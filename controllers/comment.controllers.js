import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/Comment.models.js";
import { ApiError } from "../utils/ApiError.utils.js";
import { ApiResponse } from "../utils/ApiResponse.utils.js";
import { Post } from "../models/Post.models.js";

//#region Get Post Comments
const getPostComments = async (req, res) => {
  const { postId } = req.params;
  const userId = req.user?._id;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }

  // const comments = await Comment.aggregate([
  //   {
  //     $match: { video: new mongoose.Types.ObjectId(`${videoId}`) },
  //   },
  //   { $sort: { createdAt: -1 } }, // newest first
  //   { $skip: (pageNum - 1) * limitNum }, // paginate early
  //   { $limit: limitNum },
  //   {
  //     $lookup: {
  //       from: "users",
  //       localField: "owner",
  //       foreignField: "_id",
  //       as: "owner",
  //       pipeline: [{ $project: { password: 0, email: 0 } }],
  //     },
  //   },
  //   { $unwind: "$owner" },
  //   {
  //     $lookup: {
  //       from: "likes",
  //       localField: "_id",
  //       foreignField: "comment",
  //       as: "likesList",
  //     },
  //   },
  //   {
  //     $addFields: {
  //       likes: { $size: "$likesList" },
  //       isLiked: userId ? { $in: [userId, "$likesList.likedBy"] } : false,
  //       isOwner: userId ? { $eq: ["$owner._id", userId] } : false,
  //     },
  //   },
  //   {
  //     $project: {
  //       likesList: 0, // remove raw likes array
  //     },
  //   },
  // ]);

  return res
    .status(200)
    .json(new ApiResponse(200, comments, "Comments fetched"));
};
//#endregion

//#region Add Comment To Post
export const addCommentToPost = async (req, res) => {
  // TODO: add a comment to a video
  // const { postId } = req.params;
  const { postId, content } = req.body;

  if (!isValidObjectId(postId)) {
    throw new ApiError(400, "Invalid video id");
  }
  try {
    const post = await Post.findById(postId);
    if (!post) {
      throw new ApiError(404, "Video not found");
    }
    const newComment = new Comment({
      content: content,
      post: post,
      owner: req.user?._id,
    });
    await newComment.save();

    //NOTE: Only fetching the comment so we can populate the owner field to send to the frontend
    const comment = await Comment.findById(newComment._id).populate(
      "owner",
      "full_name username profile_picture",
    );

    return res
      .status(200)
      .json(new ApiResponse(200, { comment }, "New Comment added"));
  } catch (error) {
    return res.status(error.status || 500).json({
      status: error.status || 500,
      message: error.message,
    });
  }
};
//#endregion

//#region Reply To Comment
export const replyToComment = async (req, res) => {
  const { postId, parentId, content } = req.body;

  if (!isValidObjectId(postId)) {
    throw new ApiError(400, "Invalid Post Id");
  }

  try {
    const post = await Post.findById(postId);

    const newComment = new Comment({
      content: content,
      post: post,
      owner: req.user?._id,
      parent: parentId,
    });
    await newComment.save();

    await Comment.findByIdAndUpdate(parentId, {
      $addToSet: { replies: newComment._id },
    });

    //NOTE: Only fetching the comment so we can populate the owner field to send to the frontend
    const comment = await Comment.findById(newComment._id)
      .populate("owner", "full_name username profile_picture")
      .populate("replies");

    return res
      .status(200)
      .json(
        new ApiResponse(200, { comment }, "Replied to comment successfully"),
      );
  } catch (error) {
    return res
      .status(error.status || 500)
      .json({ status: error.status || 500, message: error.message });
  }
};
//#endregion

// const updateComment = asyncHandler(async (req, res) => {
//   // TODO: update a comment
// });

//#region Delete Comment
const deleteComment = async (req, res) => {
  // TODO: delete a comment
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    throw new ApiError(400, "Invalid comment id");
  }

  try {
    const commentToDelete = await Comment.findByIdAndDelete(id);

    if (!commentToDelete) {
      throw new ApiError(404, "Comment not found");
    }

    res.status(200).json(new ApiResponse(200, {}, "Comment deleted"));
    console.log(commentToDelete);
  } catch (error) {
    throw new ApiError(500, "Error deleting comment", error);
  }
};
//#endregion
