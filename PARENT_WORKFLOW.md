# Parent Workflow - Zuanga School Transportation App

This document outlines the complete workflow for parents using the Zuanga app, from registration to tracking their kids' rides.

## Overview

Parents use the Zuanga app to:
- Register and manage their profile
- Add and manage their children
- Book rides for their children
- Track rides in real-time
- View ride history and manage payments

---

## 1. Registration & Authentication

### Step 1.1: Register Account
**Endpoint:** `POST /api/v1/auth/register`

**Request:**
```json
{
  "email": "parent@example.com",
  "password": "SecurePassword123!",
  "phone": "+1234567890",
  "first_name": "John",
  "last_name": "Doe",
  "role": "PARENT"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "parent@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "role": "PARENT"
    },
    "tokens": {
      "accessToken": "jwt_token",
      "refreshToken": "refresh_token"
    }
  }
}
```

**What happens:**
- Account is created with PARENT role
- Password is hashed and stored securely
- JWT tokens are generated for authentication
- User can now log in

---

### Step 1.2: Login
**Endpoint:** `POST /api/v1/auth/login`

**Request:**
```json
{
  "email": "parent@example.com",
  "password": "SecurePassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "parent@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "role": "PARENT"
    },
    "tokens": {
      "accessToken": "jwt_token",
      "refreshToken": "refresh_token"
    }
  }
}
```

**What happens:**
- Credentials are verified
- JWT tokens are issued
- Parent can now access protected endpoints

---

## 2. Profile Management

### Step 2.1: View Profile
**Endpoint:** `GET /api/v1/users/profile`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "parent@example.com",
      "phone": "+1234567890",
      "first_name": "John",
      "last_name": "Doe",
      "role": "PARENT",
      "created_at": "2024-01-01T00:00:00Z"
    }
  }
}
```

---

### Step 2.2: Update Profile
**Endpoint:** `PUT /api/v1/users/profile`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request:**
```json
{
  "phone": "+1234567891",
  "first_name": "John",
  "last_name": "Smith"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "parent@example.com",
      "phone": "+1234567891",
      "first_name": "John",
      "last_name": "Smith",
      "role": "PARENT"
    }
  }
}
```

---

## 3. School Management

### Step 3.1: Browse Schools
**Endpoint:** `GET /api/v1/schools`

**Response:**
```json
{
  "success": true,
  "data": {
    "schools": [
      {
        "id": "school-uuid",
        "name": "Lincoln Elementary School",
        "address": "123 School St",
        "latitude": 40.7128,
        "longitude": -74.0060,
        "phone": "+1234567890",
        "email": "info@lincoln.edu"
      }
    ]
  }
}
```

**What happens:**
- Parent can view all available schools
- Can search/filter schools by location or name
- Selects school for their child

---

### Step 3.2: Create School (Optional)
**Endpoint:** `POST /api/v1/schools`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request:**
```json
{
  "name": "New School",
  "address": "456 Education Ave",
  "latitude": 40.7580,
  "longitude": -73.9855,
  "phone": "+1234567890",
  "email": "info@newschool.edu"
}
```

**Note:** Parents can create schools (same permissions as admins)

---

## 4. Kid Management

### Step 4.1: Add a Child
**Endpoint:** `POST /api/v1/users/kids`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request:**
```json
{
  "school_id": "school-uuid",
  "first_name": "Emma",
  "last_name": "Doe",
  "date_of_birth": "2015-05-15",
  "grade": "3rd Grade",
  "pickup_address": "123 Home St, City, State",
  "pickup_latitude": 40.7128,
  "pickup_longitude": -74.0060,
  "dropoff_address": "456 School Ave, City, State",
  "dropoff_latitude": 40.7580,
  "dropoff_longitude": -73.9855,
  "emergency_contact_name": "Jane Doe",
  "emergency_contact_phone": "+1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "kid": {
      "id": "kid-uuid",
      "parent_id": "parent-uuid",
      "school_id": "school-uuid",
      "first_name": "Emma",
      "last_name": "Doe",
      "date_of_birth": "2015-05-15",
      "grade": "3rd Grade",
      "pickup_address": "123 Home St",
      "pickup_latitude": 40.7128,
      "pickup_longitude": -74.0060,
      "is_active": true
    }
  }
}
```

**What happens:**
- Child profile is created
- Linked to parent account
- Linked to selected school
- Pickup/dropoff locations are saved

---

### Step 4.2: View All Kids
**Endpoint:** `GET /api/v1/users/kids`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "kids": [
      {
        "id": "kid-uuid",
        "first_name": "Emma",
        "last_name": "Doe",
        "school_id": "school-uuid",
        "grade": "3rd Grade",
        "is_active": true
      }
    ]
  }
}
```

