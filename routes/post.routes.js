import { Router } from "express";
import { upload } from "../utils/multer.utils.js";
import {
  addPost,
  getFeedPosts,
  toggleLike,
} from "../controllers/post.controllers.js";
import { verifyJWT } from "../middlewares/Authenticated.middlewares.js";

const router = Router();

router.get("/feed", getFeedPosts);
router.post("/add", upload.array("images", 4), addPost);
router.post("/like", toggleLike);

export default router;
