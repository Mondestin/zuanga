import { Request, Response, NextFunction } from 'express';
import { verifyToken, JWTPayload } from './jwt';
import { UserModel, User } from '../models/User';

/**
 * Extend Express Request to include user
 */
declare global {
  namespace Express {
    interface Request {
      user?: User;
      token?: JWTPayload;
    }
  }
}

/**
 * Authentication middleware - verifies JWT token
 */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: {
          message: 'No token provided',
          statusCode: 401,
        },
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = verifyToken(token);
    req.token = decoded;

    // Continue without fetching user (lazy loading)
    next();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid token';
    res.status(401).json({
      success: false,
      error: {
        message,
        statusCode: 401,
      },
    });
  }
}

/**
 * Middleware to load user from database
 */
export async function loadUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.token) {
      res.status(401).json({
        success: false,
        error: {
          message: 'Not authenticated',
          statusCode: 401,
        },
      });
      return;
    }

    const user = await UserModel.findById(req.token.userId);

    if (!user) {
      res.status(401).json({
        success: false,
        error: {
          message: 'User not found',
          statusCode: 401,
        },
      });
      return;
    }

    if (!user.is_active) {
      res.status(403).json({
        success: false,
        error: {
          message: 'Account is deactivated',
          statusCode: 403,
        },
      });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to load user',
        statusCode: 500,
      },
    });
  }
}

/**
 * Combined middleware: authenticate + load user
 */
export const auth = [authenticate, loadUser];

/**
 * Role-based access control middleware
 */
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          message: 'Not authenticated',
          statusCode: 401,
        },
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: {
          message: 'Insufficient permissions',
          statusCode: 403,
        },
      });
      return;
    }

    next();
  };
}

