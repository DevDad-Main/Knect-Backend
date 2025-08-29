import { ApiError } from "../utils/ApiError.utils.js";

export const isAuthenticated = async (req, res, next) => {
  try {
    const { userId, getToken } = await req.auth();
    if (!userId || !getToken) {
      throw new ApiError(401, "User Not Authenticated");
    }
    next();
  } catch (error) {
    throw new ApiError(401, "User Not Authenticated");
  }
};
