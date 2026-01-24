import { Request, Response } from 'express';
import { OtpService } from '../services/otp.service';

/**
 * OTP Controller
 * Handles HTTP requests/responses for OTP (SMS verification) endpoints.
 */
export class OtpController {
  /**
   * Start an OTP verification request (Vonage Verify).
   * POST /api/v1/auth/otp/start
   */
  static async start(req: Request, res: Response): Promise<void> {
    try {
      // Accept either `phone` or `number` (client flexibility)
      const phoneNumber = String(req.body.phone || req.body.number || '');
      const brand = req.body.brand ? String(req.body.brand) : undefined;

      const result = await OtpService.startVerification({ phoneNumber, brand });

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to start OTP verification';

      res.status(400).json({
        success: false,
        error: {
          message,
          statusCode: 400,
        },
      });
    }
  }

  /**
   * Check an OTP code for a request_id (Vonage Verify).
   * POST /api/v1/auth/otp/check
   */
  static async check(req: Request, res: Response): Promise<void> {
    try {
      const requestId = String(req.body.request_id || '');
      const code = String(req.body.code || '');

      const result = await OtpService.checkVerification({ requestId, code });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to verify OTP code';

      res.status(400).json({
        success: false,
        error: {
          message,
          statusCode: 400,
        },
      });
    }
  }

  /**
   * Cancel an OTP request (Vonage Verify).
   * POST /api/v1/auth/otp/cancel
   */
  static async cancel(req: Request, res: Response): Promise<void> {
    try {
      const requestId = String(req.body.request_id || '');

      const result = await OtpService.cancelVerification({ requestId });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to cancel OTP request';

      res.status(400).json({
        success: false,
        error: {
          message,
          statusCode: 400,
        },
      });
    }
  }
}

