CREATE TABLE public.draw_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  data jsonb NOT NULL,
  source text NOT NULL DEFAULT 'embedded-sheet-snapshot',
  refreshed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.draw_snapshots TO authenticated;
GRANT ALL ON public.draw_snapshots TO service_role;
ALTER TABLE public.draw_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can read draw snapshots" ON public.draw_snapshots FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can insert draw snapshots" ON public.draw_snapshots FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update draw snapshots" ON public.draw_snapshots FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins can delete draw snapshots" ON public.draw_snapshots FOR DELETE TO authenticated USING (public.is_admin());