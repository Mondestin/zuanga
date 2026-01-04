-- Zuanga School Transportation System
-- Production-ready PostgreSQL Schema
-- Version: 1.0.0

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search optimization

-- ============================================================================
-- ENUMS
-- ============================================================================

-- User roles
CREATE TYPE user_role AS ENUM ('PARENT', 'DRIVER', 'ADMIN');

-- Ride status
CREATE TYPE ride_status AS ENUM (
  'PENDING',
  'ACCEPTED',
  'DRIVER_ASSIGNED',
  'IN_PROGRESS',
  'PICKED_UP',
  'COMPLETED',
  'CANCELLED'
);

-- Payment status
CREATE TYPE payment_status AS ENUM (
  'PENDING',
  'PROCESSING',
  'COMPLETED',
  'FAILED',
  'REFUNDED'
);

-- Payment method
CREATE TYPE payment_method AS ENUM (
  'CREDIT_CARD',
  'DEBIT_CARD',
  'MOBILE_MONEY',
  'BANK_TRANSFER'
);

-- Notification type
CREATE TYPE notification_type AS ENUM (
  'RIDE_REQUESTED',
  'RIDE_ACCEPTED',
  'RIDE_STARTED',
  'RIDE_COMPLETED',
  'RIDE_CANCELLED',
  'PAYMENT_RECEIVED',
  'DRIVER_ARRIVING',
  'SYSTEM'
);

-- ============================================================================
-- TABLES
-- ============================================================================

-- Users table (Parents, Drivers, Admins)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role user_role NOT NULL DEFAULT 'PARENT',
  
  -- Driver-specific fields
  license_number VARCHAR(50),
  vehicle_make VARCHAR(50),
  vehicle_model VARCHAR(50),
  vehicle_color VARCHAR(30),
  vehicle_plate_number VARCHAR(20),
  is_available BOOLEAN DEFAULT false,
  current_latitude DECIMAL(10, 8),
  current_longitude DECIMAL(11, 8),
  
  -- Profile fields
  profile_image_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP WITH TIME ZONE,
  
  -- Constraints
  CONSTRAINT chk_driver_fields CHECK (
    (role = 'DRIVER' AND license_number IS NOT NULL) OR 
    (role != 'DRIVER')
  ),
  CONSTRAINT chk_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Schools table
CREATE TABLE schools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100),
  country VARCHAR(100) NOT NULL DEFAULT 'US',
  postal_code VARCHAR(20),
  
  -- Location coordinates
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  
  -- School details
  phone VARCHAR(20),
  email VARCHAR(255),
  website TEXT,
  start_time TIME,
  end_time TIME,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Kids table
CREATE TABLE kids (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE RESTRICT,
  
  -- Kid information
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  date_of_birth DATE NOT NULL,
  grade VARCHAR(20),
  
  -- Pickup/Dropoff locations
  pickup_address TEXT NOT NULL,
  pickup_latitude DECIMAL(10, 8) NOT NULL,
  pickup_longitude DECIMAL(11, 8) NOT NULL,
  dropoff_address TEXT,
  dropoff_latitude DECIMAL(10, 8),
  dropoff_longitude DECIMAL(11, 8),
  
  -- Emergency contact
  emergency_contact_name VARCHAR(200),
  emergency_contact_phone VARCHAR(20),
  
  -- Profile
  profile_image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraints
  CONSTRAINT chk_dropoff_location CHECK (
    (dropoff_address IS NULL AND dropoff_latitude IS NULL AND dropoff_longitude IS NULL) OR
    (dropoff_address IS NOT NULL AND dropoff_latitude IS NOT NULL AND dropoff_longitude IS NOT NULL)
  )
);

-- Routes table
CREATE TABLE routes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE RESTRICT,
  driver_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Route information
  name VARCHAR(255),
  description TEXT,
  
  -- Route waypoints (stored as JSONB for flexibility)
  waypoints JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Route metrics
  estimated_distance_km DECIMAL(10, 2),
  estimated_duration_minutes INTEGER,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Rides table
