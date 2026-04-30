import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Homestead Host Hub project (separate Supabase project)
const HOST_HUB_URL = "https://fiunauckxdnaqvlircob.supabase.co";
const HOST_HUB_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpdW5hdWNreGRuYXF2bGlyY29iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0MjcwMjUsImV4cCI6MjA4NjAwMzAyNX0.Ro1WWf4RPIJJZkQw0HBhK8DaAWgApZJ35Ci4Izp1J6Q";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// ---- Unit catalog (kept in sync with src/data/units.ts) ----
interface UnitInfo {
  id: string;
  name: string;
  type: "apartment" | "cottage";
  bedrooms: number;
  group: "1br" | "2br" | "cottage";
}

const UNITS: UnitInfo[] = [
  { id: "unit-1", name: "Unit 1", type: "apartment", bedrooms: 1, group: "1br" },
  { id: "unit-2", name: "Unit 2", type: "apartment", bedrooms: 1, group: "1br" },
  { id: "unit-3", name: "Unit 3", type: "apartment", bedrooms: 1, group: "1br" },
  { id: "unit-4", name: "Unit 4", type: "apartment", bedrooms: 1, group: "1br" },
  { id: "unit-5", name: "Unit 5", type: "apartment", bedrooms: 2, group: "2br" },
  { id: "unit-6", name: "Unit 6", type: "apartment", bedrooms: 2, group: "2br" },
  { id: "unit-11", name: "Unit 11 - Cottage", type: "cottage", bedrooms: 1, group: "cottage" },
  { id: "unit-13", name: "Unit 13 - Premium Cottage", type: "cottage", bedrooms: 1, group: "cottage" },
];

function getUnit(id: string): UnitInfo | undefined {
  return UNITS.find((u) => u.id === id);
}

function getSiblings(unitId: string): UnitInfo[] {
  const unit = getUnit(unitId);
  if (!unit) return [];
  return UNITS.filter((u) => u.group === unit.group && u.id !== unitId);
}

// ---- Date helpers ----
function isIsoDate(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}

function rangesOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string,
): boolean {
  // exclusive end (checkout day frees the unit)
  return startA < endB && startB < endA;
}

// ---- Availability check against this project's calendar_events ----
async function isUnitAvailable(
  unitId: string,
  start: string,
  end: string,
): Promise<boolean> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const { data, error } = await supabase
    .from("calendar_events")
    .select("start_date,end_date")
    .eq("unit_id", unitId);
  if (error) {
    console.error("calendar_events query failed:", error);
    // Fail closed (treat as unavailable so admin still gets pinged)
    return false;
  }
  for (const evt of data ?? []) {
    if (rangesOverlap(start, end, evt.start_date, evt.end_date)) return false;
  }
  return true;
}

// ---- Host Hub guest lookup ----
// We try to find a confirmed booking matching email + check-in date in the
// Host Hub `bookings` table. We fall back to `booking_requests` if needed.
async function lookupHostHubBooking(params: {
  email: string;
  checkIn: string; // YYYY-MM-DD
  unitId: string;
}): Promise<{ found: boolean; checkOut?: string; guestName?: string }> {
  const headers = {
    apikey: HOST_HUB_ANON_KEY,
    Authorization: `Bearer ${HOST_HUB_ANON_KEY}`,
  };

  // Try `bookings` table first
  try {
    const url = `${HOST_HUB_URL}/rest/v1/bookings?select=guest_name,guest_email,check_in,check_out,unit_id&guest_email=eq.${encodeURIComponent(
      params.email.toLowerCase(),
    )}&check_in=eq.${params.checkIn}`;
    const res = await fetch(url, { headers });
    if (res.ok) {
      const rows = (await res.json()) as Array<{
        guest_name?: string;
        check_in: string;
        check_out: string;
      }>;
      if (rows.length > 0) {
        return {
          found: true,
          checkOut: rows[0].check_out,
          guestName: rows[0].guest_name,
        };
      }
    } else {
      console.log("bookings lookup non-ok:", res.status);
    }
  } catch (e) {
    console.log("bookings lookup error:", e);
  }

  // Fallback: booking_requests
  try {
    const url = `${HOST_HUB_URL}/rest/v1/booking_requests?select=name,email,check_in,check_out&email=eq.${encodeURIComponent(
      params.email.toLowerCase(),
    )}&check_in=eq.${params.checkIn}`;
    const res = await fetch(url, { headers });
    if (res.ok) {
      const rows = (await res.json()) as Array<{
        name?: string;
        check_in: string;
        check_out: string;
      }>;
      if (rows.length > 0) {
        return {
          found: true,
          checkOut: rows[0].check_out,
          guestName: rows[0].name,
        };
      }
    }
  } catch (e) {
    console.log("booking_requests lookup error:", e);
  }

  return { found: false };
}

