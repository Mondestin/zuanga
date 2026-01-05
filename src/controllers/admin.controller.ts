import { Request, Response } from 'express';
import { AdminService } from '../services/admin.service';
import { UpdateUserInput } from '../models/User';
import { UserRole } from '../models/User';

/**
 * Admin Controller
 * Handles HTTP requests/responses for admin endpoints
 */
export class AdminController {
  /**
   * Get all users (parents and drivers)
   * GET /api/v1/admin/users
   */
  static async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const role = req.query.role as UserRole | undefined;
      const activeOnly = req.query.active === 'true';

      const users = await AdminService.getAllUsers(role, activeOnly);

      // Remove password_hash from response
      const usersWithoutPassword = users.map(({ password_hash, ...user }) => user);

      res.json({
        success: true,
        data: {
          users: usersWithoutPassword,
          count: usersWithoutPassword.length,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get users';
      res.status(500).json({
        success: false,
        error: {
          message,
          statusCode: 500,
        },
      });
    }
  }

  /**
   * Get user by ID
   * GET /api/v1/admin/users/:id
   */
  static async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const user = await AdminService.getUserById(req.params.id);

      if (!user) {
        res.status(404).json({
          success: false,
          error: {
            message: 'User not found',
            statusCode: 404,
          },
        });
        return;
      }

      // Remove password_hash from response
      const { password_hash, ...userWithoutPassword } = user;

      res.json({
        success: true,
        data: {
          user: userWithoutPassword,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get user';
      res.status(500).json({
        success: false,
        error: {
          message,
          statusCode: 500,
        },
      });
    }
  }

  /**
   * Update user account
   * PUT /api/v1/admin/users/:id
   */
  static async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const updateData: UpdateUserInput = req.body;
      const user = await AdminService.updateUser(req.params.id, updateData);

      if (!user) {
        res.status(404).json({
          success: false,
          error: {
            message: 'User not found',
            statusCode: 404,
          },
        });
        return;
      }

      // Remove password_hash from response
      const { password_hash, ...userWithoutPassword } = user;

      res.json({
        success: true,
        data: {
          user: userWithoutPassword,
          message: 'User updated successfully',
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update user';
      const statusCode = message.includes('not found') ? 404 : message.includes('already') ? 409 : 500;

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
   * Deactivate user account
   * PUT /api/v1/admin/users/:id/deactivate
   */
  static async deactivateUser(req: Request, res: Response): Promise<void> {
    try {
      const user = await AdminService.deactivateUser(req.params.id);

      if (!user) {
        res.status(404).json({
          success: false,
          error: {
            message: 'User not found',
            statusCode: 404,
          },
        });
        return;
      }

      // Remove password_hash from response
      const { password_hash, ...userWithoutPassword } = user;

      res.json({
        success: true,
        data: {
          user: userWithoutPassword,
          message: 'User deactivated successfully',
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to deactivate user';
      res.status(500).json({
        success: false,
        error: {
          message,
          statusCode: 500,
        },
      });
    }
  }

  /**
   * Activate user account
   * PUT /api/v1/admin/users/:id/activate
   */
  static async activateUser(req: Request, res: Response): Promise<void> {
    try {
      const user = await AdminService.activateUser(req.params.id);

      if (!user) {
        res.status(404).json({
          success: false,
          error: {
            message: 'User not found',
            statusCode: 404,
          },
        });
        return;
      }

      // Remove password_hash from response
      const { password_hash, ...userWithoutPassword } = user;

      res.json({
        success: true,
        data: {
          user: userWithoutPassword,
          message: 'User activated successfully',
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to activate user';
      res.status(500).json({
        success: false,
        error: {
          message,
          statusCode: 500,
        },
      });
    }
  }

  /**
   * Get all parents
   * GET /api/v1/admin/parents
   */
  static async getAllParents(req: Request, res: Response): Promise<void> {
    try {
      const activeOnly = req.query.active === 'true';
      const parents = await AdminService.getAllParents(activeOnly);

      // Remove password_hash from response
      const parentsWithoutPassword = parents.map(({ password_hash, ...parent }) => parent);

      res.json({
        success: true,
        data: {
          parents: parentsWithoutPassword,
          count: parentsWithoutPassword.length,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get parents';
      res.status(500).json({
        success: false,
        error: {
          message,
          statusCode: 500,
        },
      });
    }
  }

  /**
   * Get all drivers
   * GET /api/v1/admin/drivers
   */
  static async getAllDrivers(req: Request, res: Response): Promise<void> {
    try {
      const activeOnly = req.query.active === 'true';
      const drivers = await AdminService.getAllDrivers(activeOnly);

      // Remove password_hash from response
      const driversWithoutPassword = drivers.map(({ password_hash, ...driver }) => driver);

      res.json({
        success: true,
        data: {
          drivers: driversWithoutPassword,
          count: driversWithoutPassword.length,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get drivers';
      res.status(500).json({
        success: false,
        error: {
          message,
          statusCode: 500,
        },
      });
    }
  }

  /**
   * Get user statistics
   * GET /api/v1/admin/stats
   */
  static async getUserStats(_req: Request, res: Response): Promise<void> {
    try {
      const stats = await AdminService.getUserStats();

      res.json({
        success: true,
        data: {
          stats,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get statistics';
      res.status(500).json({
        success: false,
        error: {
          message,
          statusCode: 500,
        },
      });
    }
  }
}

