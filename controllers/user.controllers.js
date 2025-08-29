import { Connection } from "../models/Connection.models.js";
import { inngest } from "../utils/inngest.utils.js";
import { User } from "../models/User.models.js";
import { Post } from "../models/Post.models.js";
import { ApiError } from "../utils/ApiError.utils.js";
import { ApiResponse } from "../utils/ApiResponse.utils.js";
import { uploadOnImageKit } from "../utils/imageKit.utils.js";
import escapeRegex from "../utils/regex.utils.js";

//#region Register User
const registerUser = async (req, res) => {
  //NOTE: We also have the image files aswell avatar and cover image but they get handled seperately by multer

  const { firstName, lastName, email, username, password } = req.body;

  // const errors = validationResult(req);
  //
  // if (!errors.isEmpty()) {
  //   return res.status(400).json({ errors: errors.array() });
  // }

  const profilePicture = req.files?.profile_picture?.[0];
  const coverImage = req.files?.cover?.[0];

  // NOTE: ALlowing the coverImage and avatar to default and then user can update this later in settings.
  // NOTE: This will allow us split the users images into seperate files using their ids
  // let coverImage = "";

  // if (!avatarLocalPath) {
  //   throw new ApiError(400, "Avatar file is missing.");
  // }

  // const avatar = await uploadOnCloudinary(avatarLocalPath);
  // if (coverImage) {
  //   const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  // }

  let profile_picture;
  let cover_photo;

  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user = new User.create({
      full_name: `${firstName === " " ? "First" : firstName} ${lastName === " " ? "First" : lastName}`,
      email: email,
      username: username,
      password: hashedPassword,
    });

    //#region Avatar Upload -> They can be not set by default
    try {
      profile_picture = await uploadOnImageKit(profilePicture, "512");
      cover = await uploadOnImageKit(coverImage, "1280");
    } catch (error) {
      throw new ApiError(
        500,
        "Failed to upload Profile picture or cover image.",
      );
    }
    //#endregion

    user.profile_picture = profile_picture || "";
    user.cover_photo = cover_photo || "";

    await user.save();
    //NOTE: Returning a response to the front end
    return res
      .status(201)
      .json(new ApiResponse(200, user, "User registered successfully"));
  } catch (error) {
    console.log("User Creation Failed: ", error);

    // if (avatar) {
    //   await deleteFromCloudinary(avatar.public_id);
    // }
    // if (coverImage) {
    //   await deleteFromCloudinary(coverImage.public_id);
    // }

    throw new ApiError(
      500,
      "Something went wrong while registering a new user and image files were deleted",
      error,
    );
  }
};
//#endregion

//#region Login User
const loginUser = async (req, res) => {
  const { username, password } = req.body;

  // const errors = validationResult(req);
  //
  // if (!errors.isEmpty()) {
  //   return res.status(400).json({ errors: errors.array() });
  // }

  // if (!username.trim() || !password.trim()) {
  //   throw new ApiError(400, "Username and Password is required");
  // }
  const user = await User.findOne({ username: username });
  // const user = await User.findOne({ $or: [
  //     {
  //       username,
  //     },
  // {
  //   email,
  // },
  //   ],
  // });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPassValid = await bcrypt.compare(password, user.password);

  if (!isPassValid) {
    throw new ApiError(400, "Invalid Password");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id,
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  };

  return (
    res
      .status(200)
      .cookie("accessToken", accessToken, options)
      //NOTE: Refresh token is only normally set in the cookie
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { user: loggedInUser, accessToken, refreshToken },
          "User logged in successfully",
        ),
      )
  );
};
//#endregion

//#region Logout User
const logoutUser = async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      //NOTE: Allows us to set and change any property, in this case it will be the refresh token
      $set: {
        refreshToken: undefined, // NOTE: Depending on the MongoDB version, we can use "" empty string or null or undefined
      },
    },

    { new: true }, //NOTE: Returns us the updated user
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
  };

  return (
    res
      .status(200)
      //NOTE: Using a method called .clearCookie allowing us to clear the cookies one by one
      .clearCookie("accessToken", options)
      //NOTE: Using a method called .clearCookie allowing us to clear the cookies one by one
      .clearCookie("refreshToken", options)
      //NOTE: Here we just send the default 200 resonse
      .json(new ApiResponse(200, user, "Logout successful"))
  );
};
//#endregion

