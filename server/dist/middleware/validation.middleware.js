import { ZodError } from "zod";
/**
 * Middleware: Validate request body against a Zod schema.
 */
export function validateBody(schema) {
    return (req, res, next) => {
        try {
            req.body = schema.parse(req.body);
            next();
        }
        catch (err) {
            if (err instanceof ZodError) {
                res.status(400).json({
                    error: "Validasi gagal",
                    details: err.errors.map((e) => ({
                        field: e.path.join("."),
                        message: e.message,
                    })),
                });
                return;
            }
            next(err);
        }
    };
}
/**
 * Middleware: Validate query params against a Zod schema.
 */
export function validateQuery(schema) {
    return (req, res, next) => {
        try {
            req.query = schema.parse(req.query);
            next();
        }
        catch (err) {
            if (err instanceof ZodError) {
                res.status(400).json({
                    error: "Parameter query tidak valid",
                    details: err.errors.map((e) => ({
                        field: e.path.join("."),
                        message: e.message,
                    })),
                });
                return;
            }
            next(err);
        }
    };
}
