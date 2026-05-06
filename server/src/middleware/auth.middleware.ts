import type { Request, Response, NextFunction } from "express";
import { auth } from "../config/auth.js";
import { fromNodeHeaders } from "better-auth/node";

/**
 * Middleware: Require authenticated session.
 * Attaches `req.user` and `req.session` on success.
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      res.status(401).json({ error: "Unauthorized — silakan login terlebih dahulu" });
      return;
    }

    (req as any).user = session.user;
    (req as any).session = session.session;
    next();
  } catch (err) {
    res.status(401).json({ error: "Unauthorized" });
  }
}

/**
 * Middleware: Optional auth — attach user if present but don't block.
 */
export async function optionalAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    if (session) {
      (req as any).user = session.user;
      (req as any).session = session.session;
    }
  } catch {
    // Ignore auth errors for optional
  }
  next();
}
