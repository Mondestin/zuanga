-- Add subscription types enum
DO $$ BEGIN
    CREATE TYPE subscription_type AS ENUM ('WEEKLY', 'MONTHLY');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add subscription status enum
DO $$ BEGIN
    CREATE TYPE subscription_status AS ENUM ('ACTIVE', 'PAUSED', 'CANCELLED', 'EXPIRED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kid_id UUID NOT NULL REFERENCES kids(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE RESTRICT,
  
  -- Subscription details
  subscription_type subscription_type NOT NULL,
  status subscription_status NOT NULL DEFAULT 'ACTIVE',
  
  -- Schedule
  start_date DATE NOT NULL,
  end_date DATE,
  days_of_week INTEGER[] NOT NULL, -- Array of day numbers (0=Sunday, 1=Monday, ..., 6=Saturday)
  pickup_time TIME NOT NULL,
  dropoff_time TIME,
  
  -- Locations
  pickup_address TEXT NOT NULL,
  pickup_latitude DECIMAL(10, 8) NOT NULL,
  pickup_longitude DECIMAL(11, 8) NOT NULL,
  dropoff_address TEXT NOT NULL,
  dropoff_latitude DECIMAL(10, 8) NOT NULL,
  dropoff_longitude DECIMAL(11, 8) NOT NULL,
  
  -- Pricing
  base_fare DECIMAL(10, 2) NOT NULL,
  distance_fare DECIMAL(10, 2),
  total_fare_per_ride DECIMAL(10, 2) NOT NULL,
  subscription_total DECIMAL(10, 2), -- Total for subscription period
  
  -- Notes
  parent_notes TEXT,
  
  -- Metadata
  auto_generate_rides BOOLEAN DEFAULT true, -- Automatically generate rides from subscription
  last_ride_generated_date DATE, -- Track last date rides were generated
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  paused_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE
);

-- Add subscription_id to rides table
ALTER TABLE rides 
ADD COLUMN IF NOT EXISTS subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL;

-- Indexes for subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_parent ON subscriptions(parent_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_kid ON subscriptions(kid_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_dates ON subscriptions(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_rides_subscription ON rides(subscription_id);

-- Add comments
COMMENT ON TABLE subscriptions IS 'Weekly and monthly ride subscriptions for parents';
COMMENT ON COLUMN subscriptions.days_of_week IS 'Array of day numbers: 0=Sunday, 1=Monday, ..., 6=Saturday';
COMMENT ON COLUMN subscriptions.auto_generate_rides IS 'If true, system automatically generates rides based on schedule';
COMMENT ON COLUMN subscriptions.last_ride_generated_date IS 'Last date for which rides were automatically generated';
COMMENT ON COLUMN rides.subscription_id IS 'Reference to subscription if ride was generated from subscription';

