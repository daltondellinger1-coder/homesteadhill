-- Create table to store iCal URLs for each unit
CREATE TABLE public.unit_calendars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id TEXT NOT NULL UNIQUE,
  ical_url TEXT NOT NULL,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table to store blocked/booked dates from iCal
CREATE TABLE public.calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  summary TEXT,
  source TEXT DEFAULT 'airbnb',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.unit_calendars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- Allow public read access to calendar events (so guests can see availability)
CREATE POLICY "Anyone can view calendar events"
ON public.calendar_events
FOR SELECT
USING (true);

-- Only backend functions can insert/update/delete calendar events
CREATE POLICY "Service role can manage calendar events"
ON public.calendar_events
FOR ALL
USING (auth.role() = 'service_role');

-- Unit calendars are admin-only (managed via edge function)
CREATE POLICY "Service role can manage unit calendars"
ON public.unit_calendars
FOR ALL
USING (auth.role() = 'service_role');

-- Allow public read access to unit calendars (to check if sync is configured)
CREATE POLICY "Anyone can view unit calendars"
ON public.unit_calendars
FOR SELECT
USING (true);

-- Create index for faster date lookups
CREATE INDEX idx_calendar_events_dates ON public.calendar_events (unit_id, start_date, end_date);