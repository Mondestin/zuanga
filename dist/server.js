"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const env_1 = require("./config/env");
const connection_1 = require("./database/connection");
/**
 * Start the server
 */
async function startServer() {
    try {
        // Validate configuration
        (0, env_1.validateConfig)();
        // Test database connection
        await (0, connection_1.testConnection)();
        // Create Express app
        const app = (0, app_1.createApp)();
        // Start server
        const server = app.listen(env_1.config.port, () => {
            console.log(`🚀 Server running on port ${env_1.config.port}`);
            console.log(`📝 Environment: ${env_1.config.nodeEnv}`);
            console.log(`🔗 Health check: http://localhost:${env_1.config.port}${env_1.config.apiPrefix}/health`);
        });
        // Graceful shutdown
        const shutdown = (signal) => {
            console.log(`${signal} received. Shutting down gracefully...`);
            server.close(() => {
                console.log('Server closed successfully');
                process.exit(0);
            });
            // Force close after 10 seconds
            setTimeout(() => {
                console.error('Forcing shutdown after timeout');
                process.exit(1);
            }, 10000);
        };
        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}
// Start the server
startServer();
//# sourceMappingURL=server.js.map