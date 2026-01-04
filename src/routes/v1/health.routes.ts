import { Router, Request, Response } from 'express';
import { config } from '../../config/env';

const router = Router();

/**
 * Health check endpoint
 * GET /api/v1/health
 */
router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.nodeEnv,
      version: process.env.npm_package_version || '1.0.0',
    },
  });
});

export default router;

