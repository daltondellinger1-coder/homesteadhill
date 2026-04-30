import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// Public per-unit iCal feed. Each external listing platform subscribes to
// /functions/v1/unit-ical?unit=<slug> and receives a VEVENT for every
// blocked range in calendar_events for that unit. No auth, no PII —
// just opaque busy blocks.

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const ALLOWED_UNIT_SLUGS = new Set([
  "unit-1", "unit-2", "unit-3", "unit-4",
  "unit-5", "unit-6", "unit-11", "unit-13",
]);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

function pad(n: number) { return n < 10 ? `0${n}` : `${n}`; }
function icsDate(iso: string): string {
  // YYYY-MM-DD → YYYYMMDD (DATE value type, all-day)
  return iso.replaceAll("-", "");
}
function icsDateTimeUtc(d: Date): string {
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
}
function escapeIcs(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}
function fold(line: string): string {
  // RFC 5545: lines must not exceed 75 octets; continuation starts with a space.
  if (line.length <= 75) return line;
  const out: string[] = [];
  let i = 0;
  while (i < line.length) {
    const chunk = line.slice(i, i + (i === 0 ? 75 : 74));
    out.push(i === 0 ? chunk : ` ${chunk}`);
    i += i === 0 ? 75 : 74;
  }
  return out.join("\r\n");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "GET") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  const url = new URL(req.url);
  const unit = url.searchParams.get("unit");
  if (!unit || !ALLOWED_UNIT_SLUGS.has(unit)) {
    return new Response("Invalid or missing 'unit' parameter", {
      status: 400, headers: corsHeaders,
    });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data, error } = await supabase
      .from("calendar_events")
      .select("id, start_date, end_date, summary, source")
      .eq("unit_id", unit)
      .order("start_date", { ascending: true });

    if (error) {
      console.error("unit-ical query failed:", error);
      return new Response("Internal error", { status: 500, headers: corsHeaders });
    }

    const now = new Date();
    const dtstamp = icsDateTimeUtc(now);
    const host = url.hostname;

    const lines: string[] = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Homestead Hill//Unit Availability//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      fold(`X-WR-CALNAME:Homestead Hill ${unit}`),
      fold(`X-WR-CALDESC:Blocked dates for ${unit}`),
    ];

    for (const evt of data ?? []) {
      const summary = evt.summary?.trim() || `Reserved (${evt.source ?? "block"})`;
      lines.push(
        "BEGIN:VEVENT",
        fold(`UID:${evt.id}@${host}`),
        `DTSTAMP:${dtstamp}`,
        `DTSTART;VALUE=DATE:${icsDate(evt.start_date)}`,
        `DTEND;VALUE=DATE:${icsDate(evt.end_date)}`,
        fold(`SUMMARY:${escapeIcs(summary)}`),
        "TRANSP:OPAQUE",
        "END:VEVENT",
      );
    }
    lines.push("END:VCALENDAR");

    const body = lines.join("\r\n") + "\r\n";
    return new Response(body, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `inline; filename="${unit}.ics"`,
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch (e) {
    console.error("unit-ical error:", e);
    return new Response("Internal error", { status: 500, headers: corsHeaders });
  }
});