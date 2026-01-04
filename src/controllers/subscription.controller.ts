import { Request, Response } from 'express';
import { SubscriptionService } from '../services/subscription.service';
import { CreateSubscriptionInput, SubscriptionType } from '../models/Subscription';

/**
 * Subscription Controller
 * Handles HTTP requests/responses for subscription endpoints
 */
export class SubscriptionController {
  /**
   * Create a new subscription
   * POST /api/v1/subscriptions
   */
  static async createSubscription(req: Request, res: Response): Promise<void> {
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

      const subscriptionInput: CreateSubscriptionInput = {
        parent_id: req.user.id,
        kid_id: req.body.kid_id,
        school_id: req.body.school_id,
        subscription_type: req.body.subscription_type as SubscriptionType,
        start_date: req.body.start_date,
        end_date: req.body.end_date || null,
        days_of_week: req.body.days_of_week,
        pickup_time: req.body.pickup_time,
        dropoff_time: req.body.dropoff_time || null,
        pickup_address: req.body.pickup_address,
        pickup_latitude: req.body.pickup_latitude,
        pickup_longitude: req.body.pickup_longitude,
        dropoff_address: req.body.dropoff_address,
        dropoff_latitude: req.body.dropoff_latitude,
        dropoff_longitude: req.body.dropoff_longitude,
        base_fare: req.body.base_fare,
        distance_fare: req.body.distance_fare || null,
        total_fare_per_ride: req.body.total_fare_per_ride,
        subscription_total: req.body.subscription_total || null,
        parent_notes: req.body.parent_notes || null,
        auto_generate_rides: req.body.auto_generate_rides !== false,
      };

      const subscription = await SubscriptionService.createSubscription(
        subscriptionInput,
        req.user.id,
        req.user.role
      );

      res.status(201).json({
        success: true,
        data: {
          subscription,
          message: 'Subscription created successfully. Rides will be automatically generated.',
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create subscription';
      const statusCode =
        message.includes('not found') || message.includes('does not belong')
          ? 404
          : message.includes('Invalid') || message.includes('required') || message.includes('must be')
          ? 400
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
   * Get all subscriptions for current parent
   * GET /api/v1/subscriptions
   */
  static async getSubscriptions(req: Request, res: Response): Promise<void> {
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

      const activeOnly = req.query.active === 'true';
      const subscriptions = await SubscriptionService.getSubscriptionsForParent(req.user.id, activeOnly);

      res.json({
        success: true,
        data: {
          subscriptions,
          count: subscriptions.length,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get subscriptions';
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
   * Get subscription by ID
   * GET /api/v1/subscriptions/:id
   */
  static async getSubscriptionById(req: Request, res: Response): Promise<void> {
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

      const subscription = await SubscriptionService.getSubscriptionById(
        req.params.id,
        req.user.id,
        req.user.role
      );

      if (!subscription) {
        res.status(404).json({
          success: false,
          error: {
            message: 'Subscription not found',
            statusCode: 404,
          },
        });
        return;
      }

      res.json({
        success: true,
        data: {
          subscription,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get subscription';
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
   * Update subscription
   * PUT /api/v1/subscriptions/:id
   */
  static async updateSubscription(req: Request, res: Response): Promise<void> {
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

      const subscription = await SubscriptionService.updateSubscription(
        req.params.id,
        req.body,
        req.user.id,
        req.user.role
      );

      res.json({
        success: true,
        data: {
          subscription,
          message: 'Subscription updated successfully',
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update subscription';
      const statusCode =
        message.includes('not found') ? 404 : message.includes('Unauthorized') ? 403 : message.includes('Invalid') ? 400 : 500;

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
   * Pause subscription
   * PUT /api/v1/subscriptions/:id/pause
   */
  static async pauseSubscription(req: Request, res: Response): Promise<void> {
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

      const subscription = await SubscriptionService.pauseSubscription(
        req.params.id,
        req.user.id,
        req.user.role
      );

      res.json({
        success: true,
        data: {
          subscription,
          message: 'Subscription paused successfully',
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to pause subscription';
      const statusCode =
        message.includes('not found') ? 404 : message.includes('Unauthorized') ? 403 : 500;

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
   * Resume subscription
   * PUT /api/v1/subscriptions/:id/resume
   */
  static async resumeSubscription(req: Request, res: Response): Promise<void> {
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

      const subscription = await SubscriptionService.resumeSubscription(
        req.params.id,
        req.user.id,
        req.user.role
      );

      res.json({
        success: true,
        data: {
          subscription,
          message: 'Subscription resumed successfully. Rides will be automatically generated.',
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to resume subscription';
      const statusCode =
        message.includes('not found') || message.includes('not paused')
          ? 404
          : message.includes('Unauthorized')
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
   * Cancel subscription
   * PUT /api/v1/subscriptions/:id/cancel
   */
  static async cancelSubscription(req: Request, res: Response): Promise<void> {
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

      const subscription = await SubscriptionService.cancelSubscription(
        req.params.id,
        req.user.id,
        req.user.role
      );

      res.json({
        success: true,
        data: {
          subscription,
          message: 'Subscription cancelled successfully',
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to cancel subscription';
      const statusCode =
        message.includes('not found') ? 404 : message.includes('Unauthorized') ? 403 : 500;

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
   * Manually generate rides for subscription
   * POST /api/v1/subscriptions/:id/generate-rides
   */
  static async generateRides(req: Request, res: Response): Promise<void> {
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

      const upToDate = req.body.up_to_date ? new Date(req.body.up_to_date) : new Date();

      await SubscriptionService.generateRidesForSubscription(req.params.id, upToDate);

      res.json({
        success: true,
        message: 'Rides generated successfully',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate rides';
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

