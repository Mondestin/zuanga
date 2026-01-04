import { Router } from 'express';
import { DriverController } from '../../controllers/driver.controller';
import { authenticate, loadUser, requireRole } from '../../auth/middleware';
import { UserRole } from '../../models/User';

const router = Router();

/**
 * List available drivers
 * GET /api/v1/drivers
 */
router.get('/', DriverController.getDrivers);

/**
 * Get driver details
 * GET /api/v1/drivers/:id
 */
router.get('/:id', DriverController.getDriverById);

/**
 * Update driver availability status
 * PUT /api/v1/drivers/status
 */
router.put('/status', authenticate, loadUser, requireRole(UserRole.DRIVER), DriverController.updateDriverStatus);

export default router;
