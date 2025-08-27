import { ApiError } from "../utils/ApiError.utils.js";

export const isUserAuthenticated = async (req, res, next) => {
  try {
    const { userId } = await req.auth();

    if (!userId) {
      throw new ApiError(401, "Not Authenticated...");
    }

    next(); // Carry on to the next middlware if we have a user id
  } catch (error) {
    throw new ApiError(401, "Unauthorized", error.message);
  }
};
