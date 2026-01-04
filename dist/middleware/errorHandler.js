"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiError = exports.ErrorCode = void 0;
exports.errorHandler = errorHandler;
exports.notFoundHandler = notFoundHandler;
exports.asyncHandler = asyncHandler;
exports.createValidationError = createValidationError;
exports.createNotFoundError = createNotFoundError;
exports.createUnauthorizedError = createUnauthorizedError;
exports.createForbiddenError = createForbiddenError;
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
/**
 * Error codes enum for better error categorization
 */
var ErrorCode;
(function (ErrorCode) {
    // Client errors (4xx)
    ErrorCode["BAD_REQUEST"] = "BAD_REQUEST";
    ErrorCode["UNAUTHORIZED"] = "UNAUTHORIZED";
    ErrorCode["FORBIDDEN"] = "FORBIDDEN";
    ErrorCode["NOT_FOUND"] = "NOT_FOUND";
    ErrorCode["CONFLICT"] = "CONFLICT";
    ErrorCode["VALIDATION_ERROR"] = "VALIDATION_ERROR";
    ErrorCode["RATE_LIMIT_EXCEEDED"] = "RATE_LIMIT_EXCEEDED";
    // Server errors (5xx)
    ErrorCode["INTERNAL_SERVER_ERROR"] = "INTERNAL_SERVER_ERROR";
    ErrorCode["DATABASE_ERROR"] = "DATABASE_ERROR";
    ErrorCode["EXTERNAL_SERVICE_ERROR"] = "EXTERNAL_SERVICE_ERROR";
    ErrorCode["SERVICE_UNAVAILABLE"] = "SERVICE_UNAVAILABLE";
})(ErrorCode || (exports.ErrorCode = ErrorCode = {}));
/**
 * Custom error class for API errors
 */
class ApiError extends Error {
    statusCode;
    errorCode;
    isOperational;
    details;
    constructor(statusCode, message, errorCode = ErrorCode.INTERNAL_SERVER_ERROR, isOperational = true, details) {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.isOperational = isOperational;
        this.details = details;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.ApiError = ApiError;
 === 'development' ? { stack: string, details: (Record) } : {};
;
;
/**
 * Log error with context
 */
function logError(err, req, statusCode) {
    const requestId = req.requestId || 'unknown';
    const errorContext = {
        requestId,
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        statusCode,
    };
    if (err instanceof ApiError) {
        // Operational errors - log as warning
        if (err.isOperational) {
            logger_1.log.warn(err.message, {
                ...errorContext,
                errorCode: err.errorCode,
                details: err.details,
                stack: err.stack,
            });
        }
        else {
            // Non-operational errors - log as error
            logger_1.log.error(err.message, {
                ...errorContext,
                errorCode: err.errorCode,
                details: err.details,
                stack: err.stack,
            });
        }
    }
    else {
        // Unknown errors - always log as error
        logger_1.log.error(err.message || 'Unknown error', {
            ...errorContext,
            errorCode: ErrorCode.INTERNAL_SERVER_ERROR,
            stack: err.stack,
            errorName: err.name,
        });
    }
}
/**
 * Global error handling middleware
 */
function errorHandler(err, req, res, next) {
    // If response already sent, delegate to default Express error handler
    if (res.headersSent) {
        logger_1.log.error('Response already sent, cannot send error response', {
            requestId: req.requestId,
            error: err.message,
        });
        return next(err);
    }
    // Determine status code
    const statusCode = err instanceof ApiError ? err.statusCode : 500;
    // Log the error
    logError(err, req, statusCode);
    // Handle known API errors
    if (err instanceof ApiError) {
        const response = {
            success: false,
            error: {
                message: err.message,
                statusCode: err.statusCode,
                errorCode: err.errorCode,
                requestId: req.requestId,
                timestamp: new Date().toISOString(),
            },
        };
        // Include stack trace and details in development
        if (env_1.config.nodeEnv === 'development') {
            if (err.stack) {
                response.error.stack = err.stack;
            }
            if (err.details) {
                response.error.details = err.details;
            }
        }
        res.status(err.statusCode).json(response);
        return;
    }
    // Handle unknown errors
    const response = {
        success: false,
        error: {
            message: env_1.config.nodeEnv === 'production'
                ? 'Internal server error'
                : err.message,
            statusCode,
            errorCode: ErrorCode.INTERNAL_SERVER_ERROR,
            requestId: req.requestId,
            timestamp: new Date().toISOString(),
        },
    };
    // Include stack trace in development
    if (env_1.config.nodeEnv === 'development' && err.stack) {
        response.error.stack = err.stack;
    }
    res.status(statusCode).json(response);
}
/**
 * 404 Not Found handler
 */
function notFoundHandler(req, res, next) {
    const error = new ApiError(404, `Route ${req.originalUrl} not found`, ErrorCode.NOT_FOUND);
    next(error);
}
/**
 * Async error wrapper to catch errors in async route handlers
 */
function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}
/**
 * Validation error helper
 */
function createValidationError(message, details) {
    return new ApiError(400, message, ErrorCode.VALIDATION_ERROR, true, details);
}
/**
 * Not found error helper
 */
function createNotFoundError(resource, identifier) {
    const message = identifier
        ? `${resource} with identifier '${identifier}' not found`
        : `${resource} not found`;
    return new ApiError(404, message, ErrorCode.NOT_FOUND);
}
/**
 * Unauthorized error helper
 */
function createUnauthorizedError(message = 'Unauthorized') {
    return new ApiError(401, message, ErrorCode.UNAUTHORIZED);
}
/**
 * Forbidden error helper
 */
function createForbiddenError(message = 'Forbidden') {
    return new ApiError(403, message, ErrorCode.FORBIDDEN);
}
//# sourceMappingURL=errorHandler.js.map