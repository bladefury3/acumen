
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { OpenAI } from "https://esm.sh/openai@4.10.0";
import { Groq } from "https://esm.sh/groq-sdk@0.5.0";

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize supabase client with deno env var
const supabaseClient = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get request body
    const { lessonPlanId } = await req.json();

    if (!lessonPlanId) {
      return new Response(
        JSON.stringify({ success: false, error: "Lesson plan ID is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log(`Generating resources for lesson plan: ${lessonPlanId}`);

    // Check if resources already exist
    const { data: existingResources, error: checkError } = await supabaseClient
      .from('lesson_resources')
      .select('id')
      .eq('lesson_plan_id', lessonPlanId)
      .limit(1);

    if (checkError) {
      console.error(`Error checking for existing resources: ${checkError.message}`);
      throw new Error(`Database error when checking existing resources: ${checkError.message}`);
    }

    if (existingResources && existingResources.length > 0) {
      console.log(`Resources already exist for lesson plan: ${lessonPlanId}`);
      return new Response(
        JSON.stringify({ success: true, resources: existingResources[0] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the lesson plan data
    const { data: lessonPlan, error: lessonError } = await supabaseClient
      .from('lesson_plans')
      .select('*')
      .eq('id', lessonPlanId)
      .single();

    if (lessonError) {
      console.error(`Error fetching lesson plan: ${lessonError.message}`);
      throw new Error(`Database error when fetching lesson plan: ${lessonError.message}`);
    }

    if (!lessonPlan) {
      return new Response(
        JSON.stringify({ success: false, error: "Lesson plan not found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    // Try to use either OpenAI or Groq API based on available keys
    let resourcesContent = "";
    
    if (Deno.env.get("OPENAI_API_KEY")) {
      // Use OpenAI
      const openai = new OpenAI({
        apiKey: Deno.env.get("OPENAI_API_KEY") || "",
      });

      const prompt = generateResourcesPrompt(lessonPlan);
      
      console.log("Calling OpenAI API to generate resources...");
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 2000,
      });

      resourcesContent = completion.choices[0]?.message?.content || "";
    } 
    else if (Deno.env.get("GROQ_API_KEY")) {
      // Use Groq as fallback
      const groq = new Groq({
        apiKey: Deno.env.get("GROQ_API_KEY") || "",
      });
      
      const prompt = generateResourcesPrompt(lessonPlan);
      
      console.log("Calling Groq API to generate resources...");
      const completion = await groq.chat.completions.create({
        model: "llama3-8b-8192",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 2000, 
      });

      resourcesContent = completion.choices[0]?.message?.content || "";
    } 
    else {
      throw new Error("No AI API key configured (OPENAI_API_KEY or GROQ_API_KEY)");
    }

    if (!resourcesContent) {
      throw new Error("Failed to generate resources content");
    }

    // Store in database
    const { data: resources, error: insertError } = await supabaseClient
      .from('lesson_resources')
      .insert({
        lesson_plan_id: lessonPlanId,
        content: resourcesContent,
      })
      .select()
      .single();

    if (insertError) {
      console.error(`Error inserting resources: ${insertError.message}`);
      throw new Error(`Database error when inserting resources: ${insertError.message}`);
    }

    console.log(`Resources generated successfully for lesson plan: ${lessonPlanId}`);
    return new Response(
      JSON.stringify({ success: true, resources }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error(`Error in generate-resources function: ${error.message}`);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

// Generate a comprehensive prompt for creating resources based on the lesson plan
function generateResourcesPrompt(lessonPlan) {
  return `Create a comprehensive set of teaching resources for the following lesson plan:

Subject: ${lessonPlan.subject}
Grade Level: ${lessonPlan.grade}
Duration: ${lessonPlan.duration}
Objectives: ${lessonPlan.objectives}
${lessonPlan.fun_elements ? `Fun Elements: ${lessonPlan.fun_elements}` : ''}

Based on this lesson plan, create the following teaching resources:

1. A detailed worksheet for students that covers the main concepts
2. An assessment activity or quiz to measure learning
3. At least one extension activity for advanced students
4. A list of additional resources (websites, books, videos) that complement the lesson
5. Teaching tips and common misconceptions to watch for

Format each section with clear headings using markdown format (# for main headings, ## for subheadings).
Make each resource practical, age-appropriate, and directly aligned with the lesson objectives.
Include clear instructions for using each resource.
`;
}
