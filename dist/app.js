"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const env_1 = require("./config/env");
const security_1 = require("./middleware/security");
const v1_1 = __importDefault(require("./routes/v1"));
/**
 * Create and configure Express application
 */
function createApp() {
    const app = (0, express_1.default)();
    // Trust proxy (important for rate limiting behind reverse proxy)
    app.set('trust proxy', 1);
    // Body parsing middleware
    app.use(express_1.default.json({ limit: '10mb' }));
    app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
    // Security middleware
    (0, security_1.setupSecurity)(app);
    // API routes
    app.use(env_1.config.apiPrefix, v1_1.default);
    // Root endpoint
    app.get('/', (req, res) => {
        res.json({
            success: true,
            message: 'API Server is running',
            version: process.env.npm_package_version || '1.0.0',
            documentation: `${req.protocol}://${req.get('host')}${env_1.config.apiPrefix}/health`,
        });
    });
    // 404 handler
    app.use((req, res) => {
        res.status(404).json({
            success: false,
            message: 'Route not found',
        });
    });
    return app;
}
//# sourceMappingURL=app.js.map