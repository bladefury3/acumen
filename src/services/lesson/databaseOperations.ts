
import { supabase } from "@/integrations/supabase/client";
import { ParsedLesson } from "./types";

export const cleanExistingLessonData = async (responseId: string) => {
  try {
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

export const createActivities = async (lessonId: string, activities: ParsedLesson['activities']) => {
  for (const activity of activities) {
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

    if (activityError) throw activityError;

    const instructionsToInsert = activity.instructions
      .split('\n')
      .filter(text => text.trim().length > 0)
      .map(instruction_text => ({
        instruction_text,
        activities_detail_id: newActivity.id
      }));

    if (instructionsToInsert.length > 0) {
      const { error: instructionsError } = await supabase
        .from('instructions')
        .insert(instructionsToInsert);

      if (instructionsError) throw instructionsError;
    }
  }
};
