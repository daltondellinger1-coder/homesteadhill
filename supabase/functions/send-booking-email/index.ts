import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface BookingRequest {
  name: string;
  email: string;
  phone: string;
  unit: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  message?: string;
  nights: number;
  totalPrice: number;
  rateType: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const booking: BookingRequest = await req.json();

    // Validate required fields
    if (!booking.name || !booking.email || !booking.unit || !booking.checkIn || !booking.checkOut) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Send notification email to admin
    const adminEmailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Homestead Hill <onboarding@resend.dev>",
        to: ["admin@wefliphouses.com"],
        subject: `New Booking Request - ${booking.unit}`,
        html: `
          <h1>New Booking Request</h1>
          <h2>Guest Information</h2>
          <ul>
            <li><strong>Name:</strong> ${booking.name}</li>
            <li><strong>Email:</strong> ${booking.email}</li>
            <li><strong>Phone:</strong> ${booking.phone || 'Not provided'}</li>
          </ul>
          
          <h2>Booking Details</h2>
          <ul>
            <li><strong>Unit:</strong> ${booking.unit}</li>
            <li><strong>Check-in:</strong> ${booking.checkIn}</li>
            <li><strong>Check-out:</strong> ${booking.checkOut}</li>
            <li><strong>Nights:</strong> ${booking.nights}</li>
            <li><strong>Guests:</strong> ${booking.guests}</li>
            <li><strong>Rate:</strong> ${booking.rateType}</li>
            <li><strong>Estimated Total:</strong> $${booking.totalPrice.toLocaleString()}</li>
          </ul>
          
          ${booking.message ? `<h2>Additional Message</h2><p>${booking.message}</p>` : ''}
          
          <hr />
          <p><em>This booking request was submitted via the Homestead Hill website.</em></p>
        `,
      }),
    });

    if (!adminEmailRes.ok) {
      const error = await adminEmailRes.text();
      console.error("Failed to send admin email:", error);
      throw new Error(`Failed to send admin email: ${error}`);
    }

    console.log("Admin email sent successfully");

    // Send confirmation email to guest
    const guestEmailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Homestead Hill <onboarding@resend.dev>",
        to: [booking.email],
        subject: "We received your booking request - Homestead Hill",
        html: `
          <h1>Thank you for your booking request, ${booking.name}!</h1>
          <p>We have received your request and will get back to you within 24 hours to confirm availability and finalize your reservation.</p>
          
          <h2>Your Booking Details</h2>
          <ul>
            <li><strong>Unit:</strong> ${booking.unit}</li>
            <li><strong>Check-in:</strong> ${booking.checkIn}</li>
            <li><strong>Check-out:</strong> ${booking.checkOut}</li>
            <li><strong>Nights:</strong> ${booking.nights}</li>
            <li><strong>Guests:</strong> ${booking.guests}</li>
            <li><strong>Estimated Total:</strong> $${booking.totalPrice.toLocaleString()}</li>
          </ul>
          
          <p>If you have any questions, feel free to reply to this email or call us at (812) 768-3108.</p>
          
          <p>Best regards,<br>The Homestead Hill Team</p>
        `,
      }),
    });

    if (!guestEmailRes.ok) {
      const error = await guestEmailRes.text();
      console.error("Failed to send guest email:", error);
      // Don't throw - admin email was sent successfully
    }

    console.log("Guest confirmation email sent successfully");

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-booking-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
