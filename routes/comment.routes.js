import { Router } from "express";
import { verifyJWT } from "../middlewares/Authenticated.middlewares.js";
import {
  addCommentToPost,
  replyToComment,
} from "../controllers/comment.controllers.js";

const router = Router();

router.post("/add-comment", verifyJWT, addCommentToPost);
router.post("/add-reply", verifyJWT, replyToComment);
export default router;
