
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.48.1'
import { Groq } from 'https://esm.sh/groq-sdk@0.4.0';

// Initialize Groq client
const groq = new Groq({
  apiKey: Deno.env.get('GROQ_API_KEY'),
});

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create Supabase client
const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? '',
);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get request body
    const { lessonPlanId } = await req.json();

    if (!lessonPlanId) {
      console.error('Missing lessonPlanId in request');
      return new Response(
        JSON.stringify({ success: false, error: 'Missing lessonPlanId parameter' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`Generating resources for lesson plan ID: ${lessonPlanId}`);

    // Get existing lesson plan
    const { data: lessonPlan, error: lessonPlanError } = await supabaseClient
      .from('lesson_plans')
      .select('*')
      .eq('id', lessonPlanId)
      .maybeSingle();

    if (lessonPlanError) {
      console.error('Error fetching lesson plan:', lessonPlanError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to fetch lesson plan' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    if (!lessonPlan) {
      console.error('Lesson plan not found');
      return new Response(
        JSON.stringify({ success: false, error: 'Lesson plan not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // Check for existing resources
    const { data: existingResources, error: existingError } = await supabaseClient
      .rpc('get_lesson_resources_by_lesson_id', { p_lesson_plan_id: lessonPlanId });

    if (existingError) {
      console.error('Error checking for existing resources:', existingError);
    } else if (existingResources && existingResources.length > 0) {
      console.log('Resources already exist for this lesson plan');
      return new Response(
        JSON.stringify({ success: true, resources: existingResources[0] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Optionally retrieve more lesson details
    const { data: lessonDetails, error: lessonDetailsError } = await supabaseClient
      .from('lessons')
      .select('*')
      .eq('response_id', lessonPlanId)
      .limit(1);  // Use limit(1) instead of single()

    if (lessonDetailsError) {
      console.error('Error fetching lesson details:', lessonDetailsError);
    }

    const lessonDetail = lessonDetails && lessonDetails.length > 0 ? lessonDetails[0] : null;

    // Combine info for the Groq prompt
    const lessonInfo = {
      grade: lessonPlan.grade,
      subject: lessonPlan.subject,
      objectives: lessonPlan.objectives,
      duration: lessonPlan.duration,
      curriculum: lessonPlan.curriculum,
      learningObjectives: lessonDetail?.learning_objectives || '',
      materialsResources: lessonDetail?.materials_resources || '',
      introductionHook: lessonDetail?.introduction_hook || '',
      assessmentStrategies: lessonDetail?.assessment_strategies || '',
      differentiationStrategies: lessonDetail?.differentiation_strategies || '',
      activities: lessonPlan.activities?.join(', ') || '',
      aiResponse: lessonPlan.ai_response || '',
    };

    console.log('Generating resources with Groq');

    // Generate resources using Groq
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an expert educational resource creator. Create comprehensive teaching resources tailored to the specific lesson provided, including handouts, worksheets, assessment tools, and additional reference materials.`
        },
        {
          role: "user",
          content: `Create comprehensive teaching resources for a ${lessonInfo.grade} ${lessonInfo.subject} lesson with the following details:
          
          LESSON OBJECTIVES: ${lessonInfo.objectives}
          GRADE LEVEL: ${lessonInfo.grade}
          SUBJECT: ${lessonInfo.subject}
          DURATION: ${lessonInfo.duration} minutes
          CURRICULUM: ${lessonInfo.curriculum}
          
          LEARNING OBJECTIVES: ${lessonInfo.learningObjectives}
          MATERIALS/RESOURCES NEEDED: ${lessonInfo.materialsResources}
          INTRODUCTION/HOOK: ${lessonInfo.introductionHook}
          ASSESSMENT STRATEGIES: ${lessonInfo.assessmentStrategies}
          DIFFERENTIATION STRATEGIES: ${lessonInfo.differentiationStrategies}
          
          Please create the following resources in markdown format:
          1. A student worksheet or handout related to the lesson
          2. An assessment tool (quiz, rubric, or checklist)
          3. Additional teacher reference materials or extension activities
          4. Recommendations for supplementary resources (books, websites, videos)
          
          Format your response clearly with markdown headings and sections.`
        }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.5,
      max_tokens: 4000,
    });

    const resourcesContent = completion.choices[0]?.message?.content || '';
    
    if (!resourcesContent) {
      console.error('Empty response from Groq');
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to generate resources content' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    console.log('Resources generated successfully, saving to database...');

    // Insert the generated resources into the database
    const { data: resources, error: resourcesError } = await supabaseClient
      .from('lesson_resources')
      .insert({
        lesson_plan_id: lessonPlanId,
        content: resourcesContent
      })
      .select()
      .single();

    if (resourcesError) {
      console.error('Error storing resources:', resourcesError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to store resources' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ success: true, resources }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'An unexpected error occurred' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
