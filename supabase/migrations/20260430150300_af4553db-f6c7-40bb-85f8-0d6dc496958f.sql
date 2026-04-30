
ALTER TABLE public.admin_allowlist
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

UPDATE public.admin_allowlist a
SET user_id = u.id
FROM auth.users u
WHERE a.user_id IS NULL
  AND lower(u.email) = lower(a.email);

DELETE FROM public.admin_allowlist WHERE user_id IS NULL;

ALTER TABLE public.admin_allowlist
  ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE public.admin_allowlist
  ADD CONSTRAINT admin_allowlist_user_id_unique UNIQUE (user_id);

-- Drop the old email-based policy first so the email column has no deps.
DROP POLICY IF EXISTS "Users can see their own allowlist entry" ON public.admin_allowlist;

-- Drop the email-normalization function (and its trigger via CASCADE).
DROP FUNCTION IF EXISTS public.normalize_admin_email() CASCADE;

ALTER TABLE public.admin_allowlist
  DROP COLUMN IF EXISTS email;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_allowlist
    WHERE user_id = auth.uid()
  );
$$;

REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

CREATE POLICY "Users can see their own allowlist entry"
ON public.admin_allowlist
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view calendar events" ON public.calendar_events;
CREATE POLICY "Admins can view calendar events"
ON public.calendar_events
FOR SELECT
TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can view rental applications" ON public.rental_applications;
CREATE POLICY "Admins can view rental applications"
ON public.rental_applications
FOR SELECT
TO authenticated
USING (public.is_admin());

REVOKE EXECUTE ON FUNCTION public.get_blocked_ranges(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_blocked_ranges(text) TO anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.get_all_blocked_ranges() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_all_blocked_ranges() TO anon, authenticated;
