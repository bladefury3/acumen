
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.6";

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const openAIApiKey = Deno.env.get('OPENAI_API_KEY') || '';

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
    const { lessonPlanId } = await req.json();
    console.log(`Generating resources for lesson plan: ${lessonPlanId}`);

    // Check if we already have resources for this lesson
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data: existingResources } = await supabase
      .from('lesson_resources')
      .select('*')
      .eq('lesson_plan_id', lessonPlanId)
      .single();

    if (existingResources) {
      console.log("Resources already exist for this lesson plan");
      return new Response(
        JSON.stringify({
          success: true,
          message: "Resources already exist for this lesson plan",
          resources: existingResources
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the lesson plan details
    const { data: lessonPlan, error: lessonError } = await supabase
      .from('lesson_plans')
      .select('*')
      .eq('id', lessonPlanId)
      .single();

    if (lessonError || !lessonPlan) {
      console.error("Error fetching lesson plan:", lessonError);
      return new Response(
        JSON.stringify({ success: false, error: "Lesson plan not found" }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get associated lesson details
    const { data: lessonData, error: lessonDataError } = await supabase
      .from('lessons')
      .select('*')
      .eq('response_id', lessonPlanId)
      .single();

    if (lessonDataError) {
      console.error("Error fetching lesson details:", lessonDataError);
      return new Response(
        JSON.stringify({ success: false, error: "Lesson details not found" }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get activities
    const { data: activities, error: activitiesError } = await supabase
      .from('activities_detail')
      .select('*')
      .eq('lesson_id', lessonData.id);

    if (activitiesError) {
      console.error("Error fetching activities:", activitiesError);
      // Continue anyway as we can generate resources without activities
    }

    // Construct the LLM prompt based on lesson plan data
    const prompt = `
Create comprehensive teaching resources for a lesson plan with the following details:

SUBJECT: ${lessonPlan.subject}
GRADE LEVEL: ${lessonPlan.grade}
DURATION: ${lessonPlan.duration}
OBJECTIVES: ${lessonPlan.objectives}
CURRICULUM STANDARDS: ${lessonPlan.curriculum}

LEARNING OBJECTIVES: ${lessonData.learning_objectives || 'Not specified'}
MATERIALS NEEDED: ${lessonData.materials_resources || 'Not specified'}
INTRODUCTION/HOOK: ${lessonData.introduction_hook || 'Not specified'}
ASSESSMENT STRATEGIES: ${lessonData.assessment_strategies || 'Not specified'}
DIFFERENTIATION STRATEGIES: ${lessonData.differentiation_strategies || 'Not specified'}

ACTIVITIES:
${activities && activities.length > 0 
  ? activities.map(act => `- ${act.activity_name}: ${act.description}`).join('\n')
  : 'No specific activities provided'}

Please create the following resources to support this lesson plan:
1. STUDENT WORKSHEETS: Create 1-2 worksheets that align with the learning objectives
2. ASSESSMENT MATERIALS: Create quizzes, rubrics, or other assessment tools
3. VISUAL AIDS: Describe any visual aids or handouts that would support the lesson
4. EXTENSION ACTIVITIES: Provide 2-3 extension activities for advanced students
5. ADDITIONAL RESOURCES: List any helpful websites, books, or materials teachers could use

Format each section with clear headings, and provide ready-to-use materials that a teacher could print and distribute.
`;

    // Call the OpenAI API
    console.log("Calling OpenAI API to generate resources");
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert educator who creates high-quality teaching materials and resources.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.text();
      console.error("OpenAI API error:", errorData);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to generate resources" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await openAIResponse.json();
    const generatedResources = aiData.choices[0].message.content;

    // Store the generated resources in the database
    const { data: savedResources, error: saveError } = await supabase
      .from('lesson_resources')
      .insert({
        lesson_plan_id: lessonPlanId,
        content: generatedResources,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (saveError) {
      console.error("Error saving resources:", saveError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to save resources" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Resources generated and saved successfully");
    return new Response(
      JSON.stringify({
        success: true,
        resources: savedResources
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