---

### Step 4.3: View Kid Details
**Endpoint:** `GET /api/v1/users/kids/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "kid": {
      "id": "kid-uuid",
      "first_name": "Emma",
      "last_name": "Doe",
      "date_of_birth": "2015-05-15",
      "grade": "3rd Grade",
      "pickup_address": "123 Home St",
      "dropoff_address": "456 School Ave",
      "school_id": "school-uuid"
    }
  }
}
```

---

### Step 4.4: Update Kid Information
**Endpoint:** `PUT /api/v1/users/kids/:id`

**Request:**
```json
{
  "grade": "4th Grade",
  "pickup_address": "789 New Home St",
  "pickup_latitude": 40.7200,
  "pickup_longitude": -74.0100
}
```

---

### Step 4.5: Remove Kid (Soft Delete)
**Endpoint:** `DELETE /api/v1/users/kids/:id`

**What happens:**
- Kid is marked as inactive (soft delete)
- Historical rides remain accessible
- Kid can be reactivated later

---

## 5. Subscription Management (Primary Method)

### Step 5.1: Create Weekly Subscription
**Endpoint:** `POST /api/v1/subscriptions`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request:**
```json
{
  "kid_id": "kid-uuid",
  "school_id": "school-uuid",
  "subscription_type": "WEEKLY",
  "start_date": "2024-12-25",
  "end_date": "2025-03-25",
  "days_of_week": [1, 2, 3, 4, 5],
  "pickup_time": "08:00",
  "dropoff_time": "15:30",
  "pickup_address": "123 Home St, City, State",
  "pickup_latitude": 40.7128,
  "pickup_longitude": -74.0060,
  "dropoff_address": "456 School Ave, City, State",
  "dropoff_latitude": 40.7580,
  "dropoff_longitude": -73.9855,
  "base_fare": 5.00,
  "distance_fare": 3.50,
  "total_fare_per_ride": 8.50,
  "parent_notes": "Please be on time, child has a test today",
  "auto_generate_rides": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "subscription": {
      "id": "subscription-uuid",
      "parent_id": "parent-uuid",
      "kid_id": "kid-uuid",
      "school_id": "school-uuid",
      "subscription_type": "WEEKLY",
      "status": "ACTIVE",
      "start_date": "2024-12-25",
      "end_date": "2025-03-25",
      "days_of_week": [1, 2, 3, 4, 5],
      "pickup_time": "08:00:00",
      "total_fare_per_ride": 8.50,
      "subscription_total": 510.00,
      "auto_generate_rides": true
    },
    "message": "Subscription created successfully. Rides will be automatically generated."
  }
}
```

**What happens:**
- Weekly subscription is created with ACTIVE status (Monday-Friday)
- System calculates total subscription cost
- **Rides are automatically generated ONLY because subscription is ACTIVE**
- Each ride is created with PENDING status
- Parent can track all rides from the subscription
- **Important:** Rides are only generated when subscription status is ACTIVE

**Days of Week:**
- `0` = Sunday
- `1` = Monday
- `2` = Tuesday
- `3` = Wednesday
- `4` = Thursday
- `5` = Friday
- `6` = Saturday

---

