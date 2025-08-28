import { Router } from "express";
import { upload } from "../utils/multer.utils.js";
import { requireAuth } from "@clerk/express";
import {
  addPost,
  getFeedPosts,
  toggleLike,
} from "../controllers/post.controllers.js";
import { isAuthenticated } from "../middlewares/Authenticated.middlewares.js";

const router = Router();

router.use(requireAuth());

router.get("/feed", isAuthenticated, getFeedPosts);
router.post("/add", upload.array("images", 4), isAuthenticated, addPost);
router.post("/like", isAuthenticated, toggleLike);

export default router;
