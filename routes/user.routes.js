import { requireAuth } from "@clerk/express";
import { Router } from "express";
import { getUser } from "../controllers/user.controllers.js";

const router = Router();

router.get("/user", requireAuth(), getUser);

export default router;