### Step 5.2: Create Monthly Subscription
**Request:**
```json
{
  "kid_id": "kid-uuid",
  "school_id": "school-uuid",
  "subscription_type": "MONTHLY",
  "start_date": "2024-12-25",
  "end_date": "2025-06-25",
  "days_of_week": [1, 2, 3, 4, 5],
  "pickup_time": "08:00",
  "dropoff_time": "15:30",
  "pickup_address": "123 Home St",
  "pickup_latitude": 40.7128,
  "pickup_longitude": -74.0060,
  "dropoff_address": "456 School Ave",
  "dropoff_latitude": 40.7580,
  "dropoff_longitude": -73.9855,
  "base_fare": 5.00,
  "total_fare_per_ride": 8.50,
  "auto_generate_rides": true
}
```

**What happens:**
- Monthly subscription is created with ACTIVE status
- System automatically generates rides for the entire period (because status is ACTIVE)
- Parent pays upfront or monthly (depending on payment integration)
- **Note:** Rides are only generated when subscription is ACTIVE

---

### Step 5.3: View All Subscriptions
**Endpoint:** `GET /api/v1/subscriptions?active=true`

**Response:**
```json
{
  "success": true,
  "data": {
    "subscriptions": [
      {
        "id": "subscription-uuid",
        "kid_id": "kid-uuid",
        "subscription_type": "WEEKLY",
        "status": "ACTIVE",
        "start_date": "2024-12-25",
        "end_date": "2025-03-25",
        "days_of_week": [1, 2, 3, 4, 5],
        "total_fare_per_ride": 8.50,
        "subscription_total": 510.00
      }
    ],
    "count": 1
  }
}
```

---

### Step 5.4: View Subscription Details
**Endpoint:** `GET /api/v1/subscriptions/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "subscription": {
      "id": "subscription-uuid",
      "parent_id": "parent-uuid",
      "kid_id": "kid-uuid",
      "school_id": "school-uuid",
      "subscription_type": "WEEKLY",
      "status": "ACTIVE",
      "start_date": "2024-12-25",
      "end_date": "2025-03-25",
      "days_of_week": [1, 2, 3, 4, 5],
      "pickup_time": "08:00:00",
      "dropoff_time": "15:30:00",
      "pickup_address": "123 Home St",
      "dropoff_address": "456 School Ave",
      "total_fare_per_ride": 8.50,
      "subscription_total": 510.00,
      "auto_generate_rides": true,
      "last_ride_generated_date": "2024-12-24"
    }
  }
}
```

---

### Step 5.5: Update Subscription
**Endpoint:** `PUT /api/v1/subscriptions/:id`

**Request:**
```json
{
  "pickup_time": "07:45",
  "days_of_week": [1, 2, 3, 4],
  "parent_notes": "Updated schedule"
}
```

**What happens:**
- Subscription details are updated
- Future rides will use new schedule
- Existing rides remain unchanged

---

### Step 5.6: Pause Subscription
**Endpoint:** `PUT /api/v1/subscriptions/:id/pause`

**Response:**
```json
{
  "success": true,
  "data": {
    "subscription": {
      "id": "subscription-uuid",
      "status": "PAUSED",
      "paused_at": "2024-12-20T10:00:00Z"
    },
    "message": "Subscription paused successfully"
  }
}
```

**What happens:**
- Subscription status changes to PAUSED
- **No new rides will be generated** (only ACTIVE subscriptions can generate rides)
- Existing pending rides remain active
- Parent can resume subscription later to continue ride generation

---

### Step 5.7: Resume Subscription
**Endpoint:** `PUT /api/v1/subscriptions/:id/resume`

**Response:**
```json
{
  "success": true,
  "data": {
    "subscription": {
      "id": "subscription-uuid",
      "status": "ACTIVE"
    },
    "message": "Subscription resumed successfully. Rides will be automatically generated."
  }
}
```

**What happens:**
- Subscription status changes to ACTIVE
- **System generates rides for the remaining period** (because subscription is now ACTIVE)
- Parent can track resumed rides
- **Important:** Rides are only generated when subscription status is ACTIVE

---

### Step 5.8: Cancel Subscription
**Endpoint:** `PUT /api/v1/subscriptions/:id/cancel`

**Response:**
```json
{
  "success": true,
  "data": {
    "subscription": {
      "id": "subscription-uuid",
      "status": "CANCELLED",
      "cancelled_at": "2024-12-20T10:00:00Z"
    },
    "message": "Subscription cancelled successfully"
  }
}
```

