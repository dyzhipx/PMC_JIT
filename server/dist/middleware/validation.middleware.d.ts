import type { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
/**
 * Middleware: Validate request body against a Zod schema.
 */
export declare function validateBody(schema: ZodSchema): (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware: Validate query params against a Zod schema.
 */
export declare function validateQuery(schema: ZodSchema): (req: Request, res: Response, next: NextFunction) => void;
