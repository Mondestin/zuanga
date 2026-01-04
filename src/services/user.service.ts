import { UserModel, User, UpdateUserInput } from '../models/User';
import { KidModel, Kid, CreateKidInput, UpdateKidInput } from '../models/Kid';
import { SchoolModel } from '../models/School';

/**
 * User Service
 * Handles all user-related business logic
 */
export class UserService {
  /**
   * Get user profile
   */
  static async getProfile(userId: string): Promise<Omit<User, 'password_hash'>> {
    const user = await UserModel.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    const { password_hash, ...userResponse } = user;
    return userResponse;
  }

  /**
   * Update user profile
   */
  static async updateProfile(userId: string, updateData: UpdateUserInput): Promise<Omit<User, 'password_hash'>> {
    const currentUser = await UserModel.findById(userId);
    if (!currentUser) {
      throw new Error('User not found');
    }

    // Check if phone is being updated and if it's already taken
    if (updateData.phone && updateData.phone !== currentUser.phone) {
      if (await UserModel.phoneExists(updateData.phone, userId)) {
        throw new Error('Phone number already registered');
      }
    }

    // Only allow vehicle/license fields to be updated for drivers
    // Remove these fields from update data if user is not a driver
    let filteredUpdateData = updateData;
    if (currentUser.role !== 'DRIVER') {
      const { license_number, vehicle_make, vehicle_model, vehicle_color, vehicle_plate_number, ...rest } = updateData;
      filteredUpdateData = rest;
    }

    const updatedUser = await UserModel.update(userId, filteredUpdateData);

    if (!updatedUser) {
      throw new Error('User not found');
    }

    const { password_hash, ...userResponse } = updatedUser;
    return userResponse;
  }

  /**
   * Add a kid for a parent
   */
  static async addKid(parentId: string, input: CreateKidInput): Promise<Kid> {
    // Verify school exists
    const school = await SchoolModel.findById(input.school_id);
    if (!school) {
      throw new Error('School not found');
    }

    const kid = await KidModel.create({
      ...input,
      parent_id: parentId,
    });

    return kid;
  }

  /**
   * Get all kids for a parent
   */
  static async getKids(parentId: string, activeOnly: boolean = true): Promise<Kid[]> {
    return await KidModel.findByParentId(parentId, activeOnly);
  }

  /**
   * Get kid by ID (with parent verification)
   */
  static async getKidById(kidId: string, parentId: string): Promise<Kid> {
    const belongsToParent = await KidModel.belongsToParent(kidId, parentId);
    if (!belongsToParent) {
      throw new Error('Kid not found or access denied');
    }

    const kid = await KidModel.findById(kidId);
    if (!kid) {
      throw new Error('Kid not found');
    }

    return kid;
  }

  /**
   * Update kid (with parent verification)
   */
  static async updateKid(kidId: string, parentId: string, updateData: UpdateKidInput): Promise<Kid> {
    const belongsToParent = await KidModel.belongsToParent(kidId, parentId);
    if (!belongsToParent) {
      throw new Error('Kid not found or access denied');
    }

    // If school is being updated, verify it exists
    if (updateData.school_id) {
      const school = await SchoolModel.findById(updateData.school_id);
      if (!school) {
        throw new Error('School not found');
      }
    }

    const updatedKid = await KidModel.update(kidId, updateData);
    if (!updatedKid) {
      throw new Error('Kid not found');
    }

    return updatedKid;
  }

  /**
   * Delete kid (soft delete, with parent verification)
   */
  static async deleteKid(kidId: string, parentId: string): Promise<void> {
    const belongsToParent = await KidModel.belongsToParent(kidId, parentId);
    if (!belongsToParent) {
      throw new Error('Kid not found or access denied');
    }

    await KidModel.delete(kidId);
  }
}

