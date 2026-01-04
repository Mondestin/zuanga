import { Request, Response } from 'express';
import { RouteService, OptimizeRouteInput } from '../services/route.service';
import { CreateRouteInput, UpdateRouteInput } from '../models/Route';

/**
 * Route Controller
 * Handles HTTP requests/responses for route endpoints
 */
export class RouteController {
  /**
   * List routes (optionally filtered by school or driver)
   * GET /api/v1/routes
   */
  static async getRoutes(req: Request, res: Response): Promise<void> {
    try {
      const schoolId = req.query.school_id as string | undefined;
      const driverId = req.query.driver_id as string | undefined;
      const activeOnly = req.query.active !== 'false';

      const routes = await RouteService.getRoutes(schoolId, driverId, activeOnly);

      res.json({
        success: true,
        data: {
          routes,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get routes';
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
   * Get route by ID
   * GET /api/v1/routes/:id
   */
  static async getRouteById(req: Request, res: Response): Promise<void> {
    try {
      const route = await RouteService.getRouteById(req.params.id);

      res.json({
        success: true,
        data: {
          route,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get route';
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
   * Create a new route
   * POST /api/v1/routes
   */
  static async createRoute(req: Request, res: Response): Promise<void> {
    try {
      const routeInput: CreateRouteInput = {
        school_id: req.body.school_id,
        proposed_driver_id: req.body.proposed_driver_id || req.body.driver_id, // Support both for backward compatibility
        name: req.body.name,
        description: req.body.description,
        waypoints: req.body.waypoints,
        estimated_distance_km: req.body.estimated_distance_km,
        estimated_duration_minutes: req.body.estimated_duration_minutes,
      };

      const route = await RouteService.createRoute(routeInput);

      res.status(201).json({
        success: true,
        data: {
          route,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create route';
      const statusCode = message.includes('not found') ? 404 : message.includes('Invalid') ? 400 : 500;

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
   * Optimize route for multiple pickups
   * POST /api/v1/routes/optimize
   */
  static async optimizeRoute(req: Request, res: Response): Promise<void> {
    try {
      const optimizeInput: OptimizeRouteInput = {
        school_id: req.body.school_id,
        waypoints: req.body.waypoints,
        driver_id: req.body.proposed_driver_id || req.body.driver_id, // Support both for backward compatibility
        name: req.body.name,
        description: req.body.description,
      };

      const route = await RouteService.optimizeRoute(optimizeInput);

      res.status(201).json({
        success: true,
        data: {
          route,
          message: 'Route optimized successfully',
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to optimize route';
      const statusCode = message.includes('not found') ? 404 : message.includes('Invalid') || message.includes('required') ? 400 : 500;

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
   * Update route
   * PUT /api/v1/routes/:id
   */
  static async updateRoute(req: Request, res: Response): Promise<void> {
    try {
      const updateData: UpdateRouteInput = req.body;
      const route = await RouteService.updateRoute(req.params.id, updateData);

      res.json({
        success: true,
        data: {
          route,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update route';
      const statusCode = message.includes('not found') ? 404 : message.includes('Invalid') ? 400 : 500;

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
   * Delete route (soft delete)
   * DELETE /api/v1/routes/:id
   */
  static async deleteRoute(req: Request, res: Response): Promise<void> {
    try {
      await RouteService.deleteRoute(req.params.id);

      res.json({
        success: true,
        message: 'Route deleted successfully',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete route';
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
   * Get routes by school
   * GET /api/v1/routes/school/:schoolId
   */
  static async getRoutesBySchool(req: Request, res: Response): Promise<void> {
    try {
      const routes = await RouteService.getRoutesBySchool(req.params.schoolId);

      res.json({
        success: true,
        data: {
          routes,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get routes';
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
   * Get routes by driver
   * GET /api/v1/routes/driver/:driverId
   */
  static async getRoutesByDriver(req: Request, res: Response): Promise<void> {
    try {
      const routes = await RouteService.getRoutesByDriver(req.params.driverId);

      res.json({
        success: true,
        data: {
          routes,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get routes';
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
   * Get routes proposed to current driver
   * GET /api/v1/routes/proposed
   */
  static async getProposedRoutes(req: Request, res: Response): Promise<void> {
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

      const routes = await RouteService.getProposedRoutes(req.user.id);

      res.json({
        success: true,
        data: {
          routes,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get proposed routes';
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
   * Accept route proposal
   * PUT /api/v1/routes/:id/accept
   */
  static async acceptRouteProposal(req: Request, res: Response): Promise<void> {
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

      const route = await RouteService.acceptRouteProposal(req.params.id, req.user.id);

      res.json({
        success: true,
        data: {
          route,
          message: 'Route proposal accepted successfully',
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to accept route proposal';
      const statusCode = message.includes('not found') ? 404 : message.includes('not proposed to you') || message.includes('already') ? 403 : 500;

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
   * Reject route proposal
   * PUT /api/v1/routes/:id/reject
   */
  static async rejectRouteProposal(req: Request, res: Response): Promise<void> {
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

      const route = await RouteService.rejectRouteProposal(req.params.id, req.user.id);

      res.json({
        success: true,
        data: {
          route,
          message: 'Route proposal rejected',
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to reject route proposal';
      const statusCode = message.includes('not found') ? 404 : message.includes('not proposed to you') || message.includes('already') ? 403 : 500;

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

