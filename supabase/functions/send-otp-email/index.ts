import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OTPEmailRequest {
  email: string;
  otp: string;
  userName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-otp-email function called");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, otp, userName }: OTPEmailRequest = await req.json();
    
    console.log(`Sending OTP email to: ${email}`);

    if (!email || !otp) {
      console.error("Missing required fields: email or otp");
      return new Response(
        JSON.stringify({ error: "Email and OTP are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const emailResponse = await resend.emails.send({
      from: "Bumex <noreply@verify.bumex.mr>",
      to: [email],
      subject: "Your Bumex Login Verification Code",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
          <div style="max-width: 480px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
            <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 32px 24px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">BUMEX</h1>
              <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0; font-size: 14px;">Audit Management System</p>
            </div>
            
            <div style="padding: 32px 24px;">
              <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 20px;">Verification Code</h2>
              <p style="color: #6b7280; margin: 0 0 24px 0; font-size: 15px; line-height: 1.5;">
                Hello${userName ? ` ${userName}` : ''},<br><br>
                Enter this code to complete your sign-in:
              </p>
              
              <div style="background-color: #f3f4f6; border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 24px;">
                <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #1e40af; font-family: 'Courier New', monospace;">${otp}</span>
              </div>
              
              <p style="color: #9ca3af; margin: 0 0 16px 0; font-size: 13px; text-align: center;">
                This code will expire in <strong>5 minutes</strong>
              </p>
              
              <div style="border-top: 1px solid #e5e7eb; padding-top: 24px; margin-top: 24px;">
                <p style="color: #9ca3af; margin: 0; font-size: 12px; line-height: 1.5;">
                  If you didn't request this code, please ignore this email or contact support if you have concerns.
                </p>
              </div>
            </div>
            
            <div style="background-color: #f9fafb; padding: 16px 24px; text-align: center;">
              <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                © ${new Date().getFullYear()} Bumex. All rights reserved.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-otp-email function:", error);
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
