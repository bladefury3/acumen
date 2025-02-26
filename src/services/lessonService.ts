
import { supabase } from "@/integrations/supabase/client";
import { ParsedSection } from "@/types/lesson";
import { parseAIResponse } from "@/utils/lessonParser";
import { toast } from "sonner";

interface ParsedLesson {
  learning_objectives: string;
  materials_resources: string;
  introduction_hook: string;
  assessment_strategies: string;
  differentiation_strategies: string;
  close: string;
  activities: {
    activity_name: string;
    description: string;
    instructions: string;
  }[];
}

export const parseAndStoreAIResponse = async (aiResponse: string, responseId: string) => {
  try {
    const sections = parseAIResponse(aiResponse);
    console.log('Parsed sections:', sections);

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

    if (parsedLesson.activities.length === 0) {
      throw new Error('Failed to parse activities from the lesson plan');
    }

    // Clean up existing data
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

    // Insert activities and their instructions
    for (const activity of parsedLesson.activities) {
      const { data: newActivity, error: activityError } = await supabase
        .from('activities_detail')
        .insert({
          lesson_id: newLesson.id,
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

    return sections;
  } catch (error) {
    console.error('Error parsing and storing AI response:', error);
    toast.error(`Failed to create lesson plan: ${error.message}`);
    throw error;
  }
};
