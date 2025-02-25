
import { supabase } from "@/integrations/supabase/client";
import { ParsedLesson, ParsedSection } from "@/types/lesson";
import { parseAIResponse } from "@/utils/lessonParser";
import { toast } from "sonner";

export const parseAndStoreAIResponse = async (aiResponse: string, responseId: string) => {
  try {
    const sections = parseAIResponse(aiResponse);
    console.log('Parsed sections:', sections);

    const parsedLesson: ParsedLesson = {
      learning_objectives: sections.find(s => s.title.toLowerCase().includes('learning objectives'))?.content.join('\n') || '',
      materials_resources: sections.find(s => s.title.toLowerCase().includes('materials'))?.content.join('\n') || '',
      introduction_hook: sections.find(s => s.title.toLowerCase().includes('introduction'))?.content.join('\n') || '',
      assessment_strategies: sections.find(s => s.title.toLowerCase().includes('assessment'))?.content.join('\n') || '',
      differentiation_strategies: sections.find(s => s.title.toLowerCase().includes('differentiation'))?.content.join('\n') || '',
      close: sections.find(s => s.title.toLowerCase().includes('close'))?.content.join('\n') || '',
      activities: []
    };

    if (!parsedLesson.learning_objectives || !parsedLesson.materials_resources || 
        !parsedLesson.introduction_hook || !parsedLesson.assessment_strategies || 
        !parsedLesson.differentiation_strategies || !parsedLesson.close) {
      throw new Error('Missing required fields in lesson plan');
    }

    const activitiesSection = sections.find(s => s.title.toLowerCase().includes('activities'));
    if (activitiesSection?.activities) {
      parsedLesson.activities = activitiesSection.activities.map(activity => ({
        activity_name: activity.title || 'Untitled Activity',
        description: activity.duration || 'No duration specified',
        instructions: activity.steps?.join('\n') || 'No instructions provided'
      }));
    }

    const { data: existingLesson } = await supabase
      .from('lessons')
      .select('id')
      .eq('response_id', responseId)
      .maybeSingle();

    let lessonId;

    if (existingLesson?.id) {
      const { error: updateError } = await supabase
        .from('lessons')
        .update({
          learning_objectives: parsedLesson.learning_objectives,
          materials_resources: parsedLesson.materials_resources,
          introduction_hook: parsedLesson.introduction_hook,
          assessment_strategies: parsedLesson.assessment_strategies,
          differentiation_strategies: parsedLesson.differentiation_strategies,
          close: parsedLesson.close
        })
        .eq('id', existingLesson.id);

      if (updateError) throw updateError;
      lessonId = existingLesson.id;

      const { error: deleteError } = await supabase
        .from('activities_detail')
        .delete()
        .eq('lesson_id', lessonId);

      if (deleteError) throw deleteError;
    } else {
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
      lessonId = newLesson.id;
    }

    if (parsedLesson.activities.length > 0) {
      const activitiesWithLessonId = parsedLesson.activities.map(activity => ({
        lesson_id: lessonId,
        activity_name: activity.activity_name,
        description: activity.description,
        instructions: activity.instructions
      }));

      const { error: activitiesError } = await supabase
        .from('activities_detail')
        .insert(activitiesWithLessonId);

      if (activitiesError) throw activitiesError;
    }

    return sections;
  } catch (error) {
    console.error('Error parsing and storing AI response:', error);
    throw error;
  }
};

export const parseExistingLessonPlans = async () => {
  try {
    // Fixed the query to correctly filter non-null ai_responses
    const { data: lessonPlans, error } = await supabase
      .from('lesson_plans')
      .select('id, ai_response')
      .filter('ai_response', 'neq', null);

    if (error) throw error;

    let successCount = 0;
    let failureCount = 0;

    console.log(`Found ${lessonPlans?.length || 0} lesson plans to process`);

    for (const plan of lessonPlans || []) {
      if (plan.ai_response) {
        try {
          console.log(`Processing lesson plan ${plan.id}`);
          await parseAndStoreAIResponse(plan.ai_response, plan.id);
          successCount++;
          console.log(`Successfully processed lesson plan ${plan.id}`);
        } catch (error) {
          console.error(`Error processing lesson plan ${plan.id}:`, error);
          failureCount++;
        }
      }
    }

    if (successCount > 0) {
      toast.success(`Successfully parsed ${successCount} lesson plans`);
    }
    if (failureCount > 0) {
      toast.error(`Failed to parse ${failureCount} lesson plans`);
    }
  } catch (error) {
    console.error('Error parsing existing lesson plans:', error);
    toast.error('Failed to parse lesson plans');
  }
};
