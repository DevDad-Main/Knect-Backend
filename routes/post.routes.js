import { Router } from "express";
import { upload } from "../utils/multer.utils.js";
import { requireAuth } from "@clerk/express";
import { addPost, getFeedPosts } from "../controllers/post.controllers.js";

const router = Router();

router.use(requireAuth());

router.get("/feed", getFeedPosts);
router.post("/add", upload.array("images", 4), addPost);
router.post("/like", likePost);

export default router;
