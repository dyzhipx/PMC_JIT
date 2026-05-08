import type { Request, Response, NextFunction } from "express";
type Role = "admin" | "ppic" | "admin_transit" | "gudang" | "operator_line" | "supervisor" | "viewer";
/**
 * Middleware: Require one of the specified roles.
 * Must be used AFTER requireAuth.
 */
export declare function requireRole(...roles: Role[]): (req: Request, res: Response, next: NextFunction) => void;
export {};
