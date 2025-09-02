import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // recipient
    from: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["message", "like", "comment"],
      required: true,
    },
    entityId: { type: mongoose.Schema.Types.ObjectId }, // messageId, postId, commentId
    text: String,
    read: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);

export const Notification = mongoose.model("Notification", notificationSchema);
