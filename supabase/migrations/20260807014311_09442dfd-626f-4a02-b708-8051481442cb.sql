CREATE OR REPLACE FUNCTION public.get_calendar_freshness(p_unit_id text)
RETURNS TABLE(unit_id text, configured boolean, last_synced_at timestamptz, is_fresh boolean)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT
    p_unit_id AS unit_id,
    COALESCE(uc.ical_url, '') <> '' AS configured,
    uc.last_synced_at,
    (uc.ical_url IS NOT NULL
      AND COALESCE(uc.ical_url, '') <> ''
      AND uc.last_synced_at IS NOT NULL
      AND uc.last_synced_at > now() - interval '12 hours') AS is_fresh
  FROM (SELECT 1) AS one
  LEFT JOIN public.unit_calendars uc ON uc.unit_id = p_unit_id;
$$;

REVOKE ALL ON FUNCTION public.get_calendar_freshness(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_calendar_freshness(text) TO anon, authenticated;