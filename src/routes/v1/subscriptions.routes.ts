import { Router } from 'express';
import { SubscriptionController } from '../../controllers/subscription.controller';
import { authenticate, loadUser, requireRole } from '../../auth/middleware';
import { validate } from '../../middleware/validator';
import { createSubscriptionSchema, updateSubscriptionSchema } from '../../validators/subscription.validator';
import { UserRole } from '../../models/User';

const router = Router();

/**
 * Create a new subscription
 * POST /api/v1/subscriptions
 * Requires: PARENT or ADMIN role
 */
router.post(
  '/',
  authenticate,
  loadUser,
  requireRole(UserRole.PARENT, UserRole.ADMIN),
  validate(createSubscriptionSchema),
  SubscriptionController.createSubscription
);

/**
 * Get all subscriptions for current parent
 * GET /api/v1/subscriptions
 * Query params: ?active=true
 * Requires: PARENT or ADMIN role
 */
router.get('/', authenticate, loadUser, requireRole(UserRole.PARENT, UserRole.ADMIN), SubscriptionController.getSubscriptions);

/**
 * Get subscription by ID
 * GET /api/v1/subscriptions/:id
 * Requires: PARENT or ADMIN role
 */
router.get('/:id', authenticate, loadUser, requireRole(UserRole.PARENT, UserRole.ADMIN), SubscriptionController.getSubscriptionById);

/**
 * Update subscription
 * PUT /api/v1/subscriptions/:id
 * Requires: PARENT or ADMIN role
 */
router.put(
  '/:id',
  authenticate,
  loadUser,
  requireRole(UserRole.PARENT, UserRole.ADMIN),
  validate(updateSubscriptionSchema),
  SubscriptionController.updateSubscription
);

/**
 * Pause subscription
 * PUT /api/v1/subscriptions/:id/pause
 * Requires: PARENT or ADMIN role
 */
router.put('/:id/pause', authenticate, loadUser, requireRole(UserRole.PARENT, UserRole.ADMIN), SubscriptionController.pauseSubscription);

/**
 * Resume subscription
 * PUT /api/v1/subscriptions/:id/resume
 * Requires: PARENT or ADMIN role
 */
router.put('/:id/resume', authenticate, loadUser, requireRole(UserRole.PARENT, UserRole.ADMIN), SubscriptionController.resumeSubscription);

/**
 * Cancel subscription
 * PUT /api/v1/subscriptions/:id/cancel
 * Requires: PARENT or ADMIN role
 */
router.put('/:id/cancel', authenticate, loadUser, requireRole(UserRole.PARENT, UserRole.ADMIN), SubscriptionController.cancelSubscription);

/**
 * Manually generate rides for subscription
 * POST /api/v1/subscriptions/:id/generate-rides
 * Requires: PARENT or ADMIN role
 */
router.post('/:id/generate-rides', authenticate, loadUser, requireRole(UserRole.PARENT, UserRole.ADMIN), SubscriptionController.generateRides);

export default router;

