
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

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
      Learning Tools: ${learningTools.join(', ')}
      Learning Needs: ${learningNeeds.join(', ')}
      Activities: ${activities.join(', ')}
      Assessment Methods: ${assessments.join(', ')}
      
      Please structure the lesson plan with clear sections for:
      1. Learning Objectives
      2. Materials and Resources
      3. Introduction/Hook
      4. Main Activities
      5. Assessment Strategies
      6. Differentiation Strategies
      7. Closure
    `;

    // Call OpenAI API
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
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
      const error = await openAIResponse.json();
      throw new Error(error.error?.message || 'Failed to generate lesson plan');
    }

    const data = await openAIResponse.json();
    const generatedLessonPlan = data.choices[0].message.content;

    return new Response(JSON.stringify({ response: generatedLessonPlan }), {
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
