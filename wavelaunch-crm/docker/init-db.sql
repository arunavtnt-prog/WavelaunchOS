-- PostgreSQL initialization script for WavelaunchOS CRM
-- This runs automatically when the container is first created

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For full-text search

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE wavelaunch_crm TO wavelaunch;

-- Create custom types (if needed in future)
-- Example: CREATE TYPE user_role AS ENUM ('ADMIN', 'CLIENT');

-- Note: Tables will be created by Prisma migrations
-- This file is for database-level setup only
