import express, { Express, Request, Response } from 'express';
import { config } from './config/env';
import { setupSecurity } from './middleware/security';
import { requestLogger } from './middleware/logger';
import v1Routes from './routes/v1';

/**
 * Create and configure Express application
 */
export function createApp(): Express {
  const app = express();

  // Trust proxy (important for rate limiting behind reverse proxy)
  app.set('trust proxy', 1);

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request logging middleware (before security to log all requests)
  app.use(requestLogger);

  // Security middleware
  setupSecurity(app);

  // API routes
  app.use(config.apiPrefix, v1Routes);

  // Root endpoint
  app.get('/', (req: Request, res: Response) => {
    res.json({
      success: true,
      message: 'API Server is running',
      version: process.env.npm_package_version || '1.0.0',
      documentation: `${req.protocol}://${req.get('host')}${config.apiPrefix}/health`,
    });
  });

  // 404 handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      message: 'Route not found',
    });
  });

  return app;
}