**What happens:**
- Subscription status changes to CANCELLED
- **No new rides will be generated** (only ACTIVE subscriptions can generate rides)
- Existing pending rides can be cancelled individually
- Refund processed (if payment was made)
- **Note:** Once cancelled, subscription cannot be resumed (must create new subscription)

---

### Step 5.9: Manually Generate Rides
**Endpoint:** `POST /api/v1/subscriptions/:id/generate-rides`

**Request:**
```json
{
  "up_to_date": "2025-01-31"
}
```

**What happens:**
- System generates rides up to the specified date
- **REQUIRED: Subscription must be ACTIVE to generate rides**
- If subscription is not ACTIVE, an error will be returned
- Useful if auto-generation was disabled or needs to catch up
- Only generates rides for days in the subscription schedule
- **Error:** If subscription is PAUSED, CANCELLED, or EXPIRED, generation will fail with clear error message

---

## 6. One-Time Ride Booking (Alternative Method)

### Step 6.1: Book a Single Ride
**Endpoint:** `POST /api/v1/rides`

**Note:** This is for one-time rides only. For regular rides, use subscriptions.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request:**
```json
{
  "kid_id": "kid-uuid",
  "ride_type": "TO_SCHOOL",
  "scheduled_pickup_time": "2024-12-25T08:00:00Z",
  "scheduled_dropoff_time": "2024-12-25T08:30:00Z",
  "pickup_address": "123 Home St, City, State",
  "pickup_latitude": 40.7128,
  "pickup_longitude": -74.0060,
  "dropoff_address": "456 School Ave, City, State",
  "dropoff_latitude": 40.7580,
  "dropoff_longitude": -73.9855,
  "base_fare": 5.00,
  "distance_fare": 3.50,
  "total_fare": 8.50,
  "parent_notes": "Please be on time, child has a test today"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "ride": {
      "id": "ride-uuid",
      "kid_id": "kid-uuid",
      "status": "PENDING",
      "ride_type": "TO_SCHOOL",
      "scheduled_pickup_time": "2024-12-25T08:00:00Z",
      "total_fare": 8.50,
      "created_at": "2024-12-24T10:00:00Z"
    }
  }
}
```

**What happens:**
- Ride is created with PENDING status
- System calculates distance and fare
- Ride is available for drivers to accept
- Parent receives confirmation

---

### Step 5.2: View All Rides
**Endpoint:** `GET /api/v1/rides`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `status` (optional): Filter by status (PENDING, ACCEPTED, IN_PROGRESS, etc.)

**Response:**
```json
{
  "success": true,
  "data": {
    "rides": [
      {
        "id": "ride-uuid",
        "kid_id": "kid-uuid",
        "status": "ACCEPTED",
        "ride_type": "TO_SCHOOL",
        "scheduled_pickup_time": "2024-12-25T08:00:00Z",
        "driver_id": "driver-uuid",
        "total_fare": 8.50
      }
    ]
  }
}
```

**What happens:**
- Returns all rides for parent's kids
- Can filter by status
- Shows ride history

---

### Step 5.3: View Ride Details
**Endpoint:** `GET /api/v1/rides/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "ride": {
      "id": "ride-uuid",
      "kid_id": "kid-uuid",
      "driver_id": "driver-uuid",
      "status": "IN_PROGRESS",
      "ride_type": "TO_SCHOOL",
      "scheduled_pickup_time": "2024-12-25T08:00:00Z",
      "actual_pickup_time": "2024-12-25T08:05:00Z",
      "pickup_address": "123 Home St",
      "dropoff_address": "456 School Ave",
      "total_fare": 8.50,
      "parent_notes": "Please be on time"
    }
  }
}
```

---

### Step 5.4: Cancel Ride
**Endpoint:** `PUT /api/v1/rides/:id/cancel`

**Request:**
```json
{
  "cancellation_reason": "Child is sick"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "ride": {
      "id": "ride-uuid",
      "status": "CANCELLED",
      "cancellation_reason": "Child is sick"
    }
  }
}
```

