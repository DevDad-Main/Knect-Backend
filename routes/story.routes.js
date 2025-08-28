import { Router } from "express";
import { upload } from "../utils/multer.utils.js";
import { requireAuth } from "@clerk/express";
import { addStory, getStories } from "../controllers/story.controllers.js";

const router = Router();

router.use(requireAuth());

router.route("/story").get(getStories).post(upload.single("media"), addStory);
// router.get("/stories", getStories);
// router.post("/add-story", upload.single("media"), addStory);

export default router;
