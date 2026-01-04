import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { verifyToken } from '../auth/jwt';
import { UserModel, UserRole } from '../models/User';
import { RideModel } from '../models/Ride';
import { KidModel } from '../models/Kid';
import { RoutePointModel, CreateRoutePointInput } from '../models/RoutePoint';

/**
 * Extended Socket interface with user data
 */
interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: UserRole;
}

/**
 * WebSocket server setup and event handlers
 */
export class WebSocketServer {
  private io: SocketIOServer;
  private rideRooms: Map<string, Set<string>> = new Map(); // rideId -> Set of socketIds

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.CORS_ORIGIN || '*',
        methods: ['GET', 'POST'],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  /**
   * Setup authentication middleware
   */
  private setupMiddleware(): void {
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth?.token;

        if (!token) {
          return next(new Error('Authentication token required'));
        }

        // Verify JWT token
        const decoded = verifyToken(token);
        if (!decoded || typeof decoded !== 'object' || !decoded.userId) {
          return next(new Error('Invalid token'));
        }

        // Load user data
        const user = await UserModel.findById(decoded.userId);
        if (!user || !user.is_active) {
          return next(new Error('User not found or inactive'));
        }

        // Attach user data to socket
        socket.userId = user.id;
        socket.userRole = user.role;

        next();
      } catch (error) {
        next(new Error('Authentication failed'));
      }
    });
  }

  /**
   * Setup WebSocket event handlers
   */
  private setupEventHandlers(): void {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      console.log(`🔌 WebSocket client connected: ${socket.id} (User: ${socket.userId}, Role: ${socket.userRole})`);

      // Send connection confirmation
      socket.emit('connected', {
        userId: socket.userId,
        role: socket.userRole,
        socketId: socket.id,
      });

      // Handle join ride room
      socket.on('join_ride', async (data: { rideId: string }) => {
        await this.handleJoinRide(socket, data.rideId);
      });

      // Handle leave ride room
      socket.on('leave_ride', async (data: { rideId: string }) => {
        await this.handleLeaveRide(socket, data.rideId);
      });

      // Handle location update (driver only)
      socket.on('location_update', async (data: {
        rideId: string;
        latitude: number;
        longitude: number;
        accuracy?: number;
        heading?: number;
        speed?: number;
      }) => {
        await this.handleLocationUpdate(socket, data);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`🔌 WebSocket client disconnected: ${socket.id}`);
        this.handleDisconnect(socket);
      });
    });
  }

  /**
   * Handle joining a ride room
   */
  private async handleJoinRide(socket: AuthenticatedSocket, rideId: string): Promise<void> {
    try {
      if (!socket.userId) {
        socket.emit('error', { message: 'Not authenticated', code: 'AUTH_ERROR' });
        return;
      }

      // Verify ride exists
      const ride = await RideModel.findById(rideId);
      if (!ride) {
        socket.emit('error', { message: 'Ride not found', code: 'RIDE_NOT_FOUND' });
        return;
      }

      // Verify user has permission to track this ride
      // Parent can track if kid belongs to them, driver can track if assigned, admin can track any
      if (socket.userRole === UserRole.PARENT) {
        // Check if ride's kid belongs to this parent
        const belongsToParent = await KidModel.belongsToParent(ride.kid_id, socket.userId!);
        if (!belongsToParent) {
          socket.emit('error', { message: 'Not authorized to track this ride', code: 'UNAUTHORIZED' });
          return;
        }
      } else if (socket.userRole === UserRole.DRIVER) {
        // Driver can only track rides assigned to them
        if (ride.driver_id !== socket.userId) {
          socket.emit('error', { message: 'Not authorized to track this ride', code: 'UNAUTHORIZED' });
          return;
        }
      } else if (socket.userRole !== UserRole.ADMIN) {
        socket.emit('error', { message: 'Not authorized', code: 'UNAUTHORIZED' });
        return;
      }

      // Join the room
      socket.join(`ride:${rideId}`);

      // Track room membership
      if (!this.rideRooms.has(rideId)) {
        this.rideRooms.set(rideId, new Set());
      }
      this.rideRooms.get(rideId)!.add(socket.id);

      console.log(`👥 Socket ${socket.id} joined ride room: ${rideId}`);

      // Send confirmation
      socket.emit('joined_ride', { rideId });

      // Send current ride status
      socket.emit('ride_status_change', {
        rideId,
        status: ride.status,
        timestamp: new Date().toISOString(),
      });

      // Send latest location if available
      const latestLocation = await RoutePointModel.getLatest(rideId);
      if (latestLocation) {
        socket.emit('location_update', {
          rideId,
          latitude: latestLocation.latitude,
          longitude: latestLocation.longitude,
          accuracy: latestLocation.accuracy,
          heading: latestLocation.heading,
          speed: latestLocation.speed,
          timestamp: latestLocation.recorded_at.toISOString(),
        });
      }
    } catch (error) {
      console.error('Error joining ride room:', error);
      socket.emit('error', {
        message: error instanceof Error ? error.message : 'Failed to join ride room',
        code: 'JOIN_ERROR',
      });
    }
  }

  /**
   * Handle leaving a ride room
   */
  private async handleLeaveRide(socket: AuthenticatedSocket, rideId: string): Promise<void> {
    try {
      socket.leave(`ride:${rideId}`);

      // Remove from room tracking
      const room = this.rideRooms.get(rideId);
      if (room) {
        room.delete(socket.id);
        if (room.size === 0) {
          this.rideRooms.delete(rideId);
        }
      }

      console.log(`👋 Socket ${socket.id} left ride room: ${rideId}`);
      socket.emit('left_ride', { rideId });
    } catch (error) {
      console.error('Error leaving ride room:', error);
      socket.emit('error', {
        message: error instanceof Error ? error.message : 'Failed to leave ride room',
        code: 'LEAVE_ERROR',
      });
    }
  }

  /**
   * Handle location update from driver
   */
  private async handleLocationUpdate(
    socket: AuthenticatedSocket,
    data: {
      rideId: string;
      latitude: number;
      longitude: number;
      accuracy?: number;
      heading?: number;
      speed?: number;
    }
  ): Promise<void> {
    try {
      if (!socket.userId) {
        socket.emit('error', { message: 'Not authenticated', code: 'AUTH_ERROR' });
        return;
      }

      // Only drivers can send location updates
      if (socket.userRole !== UserRole.DRIVER) {
        socket.emit('error', { message: 'Only drivers can send location updates', code: 'UNAUTHORIZED' });
        return;
      }

      // Verify ride exists and is assigned to this driver
      const ride = await RideModel.findById(data.rideId);
      if (!ride) {
        socket.emit('error', { message: 'Ride not found', code: 'RIDE_NOT_FOUND' });
        return;
      }

      if (ride.driver_id !== socket.userId) {
        socket.emit('error', { message: 'Ride not assigned to you', code: 'UNAUTHORIZED' });
        return;
      }

      // Verify ride is in progress
      if (ride.status !== 'IN_PROGRESS' && ride.status !== 'PICKED_UP') {
        socket.emit('error', { message: 'Ride is not in progress', code: 'INVALID_STATUS' });
        return;
      }

      // Validate coordinates
      if (data.latitude < -90 || data.latitude > 90 || data.longitude < -180 || data.longitude > 180) {
        socket.emit('error', { message: 'Invalid coordinates', code: 'VALIDATION_ERROR' });
        return;
      }

      // Save location to database
      const routePointInput: CreateRoutePointInput = {
        ride_id: data.rideId,
        latitude: data.latitude,
        longitude: data.longitude,
        accuracy: data.accuracy,
        heading: data.heading,
        speed: data.speed,
      };

      const routePoint = await RoutePointModel.create(routePointInput);

      // Broadcast location update to all clients in the ride room
      const locationData = {
        rideId: data.rideId,
        latitude: data.latitude,
        longitude: data.longitude,
        accuracy: data.accuracy,
        heading: data.heading,
        speed: data.speed,
        timestamp: routePoint.recorded_at.toISOString(),
      };

      this.io.to(`ride:${data.rideId}`).emit('location_update', locationData);

      console.log(`📍 Location update for ride ${data.rideId}: (${data.latitude}, ${data.longitude})`);

      // Send confirmation to driver
      socket.emit('location_sent', { rideId: data.rideId, timestamp: locationData.timestamp });
    } catch (error) {
      console.error('Error handling location update:', error);
      socket.emit('error', {
        message: error instanceof Error ? error.message : 'Failed to update location',
        code: 'LOCATION_UPDATE_ERROR',
      });
    }
  }

  /**
   * Handle socket disconnection
   */
  private handleDisconnect(socket: AuthenticatedSocket): void {
    // Remove from all ride rooms
    for (const [rideId, room] of this.rideRooms.entries()) {
      if (room.has(socket.id)) {
        room.delete(socket.id);
        if (room.size === 0) {
          this.rideRooms.delete(rideId);
        }
      }
    }
  }

  /**
   * Broadcast ride status change to all clients in the ride room
   */
  public broadcastRideStatusChange(rideId: string, status: string, data?: any): void {
    this.io.to(`ride:${rideId}`).emit('ride_status_change', {
      rideId,
      status,
      timestamp: new Date().toISOString(),
      ...data,
    });
  }

  /**
   * Broadcast driver assignment to all clients in the ride room
   */
  public broadcastDriverAssignment(rideId: string, driverId: string, driverName: string): void {
    this.io.to(`ride:${rideId}`).emit('driver_assigned', {
      rideId,
      driverId,
      driverName,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Get Socket.IO instance (for external use)
   */
  public getIO(): SocketIOServer {
    return this.io;
  }
}

