import { z } from 'zod';

/**
 * Waypoint validation schema
 */
const waypointSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().optional(),
  order: z.number().int().positive().optional(),
});

/**
 * Create route validation schema
 */
export const createRouteSchema = z.object({
  school_id: z.string().uuid('Invalid school ID format'),
  proposed_driver_id: z.string().uuid('Invalid driver ID format'),
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional(),
  waypoints: z.array(waypointSchema).optional(),
  estimated_distance_km: z.number().positive().optional(),
  estimated_duration_minutes: z.number().int().positive().optional(),
});

/**
 * Update route validation schema
 */
export const updateRouteSchema = z.object({
  school_id: z.string().uuid('Invalid school ID format').optional(),
  driver_id: z.string().uuid('Invalid driver ID format').nullable().optional(),
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional(),
  waypoints: z.array(waypointSchema).optional(),
  estimated_distance_km: z.number().positive().optional(),
  estimated_duration_minutes: z.number().int().positive().optional(),
  is_active: z.boolean().optional(),
});

/**
 * Optimize route validation schema
 */
export const optimizeRouteSchema = z.object({
  school_id: z.string().uuid('Invalid school ID format'),
  waypoints: z
    .array(waypointSchema)
    .min(1, 'At least one waypoint is required'),
  proposed_driver_id: z.string().uuid('Invalid driver ID format'),
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional(),
}).or(z.object({
  school_id: z.string().uuid('Invalid school ID format'),
  waypoints: z
    .array(waypointSchema)
    .min(1, 'At least one waypoint is required'),
  driver_id: z.string().uuid('Invalid driver ID format'), // Backward compatibility
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional(),
}));