// ---- Mirror extension request to Host Hub ----
async function createHostHubExtensionRequest(payload: {
  guestName: string;
  email: string;
  phone?: string;
  currentUnit: UnitInfo;
  currentCheckIn: string;
  currentCheckOut: string;
  newCheckOut: string;
  scenario: string;
  chosenUnitId: string;
  alternatives: string[];
}) {
  const body = {
    name: payload.guestName,
    email: payload.email,
    phone: payload.phone || null,
    check_in: payload.currentCheckOut, // extension starts at current checkout
    check_out: payload.newCheckOut,
    num_guests: 1,
    preferred_unit_type: payload.currentUnit.group,
    source: "extension",
    notes: [
      `EXTENSION REQUEST`,
      `Currently in: ${payload.currentUnit.name}`,
      `Current stay: ${payload.currentCheckIn} → ${payload.currentCheckOut}`,
      `Requested new checkout: ${payload.newCheckOut}`,
      `Scenario: ${payload.scenario}`,
      `Guest's choice: ${payload.chosenUnitId === payload.currentUnit.id
        ? `Stay in ${payload.currentUnit.name}`
        : `Switch to ${getUnit(payload.chosenUnitId)?.name ?? payload.chosenUnitId}`}`,
      payload.alternatives.length
        ? `Available alternatives offered: ${payload.alternatives.join(", ")}`
        : `No alternatives available`,
    ].join("\n"),
  };

  console.log("Mirroring extension to Host Hub:", body);

  const res = await fetch(`${HOST_HUB_URL}/rest/v1/booking_requests`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: HOST_HUB_ANON_KEY,
      Authorization: `Bearer ${HOST_HUB_ANON_KEY}`,
      Prefer: "return=representation",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Host Hub extension insert failed:", res.status, err);
    return { ok: false, error: err };
  }
  const data = await res.json();
  console.log("Host Hub extension inserted:", data?.[0]?.id);
  return { ok: true, data };
}

// ---- Email templates ----
const colors = {
  navyDeep: "#0C1D37",
  navyMedium: "#152844",
  gold: "#C4935A",
  goldLight: "#D4A870",
  cream: "#F7F5F2",
  white: "#FFFFFF",
  textMuted: "#8B9BB4",
};

