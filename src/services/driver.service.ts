import { UserModel, User, UserRole, UpdateUserInput } from '../models/User';

/**
 * Driver Service
 * Handles all driver-related business logic
 */
export class DriverService {
  /**
   * Get all available drivers
   */
  static async getDrivers(availableOnly: boolean = false): Promise<Omit<User, 'password_hash'>[]> {
    const drivers = await UserModel.findDrivers(availableOnly);

    // Remove sensitive information
    return drivers.map((driver) => {
      const { password_hash, ...driverResponse } = driver;
      return driverResponse;
    });
  }

  /**
   * Get driver by ID
   */
  static async getDriverById(driverId: string): Promise<Omit<User, 'password_hash'>> {
    const driver = await UserModel.findById(driverId);

    if (!driver) {
      throw new Error('Driver not found');
    }

    if (driver.role !== UserRole.DRIVER) {
      throw new Error('User is not a driver');
    }

    const { password_hash, ...driverResponse } = driver;
    return driverResponse;
  }

  /**
   * Update driver availability and location
   */
  static async updateDriverStatus(
    driverId: string,
    updateData: {
      is_available?: boolean;
      current_latitude?: number;
      current_longitude?: number;
    }
  ): Promise<Omit<User, 'password_hash'>> {
    if (Object.keys(updateData).length === 0) {
      throw new Error('No valid fields to update');
    }

    const updateInput: UpdateUserInput = {};
    if (typeof updateData.is_available === 'boolean') {
      updateInput.is_available = updateData.is_available;
    }
    if (typeof updateData.current_latitude === 'number') {
      updateInput.current_latitude = updateData.current_latitude;
    }
    if (typeof updateData.current_longitude === 'number') {
      updateInput.current_longitude = updateData.current_longitude;
    }

    const updatedDriver = await UserModel.update(driverId, updateInput);

    if (!updatedDriver) {
      throw new Error('Driver not found');
    }

    const { password_hash, ...driverResponse } = updatedDriver;
    return driverResponse;
  }
}

