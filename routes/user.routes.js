import { Router } from "express";
import {
  discoverUsers,
  loginUser,
  logoutUser,
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
import {
  loginUserValidation,
  registerUserValidation,
  updateUserValidation,
} from "../utils/validtion.utils.js";

const router = Router();

router.post("/login", loginUserValidation, loginUser);
router.post(
  "/register",
  upload.fields([
    { name: "profile_picture", maxCount: 1 },
    { name: "cover_photo", maxCount: 1 },
  ]),
  registerUserValidation,
  registerUser,
);
router.post("/logout", verifyJWT, logoutUser);

router.get("/user", verifyJWT, getUser);
router.get("/connections", verifyJWT, getUserConnections);
router.get("/recent-messages", verifyJWT, getUserRecentMessages);

router.post(
  "/update-user",
  upload.fields([
    { name: "profile", maxCount: 1 },
    { name: "cover", maxCount: 1 },
  ]),
  verifyJWT,
  updateUserValidation,
  updateUser,
);
router.post("/discover", verifyJWT, discoverUsers);
router.post("/follow", verifyJWT, followUser);
router.post("/unfollow", verifyJWT, unfollowUser);
router.post("/connect", verifyJWT, sendConnectionRequest);
router.post("/accept", verifyJWT, acceptUserConnections);
router.post("/profiles/:id", verifyJWT, getUserProfile);

export default router;
