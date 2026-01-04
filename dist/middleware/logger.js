"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const morgan_1 = __importDefault(require("morgan"));
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
/**
 * Custom morgan token for request ID
 */
morgan_1.default.token('request-id', (req) => {
    return req.requestId || 'unknown';
});
/**
 * Custom morgan token for request body (sanitized)
 */
morgan_1.default.token('body', (req) => {
    if (req.body && Object.keys(req.body).length > 0) {
        // Sanitize sensitive fields
        const sanitized = { ...req.body };
        const sensitiveFields = ['password', 'token', 'secret', 'authorization', 'apiKey'];
        sensitiveFields.forEach((field) => {
            if (sanitized[field]) {
                sanitized[field] = '***REDACTED***';
            }
        });
        return JSON.stringify(sanitized);
    }
    return '-';
});
/**
 * Custom log format for production (JSON)
 */
const productionFormat = JSON.stringify({
    method: ':method',
    url: ':url',
    status: ':status',
    responseTime: ':response-time ms',
    contentLength: ':res[content-length]',
    requestId: ':request-id',
    remoteAddress: ':remote-addr',
    userAgent: ':user-agent',
    timestamp: ':date[iso]',
});
/**
 * Custom log format for development (readable)
 */
const developmentFormat = ':method :url :status :response-time ms - :res[content-length] [Request-ID: :request-id]';
/**
 * Skip logging for health checks in production
 */
const skip = (req, res) => {
    if (env_1.config.nodeEnv === 'production') {
        return req.url === '/api/v1/health';
    }
    return false;
};
/**
 * Custom stream for morgan to use Winston logger
 */
const stream = {
    write: (message) => {
        // Remove trailing newline
        const cleanMessage = message.trim();
        // Parse status code from message
        const statusMatch = cleanMessage.match(/":(\d{3})"/);
        const status = statusMatch ? parseInt(statusMatch[1], 10) : 200;
        // Log based on status code
        if (status >= 500) {
            logger_1.log.error(cleanMessage);
        }
        else if (status >= 400) {
            logger_1.log.warn(cleanMessage);
        }
        else {
            logger_1.log.http(cleanMessage);
        }
    },
};
/**
 * Morgan logger middleware with Winston integration
 */
exports.logger = (0, morgan_1.default)(env_1.config.nodeEnv === 'production' ? productionFormat : developmentFormat, {
    skip,
    stream,
});
//# sourceMappingURL=logger.js.map