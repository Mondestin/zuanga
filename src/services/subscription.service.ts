import { SubscriptionModel, Subscription, CreateSubscriptionInput, UpdateSubscriptionInput, SubscriptionType, SubscriptionStatus } from '../models/Subscription';
import { KidModel } from '../models/Kid';
import { SchoolModel } from '../models/School';
import { UserRole } from '../models/User';
import { RideService } from './ride.service';
import { RideType } from '../models/Ride';

/**
 * Subscription Service
 * Business logic for subscription management
 */
export class SubscriptionService {
  /**
   * Create a new subscription
   */
  static async createSubscription(input: CreateSubscriptionInput, userId: string, userRole?: UserRole): Promise<Subscription> {
    // Verify kid belongs to parent (skip for admins)
    if (userRole !== UserRole.ADMIN) {
      const belongsToParent = await KidModel.belongsToParent(input.kid_id, userId);
      if (!belongsToParent) {
        throw new Error('Kid does not belong to this parent');
      }
      // Ensure parent_id matches authenticated user
      if (input.parent_id !== userId) {
        throw new Error('Parent ID must match authenticated user');
      }
    }

    // Verify school exists
    const school = await SchoolModel.findById(input.school_id);
    if (!school) {
      throw new Error('School not found');
    }

    // Verify kid exists
    const kid = await KidModel.findById(input.kid_id);
    if (!kid) {
      throw new Error('Kid not found');
    }

    // Validate days_of_week
    if (!input.days_of_week || input.days_of_week.length === 0) {
      throw new Error('At least one day of week must be specified');
    }

    for (const day of input.days_of_week) {
      if (day < 0 || day > 6) {
        throw new Error('Invalid day of week. Must be 0-6 (0=Sunday, 6=Saturday)');
      }
    }

    // Calculate end_date if not provided based on subscription type
    let endDate: Date | null = null;
    if (input.end_date) {
      endDate = typeof input.end_date === 'string' ? new Date(input.end_date) : input.end_date;
    } else {
      // Default: 3 months for WEEKLY, 6 months for MONTHLY
      const startDate = typeof input.start_date === 'string' ? new Date(input.start_date) : input.start_date;
      if (input.subscription_type === SubscriptionType.WEEKLY) {
        endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 3);
      } else if (input.subscription_type === SubscriptionType.MONTHLY) {
        endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 6);
      }
    }

    // Calculate subscription total if not provided
    let subscriptionTotal: number | null = null;
    if (!input.subscription_total) {
      const startDate = typeof input.start_date === 'string' ? new Date(input.start_date) : input.start_date;
      const finalEndDate = endDate || new Date(startDate);
      
      // Count number of rides based on days_of_week and date range
      const numberOfRides = this.countRidesInPeriod(startDate, finalEndDate, input.days_of_week);
      subscriptionTotal = numberOfRides * input.total_fare_per_ride;
    } else {
      subscriptionTotal = input.subscription_total;
    }

    // Create subscription with ACTIVE status
    const subscription = await SubscriptionModel.create({
      ...input,
      end_date: endDate,
      subscription_total: subscriptionTotal,
    });

    // Generate initial rides only if:
    // 1. Subscription is ACTIVE (default status)
    // 2. auto_generate_rides is true (default)
    if (subscription.status === SubscriptionStatus.ACTIVE && subscription.auto_generate_rides) {
      await this.generateRidesForSubscription(subscription.id, new Date());
    }

    return subscription;
  }

  /**
   * Count number of rides in a date period based on days of week
   */
  private static countRidesInPeriod(startDate: Date, endDate: Date, daysOfWeek: number[]): number {
    let count = 0;
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      if (daysOfWeek.includes(dayOfWeek)) {
        count++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return count;
  }

  /**
   * Generate rides for a subscription up to a certain date
   * REQUIRES: Subscription must be ACTIVE
   */
  static async generateRidesForSubscription(subscriptionId: string, upToDate: Date = new Date()): Promise<void> {
    const subscription = await SubscriptionModel.findById(subscriptionId);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    // REQUIRED: Subscription must be ACTIVE to generate rides
    if (subscription.status !== SubscriptionStatus.ACTIVE) {
      throw new Error(`Cannot generate rides: Subscription is ${subscription.status}. Only ACTIVE subscriptions can generate rides.`);
    }

    // REQUIRED: Auto-generation must be enabled
    if (!subscription.auto_generate_rides) {
      throw new Error('Cannot generate rides: Auto-generation is disabled for this subscription');
    }

    // Determine start date for generation
    let startDate = new Date(subscription.start_date);
    if (subscription.last_ride_generated_date) {
      startDate = new Date(subscription.last_ride_generated_date);
      startDate.setDate(startDate.getDate() + 1); // Start from next day
    }

    // Don't generate past the end date
    if (subscription.end_date) {
      const endDate = new Date(subscription.end_date);
      if (upToDate > endDate) {
        upToDate = endDate;
      }
    }

    // Generate rides for each day in the period
    const currentDate = new Date(startDate);
    let ridesGenerated = 0;

    while (currentDate <= upToDate) {
      const dayOfWeek = currentDate.getDay();
      
      // Check if this day is in the subscription's days_of_week
      if (subscription.days_of_week.includes(dayOfWeek)) {
        // Check if ride already exists for this date
        const existingRide = await this.findRideForDate(subscription.kid_id, currentDate, subscription.pickup_time);
        
        if (!existingRide) {
          // Determine ride type based on pickup time (morning = TO_SCHOOL, afternoon = FROM_SCHOOL)
          const [hours] = subscription.pickup_time.split(':').map(Number);
          const rideType = hours < 12 ? RideType.TO_SCHOOL : RideType.FROM_SCHOOL;

          // Create scheduled pickup time (combine date and time)
          const scheduledPickupTime = new Date(currentDate);
          const [pickupHours, pickupMinutes] = subscription.pickup_time.split(':').map(Number);
          scheduledPickupTime.setHours(pickupHours, pickupMinutes, 0, 0);

          // Create scheduled dropoff time if provided
          let scheduledDropoffTime: Date | null = null;
          if (subscription.dropoff_time) {
            scheduledDropoffTime = new Date(currentDate);
            const [dropoffHours, dropoffMinutes] = subscription.dropoff_time.split(':').map(Number);
            scheduledDropoffTime.setHours(dropoffHours, dropoffMinutes, 0, 0);
          }

          // Create ride
          await RideService.createRide(
            {
              kid_id: subscription.kid_id,
              ride_type: rideType,
              scheduled_pickup_time: scheduledPickupTime.toISOString(),
              scheduled_dropoff_time: scheduledDropoffTime?.toISOString() || undefined,
              pickup_address: subscription.pickup_address,
              pickup_latitude: subscription.pickup_latitude,
              pickup_longitude: subscription.pickup_longitude,
              dropoff_address: subscription.dropoff_address,
              dropoff_latitude: subscription.dropoff_latitude,
              dropoff_longitude: subscription.dropoff_longitude,
              base_fare: subscription.base_fare,
              distance_fare: subscription.distance_fare ?? undefined,
              total_fare: subscription.total_fare_per_ride,
              parent_notes: subscription.parent_notes ?? undefined,
              subscription_id: subscription.id,
            },
            subscription.parent_id,
            UserRole.PARENT
          );

          ridesGenerated++;
        }
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Update last_ride_generated_date
    if (ridesGenerated > 0) {
      await SubscriptionModel.updateLastRideGeneratedDate(subscriptionId, upToDate);
    }
  }

  /**
   * Find existing ride for a specific date and time
   */
  private static async findRideForDate(_kidId: string, _date: Date, _pickupTime: string): Promise<any> {
    const startOfDay = new Date(_date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(_date);
    endOfDay.setHours(23, 59, 59, 999);

    // This would need to be implemented in RideModel
    // For now, return null (assume no duplicate check)
    return null;
  }

  /**
   * Get subscriptions for a parent
   */
  static async getSubscriptionsForParent(parentId: string, activeOnly: boolean = false): Promise<Subscription[]> {
    return await SubscriptionModel.findByParentId(parentId, activeOnly);
  }

  /**
   * Get subscription by ID with authorization check
   */
  static async getSubscriptionById(subscriptionId: string, userId: string, userRole: UserRole): Promise<Subscription | null> {
    const subscription = await SubscriptionModel.findById(subscriptionId);
    if (!subscription) {
      return null;
    }

    // Check authorization
    if (userRole === UserRole.PARENT) {
      if (subscription.parent_id !== userId) {
        return null; // Access denied
      }
    }
    // Admin and driver can view any subscription

    return subscription;
  }

  /**
   * Update subscription
   */
  static async updateSubscription(
    subscriptionId: string,
    input: UpdateSubscriptionInput,
    userId: string,
    userRole: UserRole
  ): Promise<Subscription> {
    const subscription = await SubscriptionModel.findById(subscriptionId);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    // Check authorization
    if (userRole === UserRole.PARENT) {
      if (subscription.parent_id !== userId) {
        throw new Error('Unauthorized: This subscription does not belong to you');
      }
    }

    // If status is being changed to ACTIVE and auto_generate_rides is true, generate rides
    // REQUIRED: Subscription must be ACTIVE to generate rides
    if (input.status === SubscriptionStatus.ACTIVE && subscription.status !== SubscriptionStatus.ACTIVE) {
      const updatedSubscription = await SubscriptionModel.update(subscriptionId, input);
      if (updatedSubscription && updatedSubscription.auto_generate_rides) {
        // Only generate if subscription is now ACTIVE
        if (updatedSubscription.status === SubscriptionStatus.ACTIVE) {
          await this.generateRidesForSubscription(subscriptionId);
        }
      }
      return updatedSubscription!;
    }

    // If subscription is being updated but status is not ACTIVE, don't generate rides
    const updatedSubscription = await SubscriptionModel.update(subscriptionId, input) || subscription;
    
    // If status is being changed away from ACTIVE, stop any further generation
    if (input.status && input.status !== SubscriptionStatus.ACTIVE && subscription.status === SubscriptionStatus.ACTIVE) {
      // Status changed from ACTIVE to something else - no rides will be generated
      return updatedSubscription;
    }

    return updatedSubscription;
  }

  /**
   * Pause subscription
   */
  static async pauseSubscription(subscriptionId: string, userId: string, userRole: UserRole): Promise<Subscription> {
    return await this.updateSubscription(subscriptionId, { status: SubscriptionStatus.PAUSED }, userId, userRole);
  }

  /**
   * Resume subscription
   * Sets status to ACTIVE and generates rides if auto_generate_rides is enabled
   */
  static async resumeSubscription(subscriptionId: string, userId: string, userRole: UserRole): Promise<Subscription> {
    const subscription = await SubscriptionModel.findById(subscriptionId);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    if (subscription.status !== SubscriptionStatus.PAUSED) {
      throw new Error('Subscription is not paused');
    }

    // Update to ACTIVE status
    const updatedSubscription = await this.updateSubscription(
      subscriptionId,
      { status: SubscriptionStatus.ACTIVE },
      userId,
      userRole
    );

    // Generate rides for the resumed period
    // REQUIRED: Subscription must be ACTIVE (which it now is) and auto_generate_rides must be true
    if (updatedSubscription.status === SubscriptionStatus.ACTIVE && updatedSubscription.auto_generate_rides) {
      await this.generateRidesForSubscription(subscriptionId);
    }

    return updatedSubscription;
  }

  /**
   * Cancel subscription
   */
  static async cancelSubscription(subscriptionId: string, userId: string, userRole: UserRole): Promise<Subscription> {
    return await this.updateSubscription(subscriptionId, { status: SubscriptionStatus.CANCELLED }, userId, userRole);
  }

  /**
   * Generate rides for all active subscriptions (to be called by cron job)
   * Only processes subscriptions that are:
   * - Status: ACTIVE
   * - auto_generate_rides: true
   * - Within date range (start_date <= upToDate, end_date >= upToDate or null)
   */
  static async generateRidesForAllActiveSubscriptions(upToDate: Date = new Date()): Promise<number> {
    // This method already filters for ACTIVE subscriptions via findActiveForRideGeneration
    const subscriptions = await SubscriptionModel.findActiveForRideGeneration(upToDate);
    let totalGenerated = 0;

    for (const subscription of subscriptions) {
      try {
        // Double-check: Only generate if subscription is ACTIVE and auto_generate_rides is true
        if (subscription.status === SubscriptionStatus.ACTIVE && subscription.auto_generate_rides) {
          await this.generateRidesForSubscription(subscription.id, upToDate);
          totalGenerated++;
        }
      } catch (error) {
        console.error(`Failed to generate rides for subscription ${subscription.id}:`, error);
      }
    }

    return totalGenerated;
  }
}