CREATE TABLE rides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kid_id UUID NOT NULL REFERENCES kids(id) ON DELETE RESTRICT,
  driver_id UUID REFERENCES users(id) ON DELETE SET NULL,
  route_id UUID REFERENCES routes(id) ON DELETE SET NULL,
  
  -- Ride details
  status ride_status NOT NULL DEFAULT 'PENDING',
  ride_type VARCHAR(20) NOT NULL CHECK (ride_type IN ('TO_SCHOOL', 'FROM_SCHOOL')),
  
  -- Scheduled times
  scheduled_pickup_time TIMESTAMP WITH TIME ZONE NOT NULL,
  scheduled_dropoff_time TIMESTAMP WITH TIME ZONE,
  
  -- Actual times
  actual_pickup_time TIMESTAMP WITH TIME ZONE,
  actual_dropoff_time TIMESTAMP WITH TIME ZONE,
  
  -- Locations
  pickup_address TEXT NOT NULL,
  pickup_latitude DECIMAL(10, 8) NOT NULL,
  pickup_longitude DECIMAL(11, 8) NOT NULL,
  dropoff_address TEXT NOT NULL,
  dropoff_latitude DECIMAL(10, 8) NOT NULL,
  dropoff_longitude DECIMAL(11, 8) NOT NULL,
  
  -- Ride metrics
  distance_km DECIMAL(10, 2),
  duration_minutes INTEGER,
  
  -- Pricing
  base_fare DECIMAL(10, 2) NOT NULL,
  distance_fare DECIMAL(10, 2),
  total_fare DECIMAL(10, 2) NOT NULL,
  
  -- Notes
  parent_notes TEXT,
  driver_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancelled_by UUID REFERENCES users(id) ON DELETE SET NULL,
  cancellation_reason TEXT
);

-- Route points table (for real-time tracking)
CREATE TABLE route_points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
  
  -- Location
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  accuracy DECIMAL(8, 2),
  heading DECIMAL(5, 2),
  speed DECIMAL(8, 2),
  
  -- Timestamp
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Index for efficient querying
  CONSTRAINT idx_route_points_ride_time UNIQUE (ride_id, recorded_at)
);

-- Payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE RESTRICT,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  
  -- Payment details
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  status payment_status NOT NULL DEFAULT 'PENDING',
  method payment_method NOT NULL,
  
  -- Payment provider details
  transaction_id VARCHAR(255),
  provider_response JSONB,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP WITH TIME ZONE,
  
  -- Constraints
  CONSTRAINT chk_transaction_id CHECK (
    (status IN ('COMPLETED', 'FAILED', 'REFUNDED') AND transaction_id IS NOT NULL) OR
    (status NOT IN ('COMPLETED', 'FAILED', 'REFUNDED'))
  )
);

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ride_id UUID REFERENCES rides(id) ON DELETE CASCADE,
  
  -- Notification details
  type notification_type NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  
  -- Status
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  
  -- Additional data (JSONB for flexibility)
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_driver_available ON users(role, is_available) WHERE role = 'DRIVER';
CREATE INDEX idx_users_location ON users USING GIST (
  ll_to_earth(current_latitude, current_longitude)
) WHERE current_latitude IS NOT NULL AND current_longitude IS NOT NULL;

-- Schools indexes
CREATE INDEX idx_schools_location ON schools USING GIST (
  ll_to_earth(latitude, longitude)
);
CREATE INDEX idx_schools_city ON schools(city);
CREATE INDEX idx_schools_active ON schools(is_active) WHERE is_active = true;

-- Kids indexes
CREATE INDEX idx_kids_parent ON kids(parent_id);
CREATE INDEX idx_kids_school ON kids(school_id);
CREATE INDEX idx_kids_active ON kids(is_active) WHERE is_active = true;
CREATE INDEX idx_kids_pickup_location ON kids USING GIST (
  ll_to_earth(pickup_latitude, pickup_longitude)
);

-- Routes indexes
CREATE INDEX idx_routes_school ON routes(school_id);
CREATE INDEX idx_routes_driver ON routes(driver_id);
CREATE INDEX idx_routes_active ON routes(is_active) WHERE is_active = true;

-- Rides indexes
CREATE INDEX idx_rides_kid ON rides(kid_id);
CREATE INDEX idx_rides_driver ON rides(driver_id);
CREATE INDEX idx_rides_route ON rides(route_id);
CREATE INDEX idx_rides_status ON rides(status);
CREATE INDEX idx_rides_scheduled_time ON rides(scheduled_pickup_time);
CREATE INDEX idx_rides_pickup_location ON rides USING GIST (
  ll_to_earth(pickup_latitude, pickup_longitude)
);
CREATE INDEX idx_rides_dropoff_location ON rides USING GIST (
  ll_to_earth(dropoff_latitude, dropoff_longitude)
);
CREATE INDEX idx_rides_active ON rides(status) WHERE status NOT IN ('COMPLETED', 'CANCELLED');
CREATE INDEX idx_rides_driver_status ON rides(driver_id, status) WHERE driver_id IS NOT NULL;

-- Route points indexes
CREATE INDEX idx_route_points_ride ON route_points(ride_id);
CREATE INDEX idx_route_points_time ON route_points(ride_id, recorded_at DESC);
CREATE INDEX idx_route_points_location ON route_points USING GIST (
  ll_to_earth(latitude, longitude)
);

