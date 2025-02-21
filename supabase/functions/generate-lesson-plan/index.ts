
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const MAKE_WEBHOOK_URL = 'https://hook.us2.make.com/groq3rplo938ylgs0ka27kz0jakgfh6c';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { objectives, grade, subject, funElements, duration, curriculum, learningTools, learningNeeds, activities, assessments } = await req.json();

    // Prepare the text for the webhook
    const promptText = `
      Create a detailed lesson plan with the following parameters:
      Objectives: ${objectives}
      Grade Level: ${grade}
      Subject: ${subject}
      Fun Elements: ${funElements}
      Duration: ${duration} minutes
      Curriculum: ${curriculum}
      Learning Tools: ${learningTools.join(', ')}
      Learning Needs: ${learningNeeds.join(', ')}
      Activities: ${activities.join(', ')}
      Assessment Methods: ${assessments.join(', ')}
    `;

    // Call the Make.com webhook
    const webhookResponse = await fetch(MAKE_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: promptText }),
    });

    const responseText = await webhookResponse.text();

    return new Response(JSON.stringify({ response: responseText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
