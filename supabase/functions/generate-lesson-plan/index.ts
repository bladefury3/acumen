
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { Groq } from "npm:@groq/groq";

const groqApiKey = Deno.env.get('GROQ_API_KEY');

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
    if (!groqApiKey) {
      throw new Error('Groq API key is not configured');
    }

    const groq = new Groq({
      apiKey: groqApiKey,
    });

    const { objectives, grade, subject, funElements, duration, curriculum, learningTools, learningNeeds, activities, assessments } = await req.json();

    // Prepare the prompt for Groq
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

    console.log('Making request to Groq with prompt:', promptText);

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: promptText }
      ],
      model: "llama2-70b-4096",
    });

    const generatedLessonPlan = completion.choices[0]?.message?.content;

    if (!generatedLessonPlan) {
      throw new Error('No lesson plan was generated');
    }

    console.log('Groq Response received');

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
