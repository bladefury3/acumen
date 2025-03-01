
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@3.3.0'

// Set up CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Handle preflight OPTIONS request
const handleOptions = () => {
  return new Response(null, {
    headers: {
      ...corsHeaders,
      'Allow': 'POST, OPTIONS',
    },
  })
}

const createResourcesFromPrompt = async (prompt: string, lessonPlanId: string, client: any) => {
  console.log('Creating resources from prompt...')

  try {
    // Use OpenAI API key from environment variable
    const configuration = new Configuration({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    })
    const openai = new OpenAIApi(configuration)

    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are an experienced educator who creates supplementary teaching resources. 
          Format your response using markdown. Include teaching aids, worksheets, assessment tools, and additional exercises.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const resourcesContent = completion.data.choices[0]?.message?.content || 'Failed to generate resources.'
    console.log('Successfully generated content, saving to database...')

    // Insert the resources into the database
    const { data: resourcesData, error: resourcesError } = await client
      .from('lesson_resources')
      .insert({
        lesson_plan_id: lessonPlanId,
        content: resourcesContent,
      })
      .select('id')
      .single()

    if (resourcesError) {
      console.error('Error saving resources to database:', resourcesError)
      throw new Error(`Failed to save resources: ${resourcesError.message}`)
    }

    // Use a query to get the actual created record
    const { data: createdResource, error: fetchError } = await client
      .from('lesson_resources')
      .select('*')
      .eq('lesson_plan_id', lessonPlanId)
      .limit(1)

    if (fetchError) {
      console.error('Error fetching created resource:', fetchError)
      throw new Error(`Failed to fetch created resource: ${fetchError.message}`)
    }

    console.log('Resources saved successfully:', createdResource)
    return createdResource?.[0] || resourcesData
  } catch (error) {
    console.error('Error generating resources:', error)
    throw error
  }
}

serve(async (req: Request) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return handleOptions()
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Parse request body
    const requestData = await req.json()
    const { lessonPlanId } = requestData

    if (!lessonPlanId) {
      return new Response(JSON.stringify({ error: 'Missing lessonPlanId parameter' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log(`Generating resources for lesson plan: ${lessonPlanId}`)

    // Check if resources already exist
    const { data: existingResources, error: checkError } = await supabaseClient
      .from('lesson_resources')
      .select('*')
      .eq('lesson_plan_id', lessonPlanId)
      .limit(1)

    if (checkError) {
      console.error('Error checking for existing resources:', checkError)
    } else if (existingResources && existingResources.length > 0) {
      console.log('Resources already exist for this lesson plan')
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Resources already exist',
          resources: existingResources[0],
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch lesson plan details
    const { data: lessonPlan, error: lessonPlanError } = await supabaseClient
      .from('lesson_plans')
      .select('*')
      .eq('id', lessonPlanId)
      .limit(1)

    if (lessonPlanError || !lessonPlan || lessonPlan.length === 0) {
      console.error('Error fetching lesson plan:', lessonPlanError)
      return new Response(
        JSON.stringify({
          error: `Failed to fetch lesson plan: ${lessonPlanError?.message || 'Lesson plan not found'}`,
        }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Fetch lesson details
    const { data: lessonDetails, error: lessonError } = await supabaseClient
      .from('lessons')
      .select('*')
      .eq('response_id', lessonPlanId)
      .limit(1)

    if (lessonError) {
      console.error('Error fetching lesson details:', lessonError)
      return new Response(
        JSON.stringify({
          error: `Failed to fetch lesson details: ${lessonError.message}`,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }
    
    // If no lesson details found, try again with a short delay
    // This helps with race conditions between lesson creation and resource generation
    if (!lessonDetails || lessonDetails.length === 0) {
      console.log('Lesson details not found, retrying after delay...')
      
      // Wait for 3 seconds
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Retry fetch
      const { data: retryLessonDetails, error: retryError } = await supabaseClient
        .from('lessons')
        .select('*')
        .eq('response_id', lessonPlanId)
        .limit(1)
        
      if (retryError || !retryLessonDetails || retryLessonDetails.length === 0) {
        console.error('Error on retry fetching lesson details:', retryError)
        return new Response(
          JSON.stringify({
            error: 'Lesson details not found after retry. Please try again later.',
          }),
          {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }
      
      // Use the retry results
      lessonDetails[0] = retryLessonDetails[0]
    }

    // Fetch activities
    const { data: activities, error: activitiesError } = await supabaseClient
      .from('activities_detail')
      .select('*')
      .eq('lesson_id', lessonDetails[0].id)

    if (activitiesError) {
      console.error('Error fetching activities:', activitiesError)
    }

    // Create prompt for resource generation
    const prompt = `
      Create teaching resources for the following lesson:
      
      Grade level: ${lessonPlan[0].grade}
      Subject: ${lessonPlan[0].subject}
      Duration: ${lessonPlan[0].duration} minutes
      
      Objectives:
      ${lessonPlan[0].objectives}
      
      Key parts of the lesson:
      - Learning objectives: ${lessonDetails[0].learning_objectives}
      - Materials and resources: ${lessonDetails[0].materials_resources}
      - Introduction/hook: ${lessonDetails[0].introduction_hook}
      ${activities && activities.length > 0 
        ? `- Activities: ${activities.map(a => `${a.activity_name} (${a.description})`).join(', ')}` 
        : ''}
      - Assessment strategies: ${lessonDetails[0].assessment_strategies}
      - Differentiation strategies: ${lessonDetails[0].differentiation_strategies}
      
      Please create the following:
      1. At least 2 printable worksheets or handouts
      2. An assessment rubric
      3. Additional activity ideas
      4. A list of discussion questions
      5. Suggested further reading or resources
      
      Format each section with clear markdown headings.
    `

    // Generate resources
    const resources = await createResourcesFromPrompt(prompt, lessonPlanId, supabaseClient)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Resources generated successfully',
        resources,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in generate-resources function:', error)
    return new Response(
      JSON.stringify({
        error: `Internal server error: ${error.message}`,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
