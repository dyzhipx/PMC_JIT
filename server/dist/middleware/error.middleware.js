import { logger } from "../utils/logger.js";
/**
 * Global error handler middleware.
 */
export function errorHandler(err, req, res, _next) {
    // Winston will automatically log to logs/error-YYYY-MM-DD.log
    logger.error(`[Express] ${req.method} ${req.path}`, {
        message: err.message,
        stack: err.stack,
        body: req.body,
        query: req.query
    });
    res.status(500).json({
        error: "Terjadi kesalahan pada server",
        message: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
}
