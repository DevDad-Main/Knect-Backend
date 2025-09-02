import { Post } from "../models/Post.models.js";
import { Comment } from "../models/Comment.models.js";
import { User } from "../models/User.models.js";
import { ApiError } from "../utils/ApiError.utils.js";
import { ApiResponse } from "../utils/ApiResponse.utils.js";
import { uploadOnImageKit } from "../utils/imageKit.utils.js";
import { isValidObjectId } from "mongoose";

//#region Add Post
export const addPost = async (req, res) => {
  try {
    const userId = req.user;
    const { content, post_type } = req.body;

    const images = req.files;

    let image_urls = [];

    if (images.length) {
      image_urls = await Promise.all(
        images.map(async (image) => {
          return await uploadOnImageKit(image, "1280");
        }),
      );
    }

    await Post.create({
      user: userId,
      content,
      image_urls,
      post_type,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Post Added Successfully"));
  } catch (error) {
    return res.status(error.status || 500).json({
      status: error.status || 500,
      message: error.message,
    });
  }
};
//#endregion

//#region Get Posts
export const getFeedPosts = async (req, res) => {
  try {
    const user = await User.findById(req.user?._id);

    // List of people whos posts we want to show, the user, his connections and following
    const userIds = [req.user?._id, ...user.connections, ...user.following];

    // Then we try to find these posts in our DB and return them to display
    const posts = await Post.find({
      user: { $in: userIds },
    })
      .populate("user")
      .sort({ createdAt: -1 });

    const comments = await Comment.aggregate([
      { $match: { post: { $in: posts.map((p) => p._id) } } },
      { $group: { _id: "$post", count: { $sum: 1 } } },
    ]);

    const postsWithCounts = posts.map((post) => {
      const com = comments.find(
        (c) => c._id.toString() === post._id.toString(),
      );
      return {
        ...post.toObject(), // Convert back to js object or we can use lean on the mongoose query above
        commentsCount: com ? com.count : 0, // We return an extra field to our posts so we can get the count of each comment seperately
      };
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { posts: postsWithCounts },
          "Posts Fetched Successfully",
        ),
      );
  } catch (error) {
    throw new ApiError(401, "Unauthorized", error.message);
  }
};
//#endregion

//#region Like Post
export const toggleLike = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { postId } = req.body;

    const post = await Post.findById(postId);

    if (!post) {
      throw new ApiError(404, "Post not found");
    }

    let updatedPost;

    if (post.likes_count.some((id) => id.toString() === userId.toString())) {
      // If already liked → remove
      updatedPost = await Post.findByIdAndUpdate(
        postId,
        { $pull: { likes_count: userId } },
        { new: true },
      );
      return res
        .status(200)
        .json(new ApiResponse(200, updatedPost, "Post Unliked"));
    } else {
      // If not liked → add
      updatedPost = await Post.findByIdAndUpdate(
        postId,
        { $addToSet: { likes_count: userId } },
        { new: true },
      );
      return res
        .status(200)
        .json(new ApiResponse(200, updatedPost, "Post Liked!"));
    }
  } catch (error) {
    return res.status(error.status || 500).json({
      status: error.status || 500,
      message: error.message,
    });
  }
};
//#endregion

//#region Get Post By ID
export const getPostById = async (req, res) => {
  const { postId } = req.params;

  try {
    if (!isValidObjectId(postId)) {
      throw new ApiError(400, "Invalid Post Id");
    }
    const post = await Post.findById(postId).populate("user");
    const comments = await Comment.find({ post: postId })
      .populate({
        path: "owner",
        select: "full_name username profile_picture",
      })
      .sort({ createdAt: -1 })
      .lean();

    if (!post) {
      throw new ApiError(404, "Post not found");
    }

    if (!comments) {
      throw new ApiError(404, "No Comments Found");
    }

    // Build a nested tree
    const commentMap = {};
    comments.forEach((c) => (commentMap[c._id] = { ...c, replies: [] }));

    const topLevel = [];

    comments.forEach((c) => {
      if (c.parent) {
        commentMap[c.parent].replies.push(commentMap[c._id]);
      } else {
        topLevel.push(commentMap[c._id]);
      }
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { post, comments: topLevel },
          "Post And Commeents Fetched Successfully",
        ),
      );
  } catch (error) {
    return res.status(error.status || 500).json({
      status: error.status || 500,
      message: error.message,
    });
  }
};
//#endregion

//#region Delete Post
export const deletePost = async (req, res) => {
  const { postId } = req.params;

  try {
    if (!isValidObjectId(postId)) {
      throw new ApiError(400, "Invalid Post Id");
    }

    await Post.findByIdAndDelete(postId);
    return res.status(200).json(new ApiResponse(200, {}, "Post Deleted"));
  } catch (error) {
    return res.status(error.status || 500).json({
      status: error.status || 500,
      message: error.message,
    });
  }
};
//#endregion
