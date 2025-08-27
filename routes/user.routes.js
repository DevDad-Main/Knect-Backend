import { requireAuth } from "@clerk/express";
import { Router } from "express";
import {
  discoverUsers,
  getUser,
  updateUser,
  followUser,
  unfollowUser,
} from "../controllers/user.controllers.js";
import { upload } from "../utils/multer.utils.js";
const router = Router();

router.use(requireAuth());

router.get("/user", getUser);
router.get("/discover", discoverUsers);
router.post(
  "/update-user",
  upload.fields([
    { name: "profile", maxCount: 1 },
    { name: "cover", maxCount: 1 },
  ]),
  updateUser,
);
router.post("/follow/:id", followUser);
router.post("/unfollow/:id", unfollowUser);

export default router;
