# Postman Collection Setup Guide

## Import Collection and Environment

1. **Open Postman**
2. **Import Collection:**
   - Click "Import" button (top left)
   - Select `Zuanga_API.postman_collection.json`
   - Click "Import"

3. **Import Environment:**
   - Click "Import" button
   - Select `Zuanga_API.postman_environment.json`
   - Click "Import"

4. **Select Environment:**
   - In the top right corner, select "Zuanga API - Local" from the environment dropdown

## Collection Structure

### Health Check
- **GET** `/health` - Check if server is running

### Auth Endpoints

1. **Register Parent**
   - **POST** `/auth/register`
   - Registers a new parent user
   - Automatically saves tokens to environment variables

2. **Register Driver**
   - **POST** `/auth/register`
   - Registers a new driver user (requires license_number)
   - Automatically saves driver tokens to environment variables

3. **Login**
   - **POST** `/auth/login`
   - Login with email and password
   - Automatically saves tokens to environment variables

5. **Get Current User (Me)**
   - **GET** `/auth/me`
   - Get current authenticated user profile
   - Requires Bearer token (automatically uses saved token)

6. **Refresh Token**
   - **POST** `/auth/refresh`
   - Refresh access token using refresh token
   - Automatically updates access_token in environment

## Testing Flow

1. **Start your server:**
   ```bash
   npm run dev
   ```

2. **Test Health Check:**
   - Run "Health Check" request
   - Should return 200 OK

3. **Register a Parent:**
   - Run "Register Parent" request
   - Check response for user data and tokens
   - Tokens are automatically saved to environment

4. **Login:**
   - Run "Login" request
   - Tokens are automatically saved

5. **Get Current User:**
   - Run "Get Current User (Me)" request
   - Should return your user profile
   - Uses Bearer token automatically

6. **Register a Driver:**
   - Run "Register Driver" request
   - Driver tokens are saved separately

7. **Refresh Token:**
   - Run "Refresh Token" request
   - New access token is automatically saved

### Users Endpoints (Parent Only)

1. **Get Profile:**
   - Run "Get Profile" request
   - Returns current user profile

2. **Update Profile:**
   - Run "Update Profile" request
   - Update your profile information

3. **Add Kid:**
   - Run "Add Kid" request
   - Creates a new kid (requires school_id)
   - Kid ID is automatically saved to environment

4. **List Kids:**
   - Run "List Kids" request
   - Returns all kids for the current parent

5. **Get Kid by ID:**
   - Run "Get Kid by ID" request
   - Returns kid details

6. **Update Kid:**
   - Run "Update Kid" request
   - Update kid information

7. **Delete Kid:**
   - Run "Delete Kid" request
   - Soft deletes a kid

### Drivers Endpoints

1. **List Drivers:**
   - Run "List Drivers" request
   - Returns all drivers (optionally filter by availability)
   - No authentication required

2. **Get Driver by ID:**
   - Run "Get Driver by ID" request
   - Returns driver details
   - No authentication required

3. **Update Driver Status:**
   - Run "Update Driver Status" request (driver only)
   - Update availability and current location
   - Requires driver authentication

### Schools Endpoints

1. **List Schools:**
   - Run "List Schools" request
   - Returns all schools (optionally filter by active status)
   - No authentication required

2. **Get School by ID:**
   - Run "Get School by ID" request
   - Returns school details
   - Auto-saves school_id to environment
   - No authentication required

3. **Create School:**
   - Run "Create School" request (admin or parent)
   - Creates a new school
   - Auto-saves school_id to environment
   - Requires admin or parent authentication

4. **Update School:**
   - Run "Update School" request (admin or parent)
   - Updates school information
   - Requires admin or parent authentication

5. **Delete School:**
   - Run "Delete School" request (admin or parent)
   - Soft deletes a school
   - Requires admin or parent authentication

### Rides Endpoints

1. **Book Ride:**
   - Run "Book Ride" request (parent only)
   - Creates a new ride booking
   - Auto-saves ride_id to environment
   - Requires parent authentication and kid_id

