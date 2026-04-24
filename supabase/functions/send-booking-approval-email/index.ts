import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

// Sends a branded approval confirmation email to a guest after their
// booking request has been approved inside the Host Hub app. The app
// makes a cross-project fetch here (Host Hub is a separate Supabase
// project) so the email goes out through the website's Resend sender
// domain — keeping branding consistent with all our other guest emails.

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ApprovalEmailRequest {
  name: string;
  email: string;
  unit_name: string;
  check_in: string;  // YYYY-MM-DD
  check_out: string; // YYYY-MM-DD
  nights?: number;
  num_guests?: number;
}

// Brand colors — matched to send-booking-email.ts
const colors = {
  navyDeep: "#0C1D37",
  navyMedium: "#152844",
  gold: "#C4935A",
  goldLight: "#D4A870",
  cream: "#F7F5F2",
  white: "#FFFFFF",
  textMuted: "#8B9BB4",
};

function formatDate(iso: string): string {
  // "2026-04-15" → "April 15, 2026"
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function computeNights(checkIn: string, checkOut: string): number {
  const a = new Date(checkIn + "T00:00:00").getTime();
  const b = new Date(checkOut + "T00:00:00").getTime();
  if (isNaN(a) || isNaN(b)) return 0;
  return Math.max(0, Math.round((b - a) / (1000 * 60 * 60 * 24)));
}

function getApprovalEmailTemplate(b: ApprovalEmailRequest): string {
  const nights = b.nights ?? computeNights(b.check_in, b.check_out);
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
            <div style="display:inline-block;background-color:${colors.gold};color:${colors.navyDeep};font-size:12px;font-weight:700;padding:6px 14px;border-radius:20px;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:16px;">Booking Approved</div>
            <h1 style="margin:0 0 8px;font-size:28px;font-weight:700;color:${colors.gold};letter-spacing:-0.5px;">Homestead Hill</h1>
            <p style="margin:0;font-size:14px;color:${colors.textMuted};letter-spacing:2px;text-transform:uppercase;">Furnished Rentals</p>
          </td>
        </tr>
        <tr>
          <td style="background-color:${colors.white};padding:40px;">
            <h2 style="margin:0 0 20px;font-size:24px;font-weight:600;color:${colors.navyDeep};">You're in, ${b.name}!</h2>
            <p style="margin:0 0 28px;font-size:16px;line-height:1.6;color:#4A5568;">
              Great news — your stay at <strong>${b.unit_name}</strong> is confirmed. We've blocked off your dates and we'll be in touch with check-in instructions and any final details before your arrival.
            </p>

            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:${colors.cream};border-radius:12px;margin-bottom:28px;">
              <tr><td style="padding:24px;">
                <h3 style="margin:0 0 20px;font-size:14px;font-weight:600;color:${colors.gold};text-transform:uppercase;letter-spacing:1px;">Your Stay</h3>
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr><td style="padding:10px 0;border-bottom:1px solid #E2E8F0;">
                    <span style="font-size:14px;color:${colors.textMuted};">Property</span>
                    <p style="margin:4px 0 0;font-size:16px;font-weight:600;color:${colors.navyDeep};">${b.unit_name}</p>
                  </td></tr>
                  <tr><td style="padding:10px 0;border-bottom:1px solid #E2E8F0;">
                    <span style="font-size:14px;color:${colors.textMuted};">Check-in</span>
                    <p style="margin:4px 0 0;font-size:16px;font-weight:600;color:${colors.navyDeep};">${formatDate(b.check_in)}</p>
                  </td></tr>
                  <tr><td style="padding:10px 0;border-bottom:1px solid #E2E8F0;">
                    <span style="font-size:14px;color:${colors.textMuted};">Check-out</span>
                    <p style="margin:4px 0 0;font-size:16px;font-weight:600;color:${colors.navyDeep};">${formatDate(b.check_out)}</p>
                  </td></tr>
                  <tr><td style="padding:10px 0${b.num_guests ? ';border-bottom:1px solid #E2E8F0' : ''};">
                    <span style="font-size:14px;color:${colors.textMuted};">Duration</span>
                    <p style="margin:4px 0 0;font-size:16px;font-weight:600;color:${colors.navyDeep};">${nights} ${nights === 1 ? "night" : "nights"}</p>
                  </td></tr>
                  ${b.num_guests ? `<tr><td style="padding:10px 0;">
                    <span style="font-size:14px;color:${colors.textMuted};">Guests</span>
                    <p style="margin:4px 0 0;font-size:16px;font-weight:600;color:${colors.navyDeep};">${b.num_guests}</p>
                  </td></tr>` : ""}
                </table>
              </td></tr>
            </table>

            <h3 style="margin:0 0 16px;font-size:18px;font-weight:600;color:${colors.navyDeep};">What happens next?</h3>
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:30px;">
              <tr><td style="padding:10px 0;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr>
                  <td style="width:32px;height:32px;background-color:${colors.gold};border-radius:50%;text-align:center;vertical-align:middle;">
                    <span style="color:${colors.navyDeep};font-weight:700;font-size:14px;">1</span>
                  </td>
                  <td style="padding-left:16px;">
                    <p style="margin:0;font-size:15px;color:#4A5568;line-height:1.5;"><strong style="color:${colors.navyDeep};">Confirmation</strong> – You'll get a follow-up with the lease, deposit info, and payment details</p>
                  </td>
                </tr></table>
              </td></tr>
              <tr><td style="padding:10px 0;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr>
                  <td style="width:32px;height:32px;background-color:${colors.gold};border-radius:50%;text-align:center;vertical-align:middle;">
                    <span style="color:${colors.navyDeep};font-weight:700;font-size:14px;">2</span>
                  </td>
                  <td style="padding-left:16px;">
                    <p style="margin:0;font-size:15px;color:#4A5568;line-height:1.5;"><strong style="color:${colors.navyDeep};">Check-in details</strong> – We'll send door codes and parking info a day or two before arrival</p>
                  </td>
                </tr></table>
              </td></tr>
              <tr><td style="padding:10px 0;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr>
                  <td style="width:32px;height:32px;background-color:${colors.gold};border-radius:50%;text-align:center;vertical-align:middle;">
                    <span style="color:${colors.navyDeep};font-weight:700;font-size:14px;">3</span>
                  </td>
                  <td style="padding-left:16px;">
                    <p style="margin:0;font-size:15px;color:#4A5568;line-height:1.5;"><strong style="color:${colors.navyDeep};">Welcome</strong> – Enjoy your stay. We're around if you need anything.</p>
                  </td>
                </tr></table>
              </td></tr>
            </table>

            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:linear-gradient(135deg,${colors.navyDeep} 0%,${colors.navyMedium} 100%);border-radius:12px;">
              <tr><td style="padding:24px;text-align:center;">
                <p style="margin:0 0 12px;font-size:14px;color:${colors.textMuted};">Questions before your stay?</p>
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
    const body = (await req.json()) as ApprovalEmailRequest;

    if (!body.name || !body.email || !body.unit_name || !body.check_in || !body.check_out) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Homestead Hill <booking@homestead-hill.com>",
        to: [body.email],
        bcc: ["booking@homestead-hill.com"],
        subject: `Your booking is approved — ${body.unit_name}`,
        html: getApprovalEmailTemplate(body),
      }),
    });

    if (!emailRes.ok) {
      const err = await emailRes.text();
      console.error("Resend failed:", emailRes.status, err);
      return new Response(
        JSON.stringify({ error: "Failed to send email", detail: err }),
        { status: 502, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const data = await emailRes.json();
    console.log("Approval email sent:", data.id);
    return new Response(
      JSON.stringify({ success: true, id: data.id }),
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