//#region Get User
export const getUser = async (req, res) => {
  try {
    const { userId } = req.auth();

    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, user, "User Successfully Fetched"));
  } catch (error) {
    throw new ApiError(401, "Unauthorized", error.message);
  }
};
//#endregion

//#region Update User Details
export const updateUser = async (req, res) => {
  try {
    const { userId } = req.auth();
    let { username, bio, location, full_name } = req.body;

    if (!userId) {
      throw new ApiError(401, "User Not Authenticated");
    }

    const userToUpdate = await User.findById(userId);

    if (!userToUpdate) {
      throw new ApiError(404, "User not found");
    }

    !username && (username = userToUpdate.username);
    !bio && (bio = userToUpdate.bio);
    !location && (location = userToUpdate.location);
    !full_name && (full_name = userToUpdate.full_name);

    if (userToUpdate.username !== username) {
      const usernameExists = await User.findOne({ username });

      if (usernameExists) {
        username = userToUpdate.username;
      }
    }

    const profilePicture = req.files?.profile && req.files?.profile[0];
    const coverImage = req.files?.cover && req.files?.cover[0];

    let profile_picture;
    let cover;
    profilePicture
      ? (profile_picture = await uploadOnImageKit(profilePicture, "512"))
      : null;
    coverImage ? (cover = await uploadOnImageKit(coverImage, "1280")) : null;

    // if (profilePicture) {
    //   const buffer = fs.readFileSync(profilePicture.path);
    //   const response = await imagekit.upload({
    //     file: buffer,
    //     fileName: profilePicture.originalname,
    //   });
    //
    //   const url = imagekit.url({
    //     path: response.filePath,
    //     transformation: [
    //       {
    //         quality: "auto",
    //       },
    //       {
    //         format: "webp",
    //       },
    //       {
    //         width: "512",
    //       },
    //     ],
    //   });
    //   profile_picture = url;
    // }
    //

    userToUpdate.username = username;
    userToUpdate.bio = bio;
    userToUpdate.location = location;
    userToUpdate.full_name = full_name;
    if (profile_picture) {
      userToUpdate.profile_picture = profile_picture;
    }

    if (cover) {
      userToUpdate.cover_photo = cover;
    }

    await userToUpdate.save();

    return res
      .status(200)
      .json(
        new ApiResponse(200, userToUpdate, "User Updated Successfully Fetched"),
      );
  } catch (error) {
    throw new ApiError(401, error.message);
  }
};
//#endregion

//#region Get Users By Input Field
export const discoverUsers = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { input } = req.body;

    // Escaping certain regex characters (malicious check)
    const safeQuery = escapeRegex(input);

    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    // Finding all users that match the search request
    const users = await User.find({
      $or: [
        { username: { $regex: safeQuery, $options: "i" } },
        { email: { $regex: safeQuery, $options: "i" } },
        { full_name: { $regex: safeQuery, $options: "i" } },
        { location: { $regex: safeQuery, $options: "i" } },
      ],
    });

    // Filtering out the user who is currently logged in
    const filteredUsers = users.filter((user) => user._id !== userId);

    return res
      .status(200)
      .json(new ApiResponse(200, filteredUsers, "Users Successfully Fetched"));
  } catch (error) {
    throw new ApiError(401, "Unauthorized", error.message);
  }
};
//#endregion

//#region Follow User
export const followUser = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { id } = req.body;

    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const loggedInUser = await User.findById(userId);

    if (!loggedInUser) {
      throw new ApiError(404, "User not found");
    }

    if (loggedInUser.followers.includes(id)) {
      throw new ApiError(400, "User is already followed");
    }

    loggedInUser.following.push(id);
    await loggedInUser.save();

    const followedUser = await User.findById(id);
    followedUser.followers.push(userId);
    await followedUser.save();

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "User Successfully Followed"));
  } catch (error) {
    throw new ApiError(401, "Unauthorized", error.message);
  }
};
//#endregion

