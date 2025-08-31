import { Router } from "express";
import { upload } from "../utils/multer.utils.js";
import {
  sendMessage,
  getChatMessages,
  getUserRecentMessages,
  markAsSeen,
} from "../controllers/message.controllers.js";
import { verifyJWT } from "../middlewares/Authenticated.middlewares.js";

const router = Router();

router.get("/recent-messages", verifyJWT, getUserRecentMessages);
router.post("/send", upload.single("image"), verifyJWT, sendMessage);
router.get("/get/:to_user_id", verifyJWT, getChatMessages);
router.post("/mark-as-seen", verifyJWT, markAsSeen);
export default router;
