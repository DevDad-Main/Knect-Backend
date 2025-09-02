import { Notification } from "../models/Notificiation.models.js";
import { ApiResponse } from "../utils/ApiResponse.utils.js";

//#region Get All Notifications
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user?._id;

    const notifications = await Notification.find({ user: userId })
      .populate("from", "full_name username profile_picture")
      .sort({ createdAt: -1 });

    return res
      .status(200)
      .json(new ApiResponse(200, notifications, "Fetched notifications"));
  } catch (error) {
    return res.status(error.status || 500).json({
      status: error.status || 500,
      message: error.message,
    });
  }
};
//#endregion

//#region Mark Notification As Read
export const markNotificationRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    await Notification.findByIdAndUpdate(notificationId, { read: true });

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Notification marked as read"));
  } catch (error) {
    return res.status(error.status || 500).json({
      status: error.status || 500,
      message: error.message,
    });
  }
};
//#endregion
