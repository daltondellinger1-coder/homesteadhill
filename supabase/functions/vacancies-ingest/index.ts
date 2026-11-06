import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders as sdkCorsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { timingSafeEqual } from "node:crypto";
import { parseDelete, parseItems } from "./validation.ts";

const headers = {
  ...sdkCorsHeaders,
  "Access-Control-Allow-Headers": `${sdkCorsHeaders["Access-Control-Allow-Headers"]}, x-ingest-key`,
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Content-Type": "application/json",
  "Cache-Control": "no-store",
};
const reply = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers });

async function authorized(req: Request): Promise<boolean> {
  const provided = req.headers.get("X-Ingest-Key");
  const expected = Deno.env.get("VACANCIES_INGEST_KEY");
  if (!provided || !expected) return false;
  const encoder = new TextEncoder();
  const [left, right] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(provided)),
    crypto.subtle.digest("SHA-256", encoder.encode(expected)),
  ]);
  return timingSafeEqual(new Uint8Array(left), new Uint8Array(right));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers });
  if (!(await authorized(req))) return reply({ error: "Unauthorized" }, 401);
  const url = new URL(req.url);
  if (!["GET", "POST", "DELETE"].includes(req.method)) return reply({ error: "Method not allowed" }, 405);
  const backendUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!backendUrl || !serviceKey) return reply({ error: "Service unavailable" }, 503);
  const db = createClient(backendUrl, serviceKey, { auth: { persistSession: false } });

  try {
    if (req.method === "GET") {
      if (url.search !== "?list=1") return reply({ error: "Expected ?list=1" }, 400);
      const { data, error } = await db.from("vacancies").select("*").order("available_from", { ascending: true });
      return error ? reply({ error: "Read failed" }, 500) : reply({ ok: true, items: data });
    }
    if (req.method === "DELETE") {
      let id: string;
      try { id = parseDelete(url.searchParams.has("unit_id") ? undefined : await req.json(), url.searchParams.get("unit_id")); }
      catch { return reply({ error: "Invalid unit ID" }, 400); }
      const { error } = await db.from("vacancies").delete().eq("unit_id", id);
      return error ? reply({ error: "Delete failed" }, 500) : reply({ ok: true, deleted: id });
    }
    let items: ReturnType<typeof parseItems>;
    try { items = parseItems(await req.json()); }
    catch { return reply({ error: "Invalid vacancy payload" }, 400); }
    if (new Set(items.map((item) => item.unit_id)).size !== items.length) return reply({ error: "Duplicate unit IDs" }, 400);
    const { data: existing, error: readError } = await db.from("vacancies").select("*").in("unit_id", items.map((item) => item.unit_id));
    if (readError) return reply({ error: "Read failed" }, 500);
    const now = new Date().toISOString();
    const rows = items.map((item) => {
      const old = existing?.find((row) => row.unit_id === item.unit_id);
      return { status: "open", has_detail_page: true, ...old, ...item, updated_at: now };
    });
    if (rows.some((row) => !row.available_from || !row.label)) return reply({ error: "New vacancies require available_from and label" }, 400);
    const { data, error } = await db.from("vacancies").upsert(rows, { onConflict: "unit_id" }).select("*");
    return error ? reply({ error: "Upsert failed" }, 500) : reply({ ok: true, upserted: data });
  } catch {
    return reply({ error: "Request failed" }, 500);
  }
});