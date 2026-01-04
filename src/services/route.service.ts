import { RouteModel, Route, CreateRouteInput, UpdateRouteInput, RouteStatus } from '../models/Route';
import { SchoolModel } from '../models/School';
import { UserModel, UserRole } from '../models/User';

/**
 * Waypoint interface for route optimization
 */
export interface Waypoint {
  latitude: number;
  longitude: number;
  address?: string;
  order?: number;
}

/**
 * Route optimization input
 */
export interface OptimizeRouteInput {
  school_id: string;
  waypoints: Waypoint[];
  driver_id: string; // Required - driver to propose the route to
  name?: string;
  description?: string;
}

/**
 * Calculate distance between two points using Haversine formula
 * Returns distance in kilometers
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
 * Calculate total distance for a sequence of waypoints
 */
function calculateTotalDistance(waypoints: Waypoint[]): number {
  if (waypoints.length < 2) {
    return 0;
  }

  let totalDistance = 0;
  for (let i = 0; i < waypoints.length - 1; i++) {
    totalDistance += calculateDistance(
      waypoints[i].latitude,
      waypoints[i].longitude,
      waypoints[i + 1].latitude,
      waypoints[i + 1].longitude
    );
  }
  return totalDistance;
}

/**
 * Estimate travel time in minutes based on distance
 * Assumes average speed of 40 km/h in urban areas
 */
function estimateTravelTime(distanceKm: number): number {
  const averageSpeedKmh = 40; // Average urban speed
  return Math.round((distanceKm / averageSpeedKmh) * 60);
}

/**
 * Nearest Neighbor algorithm for route optimization
 * Finds the shortest path visiting all waypoints
 */
function optimizeWaypoints(waypoints: Waypoint[], startPoint: Waypoint, endPoint: Waypoint): Waypoint[] {
  if (waypoints.length === 0) {
    return [startPoint, endPoint];
  }

  const unvisited = [...waypoints];
  const optimized: Waypoint[] = [startPoint];
  let currentPoint = startPoint;

  // Greedy approach: always go to the nearest unvisited point
  while (unvisited.length > 0) {
    let nearestIndex = 0;
    let nearestDistance = calculateDistance(
      currentPoint.latitude,
      currentPoint.longitude,
      unvisited[0].latitude,
      unvisited[0].longitude
    );

    for (let i = 1; i < unvisited.length; i++) {
      const distance = calculateDistance(
        currentPoint.latitude,
        currentPoint.longitude,
        unvisited[i].latitude,
        unvisited[i].longitude
      );
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = i;
      }
    }

    const nearest = unvisited.splice(nearestIndex, 1)[0];
    optimized.push({ ...nearest, order: optimized.length });
    currentPoint = nearest;
  }

  // Add end point
  optimized.push({ ...endPoint, order: optimized.length });

  return optimized;
}

/**
 * Route Service
 * Handles all route-related business logic including optimization
 */
export class RouteService {
  /**
   * Get all routes (optionally filtered by school or driver)
   */
  static async getRoutes(schoolId?: string, driverId?: string, activeOnly: boolean = true): Promise<Route[]> {
    if (schoolId) {
      return await RouteModel.findBySchoolId(schoolId);
    }
    if (driverId) {
      return await RouteModel.findByDriverId(driverId);
    }

    // If no filters, return all active routes
    return await RouteModel.findAll(activeOnly);
  }

  /**
   * Get route by ID
   */
  static async getRouteById(routeId: string): Promise<Route> {
    const route = await RouteModel.findById(routeId);

    if (!route) {
      throw new Error('Route not found');
    }

    return route;
  }

