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

// Brand colors
const colors = {
  navyDeep: '#0C1D37',
  navyMedium: '#152844',
  gold: '#C4935A',
  goldLight: '#D4A870',
  cream: '#F7F5F2',
  white: '#FFFFFF',
  textMuted: '#8B9BB4',
};

const getEmailStyles = () => `
  <style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
  </style>
`;

const getGuestEmailTemplate = (booking: BookingRequest) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${getEmailStyles()}
</head>
<body style="margin: 0; padding: 0; background-color: ${colors.cream}; font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${colors.cream};">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; max-width: 600px;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(180deg, ${colors.navyDeep} 0%, ${colors.navyMedium} 100%); padding: 40px 40px 30px; border-radius: 16px 16px 0 0; text-align: center;">
              <h1 style="margin: 0 0 8px; font-size: 28px; font-weight: 700; color: ${colors.gold}; letter-spacing: -0.5px;">
                Homestead Hill
              </h1>
              <p style="margin: 0; font-size: 14px; color: ${colors.textMuted}; letter-spacing: 2px; text-transform: uppercase;">
                Furnished Rentals
              </p>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="background-color: ${colors.white}; padding: 40px;">
              <!-- Greeting -->
              <h2 style="margin: 0 0 20px; font-size: 24px; font-weight: 600; color: ${colors.navyDeep};">
                Thank you, ${booking.name}!
              </h2>
              <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #4A5568;">
                We've received your booking request and are excited about your interest in staying with us. Our team will review your request and get back to you within 24 hours to confirm availability.
              </p>
              
              <!-- Booking Details Card -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${colors.cream}; border-radius: 12px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 24px;">
                    <h3 style="margin: 0 0 20px; font-size: 14px; font-weight: 600; color: ${colors.gold}; text-transform: uppercase; letter-spacing: 1px;">
                      Your Booking Details
                    </h3>
                    
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #E2E8F0;">
                          <span style="font-size: 14px; color: ${colors.textMuted};">Property</span>
                          <p style="margin: 4px 0 0; font-size: 16px; font-weight: 600; color: ${colors.navyDeep};">${booking.unit}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #E2E8F0;">
                          <span style="font-size: 14px; color: ${colors.textMuted};">Check-in</span>
                          <p style="margin: 4px 0 0; font-size: 16px; font-weight: 600; color: ${colors.navyDeep};">${booking.checkIn}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #E2E8F0;">
                          <span style="font-size: 14px; color: ${colors.textMuted};">Check-out</span>
                          <p style="margin: 4px 0 0; font-size: 16px; font-weight: 600; color: ${colors.navyDeep};">${booking.checkOut}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #E2E8F0;">
                          <span style="font-size: 14px; color: ${colors.textMuted};">Duration</span>
                          <p style="margin: 4px 0 0; font-size: 16px; font-weight: 600; color: ${colors.navyDeep};">${booking.nights} nights</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #E2E8F0;">
                          <span style="font-size: 14px; color: ${colors.textMuted};">Guests</span>
                          <p style="margin: 4px 0 0; font-size: 16px; font-weight: 600; color: ${colors.navyDeep};">${booking.guests}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 16px 0 0;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td>
                                <span style="font-size: 14px; color: ${colors.textMuted};">Estimated Total</span>
                              </td>
                              <td style="text-align: right;">
                                <span style="font-size: 24px; font-weight: 700; color: ${colors.gold};">$${booking.totalPrice.toLocaleString()}</span>
                              </td>
                            </tr>
                            <tr>
                              <td colspan="2" style="padding-top: 4px;">
                                <span style="font-size: 12px; color: ${colors.textMuted};">${booking.rateType}</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- What's Next -->
              <h3 style="margin: 0 0 16px; font-size: 18px; font-weight: 600; color: ${colors.navyDeep};">
                What happens next?
              </h3>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 30px;">
                <tr>
                  <td style="padding: 12px 0; vertical-align: top;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="width: 32px; height: 32px; background-color: ${colors.gold}; border-radius: 50%; text-align: center; vertical-align: middle;">
                          <span style="color: ${colors.navyDeep}; font-weight: 700; font-size: 14px;">1</span>
                        </td>
                        <td style="padding-left: 16px;">
                          <p style="margin: 0; font-size: 15px; color: #4A5568; line-height: 1.5;">
                            <strong style="color: ${colors.navyDeep};">Review</strong> – We'll check availability for your requested dates
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; vertical-align: top;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="width: 32px; height: 32px; background-color: ${colors.gold}; border-radius: 50%; text-align: center; vertical-align: middle;">
                          <span style="color: ${colors.navyDeep}; font-weight: 700; font-size: 14px;">2</span>
                        </td>
                        <td style="padding-left: 16px;">
                          <p style="margin: 0; font-size: 15px; color: #4A5568; line-height: 1.5;">
                            <strong style="color: ${colors.navyDeep};">Confirm</strong> – We'll reach out within 24 hours with next steps
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; vertical-align: top;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="width: 32px; height: 32px; background-color: ${colors.gold}; border-radius: 50%; text-align: center; vertical-align: middle;">
                          <span style="color: ${colors.navyDeep}; font-weight: 700; font-size: 14px;">3</span>
                        </td>
                        <td style="padding-left: 16px;">
                          <p style="margin: 0; font-size: 15px; color: #4A5568; line-height: 1.5;">
                            <strong style="color: ${colors.navyDeep};">Book</strong> – Complete your reservation and prepare for your stay
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Contact Info -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(135deg, ${colors.navyDeep} 0%, ${colors.navyMedium} 100%); border-radius: 12px;">
                <tr>
                  <td style="padding: 24px; text-align: center;">
                    <p style="margin: 0 0 12px; font-size: 14px; color: ${colors.textMuted};">
                      Questions? We're here to help.
                    </p>
                    <p style="margin: 0;">
                      <a href="tel:8127683108" style="color: ${colors.gold}; font-size: 18px; font-weight: 600; text-decoration: none;">(812) 768-3108</a>
                    </p>
                    <p style="margin: 8px 0 0;">
                      <a href="mailto:booking@homestead-hill.com" style="color: ${colors.goldLight}; font-size: 14px; text-decoration: none;">booking@homestead-hill.com</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: ${colors.navyDeep}; padding: 30px 40px; border-radius: 0 0 16px 16px; text-align: center;">
              <p style="margin: 0 0 8px; font-size: 14px; color: ${colors.gold}; font-weight: 600;">
                Homestead Hill
              </p>
              <p style="margin: 0 0 16px; font-size: 13px; color: ${colors.textMuted};">
                Vincennes, Indiana
              </p>
              <p style="margin: 0; font-size: 12px; color: ${colors.textMuted};">
                © ${new Date().getFullYear()} Homestead Hill. All rights reserved.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const getAdminEmailTemplate = (booking: BookingRequest) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${getEmailStyles()}
