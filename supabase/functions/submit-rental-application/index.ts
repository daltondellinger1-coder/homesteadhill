import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Homestead Host Hub (guest-management app) is a separate Supabase project.
// We mirror long-stay rental applications into its booking_requests inbox so
// Dalton has a single "to review" list across short + long stays.
// Anon key is already public in send-booking-email for the same purpose; RLS
// on booking_requests allows public insert.
const HOST_HUB_URL =
  Deno.env.get("HOST_HUB_URL") || "https://fiunauckxdnaqvlircob.supabase.co";
const HOST_HUB_ANON_KEY =
  Deno.env.get("HOST_HUB_ANON_KEY") ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpdW5hdWNreGRuYXF2bGlyY29iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0MjcwMjUsImV4cCI6MjA4NjAwMzAyNX0.Ro1WWf4RPIJJZkQw0HBhK8DaAWgApZJ35Ci4Izp1J6Q";

// Map a website slug ("unit-5") to the app's unit_type enum.
// Matches what send-booking-email does, but operates on unit slugs rather
// than user-facing unit names since the rental application stores unit_id.
function mapSlugToUnitType(unitSlug: string): "1br" | "2br" | "cottage" {
  const s = (unitSlug || "").toLowerCase();
  // unit-11 and unit-13 are the cottages today
  if (s === "unit-11" || s === "unit-13" || s.includes("cottage")) return "cottage";
  // unit-5 and unit-6 are 2br today
  if (s === "unit-5" || s === "unit-6") return "2br";
  return "1br";
}

// "unit-1" → "Unit 1" for human-readable notes
function prettifyUnitSlug(unitSlug: string): string {
  const m = (unitSlug || "").match(/^unit-(\d+)$/i);
  if (m) return `Unit ${m[1]}`;
  return unitSlug || "Unknown unit";
}

