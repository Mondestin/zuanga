---
name: Zuanga School Transportation API
overview: Build a complete backend API for a school transportation system (like Uber for kids) with parent and driver apps. The system will include authentication, ride booking, real-time tracking, route management, school management, payments, and notifications.
todos:
  - id: db-setup
    content: Set up PostgreSQL database connection and ORM (TypeORM or Prisma)
    status: completed
  - id: models
    content: Create database models for User, Kid, School, Ride, Route, RoutePoint, and Payment
    status: completed
    dependencies:
      - db-setup
  - id: auth-system
    content: Implement JWT authentication with login, register, and token refresh endpoints
    status: completed
    dependencies:
      - models
  - id: user-routes
    content: Create user management routes (profile, kids management)
    status: completed
    dependencies:
      - auth-system
  - id: school-routes
    content: Create school management routes
    status: completed
    dependencies:
      - models
  - id: ride-booking
    content: Implement ride booking system with status management
    status: completed
    dependencies:
      - user-routes
      - school-routes
  - id: realtime-tracking
    content: Set up WebSocket server (Socket.io) for real-time location tracking
    status: completed
    dependencies:
      - ride-booking
  - id: route-optimization
    content: Implement route management and optimization service
    status: completed
    dependencies:
      - ride-booking
  - id: payment-integration
    content: Integrate Stripe for payment processing
    status: pending
    dependencies:
      - ride-booking
  - id: notifications
    content: Implement push notification system using Firebase Cloud Messaging
    status: pending
    dependencies:
      - ride-booking
  - id: validation
    content: Add input validation for all API endpoints
    status: completed
    dependencies:
      - ride-booking
  - id: admin-management
    content: Implement admin account creation and user management (parents and drivers)
    status: completed
    dependencies:
      - auth-system
---

# Zuanga School Transportation API - Implementation Plan

## Architecture Overview

The system will be built as a RESTful API with WebSocket support for real-time tracking. Core entities include Users (Parents, Drivers), Kids, Schools, Rides, Routes, and Payments.

## Database Schema (PostgreSQL)

### Core Tables

- **users** - Parents and drivers (role-based)
- **kids** - Children who need transportation
- **schools** - School information
- **rides** - Ride bookings and status
- **route_points** - Real-time location tracking during rides
- **routes** - Predefined or optimized routes
- **payments** - Payment transactions
- **notifications** - Push notification records

### Key Relationships

- Parent → Kids (one-to-many)
- Kid → School (many-to-one)
- Ride → Kid, Driver, Route (many-to-one)
- Route → School (many-to-one)
- RoutePoint → Ride (many-to-one)

## Implementation Steps

### Phase 1: Database Setup & Core Models ✅

1. **Database Configuration** ✅

- ✅ Install and configure PostgreSQL client (postgres package)
- ✅ Create database connection module in `src/database/`
- ✅ Set up migration system

2. **Entity Models** (`src/models/`) ✅

- ✅ User model (with roles: PARENT, DRIVER, ADMIN) - **COMPLETED**
- ✅ Kid model (name, age, school, parent relationship) - **COMPLETED**
- ✅ School model (name, address, coordinates) - **COMPLETED**
- ✅ Ride model (status, scheduled time, pickup/dropoff) - **COMPLETED**
- ✅ Route model (waypoints, estimated time) - **COMPLETED**
- ✅ RoutePoint model (latitude, longitude, timestamp) - **COMPLETED**
- ✅ Payment model (amount, status, method) - **COMPLETED**

### Phase 2: Authentication System ✅

1. **Auth Module** (`src/auth/`) ✅

- ✅ JWT token generation and validation
- ✅ Password hashing (bcrypt)
- ✅ Auth middleware for protected routes
- ✅ Role-based access control (RBAC)

2. **Auth Routes** (`src/routes/v1/auth.routes.ts`) ✅

- ✅ POST `/auth/register` - Register parent or driver
- ✅ POST `/auth/login` - Login and get JWT token
- ✅ POST `/auth/refresh` - Refresh access token
- ✅ GET `/auth/me` - Get current user profile

### Phase 3: User Management ✅

1. **User Routes** (`src/routes/v1/users.routes.ts`) ✅

- ✅ GET `/users/profile` - Get current user profile
- ✅ PUT `/users/profile` - Update profile
- ✅ POST `/users/kids` - Add a kid (parent only)
- ✅ GET `/users/kids` - List parent's kids
- ✅ GET `/users/kids/:id` - Get kid by ID
- ✅ PUT `/users/kids/:id` - Update kid info
- ✅ DELETE `/users/kids/:id` - Delete kid (soft delete)

2. **Driver Routes** (`src/routes/v1/drivers.routes.ts`) ✅

- ✅ GET `/drivers` - List available drivers
- ✅ GET `/drivers/:id` - Get driver details
- ✅ PUT `/drivers/status` - Update driver availability

3. **Admin Management** ✅

