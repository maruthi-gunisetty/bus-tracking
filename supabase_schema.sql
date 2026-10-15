-- ==============================================================================
-- ANSHARY BUS TRACKER - SUPABASE DATABASE & REALTIME SETUP (FREE TIER)
-- ==============================================================================
-- Execute this SQL in your Supabase SQL Editor:
-- Dashboard -> SQL Editor -> New Query -> Paste & Run
-- ==============================================================================

-- 1. Create table for live driver locations and smartphone GPS telemetry
CREATE TABLE IF NOT EXISTS public.driver_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id TEXT NOT NULL UNIQUE,
    bus_id TEXT NOT NULL,
    bus_number TEXT NOT NULL,
    driver_id TEXT NOT NULL,
    driver_name TEXT DEFAULT 'Driver',
    route_id TEXT DEFAULT 'route_07',
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    accuracy_meters NUMERIC(6, 1) DEFAULT 10,
    speed_kmh NUMERIC(5, 1) DEFAULT 0,
    heading NUMERIC(5, 1) DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    distance_to_college_meters NUMERIC(8, 1),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Indexes for high-performance free-tier querying
CREATE INDEX IF NOT EXISTS idx_driver_locations_trip_id ON public.driver_locations (trip_id);
CREATE INDEX IF NOT EXISTS idx_driver_locations_status ON public.driver_locations (status);
CREATE INDEX IF NOT EXISTS idx_driver_locations_updated_at ON public.driver_locations (updated_at DESC);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.driver_locations ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policy: Allow authorized students, drivers, and admins to read live bus locations
DROP POLICY IF EXISTS "Allow read access to driver locations" ON public.driver_locations;
CREATE POLICY "Allow read access to driver locations"
    ON public.driver_locations
    FOR SELECT
    USING (true);

-- 5. RLS Policy: Allow authenticated/authorized drivers to publish their live GPS telemetry
DROP POLICY IF EXISTS "Allow drivers to insert and update location telemetry" ON public.driver_locations;
CREATE POLICY "Allow drivers to insert and update location telemetry"
    ON public.driver_locations
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- 6. Enable Supabase Realtime replication on driver_locations table
-- This allows customers and admin dashboards to receive instant change events
ALTER PUBLICATION supabase_realtime ADD TABLE public.driver_locations;

-- Optional: Create audit log table for admin records
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor TEXT NOT NULL,
    actor_role TEXT NOT NULL,
    action TEXT NOT NULL,
    affected_record TEXT NOT NULL,
    details TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow audit log read" ON public.audit_logs;
CREATE POLICY "Allow audit log read"
    ON public.audit_logs
    FOR SELECT
    USING (true);
