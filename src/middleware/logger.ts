import { Request, Response, NextFunction } from 'express';

/**
 * Request logging middleware
 * Logs all incoming HTTP requests with method, URL, status code, and response time
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();

  // Log request start
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl || req.url}`);

  // Log request body (if present and not too large)
  if (req.body && Object.keys(req.body).length > 0) {
    // Don't log sensitive data
    const sanitizedBody = { ...req.body };
    if (sanitizedBody.password) {
      sanitizedBody.password = '***';
    }
    if (sanitizedBody.password_hash) {
      sanitizedBody.password_hash = '***';
    }
    if (sanitizedBody.refresh_token) {
      sanitizedBody.refresh_token = '***';
    }
    if (sanitizedBody.access_token) {
      sanitizedBody.access_token = '***';
    }
    console.log(`  Body:`, JSON.stringify(sanitizedBody, null, 2));
  }

  // Log query parameters (if present)
  if (req.query && Object.keys(req.query).length > 0) {
    console.log(`  Query:`, JSON.stringify(req.query, null, 2));
  }

  // Log user info if authenticated
  if (req.user) {
    console.log(`  User: ${req.user.id} (${req.user.role})`);
  }

  // Capture response finish event
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const statusColor = res.statusCode >= 500 ? '🔴' : res.statusCode >= 400 ? '🟡' : '🟢';
    
    console.log(
      `${statusColor} [${new Date().toISOString()}] ${req.method} ${req.originalUrl || req.url} - ${res.statusCode} - ${duration}ms`
    );
  });

  next();
}

