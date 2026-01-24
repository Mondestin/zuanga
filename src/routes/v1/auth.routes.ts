import { Router } from 'express';
import { AuthController } from '../../controllers/auth.controller';
import { validate } from '../../middleware/validator';
import { registerSchema, loginSchema, refreshTokenSchema } from '../../validators/auth.validator';
import { authenticate, loadUser } from '../../auth/middleware';
import otpRoutes from './otp.routes';

const router = Router();

/**
 * Register a new user
 * POST /api/v1/auth/register
 */
router.post('/register', validate(registerSchema), AuthController.register);

/**
 * Login user
 * POST /api/v1/auth/login
 */
router.post('/login', validate(loginSchema), AuthController.login);

/**
 * Refresh access token
 * POST /api/v1/auth/refresh
 */
router.post('/refresh', validate(refreshTokenSchema), AuthController.refreshToken);

/**
 * Get current user profile (protected route)
 * GET /api/v1/auth/me
 */
router.get('/me', authenticate, loadUser, AuthController.getCurrentUser);

/**
 * OTP (One-Time Password) routes (Vonage Verify)
 * Mounted under /api/v1/auth/otp/*
 */
router.use('/otp', otpRoutes);

export default router;
