import sql from '../database/connection';

/**
 * School interface matching database schema
 */
export interface School {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string | null;
  country: string;
  postal_code: string | null;
  latitude: number;
  longitude: number;
  phone: string | null;
  email: string | null;
  website: string | null;
  start_time: string | null; // TIME format
  end_time: string | null; // TIME format
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * School creation input
 */
export interface CreateSchoolInput {
  name: string;
  address: string;
  city: string;
  state?: string;
  country?: string;
  postal_code?: string;
  latitude: number;
  longitude: number;
  phone?: string;
  email?: string;
  website?: string;
  start_time?: string;
  end_time?: string;
}

/**
 * School update input
 */
export interface UpdateSchoolInput {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  email?: string;
  website?: string;
  start_time?: string;
  end_time?: string;
  is_active?: boolean;
}

/**
 * School model with database operations
 */
export class SchoolModel {
  /**
   * Create a new school
   */
  static async create(input: CreateSchoolInput): Promise<School> {
    const [school] = await sql<School[]>`
      INSERT INTO schools (
        name, address, city, state, country, postal_code,
        latitude, longitude, phone, email, website, start_time, end_time
      )
      VALUES (
        ${input.name}, ${input.address}, ${input.city},
        ${input.state || null}, ${input.country || 'US'}, ${input.postal_code || null},
        ${input.latitude}, ${input.longitude},
        ${input.phone || null}, ${input.email || null}, ${input.website || null},
        ${input.start_time || null}, ${input.end_time || null}
      )
      RETURNING *
    `;
    return school;
  }

  /**
   * Find school by ID
   */
  static async findById(id: string): Promise<School | null> {
    const [school] = await sql<School[]>`
      SELECT * FROM schools WHERE id = ${id} LIMIT 1
    `;
    return school || null;
  }

  /**
   * Find all schools
   */
  static async findAll(activeOnly: boolean = false): Promise<School[]> {
    if (activeOnly) {
      return await sql<School[]>`
        SELECT * FROM schools 
        WHERE is_active = true 
        ORDER BY name ASC
      `;
    }
    return await sql<School[]>`
      SELECT * FROM schools 
      ORDER BY name ASC
    `;
  }

  /**
   * Find schools by city
   */
  static async findByCity(city: string): Promise<School[]> {
    return await sql<School[]>`
      SELECT * FROM schools 
      WHERE city = ${city} AND is_active = true
      ORDER BY name ASC
    `;
  }

  /**
   * Update school
   */
  static async update(id: string, input: UpdateSchoolInput): Promise<School | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (input.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(input.name);
    }
    if (input.address !== undefined) {
      updates.push(`address = $${paramIndex++}`);
      values.push(input.address);
    }
    if (input.city !== undefined) {
      updates.push(`city = $${paramIndex++}`);
      values.push(input.city);
    }
    if (input.state !== undefined) {
      updates.push(`state = $${paramIndex++}`);
      values.push(input.state || null);
    }
    if (input.country !== undefined) {
      updates.push(`country = $${paramIndex++}`);
      values.push(input.country);
    }
    if (input.postal_code !== undefined) {
      updates.push(`postal_code = $${paramIndex++}`);
      values.push(input.postal_code || null);
    }
    if (input.latitude !== undefined) {
      updates.push(`latitude = $${paramIndex++}`);
      values.push(input.latitude);
    }
    if (input.longitude !== undefined) {
      updates.push(`longitude = $${paramIndex++}`);
      values.push(input.longitude);
    }
    if (input.phone !== undefined) {
      updates.push(`phone = $${paramIndex++}`);
      values.push(input.phone || null);
    }
    if (input.email !== undefined) {
      updates.push(`email = $${paramIndex++}`);
      values.push(input.email || null);
    }
    if (input.website !== undefined) {
      updates.push(`website = $${paramIndex++}`);
      values.push(input.website || null);
    }
    if (input.start_time !== undefined) {
      updates.push(`start_time = $${paramIndex++}`);
      values.push(input.start_time || null);
    }
    if (input.end_time !== undefined) {
      updates.push(`end_time = $${paramIndex++}`);
      values.push(input.end_time || null);
    }
    if (input.is_active !== undefined) {
      updates.push(`is_active = $${paramIndex++}`);
      values.push(input.is_active);
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const query = `UPDATE schools SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    
    const [school] = await sql.unsafe(query, values) as School[];
    return school || null;
  }

  /**
   * Delete school (soft delete by setting is_active = false)
   */
  static async delete(id: string): Promise<void> {
    await sql`
      UPDATE schools SET is_active = false WHERE id = ${id}
    `;
  }
}

