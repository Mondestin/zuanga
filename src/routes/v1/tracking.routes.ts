import { Router } from 'express';
import { TrackingController } from '../../controllers/tracking.controller';
import { authenticate, loadUser, requireRole } from '../../auth/middleware';
import { validate } from '../../middleware/validator';
import { updateLocationSchema } from '../../validators/tracking.validator';
import { UserRole } from '../../models/User';

const router = Router();

/**
 * Update driver location for a ride
 * POST /api/v1/tracking/:rideId/location
 * Requires: DRIVER role
 */
router.post(
  '/:rideId/location',
  authenticate,
  loadUser,
  requireRole(UserRole.DRIVER),
  validate(updateLocationSchema),
  TrackingController.updateLocation
);

/**
 * Get current ride location
 * GET /api/v1/tracking/:rideId
 * Requires: Authenticated user (parent, driver, or admin)
 */
router.get('/:rideId', authenticate, loadUser, TrackingController.getCurrentLocation);

/**
 * Get ride location history
 * GET /api/v1/tracking/:rideId/history
 * Requires: Authenticated user (parent, driver, or admin)
 */
router.get('/:rideId/history', authenticate, loadUser, TrackingController.getLocationHistory);

export default router;