- ✅ Admin account creation via `/auth/register` with `role: "ADMIN"`
- ✅ Admin routes (`src/routes/v1/admin.routes.ts`)
- ✅ Admin service (`src/services/admin.service.ts`)
- ✅ Admin controller (`src/controllers/admin.controller.ts`)
- ✅ Admin validators (`src/validators/admin.validator.ts`)
- ✅ UserModel methods: `findAll()`, `findByRole()`
- ✅ Admin can manage all users (parents and drivers)

### Phase 4: School Management ✅

1. **School Routes** (`src/routes/v1/schools.routes.ts`) ✅

- ✅ GET `/schools` - List all schools
- ✅ GET `/schools/:id` - Get school details
- ✅ POST `/schools` - Create school (admin only)
- ✅ PUT `/schools/:id` - Update school (admin only)
- ✅ DELETE `/schools/:id` - Delete school (admin only)

### Phase 5: Ride Booking System ✅

1. **Ride Routes** (`src/routes/v1/rides.routes.ts`) ✅

- ✅ POST `/rides` - Book a ride (parent) - **Now supports one-time rides only**
- ✅ GET `/rides` - List rides (filtered by user role)
- ✅ GET `/rides/:id` - Get ride details
- ✅ PUT `/rides/:id/accept` - Driver accepts ride
- ✅ PUT `/rides/:id/start` - Driver starts ride
- ✅ PUT `/rides/:id/pickup` - Driver marks as picked up
- ✅ PUT `/rides/:id/complete` - Driver completes ride
- ✅ PUT `/rides/:id/cancel` - Cancel ride

2. **Ride Service** (`src/services/ride.service.ts`) ✅

- ✅ Ride creation logic with distance/fare calculation
- ✅ Status transitions with validation
- ✅ Driver assignment and acceptance
- ✅ Nearby driver finding algorithm
- ✅ Support for subscription-based rides (subscription_id field)

3. **Subscription System** ✅

- ✅ Weekly and monthly subscription support
- ✅ **Automatic ride generation ONLY for ACTIVE subscriptions** (strict validation)
- ✅ Subscription management (create, update, pause, resume, cancel)
- ✅ Days of week scheduling (0=Sunday, 6=Saturday)
- ✅ Subscription routes and controllers
- ✅ Subscription model and service with status validation
- ✅ Database schema for subscriptions (subscriptions table + subscription_id in rides)
- ✅ Error handling: Clear errors when trying to generate rides for non-ACTIVE subscriptions

### Phase 6: Real-Time Tracking ✅

1. **WebSocket Setup** (`src/websocket/`) ✅

- ✅ Socket.io integration
- ✅ Connection handling with JWT authentication
- ✅ Room management (per ride)
- ✅ User permission verification (parent, driver, admin)

2. **Tracking Routes** (`src/routes/v1/tracking.routes.ts`) ✅

- ✅ POST `/tracking/:rideId/location` - Driver updates location
- ✅ GET `/tracking/:rideId` - Get current ride location
- ✅ GET `/tracking/:rideId/history` - Get location history

3. **WebSocket Events** ✅

- ✅ `location_update` - Driver sends location, broadcast to room
- ✅ `ride_status_change` - Status updates broadcast to room
- ✅ `driver_assigned` - Driver assignment notifications
- ✅ `join_ride` - Join ride room to receive updates
- ✅ `leave_ride` - Leave ride room
- ✅ `connected` - Connection confirmation with user data
- ✅ `error` - Error notifications

4. **Integration** ✅

- ✅ WebSocket server integrated with Express HTTP server
- ✅ Location updates saved to database (route_points table)
- ✅ Ride status changes broadcast via WebSocket
- ✅ Driver assignment broadcasts

### Phase 7: Route Management ✅

1. **Route Service** (`src/services/route.service.ts`) ✅

- ✅ Route optimization algorithm (Nearest Neighbor)
- ✅ Distance/time calculations (Haversine formula)
- ✅ Waypoint management

2. **Route Routes** (`src/routes/v1/routes.routes.ts`) ✅

- ✅ GET `/routes` - List routes (with optional filters)
- ✅ POST `/routes/optimize` - Optimize route for multiple pickups
- ✅ GET `/routes/:id` - Get route details
- ✅ POST `/routes` - Create route
- ✅ PUT `/routes/:id` - Update route
- ✅ DELETE `/routes/:id` - Delete route (soft delete)
- ✅ GET `/routes/school/:schoolId` - Get routes by school
- ✅ GET `/routes/driver/:driverId` - Get routes by driver

### Phase 5.5: Subscription System ✅

1. **Subscription Model** (`src/models/Subscription.ts`) ✅

- ✅ Subscription interface with WEEKLY/MONTHLY types
- ✅ Subscription status enum (ACTIVE, PAUSED, CANCELLED, EXPIRED)
- ✅ Days of week array support (0-6)
- ✅ CRUD operations
- ✅ Find active subscriptions for ride generation

2. **Subscription Service** (`src/services/subscription.service.ts`) ✅

