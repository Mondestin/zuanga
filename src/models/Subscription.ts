import sql from '../database/connection';

/**
 * Subscription type enum
 */
export enum SubscriptionType {
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
}

/**
 * Subscription status enum
 */
export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

/**
 * Day of week enum (0=Sunday, 1=Monday, ..., 6=Saturday)
 */
export enum DayOfWeek {
  SUNDAY = 0,
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6,
}

/**
 * Subscription interface matching database schema
 */
export interface Subscription {
  id: string;
  parent_id: string;
  kid_id: string;
  school_id: string;
  subscription_type: SubscriptionType;
  status: SubscriptionStatus;
  start_date: Date;
  end_date: Date | null;
  days_of_week: number[]; // Array of day numbers (0-6)
  pickup_time: string; // TIME format (HH:MM:SS)
  dropoff_time: string | null;
  pickup_address: string;
  pickup_latitude: number;
  pickup_longitude: number;
  dropoff_address: string;
  dropoff_latitude: number;
  dropoff_longitude: number;
  base_fare: number;
  distance_fare: number | null;
  total_fare_per_ride: number;
  subscription_total: number | null;
  parent_notes: string | null;
  auto_generate_rides: boolean;
  last_ride_generated_date: Date | null;
  created_at: Date;
  updated_at: Date;
  paused_at: Date | null;
  cancelled_at: Date | null;
}

/**
 * Subscription creation input
 */
export interface CreateSubscriptionInput {
  parent_id: string;
  kid_id: string;
  school_id: string;
  subscription_type: SubscriptionType;
  start_date: Date | string;
  end_date?: Date | string | null;
  days_of_week: number[]; // Array of day numbers (0-6)
  pickup_time: string; // HH:MM format
  dropoff_time?: string | null;
  pickup_address: string;
  pickup_latitude: number;
  pickup_longitude: number;
  dropoff_address: string;
  dropoff_latitude: number;
  dropoff_longitude: number;
  base_fare: number;
  distance_fare?: number | null;
  total_fare_per_ride: number;
  subscription_total?: number | null;
  parent_notes?: string | null;
  auto_generate_rides?: boolean;
}

/**
 * Subscription update input
 */
export interface UpdateSubscriptionInput {
  status?: SubscriptionStatus;
  end_date?: Date | string | null;
  days_of_week?: number[];
  pickup_time?: string;
  dropoff_time?: string | null;
  pickup_address?: string;
  pickup_latitude?: number;
  pickup_longitude?: number;
  dropoff_address?: string;
  dropoff_latitude?: number;
  dropoff_longitude?: number;
  base_fare?: number;
  distance_fare?: number | null;
  total_fare_per_ride?: number;
  subscription_total?: number | null;
  parent_notes?: string | null;
  auto_generate_rides?: boolean;
}

/**
 * Subscription model with database operations
 */
export class SubscriptionModel {
  /**
   * Create a new subscription
   */
  static async create(input: CreateSubscriptionInput): Promise<Subscription> {
    const [subscription] = await sql<Subscription[]>`
      INSERT INTO subscriptions (
        parent_id, kid_id, school_id, subscription_type, start_date, end_date,
        days_of_week, pickup_time, dropoff_time,
        pickup_address, pickup_latitude, pickup_longitude,
        dropoff_address, dropoff_latitude, dropoff_longitude,
        base_fare, distance_fare, total_fare_per_ride, subscription_total,
        parent_notes, auto_generate_rides
      )
      VALUES (
        ${input.parent_id}, ${input.kid_id}, ${input.school_id}, 
        ${input.subscription_type}::subscription_type,
        ${input.start_date}, ${input.end_date || null},
        ${JSON.stringify(input.days_of_week)}::integer[],
        ${input.pickup_time}::time, ${input.dropoff_time || null}::time,
        ${input.pickup_address}, ${input.pickup_latitude}, ${input.pickup_longitude},
        ${input.dropoff_address}, ${input.dropoff_latitude}, ${input.dropoff_longitude},
        ${input.base_fare}, ${input.distance_fare || null}, ${input.total_fare_per_ride},
        ${input.subscription_total || null}, ${input.parent_notes || null},
        ${input.auto_generate_rides !== false}
      )
      RETURNING *
    `;
    return subscription;
  }

  /**
   * Find subscription by ID
   */
  static async findById(id: string): Promise<Subscription | null> {
    const [subscription] = await sql<Subscription[]>`
      SELECT * FROM subscriptions WHERE id = ${id} LIMIT 1
    `;
    return subscription || null;
  }

  /**
   * Find subscriptions by parent ID
   */
  static async findByParentId(parentId: string, activeOnly: boolean = false): Promise<Subscription[]> {
    if (activeOnly) {
      return await sql<Subscription[]>`
        SELECT * FROM subscriptions 
        WHERE parent_id = ${parentId} AND status = 'ACTIVE'::subscription_status
        ORDER BY created_at DESC
      `;
    }
    return await sql<Subscription[]>`
      SELECT * FROM subscriptions 
      WHERE parent_id = ${parentId}
      ORDER BY created_at DESC
    `;
  }

