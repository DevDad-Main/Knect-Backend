import { Router } from "express";
import { verifyJWT } from "../middlewares/Authenticated.middlewares.js";
import { addCommentToPost } from "../controllers/comment.controllers.js";

const router = Router();

router.post("/add-comment", verifyJWT, addCommentToPost);

export default router;