**What happens:**
- Ride status changes to CANCELLED
- Driver is notified (if assigned)
- Refund processed (if payment was made)

---

## 6. Real-Time Tracking

### Step 6.1: Connect to WebSocket
**Connection:**
```javascript
const socket = io('http://localhost:3000', {
  auth: {
    token: 'YOUR_ACCESS_TOKEN'
  }
});
```

**What happens:**
- Parent connects to WebSocket server
- Authentication is verified via JWT token
- Connection is established

---

### Step 6.2: Join Ride Room
**Event:** `join_ride`

```javascript
socket.emit('join_ride', { rideId: 'ride-uuid' });
```

**What happens:**
- Parent joins the ride's WebSocket room
- Permission is verified (parent must own the kid)
- Parent starts receiving real-time updates

---

### Step 6.3: Receive Location Updates
**Event:** `location_update`

```javascript
socket.on('location_update', (data) => {
  console.log('Driver location:', data);
  // {
  //   rideId: 'ride-uuid',
  //   latitude: 40.7128,
  //   longitude: -74.0060,
  //   accuracy: 10,
  //   heading: 45,
  //   speed: 50,
  //   timestamp: '2024-12-25T08:10:00Z'
  // }
  // Update map marker with driver's location
});
```

**What happens:**
- Parent receives real-time location updates
- Updates occur every few seconds while ride is in progress
- Location is displayed on map in parent's app

---

### Step 6.4: Receive Status Updates
**Event:** `ride_status_change`

```javascript
socket.on('ride_status_change', (data) => {
  console.log('Ride status:', data.status);
  // {
  //   rideId: 'ride-uuid',
  //   status: 'IN_PROGRESS',
  //   timestamp: '2024-12-25T08:05:00Z'
  // }
  // Update UI to show current status
});
```

**Status Flow:**
1. `PENDING` → Ride created, waiting for driver
2. `ACCEPTED` → Driver accepted the ride
3. `IN_PROGRESS` → Driver started the ride
4. `PICKED_UP` → Driver picked up the child
5. `COMPLETED` → Ride completed successfully
6. `CANCELLED` → Ride was cancelled

---

### Step 6.5: Receive Driver Assignment
**Event:** `driver_assigned`

```javascript
socket.on('driver_assigned', (data) => {
  console.log('Driver assigned:', data);
  // {
  //   rideId: 'ride-uuid',
  //   driverId: 'driver-uuid',
  //   driverName: 'John Driver',
  //   timestamp: '2024-12-25T08:00:00Z'
  // }
  // Show driver information to parent
});
```

**What happens:**
- Parent is notified when a driver accepts the ride
- Driver information is displayed
- Parent can contact driver if needed

---

### Step 6.6: Get Current Location (REST)
**Endpoint:** `GET /api/v1/tracking/:rideId`

**Response:**
```json
{
  "success": true,
  "data": {
    "location": {
      "id": "point-uuid",
      "ride_id": "ride-uuid",
      "latitude": 40.7128,
      "longitude": -74.0060,
      "accuracy": 10,
      "heading": 45,
      "speed": 50,
      "recorded_at": "2024-12-25T08:10:00Z"
    }
  }
}
```

---

### Step 6.7: Get Location History
**Endpoint:** `GET /api/v1/tracking/:rideId/history?limit=100`

**Response:**
```json
{
  "success": true,
  "data": {
    "history": [
      {
        "id": "point-uuid",
        "latitude": 40.7128,
        "longitude": -74.0060,
        "recorded_at": "2024-12-25T08:10:00Z"
      }
    ],
    "count": 50
  }
}
```

**What happens:**
- Parent can view the complete route taken
- Useful for reviewing past rides
- Can be displayed as a route on map

---

## 7. Route Management (Optional)

### Step 7.1: View Routes
**Endpoint:** `GET /api/v1/routes?school_id=school-uuid`

**Response:**
```json
{
  "success": true,
  "data": {
    "routes": [
      {
        "id": "route-uuid",
        "school_id": "school-uuid",
        "name": "Morning Route 1",
        "status": "ACCEPTED",
        "driver_id": "driver-uuid",
        "estimated_distance_km": 15.5,
        "estimated_duration_minutes": 25
      }
    ]
  }
}
```

