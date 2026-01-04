import { Request, Response } from 'express';
import { TrackingService } from '../services/tracking.service';

/**
 * Tracking Controller
 * Handles HTTP requests/responses for tracking endpoints
 */
export class TrackingController {
  /**
   * Update driver location for a ride
   * POST /api/v1/tracking/:rideId/location
   */
  static async updateLocation(req: Request, res: Response): Promise<void> {
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

      const rideId = req.params.rideId;
      const locationData = {
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        accuracy: req.body.accuracy,
        heading: req.body.heading,
        speed: req.body.speed,
      };

      const routePoint = await TrackingService.updateLocation(rideId, req.user.id, locationData);

      res.json({
        success: true,
        data: {
          routePoint,
          message: 'Location updated successfully',
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update location';
      const statusCode =
        message.includes('not found') || message.includes('not assigned')
          ? 404
          : message.includes('not in progress') || message.includes('Invalid')
          ? 400
          : message.includes('authorized') || message.includes('Unauthorized')
          ? 403
          : 500;

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
   * Get current ride location
   * GET /api/v1/tracking/:rideId
   */
  static async getCurrentLocation(req: Request, res: Response): Promise<void> {
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

      const rideId = req.params.rideId;
      const location = await TrackingService.getCurrentLocation(rideId, req.user.id, req.user.role);

      res.json({
        success: true,
        data: {
          location,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get location';
      const statusCode =
        message.includes('not found') ? 404 : message.includes('authorized') || message.includes('Unauthorized') ? 403 : 500;

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
   * Get ride location history
   * GET /api/v1/tracking/:rideId/history
   */
  static async getLocationHistory(req: Request, res: Response): Promise<void> {
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

      const rideId = req.params.rideId;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;

      const history = await TrackingService.getLocationHistory(rideId, req.user.id, req.user.role, limit);

      res.json({
        success: true,
        data: {
          history,
          count: history.length,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get location history';
      const statusCode =
        message.includes('not found') ? 404 : message.includes('authorized') || message.includes('Unauthorized') ? 403 : 500;

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

