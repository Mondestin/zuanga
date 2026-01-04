import { z } from 'zod';

/**
 * Register validation schema
 */
export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  first_name: z.string().min(1, 'First name is required').max(100),
  last_name: z.string().min(1, 'Last name is required').max(100),
  role: z.enum(['PARENT', 'DRIVER', 'ADMIN'], {
    errorMap: () => ({ message: 'Role must be PARENT, DRIVER, or ADMIN' }),
  }),
  // Driver-specific fields (only allowed for DRIVER role)
  license_number: z.string().optional(),
  vehicle_make: z.string().optional(),
  vehicle_model: z.string().optional(),
  vehicle_color: z.string().optional(),
  vehicle_plate_number: z.string().optional(),
}).refine(
  (data) => {
    // If role is DRIVER, license_number is required
    if (data.role === 'DRIVER' && !data.license_number) {
      return false;
    }
    return true;
  },
  {
    message: 'License number is required for drivers',
    path: ['license_number'],
  }
).refine(
  (data) => {
    // Vehicle/license fields are only allowed for DRIVER role
    if (data.role !== 'DRIVER') {
      if (data.license_number || data.vehicle_make || data.vehicle_model || 
          data.vehicle_color || data.vehicle_plate_number) {
        return false;
      }
    }
    return true;
  },
  {
    message: 'Vehicle and license information can only be provided for DRIVER role',
    path: ['role'],
  }
);

/**
 * Login validation schema
 */
export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

/**
 * Refresh token validation schema
 */
export const refreshTokenSchema = z.object({
  refresh_token: z.string().min(1, 'Refresh token is required'),
});

/**
 * Update profile validation schema
 */
export const updateProfileSchema = z.object({
  first_name: z.string().min(1).max(100).optional(),
  last_name: z.string().min(1).max(100).optional(),
  phone: z.string().min(10).optional(),
  profile_image_url: z.string().url().optional().or(z.literal('')),
  // Driver-specific fields
  is_available: z.boolean().optional(),
  current_latitude: z.number().min(-90).max(90).optional(),
  current_longitude: z.number().min(-180).max(180).optional(),
  license_number: z.string().optional(),
  vehicle_make: z.string().optional(),
  vehicle_model: z.string().optional(),
  vehicle_color: z.string().optional(),
  vehicle_plate_number: z.string().optional(),
});

