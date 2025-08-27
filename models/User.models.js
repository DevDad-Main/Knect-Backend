import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
    },
    full_name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    bio: {
      type: String,
      default: "Hey there! I'm using Knect.",
    },
    profile_picture: {
      type: String,
      default: "",
    },
    cover_photo: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
    followers: [
      {
        type: String,
        ref: "User",
      },
    ],
    following: [
      {
        type: String,
        ref: "User",
      },
    ],
    connections: [
      {
        type: String,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
    minimize: false,
  },
);

export const User = mongoose.model("User", userSchema);
