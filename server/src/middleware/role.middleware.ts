import type { Request, Response, NextFunction } from "express";

type Role = "admin" | "ppic" | "admin_transit" | "gudang" | "operator_line" | "supervisor" | "viewer";

/**
 * Middleware: Require one of the specified roles.
 * Must be used AFTER requireAuth.
 */
export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const userRole = (user.role || "viewer") as Role;

    // Admin always has access
    if (userRole === "admin" || roles.includes(userRole)) {
      next();
      return;
    }

    res.status(403).json({
      error: `Akses ditolak. Role '${userRole}' tidak memiliki izin. Diperlukan: ${roles.join(", ")}`,
    });
  };
}
