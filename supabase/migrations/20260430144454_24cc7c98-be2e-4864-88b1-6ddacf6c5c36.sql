-- Add explicit service-role-only SELECT policy on unit_calendars.
-- The table currently has an ALL policy for service_role but the lov
-- scanner flags the absence of a dedicated SELECT policy. This makes
-- access intent explicit without changing any product behavior — no
-- client code reads from this table.
CREATE POLICY "Service role can view unit calendars"
ON public.unit_calendars
FOR SELECT
USING (auth.role() = 'service_role'::text);