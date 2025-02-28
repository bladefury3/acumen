
// Follow this setup guide to integrate the Deno runtime into your application:
// https://deno.land/manual/examples/deploy_node_npm

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

Deno.serve(async (req) => {
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
      .single();

    if (lessonPlanError) {
      console.error('Error fetching lesson plan:', lessonPlanError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to fetch lesson plan' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // First check if resources already exist for this lesson
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

    // Get more detailed information from the lessons table if available
    const { data: lessonDetails, error: lessonDetailsError } = await supabaseClient
      .from('lessons')
      .select('*')
      .eq('response_id', lessonPlanId)
      .maybeSingle();

    if (lessonDetailsError) {
      console.error('Error fetching lesson details:', lessonDetailsError);
    }

    // Combine basic and detailed information for the prompt
    const lessonInfo = {
      grade: lessonPlan.grade,
      subject: lessonPlan.subject,
      objectives: lessonPlan.objectives,
      duration: lessonPlan.duration,
      curriculum: lessonPlan.curriculum,
      learningObjectives: lessonDetails?.learning_objectives || '',
      materialsResources: lessonDetails?.materials_resources || '',
      introductionHook: lessonDetails?.introduction_hook || '',
      assessmentStrategies: lessonDetails?.assessment_strategies || '',
      differentiationStrategies: lessonDetails?.differentiation_strategies || '',
      activities: lessonPlan.activities?.join(', ') || '',
      aiResponse: lessonPlan.ai_response || '',
    };

    console.log('Generating resources with Groq');
    
    // Generate resources using Groq
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an expert educational resource creator. Your task is to create a detailed set of teaching resources for a lesson plan. 
          Format your response with clear markdown headings and bullet points. Include:
          1. Student worksheets with questions
          2. Teacher handouts with answer keys
          3. Assessment materials aligned to learning objectives
          4. Extension activity ideas for differentiated learning
          5. Visual aids descriptions or templates 
          6. Formative assessment questions
          
          Make all resources directly usable in a classroom setting. Use clear organization with proper headings, subheadings, and concise instructions.`
        },
        {
          role: "user",
          content: `Create comprehensive teaching resources for a ${lessonInfo.grade} ${lessonInfo.subject} lesson with the following details:
          
          LESSON OBJECTIVES: ${lessonInfo.objectives}
          
          DURATION: ${lessonInfo.duration}
          
          CURRICULUM STANDARDS: ${lessonInfo.curriculum}
          
          LEARNING OBJECTIVES: ${lessonInfo.learningObjectives}
          
          MATERIALS AND RESOURCES: ${lessonInfo.materialsResources}
          
          INTRODUCTION/HOOK: ${lessonInfo.introductionHook}
          
          ASSESSMENT STRATEGIES: ${lessonInfo.assessmentStrategies}
          
          DIFFERENTIATION STRATEGIES: ${lessonInfo.differentiationStrategies}
          
          ACTIVITIES: ${lessonInfo.activities}
          
          Create complete resources ready for classroom use focusing on worksheets, assessment materials, teacher guides, and visual aids.`
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

    // Store the generated resources in the database
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
