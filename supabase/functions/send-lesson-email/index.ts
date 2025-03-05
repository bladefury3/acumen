
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@1.0.0";

const resendApiKey = Deno.env.get('RESEND_API_KEY');
const resend = new Resend(resendApiKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LessonEmailRequest {
  userEmail: string;
  lessonTitle: string;
  lessonObjectives: string;
  lessonId: string;
  subject: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!resendApiKey) {
      throw new Error('Resend API key is not configured');
    }

    const { userEmail, lessonTitle, lessonObjectives, lessonId, subject } = await req.json() as LessonEmailRequest;
    
    if (!userEmail || !lessonTitle || !lessonId) {
      throw new Error('Missing required fields');
    }

    // Use the fixed fallback URL
    const appBaseUrl = 'https://acumen.lovable.app';
    
    // Create a valid lesson URL for the dashboard path
    const lessonUrl = `${appBaseUrl}/lesson-plan/${lessonId}`;
    
    console.log(`Email link will direct to: ${lessonUrl}`);
    
    // Send the email
    const { data, error } = await resend.emails.send({
      from: 'Sid from Acumen <acumen@sidharath.com>',
      to: [userEmail],
      subject: `Download: ${subject}: ${lessonObjectives.substring(0, 50)}${lessonObjectives.length > 50 ? '...' : ''}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #003C5A; font-size: 24px;">Your Lesson Plan is Ready!</h1>
          <p>You recently downloaded the following lesson plan:</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h2 style="color: #003C5A; margin-top: 0;">${lessonTitle}</h2>
            <p><strong>Objectives:</strong> ${lessonObjectives}</p>
          </div>
          <p>Click the button below to download your lesson plan again:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${lessonUrl}" 
               style="background-color: #003C5A; color: #C3CFF5; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: bold; display: inline-block;">
              Download Lesson Plan
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">If you have any questions or need assistance, please contact our support team.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; font-size: 12px;">© 2024 TeachAssist. All rights reserved.</p>
        </div>
      `,
    });

    if (error) {
      console.error('Email sending error:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    console.log('Email sent successfully:', data);

    return new Response(JSON.stringify({ success: true, message: 'Email sent successfully' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error in send-lesson-email function:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error',
        details: error.toString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
