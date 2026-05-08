import { auth } from "../config/auth.js";
import { fromNodeHeaders } from "better-auth/node";
/**
 * Middleware: Require authenticated session.
 * Attaches `req.user` and `req.session` on success.
 */
export async function requireAuth(req, res, next) {
    try {
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers),
        });
        if (!session) {
            res.status(401).json({ error: "Unauthorized — silakan login terlebih dahulu" });
            return;
        }
        req.user = session.user;
        req.session = session.session;
        next();
    }
    catch (err) {
        res.status(401).json({ error: "Unauthorized" });
    }
}
/**
 * Middleware: Optional auth — attach user if present but don't block.
 */
export async function optionalAuth(req, res, next) {
    try {
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers),
        });
        if (session) {
            req.user = session.user;
            req.session = session.session;
        }
    }
    catch {
        // Ignore auth errors for optional
    }
    next();
}
