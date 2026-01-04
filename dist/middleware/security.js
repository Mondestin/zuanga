"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSecurity = setupSecurity;
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const env_1 = require("../config/env");
/**
 * Configure security middleware
 */
function setupSecurity(app) {
    // Helmet - Set various HTTP headers for security
    app.use((0, helmet_1.default)({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                scriptSrc: ["'self'"],
                imgSrc: ["'self'", 'data:', 'https:'],
            },
        },
        crossOriginEmbedderPolicy: false,
    }));
    // CORS configuration
    app.use((0, cors_1.default)({
        origin: env_1.config.corsOrigin === '*' ? '*' : env_1.config.corsOrigin.split(','),
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    }));
    // Rate limiting
    const limiter = (0, express_rate_limit_1.default)({
        windowMs: env_1.config.rateLimitWindowMs,
        max: env_1.config.rateLimitMax,
        message: {
            success: false,
            error: {
                message: 'Too many requests from this IP, please try again later.',
                statusCode: 429,
            },
        },
        standardHeaders: true,
        legacyHeaders: false,
    });
    app.use(limiter);
}
//# sourceMappingURL=security.js.map