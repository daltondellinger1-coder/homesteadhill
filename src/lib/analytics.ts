import { supabase } from "@/integrations/supabase/client";

/**
 * Privacy-preserving booking funnel tracking.
 *
 * - Session ID is a random UUID stored in sessionStorage only (per-tab,
 *   cleared when the tab closes). It is never derived from PII.
 * - Events carry NO name, email, phone, message text, IP, or payment data.
 *   The backend additionally rejects unknown event types and metadata keys
 *   outside the allowlist: nights, guests, rate_type, source.
 */

export type FunnelEventType =
  | "booking_request_started"
  | "unit_selected"
  | "checkin_date_selected"
  | "checkout_date_selected"
  | "guest_count_selected"
  | "booking_request_submit_attempted"
  | "booking_request_submitted"
  | "booking_request_submit_failed";

interface FunnelMetadata {
  nights?: number;
  guests?: number;
  rate_type?: string;
  source?: string;
}

const SESSION_KEY = "hh_funnel_session";

function getAnonymousSessionId(): string {
  try {
    const existing = window.sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const id = crypto.randomUUID();
    window.sessionStorage.setItem(SESSION_KEY, id);
    return id;
  } catch {
    // sessionStorage unavailable (private mode etc.) — fall back to an
    // ephemeral ID so tracking still works without persisting anything.
    return crypto.randomUUID();
  }
}

export function trackFunnelEvent(
  eventType: FunnelEventType,
  options: { unitId?: string; metadata?: FunnelMetadata } = {}
): void {
  // Fire-and-forget: never block or alter the guest flow on tracking.
  void (async () => {
    try {
      await supabase.from("analytics_events").insert([
        {
          event_type: eventType,
          anonymous_session_id: getAnonymousSessionId(),
          page_path: window.location.pathname,
          unit_id: options.unitId ?? null,
          metadata: { ...(options.metadata ?? {}) },
        },
      ]);
    } catch {
      // Swallow tracking errors silently — analytics must never affect UX.
    }
  })();
}