- ✅ Create subscription with automatic ride generation (ACTIVE only)
- ✅ Calculate subscription totals based on ride count
- ✅ Generate rides automatically based on schedule
- ✅ **REQUIRED: Only ACTIVE subscriptions can generate rides**
- ✅ Pause, resume, cancel subscriptions
- ✅ Manual ride generation endpoint
- ✅ Batch generation for all active subscriptions (cron-ready)

3. **Subscription Routes** (`src/routes/v1/subscriptions.routes.ts`) ✅

- ✅ POST `/subscriptions` - Create subscription
- ✅ GET `/subscriptions` - List subscriptions (with active filter)
- ✅ GET `/subscriptions/:id` - Get subscription details
- ✅ PUT `/subscriptions/:id` - Update subscription
- ✅ PUT `/subscriptions/:id/pause` - Pause subscription
- ✅ PUT `/subscriptions/:id/resume` - Resume subscription (generates rides)
- ✅ PUT `/subscriptions/:id/cancel` - Cancel subscription
- ✅ POST `/subscriptions/:id/generate-rides` - Manually generate rides

4. **Database Schema** (`database/add_subscriptions.sql`) ✅

- ✅ `subscriptions` table with all required fields
- ✅ `subscription_type` enum (WEEKLY, MONTHLY)
- ✅ `subscription_status` enum (ACTIVE, PAUSED, CANCELLED, EXPIRED)
- ✅ `subscription_id` column added to `rides` table
- ✅ Indexes for performance

5. **Key Features** ✅

- ✅ **Strict Validation**: Rides only auto-generated when subscription is ACTIVE
- ✅ **Error Handling**: Clear errors when trying to generate rides for non-ACTIVE subscriptions
- ✅ **Flexible Scheduling**: Days of week array (0=Sunday, 6=Saturday)
- ✅ **Automatic Calculation**: Subscription total calculated based on ride count
- ✅ **Date Range Support**: Start and end dates with automatic ride generation
- ✅ **Status Management**: Pause/resume/cancel with proper ride generation control

### Phase 8: Payment Integration

1. **Payment Service** (`src/services/payment.service.ts`)

- Stripe integration (or alternative)
- Payment processing
- Refund handling
- **Subscription payment support** (for weekly/monthly subscriptions)

2. **Payment Routes** (`src/routes/v1/payments.routes.ts`)

- POST `/payments` - Create payment intent
- POST `/payments/:id/confirm` - Confirm payment
- GET `/payments` - List payment history
- POST `/payments/subscription/:id` - Process subscription payment

### Phase 9: Notification System

1. **Notification Service** (`src/services/notification.service.ts`)

- Push notification service (Firebase Cloud Messaging)
- Email notifications (optional)
- In-app notification storage

2. **Notification Routes** (`src/routes/v1/notifications.routes.ts`)

- GET `/notifications` - Get user notifications
- PUT `/notifications/:id/read` - Mark as read

### Phase 10: Validation & Error Handling ✅ (Partially Complete)

1. **Input Validation** (`src/validators/`) ✅

- ✅ Request validation schemas using Zod
- ✅ Validation middleware (`src/middleware/validator.ts`)
- ✅ Auth validators (register, login, refresh)
- ✅ User validators (updateProfile, createKid, updateKid)
- ✅ School validators (createSchool, updateSchool)
- ✅ Ride validators (createRide, cancelRide)
- ✅ Route validators (createRoute, updateRoute, optimizeRoute)
- ⚠️ Missing: Driver status update validator (optional - simple endpoint)
- ⚠️ Note: Status change endpoints (accept, start, pickup, complete) don't require body validation

2. **Error Handling** ⚠️

- ⚠️ Basic error handling in controllers (try/catch blocks)
- ⚠️ Error handling middleware was removed per user request
- ⚠️ Custom error types for business logic - Not implemented

## File Structure

```javascript
src/
├── auth/
│   ├── jwt.ts
│   ├── middleware.ts
│   └── strategies.ts
├── database/
│   ├── connection.ts
│   └── migrations/
├── models/
│   ├── User.ts
│   ├── Kid.ts
│   ├── School.ts
│   ├── Ride.ts
│   ├── Route.ts
│   ├── RoutePoint.ts
│   └── Payment.ts
├── routes/v1/
│   ├── auth.routes.ts
│   ├── users.routes.ts
│   ├── drivers.routes.ts
│   ├── schools.routes.ts
│   ├── rides.routes.ts
│   ├── tracking.routes.ts
│   ├── routes.routes.ts
│   ├── subscriptions.routes.ts
│   ├── payments.routes.ts
│   └── notifications.routes.ts
├── services/
│   ├── ride.service.ts
│   ├── route.service.ts
│   ├── subscription.service.ts
│   ├── payment.service.ts
│   └── notification.service.ts
├── validators/
│   ├── subscription.validator.ts
│   └── *.validator.ts
├── websocket/
│   ├── server.ts
│   └── handlers.ts
└── utils/
    └── ...
```



## Dependencies to Add

- `pg` or `typeorm` / `prisma` - Database ORM
- `jsonwebtoken` - JWT tokens
- `bcrypt` - Password hashing