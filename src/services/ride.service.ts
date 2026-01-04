import { RideModel, Ride, RideStatus, CreateRideInput, UpdateRideInput } from '../models/Ride';
import { UserModel, UserRole } from '../models/User';
import { KidModel } from '../models/Kid';

/**
 * Calculate distance between two points (Haversine formula)
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculate estimated fare based on distance
 */
function calculateFare(distanceKm: number, baseFare: number = 5.0, perKmRate: number = 1.5): number {
  return baseFare + distanceKm * perKmRate;
}

/**
 * Ride service with business logic
 */
export class RideService {
  /**
   * Get WebSocket server instance
   */
  private static getWebSocketServer(): any {
    return (global as any).wsServer;
  }

  /**
   * Create a new ride
   */
  static async createRide(input: CreateRideInput, userId: string, userRole?: UserRole): Promise<Ride> {
    // Verify kid belongs to parent (skip for admins)
    if (userRole !== UserRole.ADMIN) {
      const belongsToParent = await KidModel.belongsToParent(input.kid_id, userId);
      if (!belongsToParent) {
        throw new Error('Kid does not belong to this parent');
      }
    }

    // Get kid details for location
    const kid = await KidModel.findById(input.kid_id);
    if (!kid) {
      throw new Error('Kid not found');
    }

    // Calculate distance if not provided
    let distanceKm = calculateDistance(
      input.pickup_latitude,
      input.pickup_longitude,
      input.dropoff_latitude,
      input.dropoff_longitude
    );

    // Calculate fare if not provided
    let totalFare = input.total_fare;
    if (!input.distance_fare) {
      const distanceFare = calculateFare(distanceKm, input.base_fare) - input.base_fare;
      totalFare = input.base_fare + distanceFare;
    }

    const rideInput: CreateRideInput = {
      ...input,
      distance_fare: input.distance_fare || calculateFare(distanceKm, input.base_fare) - input.base_fare,
      total_fare: totalFare,
    };

    const ride = await RideModel.create(rideInput);

    return ride;
  }

  /**
   * Assign driver to ride
   */
  static async assignDriver(rideId: string, driverId: string): Promise<Ride | null> {
    // Verify driver exists and is available
    const driver = await UserModel.findById(driverId);
    if (!driver || driver.role !== UserRole.DRIVER) {
      throw new Error('Invalid driver');
    }

    if (!driver.is_available) {
      throw new Error('Driver is not available');
    }

    const updateData: UpdateRideInput = {
      driver_id: driverId,
      status: RideStatus.DRIVER_ASSIGNED,
    };

    return await RideModel.update(rideId, updateData);
  }

  /**
   * Accept ride (driver)
   */
  static async acceptRide(rideId: string, driverId: string): Promise<Ride | null> {
    const ride = await RideModel.findById(rideId);
    if (!ride) {
      throw new Error('Ride not found');
    }

    if (ride.driver_id && ride.driver_id !== driverId) {
      throw new Error('Ride is already assigned to another driver');
    }

    if (ride.status !== RideStatus.PENDING && ride.status !== RideStatus.ACCEPTED) {
      throw new Error(`Cannot accept ride with status: ${ride.status}`);
    }

    const updateData: UpdateRideInput = {
      driver_id: driverId,
      status: RideStatus.ACCEPTED,
    };

    return await RideModel.update(rideId, updateData);
  }

  /**
   * Start ride (driver)
   */
  static async startRide(rideId: string, driverId: string): Promise<Ride | null> {
    const ride = await RideModel.findById(rideId);
    if (!ride) {
      throw new Error('Ride not found');
    }

    if (ride.driver_id !== driverId) {
      throw new Error('Unauthorized: This ride is not assigned to you');
    }

    if (ride.status !== RideStatus.ACCEPTED && ride.status !== RideStatus.DRIVER_ASSIGNED) {
      throw new Error(`Cannot start ride with status: ${ride.status}`);
    }

    const updateData: UpdateRideInput = {
      status: RideStatus.IN_PROGRESS,
      actual_pickup_time: new Date().toISOString(),
    };

    const updatedRide = await RideModel.update(rideId, updateData);

    // Broadcast status change via WebSocket
    try {
      const wsServer = this.getWebSocketServer();
      if (wsServer) {
        wsServer.broadcastRideStatusChange(rideId, RideStatus.IN_PROGRESS);
      }
    } catch (error) {
      console.error('Failed to broadcast ride status change:', error);
    }

    return updatedRide;
  }

  /**
   * Mark ride as picked up (driver)
   */
  static async markPickedUp(rideId: string, driverId: string): Promise<Ride | null> {
    const ride = await RideModel.findById(rideId);
    if (!ride) {
      throw new Error('Ride not found');
    }

    if (ride.driver_id !== driverId) {
      throw new Error('Unauthorized: This ride is not assigned to you');
    }

    if (ride.status !== RideStatus.IN_PROGRESS) {
      throw new Error(`Cannot mark as picked up with status: ${ride.status}`);
    }

    const updateData: UpdateRideInput = {
      status: RideStatus.PICKED_UP,
    };

    const updatedRide = await RideModel.update(rideId, updateData);

    // Broadcast status change via WebSocket
    try {
      const wsServer = this.getWebSocketServer();
      if (wsServer) {
        wsServer.broadcastRideStatusChange(rideId, RideStatus.PICKED_UP);
      }
    } catch (error) {
      console.error('Failed to broadcast ride status change:', error);
    }

    return updatedRide;
  }

