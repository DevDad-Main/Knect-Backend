import { Router } from "express";
import { upload } from "../utils/multer.utils.js";
import {
  sendMessage,
  getChatMessages,
  getUserRecentMessages,
} from "../controllers/message.controllers.js";
import { verifyJWT } from "../middlewares/Authenticated.middlewares.js";

const router = Router();

router.get("/recent-messages", verifyJWT, getUserRecentMessages);
router.post("/send", upload.single("image"), verifyJWT, sendMessage);
router.post("/get", verifyJWT, getChatMessages);

export default router;
