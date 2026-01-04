import sql from '../database/connection';

/**
 * Route status enum
 */
export enum RouteStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

/**
 * Route interface matching database schema
 */
export interface Route {
  id: string;
  school_id: string;
  driver_id: string | null;
  proposed_driver_id: string | null;
  status: RouteStatus;
  name: string | null;
  description: string | null;
  waypoints: any; // JSONB
  estimated_distance_km: number | null;
  estimated_duration_minutes: number | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * Route creation input
 */
export interface CreateRouteInput {
  school_id: string;
  proposed_driver_id: string; // Required - driver to propose the route to
  name?: string;
  description?: string;
  waypoints?: any;
  estimated_distance_km?: number;
  estimated_duration_minutes?: number;
}

/**
 * Route update input
 */
export interface UpdateRouteInput {
  school_id?: string;
  driver_id?: string | null;
  proposed_driver_id?: string | null;
  status?: RouteStatus;
  name?: string;
  description?: string;
  waypoints?: any;
  estimated_distance_km?: number;
  estimated_duration_minutes?: number;
  is_active?: boolean;
}

/**
 * Route model with database operations
 */
export class RouteModel {
  /**
   * Create a new route (proposed to a driver)
   */
  static async create(input: CreateRouteInput): Promise<Route> {
    const [route] = await sql<Route[]>`
      INSERT INTO routes (
        school_id, proposed_driver_id, name, description, waypoints,
        estimated_distance_km, estimated_duration_minutes, status
      )
      VALUES (
        ${input.school_id}, ${input.proposed_driver_id}, ${input.name || null},
        ${input.description || null}, ${JSON.stringify(input.waypoints || [])}::jsonb,
        ${input.estimated_distance_km || null}, ${input.estimated_duration_minutes || null},
        'PENDING'::route_status
      )
      RETURNING *
    `;
    return route;
  }

  /**
   * Find route by ID
   */
  static async findById(id: string): Promise<Route | null> {
    const [route] = await sql<Route[]>`
      SELECT * FROM routes WHERE id = ${id} LIMIT 1
    `;
    return route || null;
  }

  /**
   * Find routes by school ID
   */
  static async findBySchoolId(schoolId: string): Promise<Route[]> {
    return await sql<Route[]>`
      SELECT * FROM routes 
      WHERE school_id = ${schoolId} AND is_active = true
      ORDER BY created_at DESC
    `;
  }

  /**
   * Find routes by driver ID (accepted routes)
   */
  static async findByDriverId(driverId: string): Promise<Route[]> {
    return await sql<Route[]>`
      SELECT * FROM routes 
      WHERE driver_id = ${driverId} AND is_active = true
      ORDER BY created_at DESC
    `;
  }

  /**
   * Find routes proposed to a driver (pending proposals)
   */
  static async findProposedToDriver(driverId: string): Promise<Route[]> {
    return await sql<Route[]>`
      SELECT * FROM routes 
      WHERE proposed_driver_id = ${driverId} AND status = 'PENDING'::route_status AND is_active = true
      ORDER BY created_at DESC
    `;
  }

  /**
   * Find all active routes
   */
  static async findAll(activeOnly: boolean = true): Promise<Route[]> {
    if (activeOnly) {
      return await sql<Route[]>`
        SELECT * FROM routes 
        WHERE is_active = true
        ORDER BY created_at DESC
      `;
    }
    return await sql<Route[]>`
      SELECT * FROM routes 
      ORDER BY created_at DESC
    `;
  }

  /**
   * Update route
   */
  static async update(id: string, input: UpdateRouteInput): Promise<Route | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (input.school_id !== undefined) {
      updates.push(`school_id = $${paramIndex++}`);
      values.push(input.school_id);
    }
    if (input.driver_id !== undefined) {
      updates.push(`driver_id = $${paramIndex++}`);
      values.push(input.driver_id);
    }
    if (input.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(input.name || null);
    }
    if (input.description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(input.description || null);
    }
    if (input.waypoints !== undefined) {
      updates.push(`waypoints = $${paramIndex++}::jsonb`);
      values.push(JSON.stringify(input.waypoints));
    }
    if (input.estimated_distance_km !== undefined) {
      updates.push(`estimated_distance_km = $${paramIndex++}`);
      values.push(input.estimated_distance_km || null);
    }
    if (input.estimated_duration_minutes !== undefined) {
      updates.push(`estimated_duration_minutes = $${paramIndex++}`);
      values.push(input.estimated_duration_minutes || null);
    }
    if (input.is_active !== undefined) {
      updates.push(`is_active = $${paramIndex++}`);
      values.push(input.is_active);
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const query = `UPDATE routes SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    
    const [route] = await sql.unsafe(query, values) as Route[];
    return route || null;
  }
}