// Best-effort mirror of a rental application into Host Hub booking_requests.
// Returns { ok, error? } — never throws, never fails the outer submission.
async function mirrorToHostHub(app: any, rentalApplicationId: string | null) {
  try {
    const fullName = [app.first_name, app.middle_initial, app.last_name]
      .filter(Boolean)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    const requestedUnit = prettifyUnitSlug(app.unit_id);

    // Pack useful triage context into notes (shown on the RequestCard with
    // whitespace-pre-wrap). Keep it concise — full application stays in the
    // website's rental_applications table for deep review.
    const noteLines: (string | null)[] = [
      `Long-stay rental application`,
      `Requested: ${requestedUnit} · ${app.nights ?? "?"} nights`,
      app.applicant_signature
        ? `Signed by ${app.applicant_signature} on ${app.signature_date}`
        : null,
      app.current_employer
        ? `Employer: ${app.current_employer}${app.employer_position ? ` (${app.employer_position})` : ""}`
        : null,
      app.gross_wages ? `Gross wages: ${app.gross_wages}` : null,
      app.pets && app.pets !== "None" ? `Pets: ${app.pets}` : null,
      (app.evictions_count && app.evictions_count !== "0") ||
      (app.felonies_count && app.felonies_count !== "0")
        ? `Evictions: ${app.evictions_count || "0"} · Felonies: ${app.felonies_count || "0"}`
        : null,
      app.desired_move_in ? `Desired move-in: ${app.desired_move_in}` : null,
      app.why_rent_to_you ? `Why rent: ${app.why_rent_to_you}` : null,
      rentalApplicationId ? `Website application id: ${rentalApplicationId}` : null,
    ];
    const notes = noteLines.filter(Boolean).join("\n");

    const payload = {
      name: fullName || app.booking_name || "Applicant",
      email: app.email,
      phone: app.phone_number || app.booking_phone || null,
      check_in: app.check_in,
      check_out: app.check_out,
      num_guests: 1,
      preferred_unit_type: mapSlugToUnitType(app.unit_id),
      source: "long_term",
      notes,
    };

    const res = await fetch(`${HOST_HUB_URL}/rest/v1/booking_requests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: HOST_HUB_ANON_KEY,
        Authorization: `Bearer ${HOST_HUB_ANON_KEY}`,
        Prefer: "return=representation",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Host Hub mirror (rental-app) failed:", res.status, err);
      return { ok: false, error: err };
    }
    const data = await res.json();
    console.log("Host Hub mirror (rental-app) inserted booking_request:", data?.[0]?.id);
    return { ok: true, data };
  } catch (err) {
    console.error("Host Hub mirror (rental-app) threw:", err);
    return { ok: false, error: String(err) };
  }
}


const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const colors = {
  navyDeep: '#0C1D37',
  navyMedium: '#152844',
  gold: '#C4935A',
  goldLight: '#D4A870',
  cream: '#F7F5F2',
  white: '#FFFFFF',
  textMuted: '#8B9BB4',
};

function getAdminNotificationEmail(app: any) {
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:${colors.cream};font-family:'DM Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:${colors.cream};">
    <tr><td style="padding:40px 20px;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin:0 auto;max-width:600px;">
        <tr>
          <td style="background:linear-gradient(180deg,${colors.navyDeep} 0%,${colors.navyMedium} 100%);padding:30px 40px;border-radius:16px 16px 0 0;">
            <table role="presentation" width="100%"><tr>
              <td><h1 style="margin:0;font-size:20px;font-weight:700;color:${colors.gold};">Homestead Hill</h1></td>
              <td style="text-align:right;">
                <span style="display:inline-block;background-color:${colors.gold};color:${colors.navyDeep};font-size:12px;font-weight:700;padding:6px 12px;border-radius:20px;text-transform:uppercase;">New Application</span>
              </td>
            </tr></table>
          </td>
        </tr>
        <tr>
          <td style="background-color:${colors.white};padding:40px;">
            <h2 style="margin:0 0 24px;font-size:22px;font-weight:600;color:${colors.navyDeep};">New Rental Application</h2>
            
            <table role="presentation" width="100%" style="background-color:${colors.cream};border-radius:12px;margin-bottom:24px;">
              <tr><td style="padding:20px;">
                <h3 style="margin:0 0 16px;font-size:12px;font-weight:600;color:${colors.gold};text-transform:uppercase;letter-spacing:1px;">Applicant</h3>
                <p style="margin:4px 0;font-size:15px;color:${colors.navyDeep};"><strong>${app.first_name} ${app.middle_initial ? app.middle_initial + ' ' : ''}${app.last_name}</strong></p>
                <p style="margin:4px 0;font-size:14px;color:#4A5568;">${app.email} · ${app.phone_number}</p>
              </td></tr>
            </table>

            <table role="presentation" width="100%" style="background-color:${colors.cream};border-radius:12px;margin-bottom:24px;">
              <tr><td style="padding:20px;">
                <h3 style="margin:0 0 16px;font-size:12px;font-weight:600;color:${colors.gold};text-transform:uppercase;letter-spacing:1px;">Booking Details</h3>
                <p style="margin:4px 0;font-size:14px;color:#4A5568;">Unit: <strong style="color:${colors.navyDeep};">${app.unit_id}</strong></p>
                <p style="margin:4px 0;font-size:14px;color:#4A5568;">Check-in: <strong style="color:${colors.navyDeep};">${app.check_in}</strong></p>
                <p style="margin:4px 0;font-size:14px;color:#4A5568;">Check-out: <strong style="color:${colors.navyDeep};">${app.check_out}</strong></p>
                <p style="margin:4px 0;font-size:14px;color:#4A5568;">Duration: <strong style="color:${colors.navyDeep};">${app.nights} nights</strong></p>
              </td></tr>
            </table>

            <table role="presentation" width="100%" style="background-color:${colors.cream};border-radius:12px;margin-bottom:24px;">
              <tr><td style="padding:20px;">
                <h3 style="margin:0 0 16px;font-size:12px;font-weight:600;color:${colors.gold};text-transform:uppercase;letter-spacing:1px;">Employment</h3>
                <p style="margin:4px 0;font-size:14px;color:#4A5568;">Employer: <strong style="color:${colors.navyDeep};">${app.current_employer || 'Not provided'}</strong></p>
                <p style="margin:4px 0;font-size:14px;color:#4A5568;">Position: <strong style="color:${colors.navyDeep};">${app.employer_position || 'Not provided'}</strong></p>
                <p style="margin:4px 0;font-size:14px;color:#4A5568;">Gross Wages: <strong style="color:${colors.navyDeep};">${app.gross_wages || 'Not provided'}</strong></p>
              </td></tr>
            </table>

            <table role="presentation" width="100%" style="background-color:${colors.cream};border-radius:12px;">
              <tr><td style="padding:20px;">
                <h3 style="margin:0 0 16px;font-size:12px;font-weight:600;color:${colors.gold};text-transform:uppercase;letter-spacing:1px;">Key Info</h3>
                <p style="margin:4px 0;font-size:14px;color:#4A5568;">Pets: ${app.pets || 'None'}</p>
                <p style="margin:4px 0;font-size:14px;color:#4A5568;">Evictions: ${app.evictions_count || '0'}</p>
                <p style="margin:4px 0;font-size:14px;color:#4A5568;">Felonies: ${app.felonies_count || '0'}</p>
                <p style="margin:4px 0;font-size:14px;color:#4A5568;">Smoke: ${app.smoke || 'Not specified'}</p>
                <p style="margin:4px 0;font-size:14px;color:#4A5568;">Why rent to them: ${app.why_rent_to_you || 'Not provided'}</p>
                <p style="margin:4px 0;font-size:14px;color:#4A5568;">Signed: <strong style="color:${colors.navyDeep};">${app.applicant_signature}</strong> on ${app.signature_date}</p>
              </td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="background-color:${colors.navyDeep};padding:20px 40px;border-radius:0 0 16px 16px;text-align:center;">
            <p style="margin:0;font-size:12px;color:${colors.textMuted};">Full application details are saved in the database.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function getApplicantConfirmationEmail(app: any) {
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:${colors.cream};font-family:'DM Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:${colors.cream};">
    <tr><td style="padding:40px 20px;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin:0 auto;max-width:600px;">
        <tr>
          <td style="background:linear-gradient(180deg,${colors.navyDeep} 0%,${colors.navyMedium} 100%);padding:40px 40px 30px;border-radius:16px 16px 0 0;text-align:center;">
            <h1 style="margin:0 0 8px;font-size:28px;font-weight:700;color:${colors.gold};letter-spacing:-0.5px;">Homestead Hill</h1>
            <p style="margin:0;font-size:14px;color:${colors.textMuted};letter-spacing:2px;text-transform:uppercase;">Furnished Rentals</p>
          </td>
        </tr>
        <tr>
          <td style="background-color:${colors.white};padding:40px;">
            <h2 style="margin:0 0 20px;font-size:24px;font-weight:600;color:${colors.navyDeep};">
              Thank you, ${app.first_name}!
            </h2>
            <p style="margin:0 0 30px;font-size:16px;line-height:1.6;color:#4A5568;">
              We've received your rental application and appreciate you taking the time to complete it. Our team will carefully review your information and get back to you within 48 hours.
            </p>

            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:${colors.cream};border-radius:12px;margin-bottom:30px;">
              <tr><td style="padding:24px;">
                <h3 style="margin:0 0 20px;font-size:14px;font-weight:600;color:${colors.gold};text-transform:uppercase;letter-spacing:1px;">Application Summary</h3>
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr><td style="padding:10px 0;border-bottom:1px solid #E2E8F0;">
                    <span style="font-size:14px;color:${colors.textMuted};">Applicant</span>
                    <p style="margin:4px 0 0;font-size:16px;font-weight:600;color:${colors.navyDeep};">${app.first_name} ${app.middle_initial ? app.middle_initial + ' ' : ''}${app.last_name}</p>
                  </td></tr>
                  <tr><td style="padding:10px 0;border-bottom:1px solid #E2E8F0;">
                    <span style="font-size:14px;color:${colors.textMuted};">Property</span>
                    <p style="margin:4px 0 0;font-size:16px;font-weight:600;color:${colors.navyDeep};">${app.unit_id}</p>
                  </td></tr>
                  <tr><td style="padding:10px 0;border-bottom:1px solid #E2E8F0;">
                    <span style="font-size:14px;color:${colors.textMuted};">Check-in</span>
                    <p style="margin:4px 0 0;font-size:16px;font-weight:600;color:${colors.navyDeep};">${app.check_in}</p>
                  </td></tr>
                  <tr><td style="padding:10px 0;border-bottom:1px solid #E2E8F0;">
                    <span style="font-size:14px;color:${colors.textMuted};">Check-out</span>
                    <p style="margin:4px 0 0;font-size:16px;font-weight:600;color:${colors.navyDeep};">${app.check_out}</p>
                  </td></tr>
                  <tr><td style="padding:10px 0;">
                    <span style="font-size:14px;color:${colors.textMuted};">Duration</span>
                    <p style="margin:4px 0 0;font-size:16px;font-weight:600;color:${colors.navyDeep};">${app.nights} nights</p>
                  </td></tr>
                </table>
              </td></tr>
            </table>

            <h3 style="margin:0 0 16px;font-size:18px;font-weight:600;color:${colors.navyDeep};">What happens next?</h3>
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:30px;">
              <tr><td style="padding:12px 0;">
                <table role="presentation"><tr>
                  <td style="width:32px;height:32px;background-color:${colors.gold};border-radius:50%;text-align:center;vertical-align:middle;">
                    <span style="color:${colors.navyDeep};font-weight:700;font-size:14px;">1</span>
                  </td>
                  <td style="padding-left:16px;">
                    <p style="margin:0;font-size:15px;color:#4A5568;line-height:1.5;">
                      <strong style="color:${colors.navyDeep};">Review</strong> – We'll verify your application details and references
                    </p>
                  </td>
                </tr></table>
              </td></tr>
              <tr><td style="padding:12px 0;">
                <table role="presentation"><tr>
                  <td style="width:32px;height:32px;background-color:${colors.gold};border-radius:50%;text-align:center;vertical-align:middle;">
                    <span style="color:${colors.navyDeep};font-weight:700;font-size:14px;">2</span>
                  </td>
                  <td style="padding-left:16px;">
                    <p style="margin:0;font-size:15px;color:#4A5568;line-height:1.5;">
                      <strong style="color:${colors.navyDeep};">Decision</strong> – We'll notify you within 48 hours of our decision
                    </p>
                  </td>
                </tr></table>
              </td></tr>
              <tr><td style="padding:12px 0;">
                <table role="presentation"><tr>
                  <td style="width:32px;height:32px;background-color:${colors.gold};border-radius:50%;text-align:center;vertical-align:middle;">
                    <span style="color:${colors.navyDeep};font-weight:700;font-size:14px;">3</span>
                  </td>
                  <td style="padding-left:16px;">
                    <p style="margin:0;font-size:15px;color:#4A5568;line-height:1.5;">
                      <strong style="color:${colors.navyDeep};">Move-in</strong> – Once approved, we'll finalize your lease and move-in details
                    </p>
                  </td>
                </tr></table>
              </td></tr>
            </table>

            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:linear-gradient(135deg,${colors.navyDeep} 0%,${colors.navyMedium} 100%);border-radius:12px;">
              <tr><td style="padding:24px;text-align:center;">
                <p style="margin:0 0 12px;font-size:14px;color:${colors.textMuted};">Questions? We're here to help.</p>
                <p style="margin:0;"><a href="tel:8127683108" style="color:${colors.gold};font-size:18px;font-weight:600;text-decoration:none;">(812) 768-3108</a></p>
                <p style="margin:8px 0 0;"><a href="mailto:booking@homestead-hill.com" style="color:${colors.goldLight};font-size:14px;text-decoration:none;">booking@homestead-hill.com</a></p>
              </td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="background-color:${colors.navyDeep};padding:30px 40px;border-radius:0 0 16px 16px;text-align:center;">
            <p style="margin:0 0 8px;font-size:14px;color:${colors.gold};font-weight:600;">Homestead Hill</p>
            <p style="margin:0 0 16px;font-size:13px;color:${colors.textMuted};">Vincennes, Indiana</p>
            <p style="margin:0;font-size:12px;color:${colors.textMuted};">© ${new Date().getFullYear()} Homestead Hill. All rights reserved.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();

    // Validate required fields
    if (!body.first_name || !body.last_name || !body.email || !body.phone_number || !body.applicant_signature || !body.signature_date || !body.unit_id) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Save to database
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: insertedApp, error: dbError } = await supabase.from("rental_applications").insert({
      first_name: body.first_name,
      middle_initial: body.middle_initial || null,
      last_name: body.last_name,
      ssn: body.ssn || null,
      date_of_birth: body.date_of_birth || null,
      drivers_license: body.drivers_license || null,
      phone_number: body.phone_number,
      alternate_phone: body.alternate_phone || null,
      email: body.email,
      who_else_living: body.who_else_living || null,
      current_address: body.current_address || null,
      current_city_state_zip: body.current_city_state_zip || null,
      current_move_in: body.current_move_in || null,
      current_landlord_name: body.current_landlord_name || null,
      current_landlord_phone: body.current_landlord_phone || null,
      current_monthly_rent: body.current_monthly_rent || null,
      current_reason_moving: body.current_reason_moving || null,
      prev1_address: body.prev1_address || null,
      prev1_city_state_zip: body.prev1_city_state_zip || null,
      prev1_move_in: body.prev1_move_in || null,
      prev1_move_out: body.prev1_move_out || null,
      prev1_landlord_name: body.prev1_landlord_name || null,
      prev1_landlord_phone: body.prev1_landlord_phone || null,
      prev1_monthly_rent: body.prev1_monthly_rent || null,
      prev1_reason_moving: body.prev1_reason_moving || null,
      prev2_address: body.prev2_address || null,
      prev2_city_state_zip: body.prev2_city_state_zip || null,
      prev2_move_in: body.prev2_move_in || null,
      prev2_move_out: body.prev2_move_out || null,
      prev2_landlord_name: body.prev2_landlord_name || null,
      prev2_landlord_phone: body.prev2_landlord_phone || null,
      prev2_monthly_rent: body.prev2_monthly_rent || null,
      prev2_reason_moving: body.prev2_reason_moving || null,
      current_employer: body.current_employer || null,
      employer_position: body.employer_position || null,
      employer_phone: body.employer_phone || null,
      supervisor_name: body.supervisor_name || null,
      gross_wages: body.gross_wages || null,
      hire_date: body.hire_date || null,
      other_income_sources: body.other_income_sources || null,
      other_income_amount: body.other_income_amount || null,
      other_income_explain: body.other_income_explain || null,
      how_long_live_here: body.how_long_live_here || null,
      pets: body.pets || null,
      evictions_count: body.evictions_count || null,
      felonies_count: body.felonies_count || null,
      broken_lease: body.broken_lease || null,
      smoke: body.smoke || null,
      vehicles_count: body.vehicles_count || null,
      total_move_in_available: body.total_move_in_available || null,
      desired_move_in: body.desired_move_in || null,
      how_heard: body.how_heard || null,
      reasons_not_pay_rent: body.reasons_not_pay_rent || null,
      has_checking_account: body.has_checking_account || null,
      checking_balance: body.checking_balance || null,
      has_savings_account: body.has_savings_account || null,
      savings_balance: body.savings_balance || null,
      emergency_name: body.emergency_name || null,
      emergency_phone: body.emergency_phone || null,
      emergency_relationship: body.emergency_relationship || null,
      why_rent_to_you: body.why_rent_to_you || null,
      additional_info: body.additional_info || null,
      applicant_signature: body.applicant_signature,
      signature_date: body.signature_date,
      unit_id: body.unit_id,
      booking_name: body.booking_name,
      booking_email: body.booking_email,
      booking_phone: body.booking_phone,
      check_in: body.check_in,
      check_out: body.check_out,
      nights: body.nights,
      status: "pending",
    }).select().single();

    if (dbError) {
      console.error("Database error:", dbError);
      throw new Error(`Database error: ${dbError.message}`);
    }

    console.log("Application saved to database, id:", insertedApp?.id);

    // Mirror into Host Hub booking_requests inbox — best-effort, non-blocking.
    try {
      console.log("Mirroring rental application to Host Hub:", {
        unit_id: body.unit_id,
        check_in: body.check_in,
        check_out: body.check_out,
      });
      const mirror = await mirrorToHostHub(body, insertedApp?.id ?? null);
      if (!mirror.ok) {
        console.error("Host Hub mirror (rental-app) returned error:", mirror.error);
      } else {
        console.log("Host Hub mirror (rental-app) succeeded");
      }
    } catch (mirrorErr) {
      console.error("Host Hub mirror (rental-app) unexpected throw:", mirrorErr);
    }

    // Send admin notification email
    if (RESEND_API_KEY) {
      const emailRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "Homestead Hill <booking@homestead-hill.com>",
          to: ["booking@homestead-hill.com"],
          subject: `New Rental Application - ${body.first_name} ${body.last_name} (${body.unit_id})`,
          html: getAdminNotificationEmail(body),
        }),
      });

      if (!emailRes.ok) {
        const err = await emailRes.text();
        console.error("Failed to send admin email:", err);
        // Don't throw - DB save succeeded
      } else {
        console.log("Admin notification email sent");
      }

      // Send confirmation email to applicant
      const applicantEmailRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "Homestead Hill <booking@homestead-hill.com>",
          to: [body.email],
          bcc: ["booking@homestead-hill.com"],
          subject: "We received your rental application - Homestead Hill",
          html: getApplicantConfirmationEmail(body),
        }),
      });

      if (!applicantEmailRes.ok) {
        const err = await applicantEmailRes.text();
        console.error("Failed to send applicant confirmation email:", err);
      } else {
        console.log("Applicant confirmation email sent");
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
