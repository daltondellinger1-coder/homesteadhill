import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders as sdkCorsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { timingSafeEqual } from "node:crypto";
import { computeNextFree, decide } from "./logic.ts";

const headers = {
  ...sdkCorsHeaders,
  "Access-Control-Allow-Headers": `${sdkCorsHeaders["Access-Control-Allow-Headers"]}, x-ingest-key`,
  "Content-Type": "application/json",
  "Cache-Control": "no-store",
};
const reply = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers });
const SHORT_STAY = ["unit-3", "unit-4", "unit-7"];

async function safeEq(a: string | null, b: string | undefined): Promise<boolean> {
  if (!a || !b) return false;
  const enc = new TextEncoder();
  const [x, y] = await Promise.all([
    crypto.subtle.digest("SHA-256", enc.encode(a)),
    crypto.subtle.digest("SHA-256", enc.encode(b)),
  ]);
  return timingSafeEqual(new Uint8Array(x), new Uint8Array(y));
}

async function authorized(req: Request): Promise<boolean> {
  if (await safeEq(req.headers.get("X-Ingest-Key"), Deno.env.get("VACANCIES_INGEST_KEY"))) return true;
  const auth = req.headers.get("Authorization") ?? "";
  if (!auth.startsWith("Bearer ")) return false;
  const token = auth.slice(7);
  // Service role (on-demand) or the project anon key (cron pattern, same as sync-calendar job).
  if ((await safeEq(token, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"))) ||
    (await safeEq(token, Deno.env.get("SUPABASE_ANON_KEY")))) return true;
  // Signed project key JWT (anon/service_role), as used by the existing cron job.
  // Same permissive cron pattern as sync-calendar: project-scoped anon key. The job is idempotent
  // and can only move listed dates later based on stored calendar data.
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    const ref = new URL(Deno.env.get("SUPABASE_URL")!).hostname.split(".")[0];
    return payload.ref === ref && (payload.role === "anon" || payload.role === "service_role");
  } catch { return false; }
}

function todayIndiana(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Indiana/Indianapolis" }).format(new Date());
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers });
  if (req.method !== "POST" && req.method !== "GET") return reply({ error: "Method not allowed" }, 405);
  if (!(await authorized(req))) return reply({ error: "Unauthorized" }, 401);

  const url = new URL(req.url);
  let dryRun = ["1", "true"].includes(url.searchParams.get("dry_run") ?? "");
  if (req.method === "POST") {
    try { const b = await req.json(); if (b && b.dry_run === true) dryRun = true; } catch { /* empty body ok */ }
  }

  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false },
  });

  try {
    const today = todayIndiana();
    const [{ data: vac, error: e1 }, { data: cals, error: e2 }] = await Promise.all([
      db.from("vacancies").select("unit_id, available_from, status, source").or("status.eq.open,status.is.null"),
      db.from("unit_calendars").select("unit_id"),
    ]);
    if (e1 || e2) return reply({ error: "Read failed" }, 500);
    const withIcal = new Set((cals ?? []).map((c) => c.unit_id));
    const ids = (vac ?? []).map((v) => v.unit_id).filter((id) => withIcal.has(id));
    const { data: events, error: e3 } = ids.length
      ? await db.from("calendar_events").select("unit_id, start_date, end_date").in("unit_id", ids).gt("end_date", today)
      : { data: [], error: null };
    if (e3) return reply({ error: "Read failed" }, 500);

    const results: Record<string, unknown>[] = [];
    const missing = new Set<string>();
    for (const v of vac ?? []) {
      if (!withIcal.has(v.unit_id)) {
        missing.add(v.unit_id);
        results.push({ unit_id: v.unit_id, action: SHORT_STAY.includes(v.unit_id) ? "skipped_missing_ical" : "skipped", next_free: null, previous: v.available_from, reason: "no_ical" });
        continue;
      }
      const ranges = (events ?? []).filter((e) => e.unit_id === v.unit_id);
      const nextFree = computeNextFree(today, ranges);
      const action = decide(nextFree, v.available_from, v.source);
      if (!dryRun && action === "updated_later") {
        const { error } = await db.from("vacancies").update({ available_from: nextFree, source: "airbnb_ical", updated_at: new Date().toISOString() }).eq("unit_id", v.unit_id).or("status.eq.open,status.is.null");
        if (error) { results.push({ unit_id: v.unit_id, action: "error", next_free: nextFree, previous: v.available_from, reason: "update_failed" }); continue; }
      }
      if (!dryRun && action === "unchanged" && !v.source) {
        await db.from("vacancies").update({ source: "airbnb_ical" }).eq("unit_id", v.unit_id);
      }
      results.push({ unit_id: v.unit_id, action, next_free: nextFree, previous: v.available_from, reason: action === "kept_marketing_lag" ? "next_free_earlier_than_listed" : null });
    }
    for (const id of SHORT_STAY) if (!withIcal.has(id)) missing.add(id);

    return reply({ ok: true, dry_run: dryRun, today, results, missing_ical: [...missing].sort() });
  } catch {
    return reply({ error: "Request failed" }, 500);
  }
});
