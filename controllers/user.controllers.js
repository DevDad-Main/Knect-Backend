import { User } from "../models/User.models.js";
import { ApiError } from "../utils/ApiError.utils.js";
import { ApiResponse } from "../utils/ApiResponse.utils.js";

//#region Get User
export const getUser = async (req, res) => {
  try {
    const { userId } = req.auth();

    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const user = User.findById(userId);

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
//#endregion

export { getUser };
