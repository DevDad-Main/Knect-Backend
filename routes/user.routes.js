import { requireAuth } from "@clerk/express";
import { Router } from "express";
import {
  discoverUsers,
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
import { isAuthenticated } from "../middlewares/Authenticated.middlewares.js";

const router = Router();

// router.use(requireAuth());

router.get("/user", isAuthenticated, getUser);
router.get("/connections", getUserConnections);
router.get("/recent-messages", getUserRecentMessages);

router.post(
  "/update-user",
  upload.fields([
    { name: "profile", maxCount: 1 },
    { name: "cover", maxCount: 1 },
  ]),
  isAuthenticated,
  updateUser,
);
router.post("/discover", isAuthenticated, discoverUsers);
router.post("/follow", followUser);
router.post("/unfollow", unfollowUser);
router.post("/connect", sendConnectionRequest);
router.post("/accept", acceptUserConnections);
router.post("/profiles", isAuthenticated, getUserProfile);

export default router;
