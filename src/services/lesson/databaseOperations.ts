
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
      
    console.log(`Successfully cleaned existing data for response ID: ${responseId}`);
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
    
    // Ensure we're not storing empty strings
    const sanitizedLesson = Object.entries(parsedLesson).reduce((acc, [key, value]) => {
      // If value is empty string or just whitespace, store a dash
      acc[key as keyof ParsedLesson] = (!value || value.trim() === '') 
        ? '-' 
        : value;
      return acc;
    }, {} as Record<keyof ParsedLesson, string>);
    
    console.log('Inserting lesson with data:', sanitizedLesson);
    
    const { data: newLesson, error: lessonError } = await supabase
      .from('lessons')
      .insert({
        response_id: responseId,
        learning_objectives: sanitizedLesson.learning_objectives,
        materials_resources: sanitizedLesson.materials_resources,
        introduction_hook: sanitizedLesson.introduction_hook,
        assessment_strategies: sanitizedLesson.assessment_strategies,
        differentiation_strategies: sanitizedLesson.differentiation_strategies,
        close: sanitizedLesson.close,
        activities: sanitizedLesson.activities || '-' // Ensure activities is never null
      })
      .select('id')
      .single();

    if (lessonError) {
      console.error('Error creating lesson:', lessonError);
      throw lessonError;
    }
    
    console.log('Successfully created lesson with ID:', newLesson?.id);
    return newLesson;
  } catch (error) {
    console.error('Error creating new lesson:', error);
    throw error;
  }
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

// Migration function to move activities from activities_detail to lessons.activities
export const migrateActivitiesToLessons = async () => {
  try {
    console.log('Starting migration of activities to lessons table...');
    
    // Get all lessons
    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('id, response_id, activities');
      
    if (lessonsError) {
      console.error('Error fetching lessons:', lessonsError);
      throw lessonsError;
    }
    
    // Process each lesson
    for (const lesson of lessons || []) {
      // Skip lessons that already have activities data
      if (lesson.activities && lesson.activities !== '-') {
        console.log(`Lesson ${lesson.id} already has activities data, skipping...`);
        continue;
      }
      
      // Get activities for this lesson
      const { data: activities, error: activitiesError } = await supabase
        .from('activities_detail')
        .select('*')
        .eq('lesson_id', lesson.id);
        
      if (activitiesError) {
        console.error(`Error fetching activities for lesson ${lesson.id}:`, activitiesError);
        continue; // Skip this lesson if there's an error
      }
      
      if (!activities || activities.length === 0) {
        console.log(`No activities found for lesson ${lesson.id}`);
        continue;
      }
      
      // Convert activities to a string
      const activitiesString = activities
        .map(activity => {
          return `Activity: ${activity.activity_name}\n${activity.description}\n${activity.instructions}`;
        })
        .join('\n\n');
      
      // Update the lesson with the activities string
      const { error: updateError } = await supabase
        .from('lessons')
        .update({ activities: activitiesString })
        .eq('id', lesson.id);
        
      if (updateError) {
        console.error(`Error updating lesson ${lesson.id} with activities:`, updateError);
      } else {
        console.log(`Successfully migrated activities for lesson ${lesson.id}`);
      }
    }
    
    console.log('Migration completed successfully');
    return true;
  } catch (error) {
    console.error('Migration failed:', error);
    return false;
  }
};
