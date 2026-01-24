import { Router } from 'express';
import { validate } from '../../middleware/validator';
import { OtpController } from '../../controllers/otp.controller';
import { otpCancelSchema, otpCheckSchema, otpStartSchema } from '../../validators/otp.validator';

const router = Router();

/**
 * Start OTP verification (Vonage Verify)
 * POST /api/v1/auth/otp/start
 */
router.post('/start', validate(otpStartSchema), OtpController.start);

/**
 * Check OTP code (Vonage Verify)
 * POST /api/v1/auth/otp/check
 */
router.post('/check', validate(otpCheckSchema), OtpController.check);

/**
 * Cancel OTP request (Vonage Verify)
 * POST /api/v1/auth/otp/cancel
 */
router.post('/cancel', validate(otpCancelSchema), OtpController.cancel);

export default router;

