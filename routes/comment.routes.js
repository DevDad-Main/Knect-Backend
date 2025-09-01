import { Router } from "express";
import { verifyJWT } from "../middlewares/Authenticated.middlewares.js";
import {
  addCommentToPost,
  replyToComment,
  toggleDislike,
  toggleLike,
} from "../controllers/comment.controllers.js";

const router = Router();

router.post("/add-comment", verifyJWT, addCommentToPost);
router.post("/add-reply", verifyJWT, replyToComment);
router.post("/toggle-like", verifyJWT, toggleLike);
router.post("/toggle-dislike", verifyJWT, toggleDislike);
export default router;
