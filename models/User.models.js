import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import "dotenv/config";

const userSchema = new mongoose.Schema(
  {
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
    password: {
      type: String,
      required: true,
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
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
    minimize: false,
  },
);

//#region Generate Access Token
//NOTE: Whenever the user has logged in we will send a refresh token and access token.
//NOTE: JWT Tokens
userSchema.method("generateAccessToken", function () {
  //NOTE: Short lived access token -> We will define the expiry time
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      full_name: this.full_name,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY },
  );
});
//#endregion

//#region Generate Refresh Token
userSchema.method("generateRefreshToken", function () {
  //NOTE: Short lived access token -> We will define the expiry time
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY },
  );
});
//#endregion

export const User = mongoose.model("User", userSchema);
