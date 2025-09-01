import mongoose, { Schema } from "mongoose";

const commentSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    // For Users to reply to each other
    parent: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      default: null, // null = top-level, otherwise it's a reply
    },
    replies: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    // for easy frontend checks and deleting a comment later
    isOwner: {
      type: Boolean,
      default: true,
    },
    likes: {
      type: Number,
      default: 0,
    },
    dislikes: {
      type: Number,
      default: 0,
    },
    // So we can keep a track of who liked it, as above we are usuing numbers for likes, not an easy way to track if user already liked
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    dislikedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true },
);

export const Comment = mongoose.model("Comment", commentSchema);
