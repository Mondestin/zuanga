import sql from '../database/connection';

/**
 * Ride status enum
 */
export enum RideStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DRIVER_ASSIGNED = 'DRIVER_ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  PICKED_UP = 'PICKED_UP',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

/**
 * Ride type enum
 */
export enum RideType {
  TO_SCHOOL = 'TO_SCHOOL',
  FROM_SCHOOL = 'FROM_SCHOOL',
}

/**
 * Ride interface matching database schema
 */
export interface Ride {
  id: string;
  kid_id: string;
  driver_id: string | null;
  route_id: string | null;
  subscription_id: string | null;
  status: RideStatus;
  ride_type: RideType;
  scheduled_pickup_time: Date;
  scheduled_dropoff_time: Date | null;
  actual_pickup_time: Date | null;
  actual_dropoff_time: Date | null;
  pickup_address: string;
  pickup_latitude: number;
  pickup_longitude: number;
  dropoff_address: string;
  dropoff_latitude: number;
  dropoff_longitude: number;
  distance_km: number | null;
  duration_minutes: number | null;
  base_fare: number;
  distance_fare: number | null;
  total_fare: number;
  parent_notes: string | null;
  driver_notes: string | null;
  created_at: Date;
  updated_at: Date;
  cancelled_at: Date | null;
  cancelled_by: string | null;
  cancellation_reason: string | null;
}

/**
 * Ride creation input
 */
export interface CreateRideInput {
  kid_id: string;
  ride_type: RideType;
  scheduled_pickup_time: Date | string;
  scheduled_dropoff_time?: Date | string;
  pickup_address: string;
  pickup_latitude: number;
  pickup_longitude: number;
  dropoff_address: string;
  dropoff_latitude: number;
  dropoff_longitude: number;
  base_fare: number;
  distance_fare?: number;
  total_fare: number;
  parent_notes?: string;
  route_id?: string;
}

/**
 * Ride update input
 */
export interface UpdateRideInput {
  driver_id?: string | null;
  route_id?: string | null;
  status?: RideStatus;
  scheduled_pickup_time?: Date | string;
  scheduled_dropoff_time?: Date | string;
  actual_pickup_time?: Date | string;
  actual_dropoff_time?: Date | string;
  distance_km?: number;
  duration_minutes?: number;
  driver_notes?: string;
  cancelled_by?: string | null;
  cancellation_reason?: string | null;
}

/**
 * Ride model with database operations
 */
export class RideModel {
  /**
   * Create a new ride
   */
  static async create(input: CreateRideInput): Promise<Ride> {
    const [ride] = await sql<Ride[]>`
      INSERT INTO rides (
        kid_id, ride_type, scheduled_pickup_time, scheduled_dropoff_time,
        pickup_address, pickup_latitude, pickup_longitude,
        dropoff_address, dropoff_latitude, dropoff_longitude,
        base_fare, distance_fare, total_fare, parent_notes, route_id, subscription_id
      )
      VALUES (
        ${input.kid_id}, ${input.ride_type}, ${input.scheduled_pickup_time},
        ${input.scheduled_dropoff_time || null},
        ${input.pickup_address}, ${input.pickup_latitude}, ${input.pickup_longitude},
        ${input.dropoff_address}, ${input.dropoff_latitude}, ${input.dropoff_longitude},
        ${input.base_fare}, ${input.distance_fare || null}, ${input.total_fare},
        ${input.parent_notes || null}, ${input.route_id || null}, ${input.subscription_id || null}
      )
      RETURNING *
    `;
    return ride;
  }

  /**
   * Find ride by ID
   */
  static async findById(id: string): Promise<Ride | null> {
    const [ride] = await sql<Ride[]>`
      SELECT * FROM rides WHERE id = ${id} LIMIT 1
    `;
    return ride || null;
  }

  /**
   * Find rides by kid ID
   */
  static async findByKidId(kidId: string): Promise<Ride[]> {
    return await sql<Ride[]>`
      SELECT * FROM rides 
      WHERE kid_id = ${kidId}
      ORDER BY scheduled_pickup_time DESC
    `;
  }

  /**
   * Find rides by driver ID
   */
  static async findByDriverId(driverId: string, status?: RideStatus): Promise<Ride[]> {
    if (status) {
      return await sql<Ride[]>`
        SELECT * FROM rides 
        WHERE driver_id = ${driverId} AND status = ${status}::ride_status
        ORDER BY scheduled_pickup_time ASC
      `;
    }
    return await sql<Ride[]>`
      SELECT * FROM rides 
      WHERE driver_id = ${driverId}
      ORDER BY scheduled_pickup_time DESC
    `;
  }

  /**
   * Find active rides (not completed or cancelled)
   */
  static async findActive(): Promise<Ride[]> {
    return await sql<Ride[]>`
      SELECT * FROM rides 
      WHERE status NOT IN ('COMPLETED', 'CANCELLED')
      ORDER BY scheduled_pickup_time ASC
    `;
  }

  /**
   * Update ride
   */
  static async update(id: string, input: UpdateRideInput): Promise<Ride | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (input.driver_id !== undefined) {
      updates.push(`driver_id = $${paramIndex++}`);
      values.push(input.driver_id);
    }
    if (input.route_id !== undefined) {
      updates.push(`route_id = $${paramIndex++}`);
      values.push(input.route_id);
    }
    if (input.status !== undefined) {
      updates.push(`status = $${paramIndex++}::ride_status`);
      values.push(input.status);
    }
    if (input.scheduled_pickup_time !== undefined) {
      updates.push(`scheduled_pickup_time = $${paramIndex++}`);
      values.push(input.scheduled_pickup_time);
    }
    if (input.scheduled_dropoff_time !== undefined) {
      updates.push(`scheduled_dropoff_time = $${paramIndex++}`);
      values.push(input.scheduled_dropoff_time || null);
    }
    if (input.actual_pickup_time !== undefined) {
      updates.push(`actual_pickup_time = $${paramIndex++}`);
      values.push(input.actual_pickup_time || null);
    }
    if (input.actual_dropoff_time !== undefined) {
      updates.push(`actual_dropoff_time = $${paramIndex++}`);
      values.push(input.actual_dropoff_time || null);
    }
    if (input.distance_km !== undefined) {
      updates.push(`distance_km = $${paramIndex++}`);
      values.push(input.distance_km || null);
    }
    if (input.duration_minutes !== undefined) {
      updates.push(`duration_minutes = $${paramIndex++}`);
      values.push(input.duration_minutes || null);
    }
    if (input.driver_notes !== undefined) {
      updates.push(`driver_notes = $${paramIndex++}`);
      values.push(input.driver_notes || null);
    }
    if (input.cancelled_by !== undefined) {
      updates.push(`cancelled_by = $${paramIndex++}`);
      values.push(input.cancelled_by);
      if (!input.cancelled_at) {
        updates.push(`cancelled_at = CURRENT_TIMESTAMP`);
      }
    }
    if (input.cancellation_reason !== undefined) {
      updates.push(`cancellation_reason = $${paramIndex++}`);
      values.push(input.cancellation_reason || null);
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const query = `UPDATE rides SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    
    const [ride] = await sql.unsafe(query, values) as Ride[];
    return ride || null;
  }
}