-- Payments indexes
CREATE INDEX idx_payments_ride ON payments(ride_id);
CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_transaction ON payments(transaction_id) WHERE transaction_id IS NOT NULL;
CREATE INDEX idx_payments_created ON payments(created_at DESC);

-- Notifications indexes
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_ride ON notifications(ride_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_unread ON notifications(user_id, created_at DESC) WHERE is_read = false;

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_schools_updated_at BEFORE UPDATE ON schools
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kids_updated_at BEFORE UPDATE ON kids
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_routes_updated_at BEFORE UPDATE ON routes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rides_updated_at BEFORE UPDATE ON rides
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate age from date of birth
CREATE OR REPLACE FUNCTION calculate_age(birth_date DATE)
RETURNS INTEGER AS $$
BEGIN
  RETURN EXTRACT(YEAR FROM AGE(birth_date));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to get distance between two points (Haversine formula)
CREATE OR REPLACE FUNCTION calculate_distance(
  lat1 DECIMAL,
  lon1 DECIMAL,
  lat2 DECIMAL,
  lon2 DECIMAL
)
RETURNS DECIMAL AS $$
DECLARE
  earth_radius_km DECIMAL := 6371;
  dlat DECIMAL;
  dlon DECIMAL;
  a DECIMAL;
  c DECIMAL;
BEGIN
  dlat := radians(lat2 - lat1);
  dlon := radians(lon2 - lon1);
  
  a := sin(dlat / 2) * sin(dlat / 2) +
       cos(radians(lat1)) * cos(radians(lat2)) *
       sin(dlon / 2) * sin(dlon / 2);
  
  c := 2 * atan2(sqrt(a), sqrt(1 - a));
  
  RETURN earth_radius_km * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- VIEWS
-- ============================================================================

-- View for active rides with details
CREATE OR REPLACE VIEW active_rides_view AS
SELECT 
  r.id,
  r.status,
  r.ride_type,
  r.scheduled_pickup_time,
  k.first_name || ' ' || k.last_name AS kid_name,
  u.first_name || ' ' || u.last_name AS driver_name,
  s.name AS school_name,
  r.pickup_address,
  r.dropoff_address,
  r.total_fare
FROM rides r
JOIN kids k ON r.kid_id = k.id
LEFT JOIN users u ON r.driver_id = u.id
JOIN schools s ON k.school_id = s.id
WHERE r.status NOT IN ('COMPLETED', 'CANCELLED');

-- View for driver statistics
CREATE OR REPLACE VIEW driver_stats_view AS
SELECT 
  u.id AS driver_id,
  u.first_name || ' ' || u.last_name AS driver_name,
  COUNT(DISTINCT r.id) FILTER (WHERE r.status = 'COMPLETED') AS total_rides,
  COUNT(DISTINCT r.id) FILTER (WHERE r.status IN ('IN_PROGRESS', 'PICKED_UP')) AS active_rides,
  COALESCE(SUM(p.amount) FILTER (WHERE p.status = 'COMPLETED'), 0) AS total_earnings,
  AVG(r.duration_minutes) FILTER (WHERE r.status = 'COMPLETED') AS avg_ride_duration
FROM users u
LEFT JOIN rides r ON u.id = r.driver_id
LEFT JOIN payments p ON r.id = p.ride_id
WHERE u.role = 'DRIVER'
GROUP BY u.id, u.first_name, u.last_name;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE users IS 'Stores all users: parents, drivers, and admins';
COMMENT ON TABLE schools IS 'School information and locations';
COMMENT ON TABLE kids IS 'Children registered in the system';
COMMENT ON TABLE routes IS 'Predefined or optimized routes for school transportation';
COMMENT ON TABLE rides IS 'Individual ride bookings and their status';
COMMENT ON TABLE route_points IS 'Real-time GPS tracking points during active rides';
COMMENT ON TABLE payments IS 'Payment transactions for rides';
COMMENT ON TABLE notifications IS 'Push and in-app notifications for users';

COMMENT ON COLUMN users.role IS 'User role: PARENT, DRIVER, or ADMIN';
COMMENT ON COLUMN rides.status IS 'Current status of the ride';
COMMENT ON COLUMN rides.ride_type IS 'TO_SCHOOL or FROM_SCHOOL';
COMMENT ON COLUMN route_points.recorded_at IS 'Timestamp when location was recorded';
COMMENT ON COLUMN payments.transaction_id IS 'External payment provider transaction ID';

-- ============================================================================
-- INITIAL DATA (Optional - for testing)
-- ============================================================================

-- You can add initial admin user or test data here if needed
-- Example:
-- INSERT INTO users (email, phone, password_hash, first_name, last_name, role, is_verified)
-- VALUES ('admin@zuanga.com', '+1234567890', '$2b$10$...', 'Admin', 'User', 'ADMIN', true);

