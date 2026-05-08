import type { Request, Response, NextFunction } from "express";
/**
 * Global error handler middleware.
 */
export declare function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void;
