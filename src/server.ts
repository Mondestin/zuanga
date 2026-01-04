import { createServer } from 'http';
import { createApp } from './app';
import { config, validateConfig } from './config/env';
import { testConnection } from './database/connection';
import { WebSocketServer } from './websocket/server';

/**
 * Start the server
 */
async function startServer(): Promise<void> {
  try {
    // Validate configuration
    validateConfig();

    // Test database connection
    await testConnection();

    // Create Express app
    const app = createApp();

    // Create HTTP server
    const httpServer = createServer(app);

    // Initialize WebSocket server
    const wsServer = new WebSocketServer(httpServer);
    // Store WebSocket server instance for use in services
    (global as any).wsServer = wsServer;

    // Start server
    httpServer.listen(config.port, () => {
      console.log(`🚀 Server running on port ${config.port}`);
      console.log(`📝 Environment: ${config.nodeEnv}`);
      console.log(`🔗 Health check: http://localhost:${config.port}${config.apiPrefix}/health`);
      console.log(`🔌 WebSocket server ready for real-time tracking`);
    });

    // Graceful shutdown
    const shutdown = (signal: string) => {
      console.log(`${signal} received. Shutting down gracefully...`);
      
      httpServer.close(() => {
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
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

