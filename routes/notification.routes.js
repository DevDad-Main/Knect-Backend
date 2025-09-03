import { Router } from "express";
import { verifyJWT } from "../middlewares/Authenticated.middlewares.js";
import {
  getNotifications,
  markNotificationRead,
  deleteNotifcation,
  deleteAllNotificationsForUser,
} from "../controllers/notification.controllers.js";

const router = Router();

router.get("/get-all", verifyJWT, getNotifications);

router.post("/read/:notificationId", verifyJWT, markNotificationRead);

router.delete("/delete/:id", verifyJWT, deleteNotifcation);
router.delete("/clear-all", verifyJWT, deleteAllNotificationsForUser);

export default router;
