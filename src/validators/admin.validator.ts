import { z } from 'zod';

/**
 * Update user validation schema (admin)
 */
export const updateUserSchema = z.object({
  first_name: z.string().min(1).max(100).optional(),
  last_name: z.string().min(1).max(100).optional(),
  phone: z.string().min(10).optional(),
  profile_image_url: z.string().url().optional().or(z.literal('')),
  is_available: z.boolean().optional(),
  current_latitude: z.number().min(-90).max(90).optional(),
  current_longitude: z.number().min(-180).max(180).optional(),
  // Vehicle/license fields - should only be set for drivers
  // Admin can update these, but they should only be set for DRIVER role users
  license_number: z.string().optional(),
  vehicle_make: z.string().optional(),
  vehicle_model: z.string().optional(),
  vehicle_color: z.string().optional(),
  vehicle_plate_number: z.string().optional(),
  is_active: z.boolean().optional(), // Admin can activate/deactivate users
});

