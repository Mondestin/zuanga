import { z } from 'zod';

/**
 * Create subscription validation schema
 */
export const createSubscriptionSchema = z.object({
  kid_id: z.string().uuid('Invalid kid ID format'),
  school_id: z.string().uuid('Invalid school ID format'),
  subscription_type: z.enum(['WEEKLY', 'MONTHLY'], {
    errorMap: () => ({ message: 'Subscription type must be WEEKLY or MONTHLY' }),
  }),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format'),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format').optional().nullable(),
  days_of_week: z
    .array(z.number().int().min(0).max(6))
    .min(1, 'At least one day of week must be specified')
    .refine(
      (days) => {
        const unique = new Set(days);
        return unique.size === days.length;
      },
      { message: 'Days of week must be unique' }
    ),
  pickup_time: z.string().regex(/^\d{2}:\d{2}$/, 'Pickup time must be in HH:MM format'),
  dropoff_time: z.string().regex(/^\d{2}:\d{2}$/, 'Dropoff time must be in HH:MM format').optional().nullable(),
  pickup_address: z.string().min(1, 'Pickup address is required'),
  pickup_latitude: z.number().min(-90).max(90, 'Latitude must be between -90 and 90'),
  pickup_longitude: z.number().min(-180).max(180, 'Longitude must be between -180 and 180'),
  dropoff_address: z.string().min(1, 'Dropoff address is required'),
  dropoff_latitude: z.number().min(-90).max(90, 'Latitude must be between -90 and 90'),
  dropoff_longitude: z.number().min(-180).max(180, 'Longitude must be between -180 and 180'),
  base_fare: z.number().positive('Base fare must be positive'),
  distance_fare: z.number().nonnegative('Distance fare must be non-negative').optional().nullable(),
  total_fare_per_ride: z.number().positive('Total fare per ride must be positive'),
  subscription_total: z.number().positive('Subscription total must be positive').optional().nullable(),
  parent_notes: z.string().max(1000, 'Parent notes must be less than 1000 characters').optional().nullable(),
  auto_generate_rides: z.boolean().optional(),
});

/**
 * Update subscription validation schema
 */
export const updateSubscriptionSchema = z.object({
  status: z.enum(['ACTIVE', 'PAUSED', 'CANCELLED', 'EXPIRED']).optional(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format').optional().nullable(),
  days_of_week: z
    .array(z.number().int().min(0).max(6))
    .min(1, 'At least one day of week must be specified')
    .optional(),
  pickup_time: z.string().regex(/^\d{2}:\d{2}$/, 'Pickup time must be in HH:MM format').optional(),
  dropoff_time: z.string().regex(/^\d{2}:\d{2}$/, 'Dropoff time must be in HH:MM format').optional().nullable(),
  pickup_address: z.string().min(1, 'Pickup address is required').optional(),
  pickup_latitude: z.number().min(-90).max(90, 'Latitude must be between -90 and 90').optional(),
  pickup_longitude: z.number().min(-180).max(180, 'Longitude must be between -180 and 180').optional(),
  dropoff_address: z.string().min(1, 'Dropoff address is required').optional(),
  dropoff_latitude: z.number().min(-90).max(90, 'Latitude must be between -90 and 90').optional(),
  dropoff_longitude: z.number().min(-180).max(180, 'Longitude must be between -180 and 180').optional(),
  base_fare: z.number().positive('Base fare must be positive').optional(),
  distance_fare: z.number().nonnegative('Distance fare must be non-negative').optional().nullable(),
  total_fare_per_ride: z.number().positive('Total fare per ride must be positive').optional(),
  subscription_total: z.number().positive('Subscription total must be positive').optional().nullable(),
  parent_notes: z.string().max(1000, 'Parent notes must be less than 1000 characters').optional().nullable(),
  auto_generate_rides: z.boolean().optional(),
});