  /**
   * Create a new route (proposed to a driver)
   */
  static async createRoute(input: CreateRouteInput): Promise<Route> {
    // Verify school exists
    const school = await SchoolModel.findById(input.school_id);
    if (!school) {
      throw new Error('School not found');
    }

    // Verify proposed driver exists and is a driver
    if (!input.proposed_driver_id) {
      throw new Error('proposed_driver_id is required');
    }

    const driver = await UserModel.findById(input.proposed_driver_id);
    if (!driver || driver.role !== UserRole.DRIVER) {
      throw new Error('Invalid driver - proposed driver must be a DRIVER');
    }

    // Verify driver is available
    if (!driver.is_available) {
      throw new Error('Driver is not available');
    }

    // Calculate distance and duration if waypoints are provided
    let estimatedDistance: number | undefined = input.estimated_distance_km;
    let estimatedDuration: number | undefined = input.estimated_duration_minutes;

    if (input.waypoints && Array.isArray(input.waypoints) && input.waypoints.length > 1) {
      const waypoints = input.waypoints as Waypoint[];
      estimatedDistance = calculateTotalDistance(waypoints);
      estimatedDuration = estimateTravelTime(estimatedDistance);
    }

    return await RouteModel.create({
      ...input,
      estimated_distance_km: estimatedDistance,
      estimated_duration_minutes: estimatedDuration,
    });
  }

  /**
   * Optimize route for multiple pickups
   * Uses Nearest Neighbor algorithm to find optimal waypoint order
   */
  static async optimizeRoute(input: OptimizeRouteInput): Promise<Route> {
    // Verify school exists
    const school = await SchoolModel.findById(input.school_id);
    if (!school) {
      throw new Error('School not found');
    }

    if (!input.waypoints || input.waypoints.length === 0) {
      throw new Error('At least one waypoint is required');
    }

    // Verify driver exists (required for optimization)
    if (!input.driver_id) {
      throw new Error('driver_id is required for route optimization');
    }

    const driver = await UserModel.findById(input.driver_id);
    if (!driver || driver.role !== UserRole.DRIVER) {
      throw new Error('Invalid driver - proposed driver must be a DRIVER');
    }

    // Verify driver is available
    if (!driver.is_available) {
      throw new Error('Driver is not available');
    }

    // Use school location as end point
    const endPoint: Waypoint = {
      latitude: school.latitude,
      longitude: school.longitude,
      address: school.address,
    };

    // If we have a driver, use their current location as start point
    // Otherwise, use the first waypoint as start
    let startPoint: Waypoint;
    if (input.driver_id) {
      const driver = await UserModel.findById(input.driver_id);
      if (driver && driver.current_latitude && driver.current_longitude) {
        startPoint = {
          latitude: driver.current_latitude,
          longitude: driver.current_longitude,
        };
      } else {
        startPoint = input.waypoints[0];
      }
    } else {
      startPoint = input.waypoints[0];
    }

    // Optimize waypoint order using Nearest Neighbor algorithm
    const optimizedWaypoints = optimizeWaypoints(input.waypoints, startPoint, endPoint);

    // Calculate total distance and estimated duration
    const totalDistance = calculateTotalDistance(optimizedWaypoints);
    const estimatedDuration = estimateTravelTime(totalDistance);

    // Create route with optimized waypoints (proposed to driver)
    const routeInput: CreateRouteInput = {
      school_id: input.school_id,
      proposed_driver_id: input.driver_id, // Use driver_id as proposed_driver_id
      name: input.name || `Optimized Route to ${school.name}`,
      description: input.description || 'Optimized route for multiple pickups',
      waypoints: optimizedWaypoints,
      estimated_distance_km: totalDistance,
      estimated_duration_minutes: estimatedDuration,
    };

    return await RouteModel.create(routeInput);
  }

