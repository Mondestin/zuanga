import { z } from 'zod';

/**
 * OTP (One-Time Password) validation schemas
 * NOTE: We accept both `phone` and `number` to match common client payloads.
 */

export const otpStartSchema = z
  .object({
    // Some clients send `phone`, others send `number` (Vonage examples often use `number`)
    phone: z.string().min(8, 'Phone number must be at least 8 characters').max(25).optional(),
    number: z.string().min(8, 'Phone number must be at least 8 characters').max(25).optional(),
    // Optional branding for the SMS message (falls back to server env default)
    brand: z.string().min(1, 'Brand must not be empty').max(50).optional(),
  })
  .refine((data) => Boolean(data.phone || data.number), {
    message: 'Either phone or number is required',
    path: ['phone'],
  });

export const otpCheckSchema = z.object({
  request_id: z.string().min(1, 'request_id is required'),
  // Vonage Verify calls this field `code`
  code: z.string().min(4, 'code is required').max(10),
});

export const otpCancelSchema = z.object({
  request_id: z.string().min(1, 'request_id is required'),
});

