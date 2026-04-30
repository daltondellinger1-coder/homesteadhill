import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

interface AdminAuthState {
  loading: boolean;
  session: Session | null;
  isAllowed: boolean;
  email: string | null;
}

/**
 * Hook that returns whether the current signed-in user is on the
 * admin allowlist. Listens to auth changes and re-checks on each
 * session change. RLS on `admin_allowlist` ensures users can only
 * see their own row, so a non-empty result means they're allowed.
 */
export function useAdminAuth(): AdminAuthState {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    let active = true;

    async function checkAllowlist(currentSession: Session | null) {
      if (!currentSession?.user?.email) {
        if (active) {
          setIsAllowed(false);
          setLoading(false);
        }
        return;
      }
      const { data, error } = await supabase
        .from("admin_allowlist")
        .select("user_id")
        .limit(1);
      if (!active) return;
      if (error) {
        console.error("Admin allowlist check failed:", error);
        setIsAllowed(false);
      } else {
        setIsAllowed((data?.length ?? 0) > 0);
      }
      setLoading(false);
    }

    // Subscribe FIRST, then read the existing session.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      // Defer the allowlist read so we don't call other supabase APIs
      // synchronously inside the auth callback.
      setTimeout(() => checkAllowlist(newSession), 0);
    });

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      checkAllowlist(data.session);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return {
    loading,
    session,
    isAllowed,
    email: session?.user?.email ?? null,
  };
}