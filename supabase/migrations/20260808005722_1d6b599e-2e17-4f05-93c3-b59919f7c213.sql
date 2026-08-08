CREATE TABLE public.analytics_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  occurred_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  anonymous_session_id UUID NOT NULL,
  page_path TEXT NOT NULL,
  unit_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT INSERT ON public.analytics_events TO anon, authenticated;
GRANT ALL ON public.analytics_events TO service_role;

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Visitors can insert their own funnel events"
ON public.analytics_events
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- No SELECT/UPDATE/DELETE policies: events are write-only for the public.

CREATE OR REPLACE FUNCTION public.validate_analytics_event()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.event_type NOT IN (
    'booking_request_started',
    'unit_selected',
    'checkin_date_selected',
    'checkout_date_selected',
    'guest_count_selected',
    'booking_request_submit_attempted',
    'booking_request_submitted',
    'booking_request_submit_failed'
  ) THEN
    RAISE EXCEPTION 'invalid event_type';
  END IF;

  IF char_length(NEW.page_path) > 200 THEN
    RAISE EXCEPTION 'page_path too long';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM jsonb_object_keys(COALESCE(NEW.metadata, '{}'::jsonb)) AS k
    WHERE k NOT IN ('nights', 'guests', 'rate_type', 'source')
  ) THEN
    RAISE EXCEPTION 'metadata key not allowed';
  END IF;

  IF char_length(COALESCE(NEW.metadata, '{}'::jsonb)::text) > 500 THEN
    RAISE EXCEPTION 'metadata too large';
  END IF;

  NEW.occurred_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_analytics_event
BEFORE INSERT ON public.analytics_events
FOR EACH ROW
EXECUTE FUNCTION public.validate_analytics_event();

CREATE OR REPLACE FUNCTION public.get_booking_funnel_stats(
  p_start DATE DEFAULT NULL,
  p_end DATE DEFAULT NULL
)
RETURNS TABLE(event_date DATE, event_type TEXT, event_count BIGINT)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  RETURN QUERY
    SELECT
      ae.occurred_at::date AS event_date,
      ae.event_type,
      count(*)::bigint AS event_count
    FROM public.analytics_events ae
    WHERE ae.occurred_at::date BETWEEN COALESCE(p_start, CURRENT_DATE - 28)
                                  AND COALESCE(p_end, CURRENT_DATE)
    GROUP BY 1, 2
    ORDER BY 1, 2;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_booking_funnel_stats(DATE, DATE) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_booking_funnel_stats(DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_booking_funnel_stats(DATE, DATE) TO service_role;