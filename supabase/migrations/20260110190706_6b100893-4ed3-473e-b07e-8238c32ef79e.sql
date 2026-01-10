-- Remove the public SELECT policy from unit_calendars
-- The ical_url contains private authentication tokens that should not be exposed
DROP POLICY IF EXISTS "Anyone can view unit calendars" ON public.unit_calendars;

-- Only the service role (used by edge functions) should be able to read/manage unit_calendars
-- The existing "Service role can manage unit calendars" policy already handles this