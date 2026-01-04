import { Request, Response } from 'express';
import { RideService } from '../services/ride.service';
import { CreateRideInput, RideStatus } from '../models/Ride';

/**
 * Ride Controller
 * Handles HTTP requests/responses for ride endpoints
 */
export class RideController {
  /**
   * Book a ride (parent or admin)
   * POST /api/v1/rides
   */
  static async createRide(req: Request, res: Response): Promise<void> {
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

      const rideInput: CreateRideInput = {
        kid_id: req.body.kid_id,
        ride_type: req.body.ride_type,
        scheduled_pickup_time: req.body.scheduled_pickup_time,
        scheduled_dropoff_time: req.body.scheduled_dropoff_time,
        pickup_address: req.body.pickup_address,
        pickup_latitude: req.body.pickup_latitude,
        pickup_longitude: req.body.pickup_longitude,
        dropoff_address: req.body.dropoff_address,
        dropoff_latitude: req.body.dropoff_latitude,
        dropoff_longitude: req.body.dropoff_longitude,
        base_fare: req.body.base_fare,
        distance_fare: req.body.distance_fare,
        total_fare: req.body.total_fare,
        parent_notes: req.body.parent_notes,
        route_id: req.body.route_id,
      };

      const ride = await RideService.createRide(rideInput, req.user.id, req.user.role);

      res.status(201).json({
        success: true,
        data: {
          ride,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create ride';
      const statusCode = message.includes('not belong') || message.includes('not found') ? 403 : 500;

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
   * List rides (filtered by user role)
   * GET /api/v1/rides
   */
  static async getRides(req: Request, res: Response): Promise<void> {
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

      const status = req.query.status as RideStatus | undefined;
      const rides = await RideService.getRidesForUser(req.user.id, req.user.role, status);

      res.json({
        success: true,
        data: {
          rides,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get rides';
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
   * Get ride by ID
   * GET /api/v1/rides/:id
   */
  static async getRideById(req: Request, res: Response): Promise<void> {
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

      const ride = await RideService.getRideById(req.params.id, req.user.id, req.user.role);

      if (!ride) {
        res.status(404).json({
          success: false,
          error: {
            message: 'Ride not found or access denied',
            statusCode: 404,
          },
        });
        return;
      }

      res.json({
        success: true,
        data: {
          ride,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get ride';
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
   * Driver accepts a ride
   * PUT /api/v1/rides/:id/accept
   */
  static async acceptRide(req: Request, res: Response): Promise<void> {
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

      const ride = await RideService.acceptRide(req.params.id, req.user.id);

      res.json({
        success: true,
        data: {
          ride,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to accept ride';
      const statusCode = message.includes('not found') ? 404 : message.includes('already assigned') || message.includes('Cannot accept') ? 400 : 500;

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
   * Driver starts a ride
   * PUT /api/v1/rides/:id/start
   */
  static async startRide(req: Request, res: Response): Promise<void> {
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

      const ride = await RideService.startRide(req.params.id, req.user.id);

      res.json({
        success: true,
        data: {
          ride,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to start ride';
      const statusCode = message.includes('not found') ? 404 : message.includes('Unauthorized') || message.includes('Cannot start') ? 403 : 500;

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
   * Driver marks kid as picked up
   * PUT /api/v1/rides/:id/pickup
   */
  static async pickupKid(req: Request, res: Response): Promise<void> {
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

      const ride = await RideService.markPickedUp(req.params.id, req.user.id);

      res.json({
        success: true,
        data: {
          ride,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to pickup kid';
      const statusCode = message.includes('not found') ? 404 : message.includes('Unauthorized') || message.includes('Cannot mark') ? 403 : 500;

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
   * Driver completes a ride
   * PUT /api/v1/rides/:id/complete
   */
  static async completeRide(req: Request, res: Response): Promise<void> {
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

      const ride = await RideService.completeRide(req.params.id, req.user.id);

      res.json({
        success: true,
        data: {
          ride,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to complete ride';
      const statusCode = message.includes('not found') ? 404 : message.includes('not in') ? 400 : 500;

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
   * Cancel a ride (by parent or driver)
   * PUT /api/v1/rides/:id/cancel
   */
  static async cancelRide(req: Request, res: Response): Promise<void> {
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

      const { reason } = req.body;
      const ride = await RideService.cancelRide(req.params.id, req.user.id, req.user.role, reason);

      res.json({
        success: true,
        data: {
          ride,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to cancel ride';
      const statusCode = message.includes('not found') ? 404 : message.includes('access denied') ? 403 : message.includes('Cannot cancel') ? 400 : 500;

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

