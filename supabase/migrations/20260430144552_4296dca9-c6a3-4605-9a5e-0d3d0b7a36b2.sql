-- Allowlist of emails permitted to access the admin dashboard.
CREATE TABLE public.admin_allowlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Normalize email for case-insensitive matching.
CREATE OR REPLACE FUNCTION public.normalize_admin_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.email = lower(trim(NEW.email));
  RETURN NEW;
END;
$$;

CREATE TRIGGER admin_allowlist_normalize
BEFORE INSERT OR UPDATE ON public.admin_allowlist
FOR EACH ROW EXECUTE FUNCTION public.normalize_admin_email();

ALTER TABLE public.admin_allowlist ENABLE ROW LEVEL SECURITY;

-- Service role manages the allowlist.
CREATE POLICY "Service role manages admin allowlist"
ON public.admin_allowlist
FOR ALL
USING (auth.role() = 'service_role'::text)
WITH CHECK (auth.role() = 'service_role'::text);

-- Authenticated users can check whether THEIR OWN email is on the list.
-- They cannot see other entries.
CREATE POLICY "Users can see their own allowlist entry"
ON public.admin_allowlist
FOR SELECT
TO authenticated
USING (lower(email) = lower((auth.jwt() ->> 'email')));

-- Seed the initial admin.
INSERT INTO public.admin_allowlist (email) VALUES ('dalton@wefliphouses.com')
ON CONFLICT (email) DO NOTHING;