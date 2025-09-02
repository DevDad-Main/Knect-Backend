import { Router } from "express";
import { upload } from "../utils/multer.utils.js";
import {
  addPost,
  getFeedPosts,
  toggleLike,
  getPostById,
  deletePost,
} from "../controllers/post.controllers.js";
import { verifyJWT } from "../middlewares/Authenticated.middlewares.js";

const router = Router();

router.get("/feed", verifyJWT, getFeedPosts);
router.get("/post/:postId", verifyJWT, getPostById);

router.post("/add", upload.array("images", 4), verifyJWT, addPost);
router.post("/like", verifyJWT, toggleLike);
router.delete("/delete/:postId", verifyJWT, deletePost);

export default router;
