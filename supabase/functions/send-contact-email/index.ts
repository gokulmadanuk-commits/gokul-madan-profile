
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactEmailRequest {
  name: string;
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email }: ContactEmailRequest = await req.json();

    console.log('Sending email with data:', { name, email });

    const emailResponse = await resend.emails.send({
      from: "Unity Advisory <noreply@xolution.io>",
      to: ["gokulmadan2@gmail.com"],
      reply_to: email,
      subject: "Unity Advisory Connect - New Contact Request",
      html: `
        <p>Hi Gokul,</p>
        <p>You have received a new contact request from your Unity Advisory website.</p>
        <br>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <br>
        <p><strong>Message:</strong></p>
        <p>This is ${name} reaching out after seeing your website. Please reach back out to me so we can schedule time to connect.</p>
        <br>
        <p>You can reply directly to this email to respond to ${name}.</p>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
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
