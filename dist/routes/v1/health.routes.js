"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const env_1 = require("../../config/env");
const router = (0, express_1.Router)();
/**
 * Health check endpoint
 * GET /api/v1/health
 */
router.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        data: {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: env_1.config.nodeEnv,
            version: process.env.npm_package_version || '1.0.0',
        },
    });
});
exports.default = router;
//# sourceMappingURL=health.routes.js.map