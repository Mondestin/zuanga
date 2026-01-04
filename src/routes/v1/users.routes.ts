import { Router } from 'express';
import { UserController } from '../../controllers/user.controller';
import { authenticate, loadUser, requireRole } from '../../auth/middleware';
import { validate } from '../../middleware/validator';
import { updateProfileSchema, createKidSchema, updateKidSchema } from '../../validators/user.validator';
import { UserRole } from '../../models/User';

const router = Router();

/**
 * Get current user profile
 * GET /api/v1/users/profile
 */
router.get('/profile', authenticate, loadUser, UserController.getProfile);

/**
 * Update current user profile
 * PUT /api/v1/users/profile
 */
router.put('/profile', authenticate, loadUser, validate(updateProfileSchema), UserController.updateProfile);

/**
 * Add a kid for the parent
 * POST /api/v1/users/kids
 */
router.post('/kids', authenticate, loadUser, requireRole(UserRole.PARENT), validate(createKidSchema), UserController.addKid);

/**
 * Get all kids for the parent
 * GET /api/v1/users/kids
 */
router.get('/kids', authenticate, loadUser, requireRole(UserRole.PARENT), UserController.getKids);

/**
 * Get kid by ID
 * GET /api/v1/users/kids/:id
 */
router.get('/kids/:id', authenticate, loadUser, requireRole(UserRole.PARENT), UserController.getKidById);

/**
 * Update kid
 * PUT /api/v1/users/kids/:id
 */
router.put('/kids/:id', authenticate, loadUser, requireRole(UserRole.PARENT), validate(updateKidSchema), UserController.updateKid);

/**
 * Delete kid (soft delete)
 * DELETE /api/v1/users/kids/:id
 */
router.delete('/kids/:id', authenticate, loadUser, requireRole(UserRole.PARENT), UserController.deleteKid);

export default router;
