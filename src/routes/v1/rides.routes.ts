import { Router } from 'express';
import { RideController } from '../../controllers/ride.controller';
import { authenticate, loadUser, requireRole } from '../../auth/middleware';
import { validate } from '../../middleware/validator';
import { createRideSchema, updateRideStatusSchema } from '../../validators/ride.validator';
import { UserRole } from '../../models/User';

const router = Router();

/**
 * Book a ride (parent or admin)
 * POST /api/v1/rides
 */
router.post('/', authenticate, loadUser, requireRole(UserRole.PARENT, UserRole.ADMIN), validate(createRideSchema), RideController.createRide);

/**
 * List rides (filtered by user role)
 * GET /api/v1/rides
 */
router.get('/', authenticate, loadUser, RideController.getRides);

/**
 * Get ride details
 * GET /api/v1/rides/:id
 */
router.get('/:id', authenticate, loadUser, RideController.getRideById);

/**
 * Driver accepts ride
 * PUT /api/v1/rides/:id/accept
 */
router.put('/:id/accept', authenticate, loadUser, requireRole(UserRole.DRIVER), RideController.acceptRide);

/**
 * Driver starts ride
 * PUT /api/v1/rides/:id/start
 */
router.put('/:id/start', authenticate, loadUser, requireRole(UserRole.DRIVER), RideController.startRide);

/**
 * Driver marks ride as picked up
 * PUT /api/v1/rides/:id/pickup
 */
router.put('/:id/pickup', authenticate, loadUser, requireRole(UserRole.DRIVER), RideController.pickupKid);

/**
 * Driver completes ride
 * PUT /api/v1/rides/:id/complete
 */
router.put('/:id/complete', authenticate, loadUser, requireRole(UserRole.DRIVER), RideController.completeRide);

/**
 * Cancel ride
 * PUT /api/v1/rides/:id/cancel
 */
router.put('/:id/cancel', authenticate, loadUser, validate(updateRideStatusSchema), RideController.cancelRide);

export default router;
