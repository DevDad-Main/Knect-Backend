import { Router } from "express";
import { upload } from "../utils/multer.utils.js";
import { addStory, getStories } from "../controllers/story.controllers.js";
import { verifyJWT } from "../middlewares/Authenticated.middlewares.js";

const router = Router();

router.get("/stories", verifyJWT, getStories);
router.post("/add-story", upload.single("media"), verifyJWT, addStory);

export default router;
