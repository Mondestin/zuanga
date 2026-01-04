import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { UpdateUserInput } from '../models/User';
import { CreateKidInput, UpdateKidInput } from '../models/Kid';

/**
 * User Controller
 * Handles HTTP requests/responses for user endpoints
 */
export class UserController {
  /**
   * Get current user profile
   * GET /api/v1/users/profile
   */
  static async getProfile(req: Request, res: Response): Promise<void> {
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

      const user = await UserService.getProfile(req.user.id);

      res.json({
        success: true,
        data: {
          user,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get profile';
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

  /**
   * Update current user profile
   * PUT /api/v1/users/profile
   */
  static async updateProfile(req: Request, res: Response): Promise<void> {
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

      const updateData: UpdateUserInput = req.body;
      const user = await UserService.updateProfile(req.user.id, updateData);

      res.json({
        success: true,
        data: {
          user,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update profile';
      const statusCode = message.includes('already registered') ? 409 : message.includes('not found') ? 404 : 500;

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
   * Add a kid for the parent
   * POST /api/v1/users/kids
   */
  static async addKid(req: Request, res: Response): Promise<void> {
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

      const kidInput: CreateKidInput = req.body;
      const kid = await UserService.addKid(req.user.id, kidInput);

      res.status(201).json({
        success: true,
        data: {
          kid,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add kid';
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

  /**
   * Get all kids for the parent
   * GET /api/v1/users/kids
   */
  static async getKids(req: Request, res: Response): Promise<void> {
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

      const activeOnly = req.query.active !== 'false';
      const kids = await UserService.getKids(req.user.id, activeOnly);

      res.json({
        success: true,
        data: {
          kids,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get kids';
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
   * Get kid by ID
   * GET /api/v1/users/kids/:id
   */
  static async getKidById(req: Request, res: Response): Promise<void> {
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

      const kid = await UserService.getKidById(req.params.id, req.user.id);

      res.json({
        success: true,
        data: {
          kid,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get kid';
      const statusCode = message.includes('not found') || message.includes('access denied') ? 404 : 500;

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
   * Update kid
   * PUT /api/v1/users/kids/:id
   */
  static async updateKid(req: Request, res: Response): Promise<void> {
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

      const updateData: UpdateKidInput = req.body;
      const kid = await UserService.updateKid(req.params.id, req.user.id, updateData);

      res.json({
        success: true,
        data: {
          kid,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update kid';
      const statusCode = message.includes('not found') || message.includes('access denied') ? 404 : 500;

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
   * Delete kid (soft delete)
   * DELETE /api/v1/users/kids/:id
   */
  static async deleteKid(req: Request, res: Response): Promise<void> {
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

      await UserService.deleteKid(req.params.id, req.user.id);

      res.json({
        success: true,
        message: 'Kid deleted successfully',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete kid';
      const statusCode = message.includes('not found') || message.includes('access denied') ? 404 : 500;

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

