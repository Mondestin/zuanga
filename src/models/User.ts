import sql from '../database/connection';

/**
 * User roles enum
 */
export enum UserRole {
  PARENT = 'PARENT',
  DRIVER = 'DRIVER',
  ADMIN = 'ADMIN',
}

/**
 * User interface matching database schema
 */
export interface User {
  id: string;
  email: string;
  phone: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  
  // Driver-specific fields
  license_number?: string | null;
  vehicle_make?: string | null;
  vehicle_model?: string | null;
  vehicle_color?: string | null;
  vehicle_plate_number?: string | null;
  is_available?: boolean | null;
  current_latitude?: number | null;
  current_longitude?: number | null;
  
  // Profile fields
  profile_image_url?: string | null;
  is_verified: boolean;
  is_active: boolean;
  
  // Timestamps
  created_at: Date;
  updated_at: Date;
  last_login_at?: Date | null;
}

/**
 * User creation input (without password_hash, will be hashed)
 */
export interface CreateUserInput {
  email: string;
  phone: string;
  password: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  license_number?: string;
  vehicle_make?: string;
  vehicle_model?: string;
  vehicle_color?: string;
  vehicle_plate_number?: string;
}

/**
 * User update input
 */
export interface UpdateUserInput {
  first_name?: string;
  last_name?: string;
  phone?: string;
  profile_image_url?: string;
  is_available?: boolean;
  current_latitude?: number;
  current_longitude?: number;
  license_number?: string;
  vehicle_make?: string;
  vehicle_model?: string;
  vehicle_color?: string;
  vehicle_plate_number?: string;
  is_active?: boolean; // Admin can activate/deactivate users
}

/**
 * User model with database operations
 */
export class UserModel {
  /**
   * Create a new user
   */
  static async create(input: CreateUserInput, passwordHash: string): Promise<User> {
    // Only include vehicle/license fields if role is DRIVER
    // This ensures parents and admins don't have unnecessary car information
    const isDriver = input.role === UserRole.DRIVER;
    
    const [user] = await sql<User[]>`
      INSERT INTO users (
        email, phone, password_hash, first_name, last_name, role,
        license_number, vehicle_make, vehicle_model, vehicle_color, vehicle_plate_number
      )
      VALUES (
        ${input.email}, ${input.phone}, ${passwordHash}, ${input.first_name}, 
        ${input.last_name}, ${input.role}::user_role,
        ${isDriver ? (input.license_number || null) : null},
        ${isDriver ? (input.vehicle_make || null) : null},
        ${isDriver ? (input.vehicle_model || null) : null},
        ${isDriver ? (input.vehicle_color || null) : null},
        ${isDriver ? (input.vehicle_plate_number || null) : null}
      )
      RETURNING *
    `;
    return user;
  }

  /**
   * Find user by email
   */
  static async findByEmail(email: string): Promise<User | null> {
    const [user] = await sql<User[]>`
      SELECT * FROM users WHERE email = ${email} LIMIT 1
    `;
    return user || null;
  }

  /**
   * Find user by ID
   */
  static async findById(id: string): Promise<User | null> {
    const [user] = await sql<User[]>`
      SELECT * FROM users WHERE id = ${id} LIMIT 1
    `;
    return user || null;
  }

  /**
   * Find user by phone
   */
  static async findByPhone(phone: string): Promise<User | null> {
    const [user] = await sql<User[]>`
      SELECT * FROM users WHERE phone = ${phone} LIMIT 1
    `;
    return user || null;
  }

