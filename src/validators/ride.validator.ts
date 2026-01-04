import { z } from 'zod';

/**
 * Create ride validation schema
 */
export const createRideSchema = z.object({
  kid_id: z.string().uuid('Invalid kid ID'),
  ride_type: z.enum(['TO_SCHOOL', 'FROM_SCHOOL'], {
    errorMap: () => ({ message: 'Ride type must be TO_SCHOOL or FROM_SCHOOL' }),
  }),
  scheduled_pickup_time: z.string().datetime('Invalid datetime format'),
  scheduled_dropoff_time: z.string().datetime().optional(),
  pickup_address: z.string().min(1, 'Pickup address is required'),
  pickup_latitude: z.number().min(-90).max(90),
  pickup_longitude: z.number().min(-180).max(180),
  dropoff_address: z.string().min(1, 'Dropoff address is required'),
  dropoff_latitude: z.number().min(-90).max(90),
  dropoff_longitude: z.number().min(-180).max(180),
  base_fare: z.number().min(0, 'Base fare must be positive'),
  distance_fare: z.number().min(0).optional(),
  total_fare: z.number().min(0, 'Total fare must be positive'),
  parent_notes: z.string().optional(),
  route_id: z.string().uuid().optional(),
});

/**
 * Update ride status validation schema
 */
export const updateRideStatusSchema = z.object({
  status: z.enum(['PENDING', 'ACCEPTED', 'DRIVER_ASSIGNED', 'IN_PROGRESS', 'PICKED_UP', 'COMPLETED', 'CANCELLED']).optional(),
  driver_notes: z.string().optional(),
  cancellation_reason: z.string().optional(),
});

