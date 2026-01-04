import { z } from 'zod';

/**
 * Create school validation schema
 */
export const createSchoolSchema = z.object({
  name: z.string().min(1, 'School name is required').max(255),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required').max(100),
  state: z.string().max(100).optional(),
  country: z.string().max(100).optional().default('US'),
  postal_code: z.string().max(20).optional(),
  latitude: z.number().min(-90).max(90, 'Invalid latitude'),
  longitude: z.number().min(-180).max(180, 'Invalid longitude'),
  phone: z.string().max(20).optional(),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
  website: z.string().url('Invalid URL format').optional().or(z.literal('')),
  start_time: z.string().regex(/^\d{2}:\d{2}:\d{2}$/, 'Time must be in HH:MM:SS format').optional(),
  end_time: z.string().regex(/^\d{2}:\d{2}:\d{2}$/, 'Time must be in HH:MM:SS format').optional(),
});

/**
 * Update school validation schema
 */
export const updateSchoolSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  address: z.string().min(1).optional(),
  city: z.string().min(1).max(100).optional(),
  state: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  postal_code: z.string().max(20).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email().optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
  start_time: z.string().regex(/^\d{2}:\d{2}:\d{2}$/).optional(),
  end_time: z.string().regex(/^\d{2}:\d{2}:\d{2}$/).optional(),
  is_active: z.boolean().optional(),
});

