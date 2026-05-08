/**
 * Middleware: Require one of the specified roles.
 * Must be used AFTER requireAuth.
 */
export function requireRole(...roles) {
    return (req, res, next) => {
        const user = req.user;
        if (!user) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        const userRole = (user.role || "viewer");
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