  /**
   * Update route
   */
  static async updateRoute(routeId: string, input: UpdateRouteInput): Promise<Route> {
    const route = await RouteModel.findById(routeId);
    if (!route) {
      throw new Error('Route not found');
    }

    // If school_id is being updated, verify school exists
    if (input.school_id) {
      const school = await SchoolModel.findById(input.school_id);
      if (!school) {
        throw new Error('School not found');
      }
    }

    // If driver_id is being updated, verify driver exists
    if (input.driver_id !== undefined && input.driver_id !== null) {
      const driver = await UserModel.findById(input.driver_id);
      if (!driver || driver.role !== UserRole.DRIVER) {
        throw new Error('Invalid driver');
      }
    }

    // Recalculate distance and duration if waypoints are updated
    if (input.waypoints && Array.isArray(input.waypoints) && input.waypoints.length > 1) {
      const waypoints = input.waypoints as Waypoint[];
      input.estimated_distance_km = calculateTotalDistance(waypoints);
      input.estimated_duration_minutes = estimateTravelTime(input.estimated_distance_km);
    }

    const updatedRoute = await RouteModel.update(routeId, input);
    if (!updatedRoute) {
      throw new Error('Route not found');
    }

    return updatedRoute;
  }

  /**
   * Delete route (soft delete)
   */
  static async deleteRoute(routeId: string): Promise<void> {
    const route = await RouteModel.findById(routeId);
    if (!route) {
      throw new Error('Route not found');
    }

    await RouteModel.update(routeId, { is_active: false });
  }

  /**
   * Get routes for a specific school
   */
  static async getRoutesBySchool(schoolId: string): Promise<Route[]> {
    const school = await SchoolModel.findById(schoolId);
    if (!school) {
      throw new Error('School not found');
    }

    return await RouteModel.findBySchoolId(schoolId);
  }

  /**
   * Get routes for a specific driver
   */
  static async getRoutesByDriver(driverId: string): Promise<Route[]> {
    const driver = await UserModel.findById(driverId);
    if (!driver || driver.role !== UserRole.DRIVER) {
      throw new Error('Driver not found');
    }

    return await RouteModel.findByDriverId(driverId);
  }

  /**
   * Accept route proposal (driver)
   */
  static async acceptRouteProposal(routeId: string, driverId: string): Promise<Route> {
    const route = await RouteModel.findById(routeId);
    if (!route) {
      throw new Error('Route not found');
    }

    // Verify the route is proposed to this driver
    if (route.proposed_driver_id !== driverId) {
      throw new Error('Route is not proposed to you');
    }

    // Verify route is still pending
    if (route.status !== RouteStatus.PENDING) {
      throw new Error(`Route is already ${route.status.toLowerCase()}`);
    }

    // Accept the route: set driver_id and status to ACCEPTED
    const updatedRoute = await RouteModel.update(routeId, {
      driver_id: driverId,
      status: RouteStatus.ACCEPTED,
    });

    if (!updatedRoute) {
      throw new Error('Failed to accept route');
    }

    return updatedRoute;
  }

  /**
   * Reject route proposal (driver)
   */
  static async rejectRouteProposal(routeId: string, driverId: string): Promise<Route> {
    const route = await RouteModel.findById(routeId);
    if (!route) {
      throw new Error('Route not found');
    }

    // Verify the route is proposed to this driver
    if (route.proposed_driver_id !== driverId) {
      throw new Error('Route is not proposed to you');
    }

    // Verify route is still pending
    if (route.status !== RouteStatus.PENDING) {
      throw new Error(`Route is already ${route.status.toLowerCase()}`);
    }

    // Reject the route: set status to REJECTED
    const updatedRoute = await RouteModel.update(routeId, {
      status: RouteStatus.REJECTED,
    });

    if (!updatedRoute) {
      throw new Error('Failed to reject route');
    }

    return updatedRoute;
  }

  /**
   * Get routes proposed to a driver
   */
  static async getProposedRoutes(driverId: string): Promise<Route[]> {
    const driver = await UserModel.findById(driverId);
    if (!driver || driver.role !== UserRole.DRIVER) {
      throw new Error('Driver not found');
    }

    return await RouteModel.findProposedToDriver(driverId);
  }
}

