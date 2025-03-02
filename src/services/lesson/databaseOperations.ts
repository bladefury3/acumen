
import { supabase } from "@/integrations/supabase/client";
import { ParsedLesson } from "./types";

export const cleanExistingLessonData = async (responseId: string) => {
  try {
    // First get all activities_detail ids to delete their instructions
    const { data: activitiesData, error: activitiesFetchError } = await supabase
      .from('activities_detail')
      .select('id')
      .eq('lesson_id', responseId);

    if (activitiesFetchError) {
      console.error('Error fetching activities:', activitiesFetchError);
      throw new Error('Failed to fetch activities for cleaning');
    }

    // Delete instructions for each activity
    if (activitiesData && activitiesData.length > 0) {
      const activityIds = activitiesData.map(activity => activity.id);
      
      for (const activityId of activityIds) {
        const { error: instructionsError } = await supabase
          .from('instructions')
          .delete()
          .eq('activities_detail_id', activityId);

        if (instructionsError) {
          console.error(`Error cleaning instructions for activity ${activityId}:`, instructionsError);
          // Continue with deletion even if some instructions fail
        }
      }
    }

    // Now delete activities and lessons
    await supabase
      .from('activities_detail')
      .delete()
      .eq('lesson_id', responseId);

    await supabase
      .from('lessons')
      .delete()
      .eq('response_id', responseId);
  } catch (error) {
    console.error('Error cleaning up existing data:', error);
    throw new Error('Failed to clean up existing data before saving new lesson plan');
  }
};

export const createNewLesson = async (responseId: string, parsedLesson: ParsedLesson) => {
  try {
    // Check if lesson plan exists
    const { data: lessonPlanCheck, error: checkError } = await supabase
      .from('lesson_plans')
      .select('id')
      .eq('id', responseId)
      .single();
      
    if (checkError) {
      console.error('Error checking lesson plan:', checkError);
      throw new Error(`Lesson plan with ID ${responseId} not found. Cannot create lesson.`);
    }
    
    const { data: newLesson, error: lessonError } = await supabase
      .from('lessons')
      .insert({
        response_id: responseId,
        learning_objectives: parsedLesson.learning_objectives,
        materials_resources: parsedLesson.materials_resources,
        introduction_hook: parsedLesson.introduction_hook,
        assessment_strategies: parsedLesson.assessment_strategies,
        differentiation_strategies: parsedLesson.differentiation_strategies,
        close: parsedLesson.close
      })
      .select('id')
      .single();

    if (lessonError) {
      console.error('Error creating lesson:', lessonError);
      throw lessonError;
    }
    
    return newLesson;
  } catch (error) {
    console.error('Error creating new lesson:', error);
    throw error;
  }
};

// Helper function to clean instruction text
const cleanInstructionText = (text: string): string => {
  if (!text || text.trim().length < 5) {
    return "Complete this step of the activity.";
  }

  // Remove bullet points, numbers, and leading/trailing whitespace
  let cleaned = text.replace(/^[-•*]\s+|\d+[).]\s+/, '').trim();
  
  // Ensure the text ends with a period if it doesn't already
  if (cleaned && !cleaned.endsWith('.') && !cleaned.endsWith('?') && !cleaned.endsWith('!')) {
    cleaned += '.';
  }
  
  return cleaned;
};

export const createActivities = async (lessonId: string, activities: ParsedLesson['activities']) => {
  if (!activities || activities.length === 0) {
    console.warn('No activities to create for lesson ID:', lessonId);
    return;
  }

  console.log(`Creating ${activities.length} activities for lesson ID: ${lessonId}`);
  
  for (const activity of activities) {
    try {
      console.log(`Creating activity: ${activity.activity_name} for lesson ID: ${lessonId}`);
      
      // Create the activity detail record
      const { data: newActivity, error: activityError } = await supabase
        .from('activities_detail')
        .insert({
          lesson_id: lessonId,
          activity_name: activity.activity_name,
          duration: activity.duration || '0 minutes'
        })
        .select('id')
        .single();

      if (activityError) {
        console.error(`Error creating activity ${activity.activity_name}:`, activityError);
        throw activityError;
      }

      // Process and insert instructions
      let instructionsToInsert = [];
      
      if (activity.steps && activity.steps.length > 0) {
        // Clean each step and add to insert array
        instructionsToInsert = activity.steps
          .filter(text => text && text.trim().length > 0)
          .map(instruction_text => ({
            instruction_text: cleanInstructionText(instruction_text),
            activities_detail_id: newActivity.id
          }));
      }

      // If no steps were parsed, create at least one from the activity name
      if (instructionsToInsert.length === 0) {
        instructionsToInsert.push({
          instruction_text: `Complete the ${activity.activity_name} activity.`,
          activities_detail_id: newActivity.id
        });
      }

      // Insert the instructions
      if (instructionsToInsert.length > 0) {
        console.log(`Inserting ${instructionsToInsert.length} instructions for activity ${activity.activity_name}`);
        
        const { error: instructionsError } = await supabase
          .from('instructions')
          .insert(instructionsToInsert);

        if (instructionsError) {
          console.error(`Error inserting instructions for activity ${activity.activity_name}:`, instructionsError);
          throw instructionsError;
        }
      } else {
        console.warn(`No instructions found to insert for activity ${activity.activity_name}`);
      }
    } catch (error) {
      console.error(`Failed to create activity ${activity.activity_name}:`, error);
      throw error;
    }
  }
};

// Function to re-parse and update a specific lesson plan
export const reparseAndUpdateLesson = async (lessonPlanId: string) => {
  try {
    // Fetch the lesson plan and AI response
    const { data: lessonPlan, error: lessonPlanError } = await supabase
      .from('lesson_plans')
      .select('ai_response')
      .eq('id', lessonPlanId)
      .single();
    
    if (lessonPlanError || !lessonPlan) {
      console.error('Error fetching lesson plan:', lessonPlanError);
      throw new Error(`Lesson plan with ID ${lessonPlanId} not found.`);
    }
    
    if (!lessonPlan.ai_response) {
      throw new Error(`Lesson plan with ID ${lessonPlanId} has no AI response to parse.`);
    }
    
    // Clean existing data
    await cleanExistingLessonData(lessonPlanId);
    
    // Re-parse the AI response (will be implemented in lessonService)
    const { parseAndStoreAIResponse } = await import('../lessonService');
    await parseAndStoreAIResponse(lessonPlan.ai_response, lessonPlanId);
    
    return { success: true, message: `Lesson plan ${lessonPlanId} successfully re-parsed.` };
  } catch (error) {
    console.error('Error re-parsing lesson plan:', error);
    throw error;
  }
};
