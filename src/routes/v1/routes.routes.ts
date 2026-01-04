import { Router } from 'express';
import { RouteController } from '../../controllers/route.controller';
import { authenticate, loadUser, requireRole } from '../../auth/middleware';
import { validate } from '../../middleware/validator';
import { createRouteSchema, updateRouteSchema, optimizeRouteSchema } from '../../validators/route.validator';
import { UserRole } from '../../models/User';

const router = Router();

/**
 * List routes (optionally filtered by school or driver)
 * GET /api/v1/routes
 * Query params: ?school_id=xxx&driver_id=xxx&active=true
 */
router.get('/', RouteController.getRoutes);

/**
 * Get route by ID
 * GET /api/v1/routes/:id
 */
router.get('/:id', RouteController.getRouteById);

/**
 * Create a new route
 * POST /api/v1/routes
 * Requires: ADMIN or PARENT role
 */
router.post('/', authenticate, loadUser, requireRole(UserRole.ADMIN, UserRole.PARENT), validate(createRouteSchema), RouteController.createRoute);

/**
 * Optimize route for multiple pickups
 * POST /api/v1/routes/optimize
 * Requires: ADMIN or PARENT role
 */
router.post('/optimize', authenticate, loadUser, requireRole(UserRole.ADMIN, UserRole.PARENT), validate(optimizeRouteSchema), RouteController.optimizeRoute);

/**
 * Update route
 * PUT /api/v1/routes/:id
 * Requires: ADMIN or PARENT role
 */
router.put('/:id', authenticate, loadUser, requireRole(UserRole.ADMIN, UserRole.PARENT), validate(updateRouteSchema), RouteController.updateRoute);

/**
 * Delete route (soft delete)
 * DELETE /api/v1/routes/:id
 * Requires: ADMIN or PARENT role
 */
router.delete('/:id', authenticate, loadUser, requireRole(UserRole.ADMIN, UserRole.PARENT), RouteController.deleteRoute);

/**
 * Get routes by school
 * GET /api/v1/routes/school/:schoolId
 */
router.get('/school/:schoolId', RouteController.getRoutesBySchool);

/**
 * Get routes by driver
 * GET /api/v1/routes/driver/:driverId
 */
router.get('/driver/:driverId', RouteController.getRoutesByDriver);

/**
 * Get routes proposed to current driver
 * GET /api/v1/routes/proposed
 * Requires: DRIVER role
 */
router.get('/proposed', authenticate, loadUser, requireRole(UserRole.DRIVER), RouteController.getProposedRoutes);

/**
 * Accept route proposal
 * PUT /api/v1/routes/:id/accept
 * Requires: DRIVER role
 */
router.put('/:id/accept', authenticate, loadUser, requireRole(UserRole.DRIVER), RouteController.acceptRouteProposal);

/**
 * Reject route proposal
 * PUT /api/v1/routes/:id/reject
 * Requires: DRIVER role
 */
router.put('/:id/reject', authenticate, loadUser, requireRole(UserRole.DRIVER), RouteController.rejectRouteProposal);

export default router;

