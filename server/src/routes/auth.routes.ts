import { Router } from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "../config/auth.js";

const router = Router();

// Better Auth handles all /api/auth/* routes automatically
router.all("/*", toNodeHandler(auth) as any);

export default router;
