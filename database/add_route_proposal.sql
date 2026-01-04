-- Add proposed_driver_id and route status to routes table
-- This allows routes to be proposed to drivers before assignment

-- Add proposed_driver_id column
ALTER TABLE routes 
ADD COLUMN IF NOT EXISTS proposed_driver_id UUID REFERENCES users(id) ON DELETE SET NULL;

-- Add route status enum
DO $$ BEGIN
    CREATE TYPE route_status AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add status column
ALTER TABLE routes 
ADD COLUMN IF NOT EXISTS status route_status DEFAULT 'PENDING';

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_routes_proposed_driver ON routes(proposed_driver_id) WHERE proposed_driver_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_routes_status ON routes(status);

-- Add comment
COMMENT ON COLUMN routes.proposed_driver_id IS 'Driver to whom the route is proposed (before acceptance)';
COMMENT ON COLUMN routes.driver_id IS 'Driver assigned to the route (after acceptance)';
COMMENT ON COLUMN routes.status IS 'Route proposal status: PENDING (proposed), ACCEPTED (driver accepted), REJECTED (driver rejected)';

