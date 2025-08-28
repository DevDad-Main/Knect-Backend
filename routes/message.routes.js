import { Router } from "express";
import { upload } from "../utils/multer.utils.js";
import { requireAuth } from "@clerk/express";
import {
  serverSideController,
  sendMessage,
  getChatMessages,
} from "../controllers/message.controllers.js";

const router = Router();

router.use(requireAuth());

router.get("/:userId", serverSideController);
router.post("/send", upload.single("media"), sendMessage);
router.post("/get", getChatMessages);

export default router;
