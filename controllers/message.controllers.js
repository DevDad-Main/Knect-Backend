import { Message } from "../models/Message.models.js";
import { ApiError } from "../utils/ApiError.utils.js";
import { ApiResponse } from "../utils/ApiResponse.utils.js";

//#region SSE Controller -> Switch out later for Socket.io
// Create an empty object to store the Server Sent event connections
const connections = {};

export const serverSideController = (req, res) => {
  const { userId } = req.params();
  console.log("New Client Added", userId);

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");

  //Add the clients reponse object to the connections object
  connections[userId] = res;

  // Send an inital event to the client
  res.write("log: Connected to Server Sent Stream\n\n");

  //Client Disconnection
  res.on("close", () => {
    // Remove the clients connection from the connections object
    delete connections[userId];
    console.log("Client Disconnected", userId);
  });
};
//#endregion

//#region Send Message
export const sendMessage = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { to_user_id, text } = req.body;
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

    // If other user is online then we can send them the real time message
    if (connections[to_user_id]) {
      connections[to_user_id].write(
        `data: ${JSON.stringify(messgageWithUserData)}\n\n`,
      );
    }

    return res.status(200).json(new ApiResponse(200, message, "Message Sent"));
  } catch (error) {
    throw new ApiError(401, "Unauthorized", error.message);
  }
};
//#endregion

//#region Get Chat Messages
export const getChatMessages = async (req, res) => {
  try {
    const { userId } = req.auth();
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
    throw new ApiError(401, "Unauthorized", error.message);
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
    // .limit(1);

    return res
      .status(200)
      .json(new ApiResponse(200, messages, " Recent Messages Fetched"));
  } catch (error) {
    throw new ApiError(401, "Unauthorized", error.message);
  }
};
//#endregion