  /**
   * Find subscriptions by kid ID
   */
  static async findByKidId(kidId: string, activeOnly: boolean = false): Promise<Subscription[]> {
    if (activeOnly) {
      return await sql<Subscription[]>`
        SELECT * FROM subscriptions 
        WHERE kid_id = ${kidId} AND status = 'ACTIVE'::subscription_status
        ORDER BY created_at DESC
      `;
    }
    return await sql<Subscription[]>`
      SELECT * FROM subscriptions 
      WHERE kid_id = ${kidId}
      ORDER BY created_at DESC
    `;
  }

  /**
   * Find active subscriptions that need ride generation
   */
  static async findActiveForRideGeneration(upToDate: Date = new Date()): Promise<Subscription[]> {
    return await sql<Subscription[]>`
      SELECT * FROM subscriptions 
      WHERE status = 'ACTIVE'::subscription_status
        AND auto_generate_rides = true
        AND start_date <= ${upToDate}
        AND (end_date IS NULL OR end_date >= ${upToDate})
      ORDER BY start_date ASC
    `;
  }

  /**
   * Update subscription
   */
  static async update(id: string, input: UpdateSubscriptionInput): Promise<Subscription | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (input.status !== undefined) {
      updates.push(`status = $${paramIndex++}::subscription_status`);
      values.push(input.status);
      // Set paused_at or cancelled_at based on status
      if (input.status === SubscriptionStatus.PAUSED) {
        updates.push(`paused_at = CURRENT_TIMESTAMP`);
      } else if (input.status === SubscriptionStatus.CANCELLED) {
        updates.push(`cancelled_at = CURRENT_TIMESTAMP`);
      }
    }
    if (input.end_date !== undefined) {
      updates.push(`end_date = $${paramIndex++}`);
      values.push(input.end_date || null);
    }
    if (input.days_of_week !== undefined) {
      updates.push(`days_of_week = $${paramIndex++}::integer[]`);
      values.push(JSON.stringify(input.days_of_week));
    }
    if (input.pickup_time !== undefined) {
      updates.push(`pickup_time = $${paramIndex++}::time`);
      values.push(input.pickup_time);
    }
    if (input.dropoff_time !== undefined) {
      updates.push(`dropoff_time = $${paramIndex++}::time`);
      values.push(input.dropoff_time || null);
    }
    if (input.pickup_address !== undefined) {
      updates.push(`pickup_address = $${paramIndex++}`);
      values.push(input.pickup_address);
    }
    if (input.pickup_latitude !== undefined) {
      updates.push(`pickup_latitude = $${paramIndex++}`);
      values.push(input.pickup_latitude);
    }
    if (input.pickup_longitude !== undefined) {
      updates.push(`pickup_longitude = $${paramIndex++}`);
      values.push(input.pickup_longitude);
    }
    if (input.dropoff_address !== undefined) {
      updates.push(`dropoff_address = $${paramIndex++}`);
      values.push(input.dropoff_address);
    }
    if (input.dropoff_latitude !== undefined) {
      updates.push(`dropoff_latitude = $${paramIndex++}`);
      values.push(input.dropoff_latitude);
    }
    if (input.dropoff_longitude !== undefined) {
      updates.push(`dropoff_longitude = $${paramIndex++}`);
      values.push(input.dropoff_longitude);
    }
    if (input.base_fare !== undefined) {
      updates.push(`base_fare = $${paramIndex++}`);
      values.push(input.base_fare);
    }
    if (input.distance_fare !== undefined) {
      updates.push(`distance_fare = $${paramIndex++}`);
      values.push(input.distance_fare || null);
    }
    if (input.total_fare_per_ride !== undefined) {
      updates.push(`total_fare_per_ride = $${paramIndex++}`);
      values.push(input.total_fare_per_ride);
    }
    if (input.subscription_total !== undefined) {
      updates.push(`subscription_total = $${paramIndex++}`);
      values.push(input.subscription_total || null);
    }
    if (input.parent_notes !== undefined) {
      updates.push(`parent_notes = $${paramIndex++}`);
      values.push(input.parent_notes || null);
    }
    if (input.auto_generate_rides !== undefined) {
      updates.push(`auto_generate_rides = $${paramIndex++}`);
      values.push(input.auto_generate_rides);
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    // Always update updated_at
    updates.push(`updated_at = CURRENT_TIMESTAMP`);

    values.push(id);
    const query = `UPDATE subscriptions SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    
    const [subscription] = await sql.unsafe(query, values) as Subscription[];
    return subscription || null;
  }

  /**
   * Update last ride generated date
   */
  static async updateLastRideGeneratedDate(id: string, date: Date): Promise<void> {
    await sql`
      UPDATE subscriptions 
      SET last_ride_generated_date = ${date}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `;
  }
}

