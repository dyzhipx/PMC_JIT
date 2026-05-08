import type { Request, Response, NextFunction } from "express";
/**
 * Middleware: Require authenticated session.
 * Attaches `req.user` and `req.session` on success.
 */
export declare function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * Middleware: Optional auth — attach user if present but don't block.
 */
export declare function optionalAuth(req: Request, res: Response, next: NextFunction): Promise<void>;