</head>
<body style="margin: 0; padding: 0; background-color: ${colors.cream}; font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${colors.cream};">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; max-width: 600px;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(180deg, ${colors.navyDeep} 0%, ${colors.navyMedium} 100%); padding: 30px 40px; border-radius: 16px 16px 0 0;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td>
                    <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: ${colors.gold};">
                      Homestead Hill
                    </h1>
                  </td>
                  <td style="text-align: right;">
                    <span style="display: inline-block; background-color: ${colors.gold}; color: ${colors.navyDeep}; font-size: 12px; font-weight: 700; padding: 6px 12px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px;">
                      New Booking
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="background-color: ${colors.white}; padding: 40px;">
              <h2 style="margin: 0 0 24px; font-size: 22px; font-weight: 600; color: ${colors.navyDeep};">
                New Booking Request
              </h2>
              
              <!-- Guest Info -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${colors.cream}; border-radius: 12px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px;">
                    <h3 style="margin: 0 0 16px; font-size: 12px; font-weight: 600; color: ${colors.gold}; text-transform: uppercase; letter-spacing: 1px;">
                      Guest Information
                    </h3>
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="font-size: 14px; color: ${colors.textMuted};">Name:</span>
                          <span style="font-size: 15px; font-weight: 600; color: ${colors.navyDeep}; margin-left: 8px;">${booking.name}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="font-size: 14px; color: ${colors.textMuted};">Email:</span>
                          <a href="mailto:${booking.email}" style="font-size: 15px; font-weight: 600; color: ${colors.gold}; margin-left: 8px; text-decoration: none;">${booking.email}</a>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="font-size: 14px; color: ${colors.textMuted};">Phone:</span>
                          <a href="tel:${booking.phone}" style="font-size: 15px; font-weight: 600; color: ${colors.gold}; margin-left: 8px; text-decoration: none;">${booking.phone || 'Not provided'}</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Booking Details -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${colors.cream}; border-radius: 12px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px;">
                    <h3 style="margin: 0 0 16px; font-size: 12px; font-weight: 600; color: ${colors.gold}; text-transform: uppercase; letter-spacing: 1px;">
                      Booking Details
                    </h3>
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #E2E8F0;">
                          <span style="font-size: 14px; color: ${colors.textMuted};">Unit:</span>
                          <span style="font-size: 15px; font-weight: 600; color: ${colors.navyDeep}; margin-left: 8px;">${booking.unit}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #E2E8F0;">
                          <span style="font-size: 14px; color: ${colors.textMuted};">Check-in:</span>
                          <span style="font-size: 15px; font-weight: 600; color: ${colors.navyDeep}; margin-left: 8px;">${booking.checkIn}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #E2E8F0;">
                          <span style="font-size: 14px; color: ${colors.textMuted};">Check-out:</span>
                          <span style="font-size: 15px; font-weight: 600; color: ${colors.navyDeep}; margin-left: 8px;">${booking.checkOut}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #E2E8F0;">
                          <span style="font-size: 14px; color: ${colors.textMuted};">Duration:</span>
                          <span style="font-size: 15px; font-weight: 600; color: ${colors.navyDeep}; margin-left: 8px;">${booking.nights} nights</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #E2E8F0;">
                          <span style="font-size: 14px; color: ${colors.textMuted};">Guests:</span>
                          <span style="font-size: 15px; font-weight: 600; color: ${colors.navyDeep}; margin-left: 8px;">${booking.guests}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #E2E8F0;">
                          <span style="font-size: 14px; color: ${colors.textMuted};">Rate:</span>
                          <span style="font-size: 15px; font-weight: 600; color: ${colors.navyDeep}; margin-left: 8px;">${booking.rateType}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0 0;">
                          <span style="font-size: 14px; color: ${colors.textMuted};">Estimated Total:</span>
                          <span style="font-size: 20px; font-weight: 700; color: ${colors.gold}; margin-left: 8px;">$${booking.totalPrice.toLocaleString()}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              ${booking.message ? `
              <!-- Message -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${colors.cream}; border-radius: 12px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px;">
                    <h3 style="margin: 0 0 12px; font-size: 12px; font-weight: 600; color: ${colors.gold}; text-transform: uppercase; letter-spacing: 1px;">
                      Guest Message
                    </h3>
                    <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #4A5568;">
                      ${booking.message}
                    </p>
                  </td>
                </tr>
              </table>
              ` : ''}
              
              <!-- Quick Actions -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="padding-right: 8px;" width="50%">
                    <a href="mailto:${booking.email}?subject=Re: Your Homestead Hill Booking Request" style="display: block; background-color: ${colors.gold}; color: ${colors.navyDeep}; font-size: 14px; font-weight: 600; text-decoration: none; padding: 14px 20px; border-radius: 8px; text-align: center;">
                      Reply via Email
                    </a>
                  </td>
                  <td style="padding-left: 8px;" width="50%">
                    <a href="tel:${booking.phone}" style="display: block; background-color: ${colors.navyMedium}; color: ${colors.white}; font-size: 14px; font-weight: 600; text-decoration: none; padding: 14px 20px; border-radius: 8px; text-align: center; border: 1px solid ${colors.gold};">
                      Call Guest
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: ${colors.navyDeep}; padding: 20px 40px; border-radius: 0 0 16px 16px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: ${colors.textMuted};">
                This booking request was submitted via the Homestead Hill website.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

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
        from: "Homestead Hill <booking@homestead-hill.com>",
        to: ["booking@homestead-hill.com"],
        subject: `New Booking Request - ${booking.unit}`,
        html: getAdminEmailTemplate(booking),
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
        from: "Homestead Hill <booking@homestead-hill.com>",
        to: [booking.email],
        bcc: ["booking@homestead-hill.com"],
        subject: "We received your booking request - Homestead Hill",
        html: getGuestEmailTemplate(booking),
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
