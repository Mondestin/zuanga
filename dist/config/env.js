"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.validateConfig = validateConfig;
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
/**
 * Environment configuration
 * Validates and exports all environment variables
 */
exports.config = {
    // Server configuration
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    // API configuration
    apiVersion: process.env.API_VERSION || 'v1',
    apiPrefix: `/api/${process.env.API_VERSION || 'v1'}`,
    // Database configuration
    databaseUrl: process.env.DATABASE_URL || '',
    // Security
    corsOrigin: process.env.CORS_ORIGIN || '*',
    // Rate limiting
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100', 10), // 100 requests per window
    // Logging
    logLevel: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'warn' : 'debug'),
    logDir: process.env.LOG_DIR || 'logs',
};
/**
 * Validates that all required environment variables are set
 */
function validateConfig() {
    const required = [];
    // Database URL is required
    if (!process.env.DATABASE_URL) {
        required.push('DATABASE_URL');
    }
    if (required.length > 0) {
        throw new Error(`Missing required environment variables: ${required.join(', ')}`);
    }
}
//# sourceMappingURL=env.js.map