-- 1. Helper to check if the current user is on the admin allowlist.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_allowlist
    WHERE lower(email) = lower((auth.jwt() ->> 'email'))
  );
$$;

-- 2. Replace the public SELECT policy on calendar_events with an admin-only one.
DROP POLICY IF EXISTS "Anyone can view calendar events" ON public.calendar_events;

CREATE POLICY "Admins can view calendar events"
ON public.calendar_events
FOR SELECT
TO authenticated
USING (public.is_admin());

-- 3. Public-safe function: returns only date ranges for a unit, no PII / source.
--    SECURITY DEFINER lets it bypass RLS so the public site can call it.
CREATE OR REPLACE FUNCTION public.get_blocked_ranges(p_unit_id text)
RETURNS TABLE (
  unit_id text,
  start_date date,
  end_date date
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    ce.unit_id,
    ce.start_date,
    ce.end_date
  FROM public.calendar_events ce
  WHERE ce.unit_id = p_unit_id
    AND ce.end_date >= CURRENT_DATE;
$$;

-- Anyone (anon + authenticated) may invoke it.
GRANT EXECUTE ON FUNCTION public.get_blocked_ranges(text) TO anon, authenticated;

-- 4. Same idea but for "all units" (used when no unit is specified).
CREATE OR REPLACE FUNCTION public.get_all_blocked_ranges()
RETURNS TABLE (
  unit_id text,
  start_date date,
  end_date date
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    ce.unit_id,
    ce.start_date,
    ce.end_date
  FROM public.calendar_events ce
  WHERE ce.end_date >= CURRENT_DATE;
$$;

GRANT EXECUTE ON FUNCTION public.get_all_blocked_ranges() TO anon, authenticated;