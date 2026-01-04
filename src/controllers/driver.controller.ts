import { Request, Response } from 'express';
import { DriverService } from '../services/driver.service';

/**
 * Driver Controller
 * Handles HTTP requests/responses for driver endpoints
 */
export class DriverController {
  /**
   * List available drivers
   * GET /api/v1/drivers
   */
  static async getDrivers(req: Request, res: Response): Promise<void> {
    try {
      const availableOnly = req.query.available === 'true';
      const drivers = await DriverService.getDrivers(availableOnly);

      res.json({
        success: true,
        data: {
          drivers,
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
   * Get driver details
   * GET /api/v1/drivers/:id
   */
  static async getDriverById(req: Request, res: Response): Promise<void> {
    try {
      const driver = await DriverService.getDriverById(req.params.id);

      res.json({
        success: true,
        data: {
          driver,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get driver';
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
   * Update driver availability status
   * PUT /api/v1/drivers/status
   */
  static async updateDriverStatus(req: Request, res: Response): Promise<void> {
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

      const { is_available, current_latitude, current_longitude } = req.body;
      const driver = await DriverService.updateDriverStatus(req.user.id, {
        is_available,
        current_latitude,
        current_longitude,
      });

      res.json({
        success: true,
        data: {
          driver,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update driver status';
      const statusCode = message.includes('not found') ? 404 : message.includes('No valid fields') ? 400 : 500;

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

