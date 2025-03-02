
import { supabase } from "@/integrations/supabase/client";
import { Activity } from "@/types/lesson";
import { ParsedLesson } from "./types";

export const cleanExistingLessonData = async (responseId: string) => {
  try {
    // Delete existing lessons 
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
    
    // Create the lesson with activities directly in the activities column
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
        activities: parsedLesson.activities as any // Cast to handle Json type
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

// Function to migrate existing activities to the lessons table
export const migrateActivitiesToLessons = async () => {
  try {
    console.log('Starting migration of activities to lessons table...');
    
    // Get all lessons
    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('id, response_id');
      
    if (lessonsError) {
      console.error('Error fetching lessons:', lessonsError);
      throw lessonsError;
    }
    
    if (!lessons || lessons.length === 0) {
      console.log('No lessons found to migrate activities for');
      return;
    }
    
    console.log(`Found ${lessons.length} lessons to check for activities migration`);
    
    let migratedCount = 0;
    
    for (const lesson of lessons) {
      try {
        // Skip lessons without response_id
        if (!lesson.response_id) continue;
        
        // Check if activities exist in activities_detail table
        const { data: activitiesData, error: activitiesError } = await supabase
          .from('activities_detail')
          .select('id, activity_name, description, instructions')
          .eq('lesson_id', lesson.id);
          
        if (activitiesError) {
          console.error(`Error fetching activities for lesson ${lesson.id}:`, activitiesError);
          continue;
        }
        
        if (!activitiesData || activitiesData.length === 0) {
          console.log(`No activities found for lesson ${lesson.id}`);
          continue;
        }
        
        console.log(`Found ${activitiesData.length} activities for lesson ${lesson.id}`);
        
        // For each activity, get instructions
        const activities: Activity[] = [];
        
        for (const activity of activitiesData) {
          const { data: instructionsData, error: instructionsError } = await supabase
            .from('instructions')
            .select('instruction_text')
            .eq('activities_detail_id', activity.id);
            
          if (instructionsError) {
            console.error(`Error fetching instructions for activity ${activity.id}:`, instructionsError);
            continue;
          }
          
          const steps = instructionsData 
            ? instructionsData.map(instruction => instruction.instruction_text)
            : [activity.instructions || 'No detailed instructions available'];
            
          activities.push({
            title: activity.activity_name,
            duration: activity.description || 'Duration not specified',
            steps
          });
        }
        
        if (activities.length > 0) {
          // Update the lesson with the activities
          const { error: updateError } = await supabase
            .from('lessons')
            .update({ activities })
            .eq('id', lesson.id);
            
          if (updateError) {
            console.error(`Error updating activities for lesson ${lesson.id}:`, updateError);
            continue;
          }
          
          migratedCount++;
          console.log(`Successfully migrated ${activities.length} activities for lesson ${lesson.id}`);
        }
      } catch (error) {
        console.error(`Error processing lesson ${lesson.id}:`, error);
      }
    }
    
    console.log(`Migration complete. Migrated activities for ${migratedCount} lessons.`);
    return migratedCount;
  } catch (error) {
    console.error('Error during activities migration:', error);
    throw error;
  }
};
