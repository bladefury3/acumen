import { supabase } from "@/integrations/supabase/client";
import { ParsedLesson, ParsedSection } from "@/types/lesson";
import { parseAIResponse } from "@/utils/lessonParser";
import { toast } from "sonner";

export const parseAndStoreAIResponse = async (aiResponse: string, responseId: string) => {
  try {
    const sections = parseAIResponse(aiResponse);
    console.log('Parsed sections:', sections);

    // Helper function to find content with flexible title matching
    const findSectionContent = (titlePatterns: string[]): string => {
      const matchingSection = sections.find(s => 
        titlePatterns.some(pattern => 
          s.title.toLowerCase().includes(pattern.toLowerCase())
        )
      );
      return matchingSection?.content.join('\n') || matchingSection?.activities?.map(a => 
        `${a.title}\n${a.steps.join('\n')}`
      ).join('\n') || '';
    };

    const parsedLesson: ParsedLesson = {
      learning_objectives: findSectionContent(['learning objectives', 'learning goals', 'objectives']),
      materials_resources: findSectionContent(['materials', 'resources', 'supplies']),
      introduction_hook: findSectionContent(['introduction', 'hook', 'opening']),
      assessment_strategies: findSectionContent(['assessment', 'evaluation', 'measuring']),
      differentiation_strategies: findSectionContent(['differentiation', 'accommodations', 'modifications']),
      close: findSectionContent(['close', 'closure', 'wrap up', 'conclusion']),
      activities: []
    };

    // Validate required sections
    const missingFields = [];
    if (!parsedLesson.learning_objectives) missingFields.push('Learning Objectives');
    if (!parsedLesson.materials_resources) missingFields.push('Materials/Resources');
    if (!parsedLesson.introduction_hook) missingFields.push('Introduction/Hook');
    if (!parsedLesson.assessment_strategies) missingFields.push('Assessment Strategies');
    if (!parsedLesson.differentiation_strategies) missingFields.push('Differentiation Strategies');
    if (!parsedLesson.close) missingFields.push('Close/Closure');

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields in lesson plan: ${missingFields.join(', ')}`);
    }

    const activitiesSection = sections.find(s => 
      ['activities', 'main activities', 'learning activities'].some(term => 
        s.title.toLowerCase().includes(term)
      )
    );

    if (!activitiesSection?.activities || activitiesSection.activities.length === 0) {
      throw new Error('No activities found in the lesson plan');
    }

    parsedLesson.activities = activitiesSection.activities.map(activity => ({
      activity_name: activity.title,
      description: activity.duration || 'Duration not specified',
      instructions: activity.steps.join('\n')
    }));

    // If parsing succeeded but no activities were created, throw an error
    if (parsedLesson.activities.length === 0) {
      throw new Error('Failed to parse activities from the lesson plan');
    }

    // Delete existing data if parsing successful but before saving new data
    try {
      // 1. Delete activities first
      await supabase
        .from('activities_detail')
        .delete()
        .eq('lesson_id', responseId);

      // 2. Delete lessons
      await supabase
        .from('lessons')
        .delete()
        .eq('response_id', responseId);

    } catch (error) {
      console.error('Error cleaning up existing data:', error);
      throw new Error('Failed to clean up existing data before saving new lesson plan');
    }

    // Create new lesson
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

    // Insert activities
    const activitiesWithLessonId = parsedLesson.activities.map(activity => ({
      lesson_id: newLesson.id,
      activity_name: activity.activity_name,
      description: activity.description,
      instructions: activity.instructions
    }));

    const { error: activitiesError } = await supabase
      .from('activities_detail')
      .insert(activitiesWithLessonId);

    if (activitiesError) throw activitiesError;

    return sections;
  } catch (error) {
    console.error('Error parsing and storing AI response:', error);
    // Delete the lesson plan if parsing or storing fails
    try {
      await supabase
        .from('lesson_plans')
        .delete()
        .eq('id', responseId);
      
      toast.error(`Failed to create lesson plan: ${error.message}`);
    } catch (deleteError) {
      console.error('Error deleting failed lesson plan:', deleteError);
    }
    throw error;
  }
};

export const parseExistingLessonPlans = async () => {
  try {
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
