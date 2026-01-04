import sql from '../database/connection';

/**
 * RoutePoint interface matching database schema
 */
export interface RoutePoint {
  id: string;
  ride_id: string;
  latitude: number;
  longitude: number;
  accuracy: number | null;
  heading: number | null;
  speed: number | null;
  recorded_at: Date;
}

/**
 * RoutePoint creation input
 */
export interface CreateRoutePointInput {
  ride_id: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  heading?: number;
  speed?: number;
}

/**
 * RoutePoint model with database operations
 */
export class RoutePointModel {
  /**
   * Create a new route point
   */
  static async create(input: CreateRoutePointInput): Promise<RoutePoint> {
    const [point] = await sql<RoutePoint[]>`
      INSERT INTO route_points (
        ride_id, latitude, longitude, accuracy, heading, speed
      )
      VALUES (
        ${input.ride_id}, ${input.latitude}, ${input.longitude},
        ${input.accuracy || null}, ${input.heading || null}, ${input.speed || null}
      )
      RETURNING *
    `;
    return point;
  }

  /**
   * Find route points by ride ID
   */
  static async findByRideId(rideId: string, limit?: number): Promise<RoutePoint[]> {
    if (limit) {
      return await sql<RoutePoint[]>`
        SELECT * FROM route_points 
        WHERE ride_id = ${rideId}
        ORDER BY recorded_at DESC
        LIMIT ${limit}
      `;
    }
    return await sql<RoutePoint[]>`
      SELECT * FROM route_points 
      WHERE ride_id = ${rideId}
      ORDER BY recorded_at ASC
    `;
  }

  /**
   * Get latest route point for a ride
   */
  static async getLatest(rideId: string): Promise<RoutePoint | null> {
    const [point] = await sql<RoutePoint[]>`
      SELECT * FROM route_points 
      WHERE ride_id = ${rideId}
      ORDER BY recorded_at DESC
      LIMIT 1
    `;
    return point || null;
  }

  /**
   * Delete old route points (cleanup)
   */
  static async deleteOld(olderThanDays: number = 30): Promise<number> {
    const result = await sql`
      DELETE FROM route_points 
      WHERE recorded_at < CURRENT_TIMESTAMP - INTERVAL '${olderThanDays} days'
    `;
    return result.count || 0;
  }
}