  /**
   * Update user
   * Only allows vehicle/license fields to be updated for drivers
   */
  static async update(id: string, input: UpdateUserInput): Promise<User | null> {
    // Get current user to check role
    const currentUser = await this.findById(id);
    if (!currentUser) {
      return null;
    }

    const isDriver = currentUser.role === UserRole.DRIVER;
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (input.first_name !== undefined) {
      updates.push(`first_name = $${paramIndex++}`);
      values.push(input.first_name);
    }
    if (input.last_name !== undefined) {
      updates.push(`last_name = $${paramIndex++}`);
      values.push(input.last_name);
    }
    if (input.phone !== undefined) {
      updates.push(`phone = $${paramIndex++}`);
      values.push(input.phone);
    }
    if (input.profile_image_url !== undefined) {
      updates.push(`profile_image_url = $${paramIndex++}`);
      values.push(input.profile_image_url || null);
    }
    if (input.is_available !== undefined) {
      updates.push(`is_available = $${paramIndex++}`);
      values.push(input.is_available);
    }
    if (input.current_latitude !== undefined) {
      updates.push(`current_latitude = $${paramIndex++}`);
      values.push(input.current_latitude);
    }
    if (input.current_longitude !== undefined) {
      updates.push(`current_longitude = $${paramIndex++}`);
      values.push(input.current_longitude);
    }
    
    // Only allow vehicle/license fields to be updated for drivers
    if (input.license_number !== undefined) {
      if (isDriver) {
        updates.push(`license_number = $${paramIndex++}`);
        values.push(input.license_number || null);
      }
      // Ignore for non-drivers (don't update the field)
    }
    if (input.vehicle_make !== undefined) {
      if (isDriver) {
        updates.push(`vehicle_make = $${paramIndex++}`);
        values.push(input.vehicle_make || null);
      }
      // Ignore for non-drivers
    }
    if (input.vehicle_model !== undefined) {
      if (isDriver) {
        updates.push(`vehicle_model = $${paramIndex++}`);
        values.push(input.vehicle_model || null);
      }
      // Ignore for non-drivers
    }
    if (input.vehicle_color !== undefined) {
      if (isDriver) {
        updates.push(`vehicle_color = $${paramIndex++}`);
        values.push(input.vehicle_color || null);
      }
      // Ignore for non-drivers
    }
    if (input.vehicle_plate_number !== undefined) {
      if (isDriver) {
        updates.push(`vehicle_plate_number = $${paramIndex++}`);
        values.push(input.vehicle_plate_number || null);
      }
      // Ignore for non-drivers
    }
    if (input.is_active !== undefined) {
      updates.push(`is_active = $${paramIndex++}`);
      values.push(input.is_active);
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    
    const [user] = await sql.unsafe(query, values) as User[];
    return user || null;
  }

  /**
   * Update last login timestamp
   */
  static async updateLastLogin(id: string): Promise<void> {
    await sql`
      UPDATE users 
      SET last_login_at = CURRENT_TIMESTAMP 
      WHERE id = ${id}
    `;
  }

  /**
   * Check if email exists
   */
  static async emailExists(email: string, excludeId?: string): Promise<boolean> {
    const query = excludeId
      ? sql`SELECT 1 FROM users WHERE email = ${email} AND id != ${excludeId} LIMIT 1`
      : sql`SELECT 1 FROM users WHERE email = ${email} LIMIT 1`;
    
    const [result] = await query;
    return !!result;
  }

  /**
   * Check if phone exists
   */
  static async phoneExists(phone: string, excludeId?: string): Promise<boolean> {
    const query = excludeId
      ? sql`SELECT 1 FROM users WHERE phone = ${phone} AND id != ${excludeId} LIMIT 1`
      : sql`SELECT 1 FROM users WHERE phone = ${phone} LIMIT 1`;
    
    const [result] = await query;
    return !!result;
  }

  /**
   * Get all drivers
   */
  static async findDrivers(availableOnly: boolean = false): Promise<User[]> {
    if (availableOnly) {
      return await sql<User[]>`
        SELECT * FROM users 
        WHERE role = 'DRIVER'::user_role 
        AND is_available = true 
        AND is_active = true
        ORDER BY created_at DESC
      `;
    }
    return await sql<User[]>`
      SELECT * FROM users 
      WHERE role = 'DRIVER'::user_role 
      AND is_active = true
      ORDER BY created_at DESC
    `;
  }

  /**
   * Find all users (admin only)
   */
  static async findAll(activeOnly: boolean = false): Promise<User[]> {
    if (activeOnly) {
      return await sql<User[]>`
        SELECT * FROM users 
        WHERE is_active = true
        ORDER BY created_at DESC
      `;
    }
    return await sql<User[]>`
      SELECT * FROM users 
      ORDER BY created_at DESC
    `;
  }

  /**
   * Find users by role (admin only)
   */
  static async findByRole(role: UserRole, activeOnly: boolean = false): Promise<User[]> {
    if (activeOnly) {
      return await sql<User[]>`
        SELECT * FROM users 
        WHERE role = ${role}::user_role 
        AND is_active = true
        ORDER BY created_at DESC
      `;
    }
    return await sql<User[]>`
      SELECT * FROM users 
      WHERE role = ${role}::user_role
      ORDER BY created_at DESC
    `;
  }
}