//#region Unfollow User
export const unfollowUser = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { id } = req.body;

    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const user = await User.findById(userId);
    user.following = user.following.filter((user) => user !== id);
    await user.save();

    const unfollowedUser = await User.findById(id);
    unfollowedUser.followers = unfollowedUser.followers.filter(
      (user) => user !== userId,
    );
    await unfollowedUser.save();

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "User Successfully Unfollowed"));
  } catch (error) {
    throw new ApiError(401, "Unauthorized", error.message);
  }
};
//#endregion

//#region Send Connection Request
export const sendConnectionRequest = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { id } = req.body;

    // Check if user has sent more than 20 connection requests in the last 24 hours
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const connectionRequests = await Connection.find({
      from_user_id: userId,
      createdAt: { $gt: last24Hours },
    });

    if (connectionRequests.length >= 20) {
      throw new ApiError(
        400,
        "You have sent too many connection requests in the last 24 hours",
      );
    }

    // Check if users are already connected
    const connection = await Connection.findOne({
      $or: [
        { from_user_id: userId, to_user_id: id },
        { from_user_id: id, to_user_id: userId },
      ],
    });

    if (!connection) {
      const newConnection = await Connection.create({
        from_user_id: userId,
        to_user_id: id,
      });

      await inngest.send({
        name: "app/connection.request",
        data: { connectionId: newConnection._id },
      });

      return res
        .status(200)
        .json(new ApiResponse(200, {}, "Connection Request Sent"));
    } else if (connection && connection.status === "accepted") {
      return res
        .status(400)
        .json(new ApiResponse(400, {}, "You are already connected"));
    }

    return res
      .status(400)
      .json(new ApiResponse(400, {}, "Connection Request Pending"));
  } catch (error) {
    throw new ApiError(401, "Unauthorized", error.message);
  }
};
//#endregion

//#region Get User Connections
export const getUserConnections = async (req, res) => {
  try {
    const { userId } = req.auth();
    const user = await User.findById(userId).populate(
      "connections followers following",
    );

    const { connections, followers, following } = user;

    const pendingConnections = (
      await Connection.find({ to_user_id: userId, status: "pending" }).populate(
        "from_user_id",
      )
    ).map((connection) => connection.from_user_id);

    console.log(connections, followers, following, pendingConnections);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { connections, followers, following, pendingConnections },
          "User Connections Successfully Fetched",
        ),
      );
  } catch (error) {
    throw new ApiError(401, "Unauthorized", error.message);
  }
};
//#endregion

//#region Accept Connection Request
export const acceptUserConnections = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { id } = req.body;

    const connection = await Connection.findOne({
      from_user_id: id,
      to_user_id: userId,
    });

    if (!connection) {
      throw new ApiError(404, "Connection not found");
    }

    const user = await User.findById(userId);
    user.connections.push(id);
    await user.save();

    const connectedUser = await User.findById(id);
    connectedUser.connections.push(userId);
    await connectedUser.save();

    connection.status = "accepted";
    await connection.save();

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Connection Accepted"));
  } catch (error) {
    throw new ApiError(401, "Unauthorized", error.message);
  }
};
//#endregion

//#region Get User Profiles
export const getUserProfile = async (req, res) => {
  try {
    const { profileId } = req.body;
    const profile = await User.findById(profileId);

    if (!profile) {
      throw new ApiError(404, "User not found");
    }
    const posts = await Post.find({ user: profileId })
      .populate("user")
      .sort({ createdAt: -1 });

    return res
      .status(200)
      .json(new ApiResponse(200, { profile, posts }, "User Profile Fetched"));
  } catch (error) {
    throw new ApiError(401, "Unauthorized", error.message);
  }
};
//#endregion
