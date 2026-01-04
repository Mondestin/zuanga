import { RoutePointModel, CreateRoutePointInput } from '../models/RoutePoint';
import { RideModel } from '../models/Ride';
import { KidModel } from '../models/Kid';
import { UserRole } from '../models/User';

/**
 * Tracking Service
 * Business logic for location tracking
 */
export class TrackingService {
  /**
   * Update driver location for a ride
   */
  static async updateLocation(
    rideId: string,
    driverId: string,
    locationData: {
      latitude: number;
      longitude: number;
      accuracy?: number;
      heading?: number;
      speed?: number;
    }
  ) {
    // Verify ride exists
    const ride = await RideModel.findById(rideId);
    if (!ride) {
      throw new Error('Ride not found');
    }

    // Verify ride is assigned to this driver
    if (ride.driver_id !== driverId) {
      throw new Error('Ride is not assigned to you');
    }

    // Verify ride is in progress
    if (ride.status !== 'IN_PROGRESS' && ride.status !== 'PICKED_UP') {
      throw new Error('Ride is not in progress');
    }

    // Validate coordinates
    if (
      locationData.latitude < -90 ||
      locationData.latitude > 90 ||
      locationData.longitude < -180 ||
      locationData.longitude > 180
    ) {
      throw new Error('Invalid coordinates');
    }

    // Create route point
    const routePointInput: CreateRoutePointInput = {
      ride_id: rideId,
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      accuracy: locationData.accuracy,
      heading: locationData.heading,
      speed: locationData.speed,
    };

    return await RoutePointModel.create(routePointInput);
  }

  /**
   * Get current ride location
   */
  static async getCurrentLocation(rideId: string, userId: string, userRole: UserRole) {
    // Verify ride exists
    const ride = await RideModel.findById(rideId);
    if (!ride) {
      throw new Error('Ride not found');
    }

    // Verify user has permission to view location
    await this.verifyTrackingPermission(rideId, userId, userRole);

    // Get latest location
    const location = await RoutePointModel.getLatest(rideId);
    if (!location) {
      throw new Error('No location data available for this ride');
    }

    return location;
  }

  /**
   * Get ride location history
   */
  static async getLocationHistory(rideId: string, userId: string, userRole: UserRole, limit?: number) {
    // Verify ride exists
    const ride = await RideModel.findById(rideId);
    if (!ride) {
      throw new Error('Ride not found');
    }

    // Verify user has permission to view location
    await this.verifyTrackingPermission(rideId, userId, userRole);

    // Get location history
    return await RoutePointModel.findByRideId(rideId, limit);
  }

  /**
   * Verify user has permission to track a ride
   */
  private static async verifyTrackingPermission(rideId: string, userId: string, userRole: UserRole): Promise<void> {
    const ride = await RideModel.findById(rideId);
    if (!ride) {
      throw new Error('Ride not found');
    }

    // Admin can track any ride
    if (userRole === UserRole.ADMIN) {
      return;
    }

    // Driver can track rides assigned to them
    if (userRole === UserRole.DRIVER) {
      if (ride.driver_id !== userId) {
        throw new Error('Not authorized to track this ride');
      }
      return;
    }

    // Parent can track rides for their kids
    if (userRole === UserRole.PARENT) {
      const belongsToParent = await KidModel.belongsToParent(ride.kid_id, userId);
      if (!belongsToParent) {
        throw new Error('Not authorized to track this ride');
      }
      return;
    }

    throw new Error('Not authorized');
  }
}

