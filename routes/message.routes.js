import { Router } from "express";
import { upload } from "../utils/multer.utils.js";
import {
  sendMessage,
  getChatMessages,
  getUserRecentMessages,
} from "../controllers/message.controllers.js";

const router = Router();

router.get("/recent-messages", getUserRecentMessages);
router.post("/send", upload.single("media"), sendMessage);
router.post("/get", getChatMessages);

export default router;
