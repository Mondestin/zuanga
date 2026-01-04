# Subscription System - Weekly & Monthly Ride Subscriptions

## Overview

The Zuanga API now supports **weekly and monthly subscriptions** for ride booking. Parents can create subscriptions that automatically generate rides based on a schedule, eliminating the need to book individual rides daily.

## Key Features

- ✅ **Weekly Subscriptions**: Schedule rides for specific days of the week
- ✅ **Monthly Subscriptions**: Schedule rides for longer periods
- ✅ **Automatic Ride Generation**: System automatically creates rides based on subscription schedule
- ✅ **Flexible Scheduling**: Choose specific days of the week (Monday-Friday, etc.)
- ✅ **Subscription Management**: Pause, resume, or cancel subscriptions
- ✅ **One-Time Rides**: Still supported for occasional rides

## Database Schema

### Subscriptions Table

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY,
  parent_id UUID NOT NULL,
  kid_id UUID NOT NULL,
  school_id UUID NOT NULL,
  subscription_type subscription_type NOT NULL, -- WEEKLY or MONTHLY
  status subscription_status NOT NULL, -- ACTIVE, PAUSED, CANCELLED, EXPIRED
  start_date DATE NOT NULL,
  end_date DATE,
  days_of_week INTEGER[] NOT NULL, -- [1,2,3,4,5] for Mon-Fri
  pickup_time TIME NOT NULL,
  dropoff_time TIME,
  pickup_address TEXT NOT NULL,
  pickup_latitude DECIMAL(10, 8) NOT NULL,
  pickup_longitude DECIMAL(11, 8) NOT NULL,
  dropoff_address TEXT NOT NULL,
  dropoff_latitude DECIMAL(10, 8) NOT NULL,
  dropoff_longitude DECIMAL(11, 8) NOT NULL,
  base_fare DECIMAL(10, 2) NOT NULL,
  total_fare_per_ride DECIMAL(10, 2) NOT NULL,
  subscription_total DECIMAL(10, 2),
  auto_generate_rides BOOLEAN DEFAULT true,
  last_ride_generated_date DATE,
  ...
);
```

### Rides Table Update

- Added `subscription_id` column to link rides to subscriptions
- Rides generated from subscriptions have `subscription_id` set
- One-time rides have `subscription_id` as NULL

## API Endpoints

### Create Subscription
**POST** `/api/v1/subscriptions`

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

### Get Subscriptions
**GET** `/api/v1/subscriptions?active=true`

### Get Subscription Details
**GET** `/api/v1/subscriptions/:id`

### Update Subscription
**PUT** `/api/v1/subscriptions/:id`

### Pause Subscription
**PUT** `/api/v1/subscriptions/:id/pause`

### Resume Subscription
**PUT** `/api/v1/subscriptions/:id/resume`

### Cancel Subscription
**PUT** `/api/v1/subscriptions/:id/cancel`

### Manually Generate Rides
**POST** `/api/v1/subscriptions/:id/generate-rides`

**Request:**
```json
{
  "up_to_date": "2025-01-31"
}
```

## How It Works

### 1. Subscription Creation

When a parent creates a subscription:
1. Subscription is saved to database
2. System calculates total subscription cost
3. If `auto_generate_rides` is true, rides are automatically generated
4. Rides are created with PENDING status
5. Each ride is linked to the subscription via `subscription_id`

### 2. Automatic Ride Generation

The system generates rides:
- **On subscription creation**: Initial rides are generated
- **On subscription resume**: Rides are generated for remaining period
- **Via cron job** (future): Daily job generates rides for upcoming week/month

### 3. Ride Generation Logic

For each day in the subscription period:
1. Check if day matches `days_of_week` array
2. Check if ride already exists for that date/time
3. Determine ride type (TO_SCHOOL if pickup < 12:00, FROM_SCHOOL otherwise)
4. Create ride with subscription details
5. Link ride to subscription

### 4. Subscription Status Flow

```
ACTIVE → PAUSED → ACTIVE (resume)
ACTIVE → CANCELLED
ACTIVE → EXPIRED (when end_date passes)
```

## Days of Week Reference

- `0` = Sunday
- `1` = Monday
- `2` = Tuesday
- `3` = Wednesday
- `4` = Thursday
- `5` = Friday
- `6` = Saturday

**Example:** `[1, 2, 3, 4, 5]` = Monday through Friday

## Example Scenarios

### Scenario 1: Weekly Subscription (Mon-Fri, Morning)

```json
{
  "subscription_type": "WEEKLY",
  "start_date": "2024-12-25",
  "end_date": "2025-03-25",
  "days_of_week": [1, 2, 3, 4, 5],
  "pickup_time": "08:00",
  "dropoff_time": "15:30"
}
```

**Result:**
- Generates rides for every Monday-Friday
- Morning rides (TO_SCHOOL) at 8:00 AM
- Afternoon rides (FROM_SCHOOL) at 3:30 PM
- Total: ~60 rides (12 weeks × 5 days × 2 rides/day)

### Scenario 2: Monthly Subscription (Weekdays Only)

```json
{
  "subscription_type": "MONTHLY",
  "start_date": "2024-12-25",
  "end_date": "2025-06-25",
  "days_of_week": [1, 2, 3, 4, 5],
  "pickup_time": "07:30"
}
```

**Result:**
- Generates rides for 6 months
- Weekdays only (Monday-Friday)
- Morning rides at 7:30 AM
- Total: ~130 rides (6 months × ~22 weekdays/month)

## Migration

Run the subscription migration:

```bash
npm run migrate:subscriptions
```

This will:
- Create subscription enums
- Create subscriptions table
- Add subscription_id to rides table
- Create necessary indexes

## Future Enhancements

- [ ] Cron job for automatic daily ride generation
- [ ] Subscription renewal reminders
- [ ] Bulk subscription management
- [ ] Subscription templates
- [ ] Holiday/school break handling
- [ ] Subscription analytics

