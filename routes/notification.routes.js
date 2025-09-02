import { Router } from "express";
import { verifyJWT } from "../middlewares/Authenticated.middlewares.js";
import {
  getNotifications,
  markNotificationRead,
} from "../controllers/notification.controllers.js";

const router = Router();

router.get("/get-all", verifyJWT, getNotifications);
router.post("/read/:notificationId", verifyJWT, markNotificationRead);

export default router;
