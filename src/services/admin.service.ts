import { UserModel, User, UpdateUserInput, UserRole } from '../models/User';

/**
 * Admin Service
 * Business logic for admin user management
 */
export class AdminService {
  /**
   * Get all users (parents and drivers)
   * Admin can filter by role and active status
   */
  static async getAllUsers(
    role?: UserRole,
    activeOnly: boolean = false
  ): Promise<User[]> {
    if (role) {
      if (activeOnly) {
        return await UserModel.findByRole(role, true);
      }
      return await UserModel.findByRole(role);
    }

    // Get all users
    if (activeOnly) {
      return await UserModel.findAll(true);
    }
    return await UserModel.findAll();
  }

  /**
   * Get user by ID (admin can view any user)
   */
  static async getUserById(userId: string): Promise<User | null> {
    return await UserModel.findById(userId);
  }

  /**
   * Update user account (admin can update any user)
   */
  static async updateUser(
    userId: string,
    updateData: UpdateUserInput
  ): Promise<User | null> {
    return await UserModel.update(userId, updateData);
  }

  /**
   * Deactivate user account (soft delete)
   */
  static async deactivateUser(userId: string): Promise<User | null> {
    return await UserModel.update(userId, { is_active: false });
  }

  /**
   * Activate user account
   */
  static async activateUser(userId: string): Promise<User | null> {
    return await UserModel.update(userId, { is_active: true });
  }

  /**
   * Get all parents
   */
  static async getAllParents(activeOnly: boolean = false): Promise<User[]> {
    return await UserModel.findByRole(UserRole.PARENT, activeOnly);
  }

  /**
   * Get all drivers
   */
  static async getAllDrivers(activeOnly: boolean = false): Promise<User[]> {
    return await UserModel.findByRole(UserRole.DRIVER, activeOnly);
  }

  /**
   * Get user statistics
   */
  static async getUserStats(): Promise<{
    total_users: number;
    total_parents: number;
    total_drivers: number;
    total_admins: number;
    active_users: number;
    active_parents: number;
    active_drivers: number;
  }> {
    const allUsers = await UserModel.findAll();
    const activeUsers = await UserModel.findAll(true);
    const allParents = await UserModel.findByRole(UserRole.PARENT);
    const activeParents = await UserModel.findByRole(UserRole.PARENT, true);
    const allDrivers = await UserModel.findByRole(UserRole.DRIVER);
    const activeDrivers = await UserModel.findByRole(UserRole.DRIVER, true);
    const allAdmins = await UserModel.findByRole(UserRole.ADMIN);

    return {
      total_users: allUsers.length,
      total_parents: allParents.length,
      total_drivers: allDrivers.length,
      total_admins: allAdmins.length,
      active_users: activeUsers.length,
      active_parents: activeParents.length,
      active_drivers: activeDrivers.length,
    };
  }
}

