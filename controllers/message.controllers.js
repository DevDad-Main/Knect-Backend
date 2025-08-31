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

    const messageWithUserData = await Message.findById(message._id).populate(
      "from_user_id",
    );

    const io = req.app.get("io"); // get io instance
    const onlineUsers = req.app.get("onlineUsers");

    // after saving message
    if (io && onlineUsers) {
      const destSockets = onlineUsers.get(to_user_id);
      if (destSockets) {
        for (const sid of destSockets) {
          // Send messages to recipient
          io.to(sid).emit("receive_message", messageWithUserData);

          // Send Notifications aswell of this message
          io.to(sid).emit("notification", {
            _id: messageWithUserData._id,
            type: "message",
            from: messageWithUserData.from_user_id, // has user info due to populate
            text: messageWithUserData.text,
            createdAt: messageWithUserData.createdAt,
          });
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
    const { to_user_id } = req.params;

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
    const userId = req.user;

    const messages = await Message.find({ to_user_id: userId })
      .populate("from_user_id to_user_id")
      .sort({ createdAt: -1 })
      .limit(5); // Limiting the amount of users messages we receive

    return res
      .status(200)
      .json(new ApiResponse(200, { messages }, " Recent Messages Fetched"));
  } catch (error) {
    return res.status(error.status || 500).json({
      status: error.status || 500,
      message: error.message,
    });
  }
};
//#endregion

//#region Mark As Seen
export const markAsSeen = async (req, res) => {
  const userId = req.user; // current logged in user
  const { fromUserId } = req.body; // the sender whose messages we want to mark

  try {
    const messagesToMarkAsSeen = await Message.updateMany(
      { to_user_id: userId, from_user_id: fromUserId, seen: false },
      { $set: { seen: true } },
    );

    if (!messagesToMarkAsSeen) {
      throw new ApiError(404, "Messages not found");
    }

    return res.status(200).json(new ApiResponse(200, {}, ""));
  } catch (error) {
    return res.status(error.status || 500).json({
      status: error.status || 500,
      message: error.message,
    });
  }
};
//#endregion