function guestEmailHtml(p: {
  guestName: string;
  currentUnit: string;
  currentCheckOut: string;
  newCheckOut: string;
  scenario: string;
  chosenUnit: string;
}) {
  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:${colors.cream};font-family:'DM Sans',Arial,sans-serif;">
  <table width="100%" cellspacing="0" cellpadding="0" style="background:${colors.cream}"><tr><td style="padding:40px 20px">
    <table width="600" cellspacing="0" cellpadding="0" style="margin:0 auto;max-width:600px">
      <tr><td style="background:linear-gradient(180deg,${colors.navyDeep},${colors.navyMedium});padding:40px;border-radius:16px 16px 0 0;text-align:center">
        <h1 style="margin:0 0 8px;font-size:28px;font-weight:700;color:${colors.gold}">Homestead Hill</h1>
        <p style="margin:0;font-size:13px;color:${colors.textMuted};letter-spacing:2px;text-transform:uppercase">Extension Request Received</p>
      </td></tr>
      <tr><td style="background:${colors.white};padding:40px">
        <h2 style="margin:0 0 16px;font-size:22px;color:${colors.navyDeep}">Thanks, ${p.guestName}!</h2>
        <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#4A5568">
          We received your request to extend your stay. Our team will review availability and reach out shortly to confirm next steps and pricing.
        </p>
        <table width="100%" cellspacing="0" cellpadding="0" style="background:${colors.cream};border-radius:12px"><tr><td style="padding:24px">
          <h3 style="margin:0 0 16px;font-size:13px;font-weight:600;color:${colors.gold};text-transform:uppercase;letter-spacing:1px">Your Request</h3>
          <p style="margin:8px 0;color:#4A5568;font-size:14px"><strong style="color:${colors.navyDeep}">Currently staying in:</strong> ${p.currentUnit}</p>
          <p style="margin:8px 0;color:#4A5568;font-size:14px"><strong style="color:${colors.navyDeep}">Original checkout:</strong> ${p.currentCheckOut}</p>
          <p style="margin:8px 0;color:#4A5568;font-size:14px"><strong style="color:${colors.navyDeep}">Requested new checkout:</strong> ${p.newCheckOut}</p>
          <p style="margin:8px 0;color:#4A5568;font-size:14px"><strong style="color:${colors.navyDeep}">Your preference:</strong> ${p.chosenUnit}</p>
        </td></tr></table>
        <p style="margin:24px 0 0;font-size:14px;color:#4A5568;line-height:1.6">Questions in the meantime? Reach us at <a href="mailto:booking@homestead-hill.com" style="color:${colors.gold};text-decoration:none">booking@homestead-hill.com</a> or (812) 768-3108.</p>
      </td></tr>
      <tr><td style="background:${colors.navyDeep};padding:20px;border-radius:0 0 16px 16px;text-align:center">
        <p style="margin:0;font-size:12px;color:${colors.textMuted}">Homestead Hill · Vincennes, Indiana</p>
      </td></tr>
    </table>
  </td></tr></table></body></html>`;
}

function adminEmailHtml(p: {
  guestName: string;
  email: string;
  phone?: string;
  currentUnit: string;
  currentCheckIn: string;
  currentCheckOut: string;
  newCheckOut: string;
  scenario: string;
  chosenUnit: string;
  alternatives: string[];
}) {
  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:${colors.cream};font-family:'DM Sans',Arial,sans-serif">
  <table width="100%" cellspacing="0" cellpadding="0"><tr><td style="padding:40px 20px">
    <table width="600" cellspacing="0" cellpadding="0" style="margin:0 auto;max-width:600px">
      <tr><td style="background:${colors.navyDeep};padding:30px;border-radius:16px 16px 0 0">
        <h1 style="margin:0;font-size:22px;color:${colors.gold}">Extension Request</h1>
        <p style="margin:6px 0 0;font-size:13px;color:${colors.textMuted}">Scenario: ${p.scenario}</p>
      </td></tr>
      <tr><td style="background:${colors.white};padding:32px">
        <h2 style="margin:0 0 16px;font-size:18px;color:${colors.navyDeep}">Guest</h2>
        <p style="margin:4px 0;font-size:14px;color:#4A5568"><strong>${p.guestName}</strong></p>
        <p style="margin:4px 0;font-size:14px;color:#4A5568">${p.email}${p.phone ? " · " + p.phone : ""}</p>

        <h2 style="margin:24px 0 12px;font-size:18px;color:${colors.navyDeep}">Current stay</h2>
        <p style="margin:4px 0;font-size:14px;color:#4A5568">${p.currentUnit}</p>
        <p style="margin:4px 0;font-size:14px;color:#4A5568">${p.currentCheckIn} → ${p.currentCheckOut}</p>

        <h2 style="margin:24px 0 12px;font-size:18px;color:${colors.navyDeep}">Requested extension</h2>
        <p style="margin:4px 0;font-size:14px;color:#4A5568">New checkout: <strong>${p.newCheckOut}</strong></p>
        <p style="margin:4px 0;font-size:14px;color:#4A5568">Guest preference: <strong>${p.chosenUnit}</strong></p>
        <p style="margin:4px 0;font-size:14px;color:#4A5568">Alternatives offered: ${p.alternatives.length ? p.alternatives.join(", ") : "none available"}</p>

        <p style="margin:24px 0 0;font-size:13px;color:${colors.textMuted}">This request has also been mirrored into Host Hub.</p>
      </td></tr>
    </table>
  </td></tr></table></body></html>`;
}