  /**
   * Complete ride (driver)
   */
  static async completeRide(rideId: string, driverId: string): Promise<Ride | null> {
    const ride = await RideModel.findById(rideId);
    if (!ride) {
      throw new Error('Ride not found');
    }

    if (ride.driver_id !== driverId) {
      throw new Error('Unauthorized: This ride is not assigned to you');
    }

    if (ride.status !== RideStatus.PICKED_UP && ride.status !== RideStatus.IN_PROGRESS) {
      throw new Error(`Cannot complete ride with status: ${ride.status}`);
    }

    // Calculate actual duration if ride was started
    let durationMinutes: number | null = null;
    if (ride.actual_pickup_time) {
      const startTime = new Date(ride.actual_pickup_time).getTime();
      const endTime = new Date().getTime();
      durationMinutes = Math.round((endTime - startTime) / (1000 * 60));
    }

    const updateData: UpdateRideInput = {
      status: RideStatus.COMPLETED,
      actual_dropoff_time: new Date().toISOString(),
      duration_minutes: durationMinutes || undefined,
    };

    return await RideModel.update(rideId, updateData);
  }

  /**
   * Cancel ride
   */
  static async cancelRide(
    rideId: string,
    userId: string,
    userRole: UserRole,
    reason?: string
  ): Promise<Ride | null> {
    const ride = await RideModel.findById(rideId);
    if (!ride) {
      throw new Error('Ride not found');
    }

    // Check authorization
    if (userRole === UserRole.PARENT) {
      const kid = await KidModel.findById(ride.kid_id);
      if (!kid || kid.parent_id !== userId) {
        throw new Error('Unauthorized: This ride does not belong to you');
      }
    } else if (userRole === UserRole.DRIVER) {
      if (ride.driver_id !== userId) {
        throw new Error('Unauthorized: This ride is not assigned to you');
      }
    }

    if (ride.status === RideStatus.COMPLETED) {
      throw new Error('Cannot cancel a completed ride');
    }

    if (ride.status === RideStatus.CANCELLED) {
      throw new Error('Ride is already cancelled');
    }

    const updateData: UpdateRideInput = {
      status: RideStatus.CANCELLED,
      cancelled_by: userId,
      cancellation_reason: reason || null,
    };

    const updatedRide = await RideModel.update(rideId, updateData);

    // Broadcast status change via WebSocket
    try {
      const wsServer = this.getWebSocketServer();
      if (wsServer) {
        wsServer.broadcastRideStatusChange(rideId, RideStatus.CANCELLED, {
          reason: reason || null,
        });
      }
    } catch (error) {
      console.error('Failed to broadcast ride status change:', error);
    }

    return updatedRide;
  }

  /**
   * Get rides for a user based on their role
   */
  static async getRidesForUser(userId: string, userRole: UserRole, status?: RideStatus): Promise<Ride[]> {
    if (userRole === UserRole.PARENT) {
      // Get all kids for parent
      const kids = await KidModel.findByParentId(userId, true);
      const kidIds = kids.map((k) => k.id);

      if (kidIds.length === 0) {
        return [];
      }

      // Get rides for all parent's kids
      const allRides = await Promise.all(
        kidIds.map((kidId) => RideModel.findByKidId(kidId))
      );
      return allRides.flat();
    } else if (userRole === UserRole.DRIVER) {
      return await RideModel.findByDriverId(userId, status);
    } else {
      // Admin - get all active rides
      return await RideModel.findActive();
    }
  }

  /**
   * Get ride by ID with authorization check
   */
  static async getRideById(rideId: string, userId: string, userRole: UserRole): Promise<Ride | null> {
    const ride = await RideModel.findById(rideId);
    if (!ride) {
      return null;
    }

    // Check authorization
    if (userRole === UserRole.PARENT) {
      const kid = await KidModel.findById(ride.kid_id);
      if (!kid || kid.parent_id !== userId) {
        return null; // Access denied
      }
    } else if (userRole === UserRole.DRIVER) {
      if (ride.driver_id !== userId) {
        return null; // Access denied
      }
    }
    // Admin can access all rides

    return ride;
  }

  /**
   * Check if user can access a ride
   */
  static async canAccessRide(rideId: string, userId: string, userRole: UserRole): Promise<boolean> {
    const ride = await this.getRideById(rideId, userId, userRole);
    return ride !== null;
  }

  /**
   * Find nearby available drivers
   */
  static async findNearbyDrivers(
    latitude: number,
    longitude: number,
    maxDistanceKm: number = 10
  ): Promise<any[]> {
    const drivers = await UserModel.findDrivers(true);

    // Filter drivers by distance
    const nearbyDrivers = drivers
      .filter((driver) => driver.current_latitude && driver.current_longitude)
      .map((driver) => {
        const distance = calculateDistance(
          latitude,
          longitude,
          driver.current_latitude!,
          driver.current_longitude!
        );
        const { password_hash, ...driverResponse } = driver;
        return {
          ...driverResponse,
          distance_km: distance as number,
        };
      })
      .filter((driver) => (driver.distance_km as number) <= maxDistanceKm)
      .sort((a, b) => (a.distance_km as number) - (b.distance_km as number));

    return nearbyDrivers;
  }
}

