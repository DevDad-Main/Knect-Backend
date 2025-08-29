import { requireAuth } from "@clerk/express";
import { Router } from "express";
import {
  discoverUsers,
  loginUser,
  registerUser,
  getUser,
  updateUser,
  followUser,
  unfollowUser,
  sendConnectionRequest,
  getUserConnections,
  acceptUserConnections,
  getUserProfile,
} from "../controllers/user.controllers.js";
import { getUserRecentMessages } from "../controllers/message.controllers.js";
import { upload } from "../utils/multer.utils.js";
import { verifyJWT } from "../middlewares/Authenticated.middlewares.js";

const router = Router();

router.post("/login", loginUser);
router.post(
  "/register",
  upload.fields([
    { name: "profile_picture", maxCount: 1 },
    { name: "cover_photo", maxCount: 1 },
  ]),
  registerUser,
);

router.get("/user", getUser);
router.get("/connections", getUserConnections);
router.get("/recent-messages", getUserRecentMessages);

router.post(
  "/update-user",
  upload.fields([
    { name: "profile", maxCount: 1 },
    { name: "cover", maxCount: 1 },
  ]),
  updateUser,
);
router.post("/discover", discoverUsers);
router.post("/follow", followUser);
router.post("/unfollow", unfollowUser);
router.post("/connect", sendConnectionRequest);
router.post("/accept", acceptUserConnections);
router.post("/profiles", getUserProfile);

export default router;
