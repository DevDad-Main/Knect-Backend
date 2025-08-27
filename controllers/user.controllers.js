import { User } from "../models/User.models.js";
import { ApiError } from "../utils/ApiError.utils.js";
import { ApiResponse } from "../utils/ApiResponse.utils.js";
import { uploadOnImageKit } from "../utils/imageKit.utils.js";

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
      .state(200)
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
    const { username, bio, location, full_name } = req.body;

    if (!userId) {
      throw new ApiError(401, "Unauthorized");
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
    userToUpdate.profile_picture = profile_picture;
    userToUpdate.cover_photo = cover;

    await userToUpdate.save();

    return res
      .state(200)
      .json(
        new ApiResponse(200, userToUpdate, "User Updated Successfully Fetched"),
      );
  } catch (error) {
    throw new ApiError(401, "Unauthorized", error.message);
  }
};
//#endregion

export { getUser, updateUser };
