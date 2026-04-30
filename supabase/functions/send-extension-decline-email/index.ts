import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

// Polite decline email when an extension request can't be accommodated.
// Same Resend setup / brand colors as send-booking-approval-email.

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface DeclineEmailRequest {
  name: string;
  email: string;
  check_in: string;  // YYYY-MM-DD (current checkout / requested extension start)
  check_out: string; // YYYY-MM-DD (requested new checkout)
  reason?: string;
}

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
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]!));
}

function template(b: DeclineEmailRequest): string {
  const reasonBlock = b.reason && b.reason.trim()
    ? `<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:${colors.cream};border-radius:12px;margin-bottom:24px;"><tr><td style="padding:20px 24px;">
         <p style="margin:0 0 6px;font-size:13px;color:${colors.gold};text-transform:uppercase;letter-spacing:1px;font-weight:600;">A note from us</p>
         <p style="margin:0;font-size:15px;line-height:1.6;color:#4A5568;">${escapeHtml(b.reason.trim())}</p>
       </td></tr></table>`
    : "";

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:${colors.cream};font-family:'DM Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:${colors.cream};"><tr><td style="padding:40px 20px;">
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin:0 auto;max-width:600px;">
  <tr><td style="background:linear-gradient(180deg,${colors.navyDeep} 0%,${colors.navyMedium} 100%);padding:40px 40px 30px;border-radius:16px 16px 0 0;text-align:center;">
    <h1 style="margin:0 0 8px;font-size:28px;font-weight:700;color:${colors.gold};letter-spacing:-0.5px;">Homestead Hill</h1>
    <p style="margin:0;font-size:14px;color:${colors.textMuted};letter-spacing:2px;text-transform:uppercase;">Furnished Rentals</p>
  </td></tr>
  <tr><td style="background-color:${colors.white};padding:40px;">
    <h2 style="margin:0 0 20px;font-size:24px;font-weight:600;color:${colors.navyDeep};">Hi ${escapeHtml(b.name)},</h2>
    <p style="margin:0 0 20px;font-size:16px;line-height:1.6;color:#4A5568;">
      Thanks so much for asking about extending your stay through <strong>${formatDate(b.check_out)}</strong>. Unfortunately, we aren't able to accommodate the extension from <strong>${formatDate(b.check_in)}</strong> this time — the unit is already committed for those dates.
    </p>
    ${reasonBlock}
    <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#4A5568;">
      We'd love to host you again. If your plans are flexible, reply to this email or give us a call and we'll do our best to find another set of dates (or a sister unit) that works.
    </p>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:linear-gradient(135deg,${colors.navyDeep} 0%,${colors.navyMedium} 100%);border-radius:12px;"><tr><td style="padding:24px;text-align:center;">
      <p style="margin:0 0 12px;font-size:14px;color:${colors.textMuted};">We're here to help</p>
      <p style="margin:0;"><a href="tel:8127683108" style="color:${colors.gold};font-size:18px;font-weight:600;text-decoration:none;">(812) 768-3108</a></p>
      <p style="margin:8px 0 0;"><a href="mailto:booking@homestead-hill.com" style="color:${colors.goldLight};font-size:14px;text-decoration:none;">booking@homestead-hill.com</a></p>
    </td></tr></table>
  </td></tr>
  <tr><td style="background-color:${colors.navyDeep};padding:30px 40px;border-radius:0 0 16px 16px;text-align:center;">
    <p style="margin:0 0 8px;font-size:14px;color:${colors.gold};font-weight:600;">Homestead Hill</p>
    <p style="margin:0 0 16px;font-size:13px;color:${colors.textMuted};">Vincennes, Indiana</p>
    <p style="margin:0;font-size:12px;color:${colors.textMuted};">© ${new Date().getFullYear()} Homestead Hill. All rights reserved.</p>
  </td></tr>
</table></td></tr></table></body></html>`;
}

function isEmail(s: unknown): s is string {
  return typeof s === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) && s.length <= 254;
}
function isIsoDate(s: unknown): s is string {
  return typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (!RESEND_API_KEY) {
    console.error("RESEND_API_KEY missing");
    return new Response(JSON.stringify({ error: "Email service not configured" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = (await req.json()) as DeclineEmailRequest;
    if (
      typeof body?.name !== "string" || body.name.length < 1 || body.name.length > 200 ||
      !isEmail(body?.email) ||
      !isIsoDate(body?.check_in) ||
      !isIsoDate(body?.check_out) ||
      (body?.reason !== undefined && (typeof body.reason !== "string" || body.reason.length > 2000))
    ) {
      return new Response(JSON.stringify({ error: "Invalid input" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Homestead Hill <booking@homestead-hill.com>",
        to: [body.email],
        bcc: ["booking@homestead-hill.com"],
        reply_to: "booking@homestead-hill.com",
        subject: "About your extension request — Homestead Hill",
        html: template(body),
      }),
    });

    if (!res.ok) {
      const txt = await res.text();
      console.error("Resend error:", res.status, txt);
      return new Response(JSON.stringify({ error: "Failed to send email" }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const data = await res.json();
    return new Response(JSON.stringify({ ok: true, id: data?.id }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("send-extension-decline-email error:", e);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);