import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const body = await req.json();
    const { action } = body;

    if (action === "list") {
      const { status } = body;
      
      let query = supabase
        .from("rental_applications")
        .select("*")
        .order("created_at", { ascending: false });

      if (status && status !== "all") {
        query = query.eq("status", status);
      }

      const { data, error } = await query;
      if (error) throw error;

      return new Response(JSON.stringify({ applications: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "update-status") {
      const { id, status } = body;

      if (!id || !status || !["pending", "approved", "denied"].includes(status)) {
        return new Response(JSON.stringify({ error: "Invalid id or status" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data, error } = await supabase
        .from("rental_applications")
        .update({ status })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      // Send status notification email to applicant
      const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
      if (RESEND_API_KEY && data.email) {
        const statusText = status === "approved" ? "Approved" : "Denied";
        const statusMessage = status === "approved"
          ? "We're pleased to inform you that your rental application has been approved! We'll be in touch shortly with next steps regarding your lease and move-in details."
          : "After careful review, we're unable to approve your rental application at this time. Please feel free to contact us if you have any questions.";

        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "Homestead Hill <booking@homestead-hill.com>",
            to: [data.email],
            bcc: ["booking@homestead-hill.com"],
            subject: `Rental Application ${statusText} - Homestead Hill`,
            html: `
<!DOCTYPE html>
<html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background-color:#FAF9F6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" width="100%" style="background-color:#FAF9F6;">
    <tr><td style="padding:40px 20px;">
      <table role="presentation" width="600" style="margin:0 auto;max-width:600px;">
        <tr><td style="background:#1B2A4A;padding:40px;border-radius:16px 16px 0 0;text-align:center;">
          <h1 style="margin:0;font-size:28px;font-weight:700;color:#C9A96E;">Homestead Hill</h1>
          <p style="margin:8px 0 0;font-size:14px;color:#8B9DC3;letter-spacing:2px;text-transform:uppercase;">Furnished Rentals</p>
        </td></tr>
        <tr><td style="background:#fff;padding:40px;">
          <h2 style="margin:0 0 20px;font-size:24px;color:#1B2A4A;">Application ${statusText}</h2>
          <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#4A5568;">Dear ${data.first_name},</p>
          <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#4A5568;">${statusMessage}</p>
          <table role="presentation" width="100%" style="background:#FAF9F6;border-radius:12px;margin-bottom:24px;">
            <tr><td style="padding:20px;">
              <p style="margin:0 0 8px;font-size:14px;color:#8B9DC3;">Unit</p>
              <p style="margin:0 0 16px;font-size:16px;font-weight:600;color:#1B2A4A;">${data.unit_id}</p>
              <p style="margin:0 0 8px;font-size:14px;color:#8B9DC3;">Dates</p>
              <p style="margin:0;font-size:16px;font-weight:600;color:#1B2A4A;">${data.check_in} – ${data.check_out}</p>
            </td></tr>
          </table>
          <table role="presentation" width="100%" style="background:#1B2A4A;border-radius:12px;">
            <tr><td style="padding:24px;text-align:center;">
              <p style="margin:0 0 8px;font-size:14px;color:#8B9DC3;">Questions? Contact us</p>
              <p style="margin:0;"><a href="tel:8127683108" style="color:#C9A96E;font-size:18px;font-weight:600;text-decoration:none;">(812) 768-3108</a></p>
              <p style="margin:8px 0 0;"><a href="mailto:booking@homestead-hill.com" style="color:#D4BC8A;font-size:14px;text-decoration:none;">booking@homestead-hill.com</a></p>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="background:#1B2A4A;padding:24px;border-radius:0 0 16px 16px;text-align:center;">
          <p style="margin:0;font-size:12px;color:#8B9DC3;">© ${new Date().getFullYear()} Homestead Hill. All rights reserved.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`,
          }),
        });
        console.log(`Status notification email sent to ${data.email}: ${statusText}`);
      }

      return new Response(JSON.stringify({ application: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "delete") {
      const { id } = body;
      if (!id) {
        return new Response(JSON.stringify({ error: "Missing id" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { error } = await supabase
        .from("rental_applications")
        .delete()
        .eq("id", id);
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error?.message ?? String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
