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

    return res
      .status(200)
      .json(new ApiResponse(200, posts, "Posts Fetched Successfully"));
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
      .populate({
        path: "replies",
        populate: {
          path: "owner",
          select: "full_name username profile_picture",
        },
      })
      .sort({ createdAt: -1 });

    if (!post) {
      throw new ApiError(404, "Post not found");
    }

    if (!comments) {
      throw new ApiError(404, "No Comments Found");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { post, comments },
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
