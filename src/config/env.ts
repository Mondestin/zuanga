import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Environment configuration
 * Validates and exports all environment variables
 */
export const config = {
  // Server configuration
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // API configuration
  apiVersion: process.env.API_VERSION || 'v1',
  apiPrefix: `/api/${process.env.API_VERSION || 'v1'}`,
  
  // Database configuration
  databaseUrl: process.env.DATABASE_URL || '',
  
  // JWT configuration
  jwtSecret: process.env.JWT_SECRET || '1h',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  
  // Security
  corsOrigin: process.env.CORS_ORIGIN || '*',
  
  // Rate limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100', 10), // 100 requests per window
  
  // Logging
  logLevel: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'warn' : 'debug'),
  logDir: process.env.LOG_DIR || 'logs',
} as const;

/**
 * Validates that all required environment variables are set
 */
export function validateConfig(): void {
  const required: string[] = [];
  
  // Database URL is required
  if (!process.env.DATABASE_URL) {
    required.push('DATABASE_URL');
  }
  // JWT Secret is required
  if (!process.env.JWT_SECRET) {
    required.push('JWT_SECRET');
  }
  
  if (required.length > 0) {
    throw new Error(`Missing required environment variables: ${required.join(', ')}`);
  }
}

