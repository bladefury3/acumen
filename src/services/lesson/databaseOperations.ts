
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

  if (lessonError) throw lessonError;
  return newLesson;
};

// Helper function to clean instruction text
const cleanInstructionText = (text: string): string => {
  // Remove phrases like "Instructions:" or "Instructions: " at the beginning
  let cleaned = text.replace(/^(?:instructions|steps|directions|activity steps)(?:\s*:)?\s*/i, '');
  
  // Remove activity title and numbering like "Activity 1: Understanding Prompts"
  cleaned = cleaned.replace(/^(?:activity\s+\d+:?\s*|[-*•]\s*|\d+\.\s*Activity\s+\d+:?\s*)/i, '');
  
  // Remove repeated activity title if present
  const titleMatch = cleaned.match(/^([^(:.]+)(?:\s*\(|\s*:)/i);
  if (titleMatch && titleMatch[1].trim().length > 0) {
    const title = titleMatch[1].trim();
    // Only remove if it's a title (more than one word typically)
    if (title.includes(' ') && title.length > 10) {
      cleaned = cleaned.replace(title, '').replace(/^\s*(?:\(|\s*:)/, '').trim();
    }
  }
  
  // Remove time in parentheses (e.g., "(10 minutes)")
  cleaned = cleaned.replace(/\s*\(\d+\s*(?:minute|min|minutes|mins)?\)\s*\.?/i, '');
  
  // Remove bullet points and numbering at the beginning
  cleaned = cleaned.replace(/^[-•*]\s*|\d+\.\s*/, '');
  
  // Ensure the text ends with a period if it doesn't already
  if (cleaned && !cleaned.endsWith('.') && !cleaned.endsWith('?') && !cleaned.endsWith('!')) {
    cleaned += '.';
  }
  
  return cleaned.trim();
};

export const createActivities = async (lessonId: string, activities: ParsedLesson['activities']) => {
  for (const activity of activities) {
    try {
      console.log(`Creating activity: ${activity.activity_name}`);
      
      const { data: newActivity, error: activityError } = await supabase
        .from('activities_detail')
        .insert({
          lesson_id: lessonId,
          activity_name: activity.activity_name,
          description: activity.description,
          instructions: activity.instructions
        })
        .select('id')
        .single();

      if (activityError) {
        console.error(`Error creating activity ${activity.activity_name}:`, activityError);
        throw activityError;
      }

      // Split instructions and clean each one
      let instructionsToInsert = [];
      
      if (activity.instructions && activity.instructions.trim()) {
        instructionsToInsert = activity.instructions
          .split('\n')
          .filter(text => text.trim().length > 0)
          .map(instruction_text => ({
            instruction_text: cleanInstructionText(instruction_text),
            activities_detail_id: newActivity.id
          }));
      }

      // If no instructions were parsed from the split, try to derive from descriptions
      if (instructionsToInsert.length === 0 && activity.description) {
        // Create at least one instruction from the description
        instructionsToInsert.push({
          instruction_text: `Explain to students about ${activity.activity_name.toLowerCase()}.`,
          activities_detail_id: newActivity.id
        });
      }

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
