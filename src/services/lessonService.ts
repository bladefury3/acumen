
import { ParsedSection } from "@/types/lesson";
import { parseAIResponse } from "@/utils/lessonParser";
import { toast } from "sonner";
import { findSectionContent, validateParsedSections, findActivitiesSection } from "./lesson/sectionParser";
import { cleanExistingLessonData, createNewLesson, createActivities } from "./lesson/databaseOperations";
import { ParsedLesson } from "./lesson/types";

export const parseAndStoreAIResponse = async (aiResponse: string, responseId: string) => {
  try {
    const sections = parseAIResponse(aiResponse);
    console.log('Parsed sections:', sections);

    const parsedLesson: ParsedLesson = {
      learning_objectives: findSectionContent(sections, ['learning objectives', 'learning goals', 'objectives']),
      materials_resources: findSectionContent(sections, ['materials', 'resources', 'supplies']),
      introduction_hook: findSectionContent(sections, ['introduction', 'hook', 'opening']),
      assessment_strategies: findSectionContent(sections, ['assessment', 'evaluation', 'measuring']),
      differentiation_strategies: findSectionContent(sections, ['differentiation', 'accommodations', 'modifications']),
      close: findSectionContent(sections, ['close', 'closure', 'wrap up', 'conclusion']),
      activities: []
    };

    validateParsedSections(parsedLesson);

    const activitiesSection = findActivitiesSection(sections);
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

    await cleanExistingLessonData(responseId);
    
    const newLesson = await createNewLesson(responseId, parsedLesson);
    await createActivities(newLesson.id, parsedLesson.activities);

    return sections;
  } catch (error) {
    console.error('Error parsing and storing AI response:', error);
    toast.error(`Failed to create lesson plan: ${error.message}`);
    throw error;
  }
};