2. **List Rides:**
   - Run "List Rides" request
   - Returns rides filtered by user role:
     - Parents see their kids' rides
     - Drivers see assigned rides
     - Admins see all active rides
   - Optional status filter for drivers

3. **Get Ride by ID:**
   - Run "Get Ride by ID" request
   - Returns ride details
   - Requires authentication

4. **Accept Ride:**
   - Run "Accept Ride" request (driver only)
   - Driver accepts a pending ride
   - Requires driver authentication

5. **Start Ride:**
   - Run "Start Ride" request (driver only)
   - Driver starts the ride (status: IN_PROGRESS)
   - Requires driver authentication

6. **Mark Picked Up:**
   - Run "Mark Picked Up" request (driver only)
   - Driver marks kid as picked up (status: PICKED_UP)
   - Requires driver authentication

7. **Complete Ride:**
   - Run "Complete Ride" request (driver only)
   - Driver completes the ride (status: COMPLETED)
   - Requires driver authentication

8. **Cancel Ride:**
   - Run "Cancel Ride" request (parent or driver)
   - Cancels a ride with optional reason
   - Requires authentication

## Environment Variables

The collection automatically manages these variables:
- `base_url` - API base URL (default: http://localhost:3000/api/v1)
- `access_token` - JWT access token (auto-saved on login/register)
- `refresh_token` - JWT refresh token (auto-saved on login/register)
- `user_id` - Current user ID (auto-saved)
- `driver_access_token` - Driver's access token
- `driver_refresh_token` - Driver's refresh token
- `driver_id` - Driver's user ID
- `kid_id` - Kid ID (auto-saved when creating a kid)
- `school_id` - School ID (auto-saved when getting/creating a school)
- `ride_id` - Ride ID (auto-saved when booking a ride)

## Sample Request Bodies

### Register Parent
```json
{
  "email": "parent@test.com",
  "phone": "+1234567890",
  "password": "Test1234",
  "first_name": "John",
  "last_name": "Parent",
  "role": "PARENT"
}
```

### Register Driver
```json
{
  "email": "driver@test.com",
  "phone": "+1234567891",
  "password": "Driver1234",
  "first_name": "Jane",
  "last_name": "Driver",
  "role": "DRIVER",
  "license_number": "DL123456",
  "vehicle_make": "Toyota",
  "vehicle_model": "Camry",
  "vehicle_color": "Blue",
  "vehicle_plate_number": "ABC123"
}
```

### Login
```json
{
  "email": "parent@test.com",
  "password": "Test1234"
}
```

### Refresh Token
```json
{
  "refresh_token": "{{refresh_token}}"
}
```

### Update Profile
```json
{
  "first_name": "John Updated",
  "last_name": "Parent Updated",
  "phone": "+1234567890"
}
```

### Add Kid
```json
{
  "school_id": "uuid-here",
  "first_name": "Emma",
  "last_name": "Parent",
  "date_of_birth": "2015-05-15",
  "grade": "3rd Grade",
  "pickup_address": "123 Main St, City, State",
  "pickup_latitude": 40.7128,
  "pickup_longitude": -74.0060,
  "dropoff_address": "456 School Ave, City, State",
  "dropoff_latitude": 40.7580,
  "dropoff_longitude": -73.9855,
  "emergency_contact_name": "Emergency Contact",
  "emergency_contact_phone": "+1987654321"
}
```

### Update Driver Status
```json
{
  "is_available": true,
  "current_latitude": 40.7128,
  "current_longitude": -74.0060
}
```

### Create School
```json
{
  "name": "Lincoln Elementary School",
  "address": "123 Education Ave",
  "city": "New York",
  "state": "NY",
  "country": "US",
  "postal_code": "10001",
  "latitude": 40.7580,
  "longitude": -73.9855,
  "phone": "+12125551234",
  "email": "info@lincolnelem.edu",
  "website": "https://lincolnelem.edu",
  "start_time": "08:00:00",
  "end_time": "15:00:00"
}
```

### Book Ride
```json
{
  "kid_id": "uuid-here",
  "ride_type": "TO_SCHOOL",
  "scheduled_pickup_time": "2024-12-25T08:00:00Z",
  "scheduled_dropoff_time": "2024-12-25T08:30:00Z",
  "pickup_address": "123 Main St, City, State",
  "pickup_latitude": 40.7128,
  "pickup_longitude": -74.0060,
  "dropoff_address": "456 School Ave, City, State",
  "dropoff_latitude": 40.7580,
  "dropoff_longitude": -73.9855,
  "base_fare": 5.00,
  "distance_fare": 3.50,
  "total_fare": 8.50,
  "parent_notes": "Please be on time"
}
```

### Cancel Ride
```json
{
  "cancellation_reason": "Change of plans"
}
```

## Routes Endpoints

### List Routes
- **GET** `/routes`
- Query params: `?active=true&school_id=xxx&driver_id=xxx`
- No authentication required

### Get Route by ID
- **GET** `/routes/:id`
- No authentication required
- Auto-saves `route_id` to environment

### Create Route
- **POST** `/routes`
- Requires: ADMIN or PARENT role
- Body:
```json
{
  "school_id": "uuid",
  "driver_id": "uuid (optional)",
  "name": "Route Name",
  "description": "Route description",
  "waypoints": [
    {
      "latitude": 40.7128,
      "longitude": -74.0060,
      "address": "123 Main St"
    }
  ],
  "estimated_distance_km": 5.2,
  "estimated_duration_minutes": 15
}
```

### Optimize Route
- **POST** `/routes/optimize`
- Requires: ADMIN or PARENT role
- Uses Nearest Neighbor algorithm to optimize waypoint order
- Automatically calculates distance and duration
- Body:
```json
{
  "school_id": "uuid",
  "driver_id": "uuid (optional)",
  "name": "Optimized Route",
  "description": "Route description",
  "waypoints": [
    {
      "latitude": 40.7128,
      "longitude": -74.0060,
      "address": "123 Main St"
    },
    {
      "latitude": 40.7200,
      "longitude": -74.0100,
      "address": "456 Oak Ave"
    }
  ]
}
```

### Update Route
- **PUT** `/routes/:id`
- Requires: ADMIN or PARENT role
- Distance and duration are recalculated if waypoints are updated

### Delete Route
- **DELETE** `/routes/:id`
- Requires: ADMIN or PARENT role
- Soft delete (sets `is_active` to false)

### Get Routes by School
- **GET** `/routes/school/:schoolId`
- No authentication required

### Get Routes by Driver
- **GET** `/routes/driver/:driverId`
- No authentication required

---

## Subscriptions Endpoints

### Create Subscription
- **POST** `/subscriptions`
- Requires: PARENT or ADMIN role
- Create a weekly or monthly subscription for automatic ride generation
- **Request Body:**
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
- **Days of Week:** `0`=Sunday, `1`=Monday, `2`=Tuesday, `3`=Wednesday, `4`=Thursday, `5`=Friday, `6`=Saturday
- Automatically saves `subscription_id` to environment

### List Subscriptions
- **GET** `/subscriptions?active=true`
- Requires: PARENT or ADMIN role
- Get all subscriptions for current parent
- Query params: `active` (true/false) to filter by status

### Get Subscription by ID
- **GET** `/subscriptions/:id`
- Requires: PARENT or ADMIN role
- Get subscription details

### Update Subscription
- **PUT** `/subscriptions/:id`
- Requires: PARENT or ADMIN role
- Update subscription details (schedule, locations, etc.)

### Pause Subscription
- **PUT** `/subscriptions/:id/pause`
- Requires: PARENT or ADMIN role
- Pause an active subscription (stops generating new rides)

### Resume Subscription
- **PUT** `/subscriptions/:id/resume`
- Requires: PARENT or ADMIN role
- Resume a paused subscription (generates rides for remaining period)

### Cancel Subscription
- **PUT** `/subscriptions/:id/cancel`
- Requires: PARENT or ADMIN role
- Cancel a subscription permanently

### Generate Rides for Subscription
- **POST** `/subscriptions/:id/generate-rides`
- Requires: PARENT or ADMIN role
- Manually generate rides for a subscription up to a specific date
- **Request Body:**
  ```json
  {
    "up_to_date": "2025-01-31"
  }
  ```

---

## Tracking Endpoints

### Update Driver Location
- **POST** `/tracking/:rideId/location`
- Requires: DRIVER role
- Update driver location for a ride (also broadcasts via WebSocket)
- **Request Body:**
  ```json
  {
    "latitude": 40.7128,
    "longitude": -74.0060,
    "accuracy": 10,
    "heading": 45,
    "speed": 50
  }
  ```

### Get Current Location
- **GET** `/tracking/:rideId`
- Requires: Authenticated user (parent, driver, or admin)
- Get the latest location for a ride

### Get Location History
- **GET** `/tracking/:rideId/history?limit=100`
- Requires: Authenticated user (parent, driver, or admin)
- Get location history for a ride
- Query params: `limit` (number of points to return)

## Environment Variables

The collection uses the following environment variables:
- `base_url` - API base URL (default: `http://localhost:3000/api/v1`)
- `access_token` - Parent/Admin JWT token
- `refresh_token` - Refresh token
- `user_id` - Current user ID
- `driver_access_token` - Driver JWT token
- `driver_refresh_token` - Driver refresh token
- `driver_id` - Driver user ID
- `kid_id` - Kid ID (auto-saved from Add Kid)
- `school_id` - School ID (auto-saved from Create/Get School)
- `ride_id` - Ride ID (auto-saved from Book Ride)
- `route_id` - Route ID (auto-saved from Create/Get Route)
- `subscription_id` - Subscription ID (auto-saved from Create Subscription)

---

## Admin Endpoints

### Register Admin
- **POST** `/auth/register`
- Register a new admin account (role: ADMIN)
- **Request Body:**
  ```json
  {
    "email": "admin@zuanga.com",
    "password": "Admin1234!",
    "phone": "+1234567899",
    "first_name": "Admin",
    "last_name": "User",
    "role": "ADMIN"
  }
  ```
- Automatically saves admin tokens to environment variables

### Get All Users
- **GET** `/admin/users?role=PARENT&active=true`
- Requires: ADMIN role
- Get all users (parents and drivers)
- Query params:
  - `role` - Filter by role (PARENT, DRIVER, ADMIN)
  - `active` - Filter by active status (true/false)

### Get User by ID
- **GET** `/admin/users/:id`
- Requires: ADMIN role
- Get user details by ID

### Update User
- **PUT** `/admin/users/:id`
- Requires: ADMIN role
- Update any user account
- **Request Body:**
  ```json
  {
    "first_name": "Updated Name",
    "phone": "+1234567890",
    "is_active": true
  }
  ```

### Deactivate User
- **PUT** `/admin/users/:id/deactivate`
- Requires: ADMIN role
- Deactivate user account (soft delete - sets is_active to false)

### Activate User
- **PUT** `/admin/users/:id/activate`
- Requires: ADMIN role
- Activate user account (sets is_active to true)

### Get All Parents
- **GET** `/admin/parents?active=true`
- Requires: ADMIN role
- Get all parent accounts
- Query params: `active` (true/false)

### Get All Drivers
- **GET** `/admin/drivers?active=true`
- Requires: ADMIN role
- Get all driver accounts
- Query params: `active` (true/false)

### Get User Statistics
- **GET** `/admin/stats`
- Requires: ADMIN role
- Get user statistics (total users, parents, drivers, admins, active counts)
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "stats": {
        "total_users": 100,
        "total_parents": 60,
        "total_drivers": 35,
        "total_admins": 5,
        "active_users": 90,
        "active_parents": 55,
        "active_drivers": 30
      }
    }
  }
  ```

## Notes

- All auth endpoints automatically save tokens to environment variables
- The "Get Current User" endpoint uses Bearer token authentication
- Make sure your `.env` file has `JWT_SECRET` set
- Server must be running on port 3000 (or update `base_url` in environment)
- Route optimization uses Nearest Neighbor algorithm for efficient waypoint ordering
- Admin accounts can be created via `/auth/register` with `role: "ADMIN"`
- Admin endpoints require ADMIN role authentication

