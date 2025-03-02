
import { supabase } from "@/integrations/supabase/client";
import { ParsedLesson } from "./types";
import { Json } from "@/integrations/supabase/types";

export const cleanExistingLessonData = async (responseId: string) => {
  try {
    // Delete existing lesson data
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
    
    // Convert activities to Json compatible format
    const activitiesJson = parsedLesson.activities as unknown as Json;
    
    const { data: newLesson, error: lessonError } = await supabase
      .from('lessons')
      .insert({
        response_id: responseId,
        learning_objectives: parsedLesson.learning_objectives,
        materials_resources: parsedLesson.materials_resources,
        introduction_hook: parsedLesson.introduction_hook,
        assessment_strategies: parsedLesson.assessment_strategies,
        differentiation_strategies: parsedLesson.differentiation_strategies,
        close: parsedLesson.close,
        activities: activitiesJson
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

// Migration function to copy data from old structure to new
export const migrateActivitiesToLessons = async () => {
  try {
    console.log('Starting migration of activities to lessons table...');
    
    // Get all lessons
    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('id, response_id')
      .is('activities', null);
      
    if (lessonsError) {
      console.error('Error fetching lessons:', lessonsError);
      throw lessonsError;
    }
    
    console.log(`Found ${lessons?.length || 0} lessons to migrate`);
    
    // Process each lesson
    for (const lesson of lessons || []) {
      try {
        // Get activities for this lesson
        const { data: activities, error: activitiesError } = await supabase
          .from('activities_detail')
          .select('id, activity_name, description')
          .eq('lesson_id', lesson.id);
          
        if (activitiesError) {
          console.error(`Error fetching activities for lesson ${lesson.id}:`, activitiesError);
          continue;
        }
        
        // Get instructions for each activity
        const activitiesWithSteps = [];
        
        for (const activity of activities || []) {
          const { data: instructions, error: instructionsError } = await supabase
            .from('instructions')
            .select('instruction_text')
            .eq('activities_detail_id', activity.id)
            .order('created_at', { ascending: true });
            
          if (instructionsError) {
            console.error(`Error fetching instructions for activity ${activity.id}:`, instructionsError);
            continue;
          }
          
          activitiesWithSteps.push({
            activity_name: activity.activity_name,
            duration: activity.description,
            steps: instructions ? instructions.map(i => i.instruction_text) : []
          });
        }
        
        // Update the lesson with the new activities array
        if (activitiesWithSteps.length > 0) {
          const { error: updateError } = await supabase
            .from('lessons')
            .update({ activities: activitiesWithSteps as unknown as Json })
            .eq('id', lesson.id);
            
          if (updateError) {
            console.error(`Error updating lesson ${lesson.id} with activities:`, updateError);
          } else {
            console.log(`Successfully migrated ${activitiesWithSteps.length} activities for lesson ${lesson.id}`);
          }
        }
      } catch (error) {
        console.error(`Error processing lesson ${lesson.id}:`, error);
      }
    }
    
    console.log('Migration completed');
  } catch (error) {
    console.error('Error during migration:', error);
    throw error;
  }
};
