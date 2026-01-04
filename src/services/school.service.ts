import { SchoolModel, School, CreateSchoolInput, UpdateSchoolInput } from '../models/School';

/**
 * School Service
 * Handles all school-related business logic
 */
export class SchoolService {
  /**
   * Get all schools
   */
  static async getSchools(activeOnly: boolean = true): Promise<School[]> {
    return await SchoolModel.findAll(activeOnly);
  }

  /**
   * Get school by ID
   */
  static async getSchoolById(schoolId: string): Promise<School> {
    const school = await SchoolModel.findById(schoolId);

    if (!school) {
      throw new Error('School not found');
    }

    return school;
  }

  /**
   * Create a new school
   */
  static async createSchool(input: CreateSchoolInput): Promise<School> {
    return await SchoolModel.create(input);
  }

  /**
   * Update school
   */
  static async updateSchool(schoolId: string, updateData: UpdateSchoolInput): Promise<School> {
    const updatedSchool = await SchoolModel.update(schoolId, updateData);

    if (!updatedSchool) {
      throw new Error('School not found');
    }

    return updatedSchool;
  }

  /**
   * Delete school (soft delete)
   */
  static async deleteSchool(schoolId: string): Promise<void> {
    await SchoolModel.delete(schoolId);
  }
}

