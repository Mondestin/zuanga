"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestIdMiddleware = requestIdMiddleware;
const uuid_1 = require("uuid");
/**
 * Request ID middleware
 * Generates a unique request ID for each request and attaches it to the request object
 * Also sets it as a response header for tracing
 */
function requestIdMiddleware(req, res, next) {
    // Generate or use existing request ID from header
    const requestId = req.headers['x-request-id'] || (0, uuid_1.v4)();
    // Attach to request object
    req.requestId = requestId;
    // Set response header for client tracing
    res.setHeader('X-Request-ID', requestId);
    next();
}
//# sourceMappingURL=requestId.js.map