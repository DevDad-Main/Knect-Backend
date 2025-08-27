import { requireAuth } from "@clerk/express";
import { Router } from "express";
import { getUser, updateUser } from "../controllers/user.controllers.js";

const router = Router();

router.use(requireAuth());

router.route("/user").get(getUser).post(updateUser);

export default router;
