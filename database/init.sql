-- Zuanga Database Initialization Script
-- Run this before schema.sql to set up required extensions

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pg_trgm for text search (useful for name/address searches)
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Enable cube extension for earthdistance calculations
-- This is needed for the GIST indexes on location columns
CREATE EXTENSION IF NOT EXISTS "cube";

-- Enable earthdistance extension for distance calculations
CREATE EXTENSION IF NOT EXISTS "earthdistance";

-- Optional: Enable PostGIS for advanced geospatial features
-- Uncomment if you want to use PostGIS instead of earthdistance
-- CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create database if it doesn't exist (run as superuser)
-- CREATE DATABASE zuanga_db;

-- Grant permissions (adjust as needed)
-- GRANT ALL PRIVILEGES ON DATABASE zuanga_db TO zuanga_user;

