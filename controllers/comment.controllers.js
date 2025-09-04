import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/Comment.models.js";
import { ApiError } from "../utils/ApiError.utils.js";
import { ApiResponse } from "../utils/ApiResponse.utils.js";
import { Post } from "../models/Post.models.js";
import { sendNotification } from "../utils/sendNotification.js";
import { Notification } from "../models/Notificiation.models.js";

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
    const io = req.app.get("io");
    const onlineUsers = req.app.get("onlineUsers");

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

    const notification = await Notification.create({
      user: post.user._id, // recipient
      from: comment.owner._id, // The liker in this case
      type: "comment", // or "message"
      entityId: post._id,
      text: "commented on your post",
    });

    if (io && onlineUsers) {
      sendNotification(io, onlineUsers, comment.owner._id, {
        ...notification.toObject(),
        from: comment.owner,
      });
    }

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
    const io = req.app.get("io");
    const onlineUsers = req.app.get("onlineUsers");

    const post = await Post.findById(postId);

    const newComment = new Comment({
      content: content,
      post: post,
      owner: req.user?._id,
      parent: parentId,
    });
    await newComment.save();

    const otherUsersComment = await Comment.findByIdAndUpdate(parentId, {
      $addToSet: { replies: newComment._id },
    }).populate("owner");

    //NOTE: Only fetching the comment so we can populate the owner field to send to the frontend
    const comment = await Comment.findById(newComment._id)
      .populate("owner", "full_name username profile_picture")
      .populate("replies");

    const notification = await Notification.create({
      user: otherUsersComment.owner._id, // recipient
      from: req.user?._id, // The liker in this case
      type: "comment", // or "messag
      entityId: post._id,
      text: "replied to your comment",
    });

    if (io && onlineUsers) {
      sendNotification(io, onlineUsers, comment.owner._id, {
        ...notification.toObject(),
        from: comment.owner,
      });
    }

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

//#region Toggle Comment Likes
export const toggleLike = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { commentId } = req.body;

    const io = req.app.get("io");
    const onlineUsers = req.app.get("onlineUsers");

    const comment = await Comment.findById(commentId).populate("owner");
    if (!comment) {
      throw new ApiError(404, "Comment not found");
    }

    let updatedComment;
    let isLiked;
    if (comment.likedBy.some((id) => id.toString() === userId.toString())) {
      // Unlike → remove user from likedBy and decrement
      updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        {
          $inc: { likes: -1 },
          $pull: { likedBy: userId },
        },
        { new: true },
      );
      isLiked = false;
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { isLiked, likes: updatedComment.likes },
            "Comment unliked",
          ),
        );
    } else {
      // Like → add user to likedBy and increment
      updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        {
          $inc: { likes: 1 },
          $addToSet: { likedBy: userId },
        },
        { new: true },
      );

      isLiked = true;

      const post = await Post.findById(comment.post);

      // Send notification of like
      const notification = await Notification.create({
        user: comment.owner._id, // recipient
        from: userId, // The liker in this case
        type: "comment", // or "messag
        entityId: post,
        text: "liked your comment",
      });

      if (io && onlineUsers) {
        sendNotification(io, onlineUsers, comment.owner._id, {
          ...notification.toObject(),
          from: comment.owner,
        });
      }

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { isLiked, likes: updatedComment.likes },
            "Comment liked",
          ),
        );
    }
  } catch (error) {
    return res.status(error.status || 500).json({
      status: error.status || 500,
      message: error.message,
    });
  }
};
//#endregion;

//#endregion

//#region Toggle Comment Dislikes
export const toggleDislike = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { commentId } = req.body;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new ApiError(404, "Comment not found");
    }

    let updatedComment;
    let isDisliked;
    if (comment.dislikedBy.some((id) => id.toString() === userId.toString())) {
      // Unlike → remove user from likedBy and decrement
      updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        {
          $inc: { dislikes: -1 },
          $pull: { dislikedBy: userId },
        },
        { new: true },
      );
      isDisliked = false;
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { isDisliked, dislikes: updatedComment.dislikes },
            "Comment undisliked",
          ),
        );
    } else {
      // Like → add user to likedBy and increment
      updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        {
          $inc: { dislikes: 1 },
          $addToSet: { dislikedBy: userId },
        },
        { new: true },
      );
      isDisliked = true;
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { isDisliked, dislikes: updatedComment.dislikes },
            "Comment Disliked",
          ),
        );
    }
  } catch (error) {
    return res.status(error.status || 500).json({
      status: error.status || 500,
      message: error.message,
    });
  }
};
//#endregion
