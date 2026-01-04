import { Router } from 'express';
import { AdminController } from '../../controllers/admin.controller';
import { authenticate, loadUser, requireRole } from '../../auth/middleware';
import { validate } from '../../middleware/validator';
import { updateUserSchema } from '../../validators/admin.validator';
import { UserRole } from '../../models/User';

const router = Router();

/**
 * Get all users (parents and drivers)
 * GET /api/v1/admin/users?role=PARENT&active=true
 * Requires: ADMIN role
 */
router.get('/users', authenticate, loadUser, requireRole(UserRole.ADMIN), AdminController.getAllUsers);

/**
 * Get user by ID
 * GET /api/v1/admin/users/:id
 * Requires: ADMIN role
 */
router.get('/users/:id', authenticate, loadUser, requireRole(UserRole.ADMIN), AdminController.getUserById);

/**
 * Update user account
 * PUT /api/v1/admin/users/:id
 * Requires: ADMIN role
 */
router.put(
  '/users/:id',
  authenticate,
  loadUser,
  requireRole(UserRole.ADMIN),
  validate(updateUserSchema),
  AdminController.updateUser
);

/**
 * Deactivate user account
 * PUT /api/v1/admin/users/:id/deactivate
 * Requires: ADMIN role
 */
router.put('/users/:id/deactivate', authenticate, loadUser, requireRole(UserRole.ADMIN), AdminController.deactivateUser);

/**
 * Activate user account
 * PUT /api/v1/admin/users/:id/activate
 * Requires: ADMIN role
 */
router.put('/users/:id/activate', authenticate, loadUser, requireRole(UserRole.ADMIN), AdminController.activateUser);

/**
 * Get all parents
 * GET /api/v1/admin/parents?active=true
 * Requires: ADMIN role
 */
router.get('/parents', authenticate, loadUser, requireRole(UserRole.ADMIN), AdminController.getAllParents);

/**
 * Get all drivers
 * GET /api/v1/admin/drivers?active=true
 * Requires: ADMIN role
 */
router.get('/drivers', authenticate, loadUser, requireRole(UserRole.ADMIN), AdminController.getAllDrivers);

/**
 * Get user statistics
 * GET /api/v1/admin/stats
 * Requires: ADMIN role
 */
router.get('/stats', authenticate, loadUser, requireRole(UserRole.ADMIN), AdminController.getUserStats);

export default router;