// ---- Handler ----
const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const action = body?.action;

    if (action === "lookup") {
      const { email, checkIn, unitId } = body;
      if (!email || !checkIn || !unitId || !isIsoDate(checkIn)) {
        return json({ error: "Missing or invalid fields" }, 400);
      }
      const unit = getUnit(unitId);
      if (!unit) return json({ error: "Unknown unit" }, 400);

      const result = await lookupHostHubBooking({
        email: String(email).trim(),
        checkIn,
        unitId,
      });

      if (!result.found) {
        return json({
          found: false,
          message:
            "We couldn't find a booking matching that email and check-in date. Double-check what's in your confirmation email, or contact us at booking@homestead-hill.com.",
        });
      }

      return json({
        found: true,
        guestName: result.guestName ?? "Guest",
        currentCheckOut: result.checkOut,
        unit: { id: unit.id, name: unit.name, group: unit.group },
      });
    }

    if (action === "submit") {
      const {
        email,
        phone,
        guestName,
        unitId,
        currentCheckIn,
        currentCheckOut,
        newCheckOut,
        chosenUnitId,
      } = body;

      if (
        !email ||
        !guestName ||
        !unitId ||
        !currentCheckIn ||
        !currentCheckOut ||
        !newCheckOut ||
        !chosenUnitId ||
        !isIsoDate(currentCheckIn) ||
        !isIsoDate(currentCheckOut) ||
        !isIsoDate(newCheckOut)
      ) {
        return json({ error: "Missing or invalid fields" }, 400);
      }
      if (newCheckOut <= currentCheckOut) {
        return json({ error: "New checkout must be after current checkout" }, 400);
      }
      const currentUnit = getUnit(unitId);
      const chosenUnit = getUnit(chosenUnitId);
      if (!currentUnit || !chosenUnit) {
        return json({ error: "Unknown unit" }, 400);
      }

      // Determine scenario fresh server-side
      const sameAvail = await isUnitAvailable(
        currentUnit.id,
        currentCheckOut,
        newCheckOut,
      );
      const siblings = getSiblings(currentUnit.id);
      const availableSiblings: string[] = [];
      for (const s of siblings) {
        if (await isUnitAvailable(s.id, currentCheckOut, newCheckOut)) {
          availableSiblings.push(s.name);
        }
      }

      let scenario = "Same unit available";
      if (!sameAvail && availableSiblings.length > 0) {
        scenario =
          chosenUnitId === currentUnit.id
            ? "Same unit booked — guest requests shuffle"
            : "Same unit booked — guest will switch units";
      } else if (!sameAvail && availableSiblings.length === 0) {
        scenario = "No units available — wishlist request";
      }

      // Mirror to Host Hub (best-effort)
      let mirrorResult: { ok: boolean; error?: string } = { ok: false };
      try {
        mirrorResult = await createHostHubExtensionRequest({
          guestName,
          email,
          phone,
          currentUnit,
          currentCheckIn,
          currentCheckOut,
          newCheckOut,
          scenario,
          chosenUnitId,
          alternatives: availableSiblings,
        });
      } catch (e) {
        console.error("Host Hub mirror threw:", e);
      }

      // Send admin email
      if (RESEND_API_KEY) {
        try {
          const adminRes = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
              from: "Homestead Hill <booking@homestead-hill.com>",
              to: ["booking@homestead-hill.com"],
              subject: `Extension Request — ${currentUnit.name} (${scenario})`,
              html: adminEmailHtml({
                guestName,
                email,
                phone,
                currentUnit: currentUnit.name,
                currentCheckIn,
                currentCheckOut,
                newCheckOut,
                scenario,
                chosenUnit: chosenUnit.name,
                alternatives: availableSiblings,
              }),
            }),
          });
          if (!adminRes.ok) {
            console.error("Admin email failed:", await adminRes.text());
          }
        } catch (e) {
          console.error("Admin email error:", e);
        }

        // Guest confirmation
        try {
          const guestRes = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
              from: "Homestead Hill <booking@homestead-hill.com>",
              to: [email],
              bcc: ["booking@homestead-hill.com"],
              subject: "We received your extension request — Homestead Hill",
              html: guestEmailHtml({
                guestName,
                currentUnit: currentUnit.name,
                currentCheckOut,
                newCheckOut,
                scenario,
                chosenUnit: chosenUnit.name,
              }),
            }),
          });
          if (!guestRes.ok) {
            console.error("Guest email failed:", await guestRes.text());
          }
        } catch (e) {
          console.error("Guest email error:", e);
        }
      } else {
        console.warn("RESEND_API_KEY missing — skipping emails");
      }

      return json({
        success: true,
        scenario,
        mirrored: mirrorResult.ok,
      });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (err: any) {
    console.error("submit-extension-request error:", err);
    return json({ error: err?.message ?? "Internal error" }, 500);
  }
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

serve(handler);