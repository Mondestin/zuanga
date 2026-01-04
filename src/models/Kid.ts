import sql from '../database/connection';

/**
 * Kid interface matching database schema
 */
export interface Kid {
  id: string;
  parent_id: string;
  school_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: Date;
  grade: string | null;
  pickup_address: string;
  pickup_latitude: number;
  pickup_longitude: number;
  dropoff_address: string | null;
  dropoff_latitude: number | null;
  dropoff_longitude: number | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  profile_image_url: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * Kid creation input
 */
export interface CreateKidInput {
  parent_id: string;
  school_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: Date | string;
  grade?: string;
  pickup_address: string;
  pickup_latitude: number;
  pickup_longitude: number;
  dropoff_address?: string;
  dropoff_latitude?: number;
  dropoff_longitude?: number;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  profile_image_url?: string;
}

/**
 * Kid update input
 */
export interface UpdateKidInput {
  school_id?: string;
  first_name?: string;
  last_name?: string;
  date_of_birth?: Date | string;
  grade?: string;
  pickup_address?: string;
  pickup_latitude?: number;
  pickup_longitude?: number;
  dropoff_address?: string;
  dropoff_latitude?: number;
  dropoff_longitude?: number;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  profile_image_url?: string;
  is_active?: boolean;
}

/**
 * Kid model with database operations
 */
export class KidModel {
  /**
   * Create a new kid
   */
  static async create(input: CreateKidInput): Promise<Kid> {
    const [kid] = await sql<Kid[]>`
      INSERT INTO kids (
        parent_id, school_id, first_name, last_name, date_of_birth, grade,
        pickup_address, pickup_latitude, pickup_longitude,
        dropoff_address, dropoff_latitude, dropoff_longitude,
        emergency_contact_name, emergency_contact_phone, profile_image_url
      )
      VALUES (
        ${input.parent_id}, ${input.school_id}, ${input.first_name}, ${input.last_name},
        ${input.date_of_birth}, ${input.grade || null},
        ${input.pickup_address}, ${input.pickup_latitude}, ${input.pickup_longitude},
        ${input.dropoff_address || null}, ${input.dropoff_latitude || null}, ${input.dropoff_longitude || null},
        ${input.emergency_contact_name || null}, ${input.emergency_contact_phone || null},
        ${input.profile_image_url || null}
      )
      RETURNING *
    `;
    return kid;
  }

  /**
   * Find kid by ID
   */
  static async findById(id: string): Promise<Kid | null> {
    const [kid] = await sql<Kid[]>`
      SELECT * FROM kids WHERE id = ${id} LIMIT 1
    `;
    return kid || null;
  }

  /**
   * Find all kids by parent ID
   */
  static async findByParentId(parentId: string, activeOnly: boolean = true): Promise<Kid[]> {
    if (activeOnly) {
      return await sql<Kid[]>`
        SELECT * FROM kids 
        WHERE parent_id = ${parentId} AND is_active = true
        ORDER BY created_at DESC
      `;
    }
    return await sql<Kid[]>`
      SELECT * FROM kids 
      WHERE parent_id = ${parentId}
      ORDER BY created_at DESC
    `;
  }

  /**
   * Find kids by school ID
   */
  static async findBySchoolId(schoolId: string): Promise<Kid[]> {
    return await sql<Kid[]>`
      SELECT * FROM kids 
      WHERE school_id = ${schoolId} AND is_active = true
      ORDER BY first_name ASC, last_name ASC
    `;
  }

  /**
   * Update kid
   */
  static async update(id: string, input: UpdateKidInput): Promise<Kid | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (input.school_id !== undefined) {
      updates.push(`school_id = $${paramIndex++}`);
      values.push(input.school_id);
    }
    if (input.first_name !== undefined) {
      updates.push(`first_name = $${paramIndex++}`);
      values.push(input.first_name);
    }
    if (input.last_name !== undefined) {
      updates.push(`last_name = $${paramIndex++}`);
      values.push(input.last_name);
    }
    if (input.date_of_birth !== undefined) {
      updates.push(`date_of_birth = $${paramIndex++}`);
      values.push(input.date_of_birth);
    }
    if (input.grade !== undefined) {
      updates.push(`grade = $${paramIndex++}`);
      values.push(input.grade || null);
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
      values.push(input.dropoff_address || null);
    }
    if (input.dropoff_latitude !== undefined) {
      updates.push(`dropoff_latitude = $${paramIndex++}`);
      values.push(input.dropoff_latitude || null);
    }
    if (input.dropoff_longitude !== undefined) {
      updates.push(`dropoff_longitude = $${paramIndex++}`);
      values.push(input.dropoff_longitude || null);
    }
    if (input.emergency_contact_name !== undefined) {
      updates.push(`emergency_contact_name = $${paramIndex++}`);
      values.push(input.emergency_contact_name || null);
    }
    if (input.emergency_contact_phone !== undefined) {
      updates.push(`emergency_contact_phone = $${paramIndex++}`);
      values.push(input.emergency_contact_phone || null);
    }
    if (input.profile_image_url !== undefined) {
      updates.push(`profile_image_url = $${paramIndex++}`);
      values.push(input.profile_image_url || null);
    }
    if (input.is_active !== undefined) {
      updates.push(`is_active = $${paramIndex++}`);
      values.push(input.is_active);
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const query = `UPDATE kids SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    
    const [kid] = await sql.unsafe(query, values) as Kid[];
    return kid || null;
  }

  /**
   * Delete kid (soft delete)
   */
  static async delete(id: string): Promise<void> {
    await sql`
      UPDATE kids SET is_active = false WHERE id = ${id}
    `;
  }

  /**
   * Check if kid belongs to parent
   */
  static async belongsToParent(kidId: string, parentId: string): Promise<boolean> {
    const [kid] = await sql<Kid[]>`
      SELECT id FROM kids WHERE id = ${kidId} AND parent_id = ${parentId} LIMIT 1
    `;
    return !!kid;
  }
}

