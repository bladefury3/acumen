
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the request body
    const requestData = await req.json();
    const { lessonPlanId } = requestData;

    if (!lessonPlanId) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Missing required parameter: lessonPlanId" 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400
        }
      );
    }

    // Get the lesson plan details to include in prompt
    const { data: lessonPlan, error: lessonError } = await supabaseClient
      .from('lesson_plans')
      .select('*')
      .eq('id', lessonPlanId)
      .single();

    if (lessonError) {
      console.error('Error fetching lesson plan:', lessonError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to fetch lesson plan details" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500
        }
      );
    }

    // Get any related lesson details from the lessons table
    const { data: lessonDetails } = await supabaseClient
      .from('lessons')
      .select('*')
      .eq('response_id', lessonPlanId)
      .single();

    // Get activities
    const { data: activities } = await supabaseClient
      .from('activities_detail')
      .select('*')
      .eq('lesson_id', lessonDetails?.id || '');

    // Create the prompt for generating resources
    const prompt = `
      Generate comprehensive teaching resources for the following lesson plan:
      
      LESSON PLAN DETAILS:
      - Grade: ${lessonPlan.grade}
      - Subject: ${lessonPlan.subject}
      - Duration: ${lessonPlan.duration} minutes
      - Objectives: ${lessonPlan.objectives}
      
      ${lessonDetails ? `
      LESSON STRUCTURE:
      - Learning Objectives: ${lessonDetails.learning_objectives}
      - Materials and Resources: ${lessonDetails.materials_resources}
      - Introduction/Hook: ${lessonDetails.introduction_hook}
      - Assessment Strategies: ${lessonDetails.assessment_strategies}
      - Differentiation Strategies: ${lessonDetails.differentiation_strategies}
      - Closure: ${lessonDetails.close}
      ` : ''}
      
      ${activities && activities.length > 0 ? `
      ACTIVITIES:
      ${activities.map((activity, index) => 
        `${index + 1}. ${activity.activity_name} (${activity.description})
         ${activity.instructions}`
      ).join('\n\n')}
      ` : ''}
      
      Generate the following resources:
      1. A worksheet for students with 5-10 questions or activities related to the lesson content
      2. An answer key for the worksheet
      3. Extension activities for advanced students
      4. Simplified version of activities for students who need additional support
      5. Assessment tools (rubric, quiz, or other evaluation methods)
      
      Format the resources clearly with appropriate headers, numbered lists, and sections.
    `;

    console.log("Generating resources for lesson plan:", lessonPlanId);

    // Check if you have access to OpenAI or Groq, you only need one working
    const apiKey = Deno.env.get('OPENAI_API_KEY') || Deno.env.get('GROQ_API_KEY');
    let modelHost = Deno.env.get('OPENAI_API_KEY') ? 'openai' : 'groq';
    const model = modelHost === 'openai' ? 'gpt-3.5-turbo' : 'llama3-8b-8192';
    
    if (!apiKey) {
      console.error('No API key found for OpenAI or Groq');
      return new Response(
        JSON.stringify({ success: false, error: "No API key configured" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500
        }
      );
    }

    // Call the AI model to generate resources
    const response = modelHost === 'openai' 
      ? await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: model,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 2000,
          }),
        })
      : await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: model,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 2000,
          }),
        });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Error calling AI model:', errorData);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to generate resources" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500
        }
      );
    }

    const aiResponse = await response.json();
    const resourcesContent = modelHost === 'openai' 
      ? aiResponse.choices[0].message.content
      : aiResponse.choices[0].message.content;

    // Save the generated resources to the database
    const { data: resources, error: resourcesError } = await supabaseClient
      .from('lesson_resources')
      .insert({
        lesson_plan_id: lessonPlanId,
        content: resourcesContent,
      })
      .select('*')
      .single();

    if (resourcesError) {
      console.error('Error saving resources:', resourcesError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to save resources" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500
        }
      );
    }

    return new Response(
      JSON.stringify({ success: true, resources }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error" }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      }
    );
  }
});
