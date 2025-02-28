
import { ParsedSection } from "@/types/lesson";
import { parseAIResponse } from "@/utils/lessonParser";
import { toast } from "sonner";
import { findSectionContent, validateParsedSections, findActivitiesSection } from "./lesson/sectionParser";
import { cleanExistingLessonData, createNewLesson, createActivities } from "./lesson/databaseOperations";
import { ParsedLesson } from "./lesson/types";

export const parseAndStoreAIResponse = async (aiResponse: string, responseId: string) => {
  try {
    console.log('Parsing AI response for lesson plan...');
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
      console.warn('No activities found in the lesson plan, attempting to parse from content');
      
      // Fallback: Try to extract activities from the content if structured activities aren't available
      if (activitiesSection && activitiesSection.content) {
        parsedLesson.activities = activitiesSection.content
          .filter(line => line.includes('Activity') || /\(\d+\s*min/i.test(line))
          .map(activityLine => {
            const titleMatch = activityLine.match(/Activity\s+\d+:\s*([^(]+)/i);
            const title = titleMatch ? titleMatch[1].trim() : activityLine.split('(')[0].trim();
            const durationMatch = activityLine.match(/\((\d+)\s*min/i);
            const duration = durationMatch ? `${durationMatch[1]} minutes` : 'Duration not specified';
            
            return {
              activity_name: title,
              description: duration,
              instructions: activityLine
            };
          });
      }
      
      if (parsedLesson.activities.length === 0) {
        throw new Error('No activities found in the lesson plan');
      }
    } else {
      console.log(`Found ${activitiesSection.activities.length} structured activities`);
      
      // Map the structured activities to the format expected by createActivities
      parsedLesson.activities = activitiesSection.activities.map(activity => {
        console.log(`Processing activity: ${activity.title} (${activity.duration})`);
        console.log(`Activity steps:`, activity.steps);
        
        return {
          activity_name: activity.title,
          description: activity.duration || 'Duration not specified',
          instructions: activity.steps.join('\n')
        };
      });
    }

    if (parsedLesson.activities.length === 0) {
      throw new Error('Failed to parse activities from the lesson plan');
    }

    console.log(`Cleaned activities: ${parsedLesson.activities.length}`);
    console.log(parsedLesson.activities);

    // First clean up any existing data for this response ID
    await cleanExistingLessonData(responseId);
    
    // Create the new lesson record first
    const newLesson = await createNewLesson(responseId, parsedLesson);
    
    // Then create activities with proper reference to the lesson ID
    await createActivities(newLesson.id, parsedLesson.activities);

    return sections;
  } catch (error) {
    console.error('Error parsing and storing AI response:', error);
    toast.error(`Failed to create lesson plan: ${error.message}`);
    throw error;
  }
};