**Note:** Parents can view routes but cannot directly create them (they're created by admins or automatically)

---

## 8. Complete Workflow Example

### Setting Up Weekly Subscription (Primary Method)

1. **Beginning of School Year - Parent sets up subscription**
   - Logs in to app
   - Navigates to Subscriptions section
   - Creates new subscription:
     - Selects child: "Emma Doe"
     - Selects school: "Lincoln Elementary"
     - Subscription type: WEEKLY
     - Days: Monday-Friday [1,2,3,4,5]
     - Pickup time: 8:00 AM (TO_SCHOOL)
     - Dropoff time: 3:30 PM (FROM_SCHOOL)
     - Start date: First day of school
     - End date: Last day of semester
     - Reviews total cost: $510.00 (60 rides × $8.50)
   - Submits subscription

2. **System automatically generates rides**
   - All rides for the subscription period are created
   - Each ride has PENDING status
   - Parent can view all scheduled rides
   - No need to book individual rides

3. **Daily - Rides are ready**
   - Each morning, parent sees today's ride
   - Driver accepts ride
   - Parent tracks ride in real-time
   - Ride completes automatically

### One-Time Ride Booking (Alternative Method)

1. **7:00 AM - Parent opens app**
   - Logs in (if not already logged in)
   - Views today's scheduled rides

2. **7:30 AM - Books one-time ride for 8:00 AM**
   - Selects child: "Emma Doe"
   - Selects ride type: "TO_SCHOOL"
   - Sets pickup time: 8:00 AM
   - Confirms pickup/dropoff addresses
   - Reviews fare: $8.50
   - Adds note: "Please be on time, child has a test"
   - Submits booking

3. **7:35 AM - Ride created**
   - Status: PENDING
   - Waiting for driver to accept

4. **7:40 AM - Driver accepts**
   - Parent receives notification: "Driver John Driver assigned"
   - Status changes to: ACCEPTED
   - Parent can see driver information

5. **7:55 AM - Driver starts ride**
   - Status changes to: IN_PROGRESS
   - Parent connects to WebSocket
   - Joins ride room
   - Starts receiving location updates

6. **8:00 AM - Driver arrives**
   - Parent sees driver location on map
   - Driver is at pickup location
   - Parent can track in real-time

7. **8:05 AM - Driver picks up child**
   - Status changes to: PICKED_UP
   - Parent receives notification
   - Continues tracking to school

8. **8:25 AM - Driver arrives at school**
   - Parent sees driver at school location
   - Status changes to: COMPLETED
   - Ride ends

9. **8:30 AM - Review ride**
   - Parent can view ride details
   - View route taken (location history)
   - Payment is processed
   - Receipt is generated

---

## 9. Key Features for Parents

### Notifications
- Push notifications for:
  - Driver assigned
  - Driver started ride
  - Driver picked up child
  - Ride completed
  - Ride cancelled

### Safety Features
- Real-time location tracking
- Driver information (name, vehicle, license)
- Emergency contact information
- Ride history for accountability

### Convenience Features
- Recurring ride booking (future feature)
- Favorite drivers (future feature)
- Payment methods management (future feature)
- Ride scheduling calendar (future feature)

---

## 10. Error Handling

### Common Scenarios

**No drivers available:**
- Ride remains in PENDING status
- Parent is notified
- System retries to find driver

**Driver cancels:**
- Ride status changes to PENDING
- System finds another driver
- Parent is notified

**Ride cancelled:**
- Status changes to CANCELLED
- Refund processed (if payment made)
- Parent can book new ride

**Connection lost:**
- WebSocket automatically reconnects
- Parent receives missed updates
- Tracking continues seamlessly

---

## Summary

The parent workflow in Zuanga is designed to be:
- **Simple**: Easy booking process
- **Transparent**: Real-time tracking and status updates
- **Safe**: Driver verification and location tracking
- **Convenient**: Manage kids and rides from one place

Parents can confidently book rides for their children and track them in real-time, ensuring safety and peace of mind.

