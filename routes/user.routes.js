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

const router = Router();

// router.use(requireAuth());

router.get("/user", requireAuth(), getUser);
router.get("/discover", discoverUsers);
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
router.post("/follow/:id", followUser);
router.post("/unfollow/:id", unfollowUser);
router.post("/connect", sendConnectionRequest);
router.post("/accept", acceptUserConnections);
router.post("/profiles", getUserProfile);

export default router;
