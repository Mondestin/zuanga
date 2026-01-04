import helmet from 'helmet';
import cors from 'cors';
import { Express } from 'express';
import rateLimit from 'express-rate-limit';
import { config } from '../config/env';

/**
 * Configure security middleware
 */
export function setupSecurity(app: Express): void {
  // Helmet - Set various HTTP headers for security
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
      crossOriginEmbedderPolicy: false,
    })
  );

  // CORS configuration
  app.use(
    cors({
      origin: config.corsOrigin === '*' ? '*' : config.corsOrigin.split(','),
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Rate limiting
  const limiter = rateLimit({
    windowMs: config.rateLimitWindowMs,
    max: config.rateLimitMax,
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

