import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

// Sends a branded confirmation email to a guest after their extension
// request has been approved in the Homestead Helper. Same Resend setup
// and brand colors as send-booking-approval-email so messaging stays
// consistent across all guest communications.

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
  new_check_out: string; // YYYY-MM-DD
  amount: number | string;
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

function formatAmount(amount: number | string): string {
  const n = typeof amount === "number" ? amount : parseFloat(String(amount));
  if (isNaN(n)) return String(amount);
  return n.toLocaleString("en-US", {
    style: "currency", currency: "USD", minimumFractionDigits: 2,
  });
}

function template(b: ApprovalEmailRequest): string {
  const amountStr = formatAmount(b.amount);
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:${colors.cream};font-family:'DM Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:${colors.cream};"><tr><td style="padding:40px 20px;">
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin:0 auto;max-width:600px;">
  <tr><td style="background:linear-gradient(180deg,${colors.navyDeep} 0%,${colors.navyMedium} 100%);padding:40px 40px 30px;border-radius:16px 16px 0 0;text-align:center;">
    <div style="display:inline-block;background-color:${colors.gold};color:${colors.navyDeep};font-size:12px;font-weight:700;padding:6px 14px;border-radius:20px;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:16px;">Extension Approved</div>
    <h1 style="margin:0 0 8px;font-size:28px;font-weight:700;color:${colors.gold};letter-spacing:-0.5px;">Homestead Hill</h1>
    <p style="margin:0;font-size:14px;color:${colors.textMuted};letter-spacing:2px;text-transform:uppercase;">Furnished Rentals</p>
  </td></tr>
  <tr><td style="background-color:${colors.white};padding:40px;">
    <h2 style="margin:0 0 20px;font-size:24px;font-weight:600;color:${colors.navyDeep};">Good news, ${b.name}!</h2>
    <p style="margin:0 0 28px;font-size:16px;line-height:1.6;color:#4A5568;">
      Your stay at <strong>${b.unit_name}</strong> has been extended through <strong>${formatDate(b.new_check_out)}</strong>. We've blocked the new dates on our end — no need to do anything further to hold the unit.
    </p>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:${colors.cream};border-radius:12px;margin-bottom:28px;"><tr><td style="padding:24px;">
      <h3 style="margin:0 0 20px;font-size:14px;font-weight:600;color:${colors.gold};text-transform:uppercase;letter-spacing:1px;">Extension Details</h3>
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr><td style="padding:10px 0;border-bottom:1px solid #E2E8F0;">
          <span style="font-size:14px;color:${colors.textMuted};">Property</span>
          <p style="margin:4px 0 0;font-size:16px;font-weight:600;color:${colors.navyDeep};">${b.unit_name}</p>
        </td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #E2E8F0;">
          <span style="font-size:14px;color:${colors.textMuted};">New check-out</span>
          <p style="margin:4px 0 0;font-size:16px;font-weight:600;color:${colors.navyDeep};">${formatDate(b.new_check_out)}</p>
        </td></tr>
        <tr><td style="padding:10px 0;">
          <span style="font-size:14px;color:${colors.textMuted};">Amount due</span>
          <p style="margin:4px 0 0;font-size:18px;font-weight:700;color:${colors.navyDeep};">${amountStr}</p>
          <p style="margin:6px 0 0;font-size:13px;color:${colors.textMuted};">Payable on-site — cash, check, or card accepted.</p>
        </td></tr>
      </table>
    </td></tr></table>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#4A5568;">If anything changes or you have questions about your extended stay, just reply to this email or give us a call.</p>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:linear-gradient(135deg,${colors.navyDeep} 0%,${colors.navyMedium} 100%);border-radius:12px;"><tr><td style="padding:24px;text-align:center;">
      <p style="margin:0 0 12px;font-size:14px;color:${colors.textMuted};">Need anything?</p>
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
    const body = (await req.json()) as ApprovalEmailRequest;
    if (
      typeof body?.name !== "string" || body.name.length < 1 || body.name.length > 200 ||
      !isEmail(body?.email) ||
      typeof body?.unit_name !== "string" || body.unit_name.length < 1 || body.unit_name.length > 200 ||
      !isIsoDate(body?.new_check_out) ||
      (typeof body?.amount !== "number" && typeof body?.amount !== "string")
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
        subject: `Your stay is extended through ${formatDate(body.new_check_out)} — Homestead Hill`,
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
    console.error("send-extension-approval-email error:", e);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);