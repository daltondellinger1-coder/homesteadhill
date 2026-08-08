CREATE TABLE public.booking_requests_ops (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  unit_id text NOT NULL,
  submitted_at timestamp with time zone NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'received' CHECK (status IN ('received','responded','qualified','deposit_requested','deposit_paid','booked','lost')),
  first_response_at timestamp with time zone,
  notes text,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, UPDATE ON public.booking_requests_ops TO authenticated;
GRANT ALL ON public.booking_requests_ops TO service_role;

ALTER TABLE public.booking_requests_ops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Operators can view request outcomes"
  ON public.booking_requests_ops
  FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "Operators can update request outcomes"
  ON public.booking_requests_ops
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE OR REPLACE FUNCTION public.booking_requests_ops_before_update()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at := now();
  IF OLD.status = 'received' AND NEW.status <> 'received' AND NEW.first_response_at IS NULL THEN
    NEW.first_response_at := now();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER booking_requests_ops_before_update
  BEFORE UPDATE ON public.booking_requests_ops
  FOR EACH ROW EXECUTE FUNCTION public.booking_requests_ops_before_update();

CREATE OR REPLACE FUNCTION public.get_funnel_unit_stats(p_start date DEFAULT NULL, p_end date DEFAULT NULL)
RETURNS TABLE(unit_id text, event_type text, event_count bigint)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  RETURN QUERY
    SELECT
      ae.unit_id,
      ae.event_type,
      count(*)::bigint AS event_count
    FROM public.analytics_events ae
    WHERE ae.unit_id IS NOT NULL
      AND ae.occurred_at::date BETWEEN COALESCE(p_start, CURRENT_DATE - 28)
                                  AND COALESCE(p_end, CURRENT_DATE)
    GROUP BY 1, 2
    ORDER BY 1, 2;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_funnel_unit_stats(DATE, DATE) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_funnel_unit_stats(DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_funnel_unit_stats(DATE, DATE) TO service_role;