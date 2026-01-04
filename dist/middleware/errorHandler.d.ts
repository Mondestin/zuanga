import { Request, Response, NextFunction } from 'express';
/**
 * Error codes enum for better error categorization
 */
export declare enum ErrorCode {
    BAD_REQUEST = "BAD_REQUEST",
    UNAUTHORIZED = "UNAUTHORIZED",
    FORBIDDEN = "FORBIDDEN",
    NOT_FOUND = "NOT_FOUND",
    CONFLICT = "CONFLICT",
    VALIDATION_ERROR = "VALIDATION_ERROR",
    RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
    INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
    DATABASE_ERROR = "DATABASE_ERROR",
    EXTERNAL_SERVICE_ERROR = "EXTERNAL_SERVICE_ERROR",
    SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE"
}
/**
 * Custom error class for API errors
 */
export declare class ApiError extends Error {
    readonly statusCode: number;
    readonly errorCode: ErrorCode;
    readonly isOperational: boolean;
    readonly details?: Record<string, unknown>;
    constructor(statusCode: number, message: string, errorCode?: ErrorCode, isOperational?: boolean, details?: Record<string, unknown>);
}
/**
 * Global error handling middleware
 */
export declare function errorHandler(err: Error | ApiError, req: Request, res: Response, next: NextFunction): void;
/**
 * 404 Not Found handler
 */
export declare function notFoundHandler(req: Request, res: Response, next: NextFunction): void;
/**
 * Async error wrapper to catch errors in async route handlers
 */
export declare function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>): (req: Request, res: Response, next: NextFunction) => void;
/**
 * Validation error helper
 */
export declare function createValidationError(message: string, details?: Record<string, unknown>): ApiError;
/**
 * Not found error helper
 */
export declare function createNotFoundError(resource: string, identifier?: string): ApiError;
/**
 * Unauthorized error helper
 */
export declare function createUnauthorizedError(message?: string): ApiError;
/**
 * Forbidden error helper
 */
export declare function createForbiddenError(message?: string): ApiError;
//# sourceMappingURL=errorHandler.d.ts.map