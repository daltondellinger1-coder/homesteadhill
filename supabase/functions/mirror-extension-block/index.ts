import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// Called by Homestead Helper (Host Hub project) when an admin approves an
// extension request. Inserts a calendar block on THIS project's
// calendar_events so the public site / iCal feeds reflect the new
// blocked dates atomically. The Helper relies on a non-2xx response
// to abort the approval, so failures here MUST surface as non-2xx.

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const ALLOWED_UNIT_SLUGS = new Set([
  "unit-1", "unit-2", "unit-3", "unit-4",
  "unit-5", "unit-6", "unit-11", "unit-13",
]);

function isIsoDate(s: unknown): s is string {
  return typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const {
    booking_request_id,
    unit_slug,
    check_in,
    check_out,
    source,
    summary,
  } = body ?? {};

  // Strict validation
  if (
    typeof booking_request_id !== "string" || booking_request_id.length < 6 ||
    typeof unit_slug !== "string" || !ALLOWED_UNIT_SLUGS.has(unit_slug) ||
    !isIsoDate(check_in) || !isIsoDate(check_out) ||
    check_out <= check_in
  ) {
    return json({ error: "Invalid input" }, 400);
  }
  const eventSource = typeof source === "string" && source.length <= 64
    ? source
    : "extension_approved";
  const eventSummary = typeof summary === "string" && summary.length <= 500
    ? summary
    : `Extension approved (${booking_request_id})`;

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data, error } = await supabase
      .from("calendar_events")
      .insert({
        unit_id: unit_slug,
        start_date: check_in,
        end_date: check_out,
        source: eventSource,
        summary: eventSummary,
      })
      .select("id")
      .single();

    if (error) {
      console.error("calendar_events insert failed:", error);
      return json({ error: "Failed to insert calendar block" }, 500);
    }

    return json({ ok: true, calendar_event_id: data.id });
  } catch (e) {
    console.error("mirror-extension-block error:", e);
    return json({ error: "Internal error" }, 500);
  }
});