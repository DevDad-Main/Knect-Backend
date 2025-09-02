import { Router } from "express";
import { upload } from "../utils/multer.utils.js";
import {
  addStory,
  getStories,
  deleteStory,
} from "../controllers/story.controllers.js";
import { verifyJWT } from "../middlewares/Authenticated.middlewares.js";
import { addStoryValidation } from "../utils/validtion.utils.js";

const router = Router();

router.get("/stories", verifyJWT, getStories);
router.post(
  "/add-story",
  upload.single("media"),
  verifyJWT,
  addStoryValidation,
  addStory,
);
router.delete("/delete/:storyId", verifyJWT, deleteStory);

export default router;
