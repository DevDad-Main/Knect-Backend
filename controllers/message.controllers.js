import { Message } from "../models/Message.models.js";
import { ApiError } from "../utils/ApiError.utils.js";
import { ApiResponse } from "../utils/ApiResponse.utils.js";
import { uploadOnImageKit } from "../utils/imageKit.utils.js";

//#region Send Message
export const sendMessage = async (req, res) => {
  try {
    const userId = req.user;

    if (!userId) {
      throw new ApiError(401, "User Not Authenticated");
    }
    const { to_user_id, text } = req.body;

    // if (!to_user_id || !text) {
    //   throw new ApiError(
    //     400,
    //     "User Not Authenticated or Missing required fields",
    //   );
    // }

    const image = req.file;
    let media_url = "";

    let message_type = image ? "image" : "text";
    if (message_type === "image") {
      media_url = await uploadOnImageKit(image, "1280");
    }

    const message = await Message.create({
      from_user_id: userId,
      to_user_id,
      text,
      message_type,
      media_url,
    });

    const messgageWithUserData = await Message.findById(message._id).populate(
      "from_user_id",
    );

    const io = req.app.get("io"); // get io instance
    const onlineUsers = req.app.get("onlineUsers");

    // after saving message
    if (io && onlineUsers) {
      const destSockets = onlineUsers.get(to_user_id);
      if (destSockets) {
        for (const sid of destSockets) {
          io.to(sid).emit("receive_message", messgageWithUserData);
        }
      }
    }

    return res.status(200).json(new ApiResponse(200, message, "Message Sent"));
  } catch (error) {
    return res.status(error.status || 500).json({
      status: error.status || 500,
      message: error.message,
    });
  }
};
//#endregion

//#region Get Chat Messages
export const getChatMessages = async (req, res) => {
  try {
    const userId = req.user;
    const { to_user_id } = req.body;

    const messages = await Message.find({
      $or: [
        { from_user_id: userId, to_user_id },
        { from_user_id: to_user_id, to_user_id: userId },
      ],
    }).sort({ createdAt: -1 });

    // Mark messages as seen
    await Message.updateMany(
      { from_user_id: to_user_id, to_user_id: userId },
      { $set: { seen: true } },
    );

    return res
      .status(200)
      .json(new ApiResponse(200, messages, "Messages Fetched"));
  } catch (error) {
    return res.status(error.status || 500).json({
      status: error.status || 500,
      message: error.message,
    });
  }
};

//#endregion

//#region Get User Recent Messages
export const getUserRecentMessages = async (req, res) => {
  try {
    const { userId } = req.auth();
    const messages = await Message.find({ to_user_id: userId })
      .populate("from_user_id to_user_id")
      .sort({ createdAt: -1 });
    // .limit(5);

    return res
      .status(200)
      .json(new ApiResponse(200, messages, " Recent Messages Fetched"));
  } catch (error) {
    return res.status(error.status || 500).json({
      status: error.status || 500,
      message: error.message,
    });
  }
};
//#endregion
