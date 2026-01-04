import { z } from 'zod';

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

/**
 * Create kid validation schema
 */
export const createKidSchema = z.object({
  school_id: z.string().uuid('Invalid school ID'),
  first_name: z.string().min(1, 'First name is required').max(100),
  last_name: z.string().min(1, 'Last name is required').max(100),
  date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  grade: z.string().optional(),
  pickup_address: z.string().min(1, 'Pickup address is required'),
  pickup_latitude: z.number().min(-90).max(90),
  pickup_longitude: z.number().min(-180).max(180),
  dropoff_address: z.string().optional(),
  dropoff_latitude: z.number().min(-90).max(90).optional(),
  dropoff_longitude: z.number().min(-180).max(180).optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
  profile_image_url: z.string().url().optional().or(z.literal('')),
}).refine(
  (data) => {
    // If dropoff_address is provided, coordinates must be provided
    if (data.dropoff_address && (!data.dropoff_latitude || !data.dropoff_longitude)) {
      return false;
    }
    return true;
  },
  {
    message: 'Dropoff coordinates are required when dropoff address is provided',
    path: ['dropoff_latitude'],
  }
);

/**
 * Update kid validation schema
 */
export const updateKidSchema = z.object({
  school_id: z.string().uuid().optional(),
  first_name: z.string().min(1).max(100).optional(),
  last_name: z.string().min(1).max(100).optional(),
  date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  grade: z.string().optional(),
  pickup_address: z.string().optional(),
  pickup_latitude: z.number().min(-90).max(90).optional(),
  pickup_longitude: z.number().min(-180).max(180).optional(),
  dropoff_address: z.string().optional(),
  dropoff_latitude: z.number().min(-90).max(90).optional(),
  dropoff_longitude: z.number().min(-180).max(180).optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
  profile_image_url: z.string().url().optional().or(z.literal('')),
  is_active: z.boolean().optional(),
});

