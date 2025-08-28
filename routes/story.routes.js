import { Router } from "express";
import { upload } from "../utils/multer.utils.js";
import { requireAuth } from "@clerk/express";
import { addStory, getStories } from "../controllers/story.controllers.js";
import { isAuthenticated } from "../middlewares/Authenticated.middlewares.js";

const router = Router();

// router.use(requireAuth());

router.get("/stories", isAuthenticated, getStories);
router.post("/add-story", upload.single("media"), isAuthenticated, addStory);

export default router;
