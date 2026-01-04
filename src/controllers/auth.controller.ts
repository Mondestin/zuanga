import { Request, Response } from 'express';
import { AuthService, RegisterInput, LoginInput } from '../services/auth.service';

/**
 * Auth Controller
 * Handles HTTP requests/responses for authentication endpoints
 */
export class AuthController {
  /**
   * Register a new user
   * POST /api/v1/auth/register
   */
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const input: RegisterInput = req.body;
      const result = await AuthService.register(input);

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to register user';
      const statusCode = message.includes('already registered') ? 409 : message.includes('password') ? 400 : 500;

      res.status(statusCode).json({
        success: false,
        error: {
          message,
          statusCode,
        },
      });
    }
  }

  /**
   * Login user
   * POST /api/v1/auth/login
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const input: LoginInput = req.body;
      const result = await AuthService.login(input);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to login';
      const statusCode = message.includes('Invalid') || message.includes('deactivated') ? 401 : message.includes('deactivated') ? 403 : 500;

      res.status(statusCode).json({
        success: false,
        error: {
          message,
          statusCode,
        },
      });
    }
  }

  /**
   * Refresh access token
   * POST /api/v1/auth/refresh
   */
  static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refresh_token } = req.body;
      const result = await AuthService.refreshToken(refresh_token);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid refresh token';

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
   * Get current user profile
   * GET /api/v1/auth/me
   */
  static async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
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

      const user = await AuthService.getCurrentUser(req.user.id);

      res.json({
        success: true,
        data: {
          user,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get user';
      const statusCode = message.includes('not found') ? 404 : 500;

      res.status(statusCode).json({
        success: false,
        error: {
          message,
          statusCode,
        },
      });
    }
  }
}

