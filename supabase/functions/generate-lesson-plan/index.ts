
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    const { objectives, grade, subject, funElements, duration, curriculum, learningTools, learningNeeds, activities, assessments } = await req.json();

    // Prepare the prompt for OpenAI
    const systemPrompt = "Act as an expert instructional designer to create a lesson plan from the following information";
    const promptText = `
      Create a detailed lesson plan with the following parameters:
      
      Objectives: ${objectives}
      Grade Level: ${grade}
      Subject: ${subject}
      Fun Elements: ${funElements}
      Duration: ${duration} minutes
      Curriculum: ${curriculum}
      Learning Tools: ${learningTools?.join(', ') || 'None specified'}
      Learning Needs: ${learningNeeds?.join(', ') || 'None specified'}
      Activities: ${activities?.join(', ') || 'None specified'}
      Assessment Methods: ${assessments?.join(', ') || 'None specified'}
      
      Please structure the lesson plan with clear sections for:
      1. Learning Objectives
      2. Materials and Resources
      3. Introduction/Hook
      4. Main Activities
      5. Assessment Strategies
      6. Differentiation Strategies
      7. Closure
    `.trim();

    console.log('Making request to OpenAI with prompt:', promptText);

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: promptText }
        ],
      }),
    });

    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.json();
      console.error('OpenAI API Error:', errorData);
      throw new Error(errorData.error?.message || 'Failed to generate lesson plan');
    }

    const data = await openAIResponse.json();
    console.log('OpenAI Response:', data);

    const generatedLessonPlan = data.choices[0].message.content;

    return new Response(JSON.stringify({ response: generatedLessonPlan }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error in generate-lesson-plan function:', error);
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
