
import { ParsedSection } from "@/types/lesson";
import { parseAIResponse } from "@/utils/parsers/lessonParser";
import { toast } from "sonner";
import { 
  getSectionContent, 
  validateParsedSections, 
  findActivitiesSection 
} from "@/utils/parsers/sectionParser";
import { 
  cleanExistingLessonData, 
  createNewLesson
} from "./lesson/databaseOperations";
import { ParsedLesson } from "./lesson/types";

export const parseAndStoreAIResponse = async (aiResponse: string, responseId: string) => {
  try {
    console.log('Parsing AI response for lesson plan...');
    const sections = parseAIResponse(aiResponse);
    console.log('Parsed sections:', sections);

    const parsedLesson: ParsedLesson = {
      learning_objectives: getSectionContent(sections, ['learning objectives', 'learning goals', 'objectives']),
      materials_resources: getSectionContent(sections, ['materials', 'resources', 'supplies']),
      introduction_hook: getSectionContent(sections, ['introduction', 'hook', 'opening']),
      assessment_strategies: getSectionContent(sections, ['assessment', 'evaluation', 'measuring']),
      differentiation_strategies: getSectionContent(sections, ['differentiation', 'accommodations', 'modifications']),
      close: getSectionContent(sections, ['close', 'closure', 'wrap up', 'conclusion']),
      activities: []
    };

    // Validate that we have all required sections
    const missingFields = validateParsedSections({
      learning_objectives: parsedLesson.learning_objectives,
      materials_resources: parsedLesson.materials_resources,
      introduction_hook: parsedLesson.introduction_hook,
      assessment_strategies: parsedLesson.assessment_strategies,
      differentiation_strategies: parsedLesson.differentiation_strategies,
      close: parsedLesson.close
    });
    
    if (missingFields.length > 0) {
      console.warn(`Missing fields in lesson plan: ${missingFields.join(', ')}`);
      // Instead of throwing an error, let's handle missing fields gracefully
      missingFields.forEach(field => {
        const key = field.toLowerCase().replace(/[\/\s]/g, '_') as keyof ParsedLesson;
        if (typeof parsedLesson[key] === 'string') {
          parsedLesson[key] = `Auto-generated ${field} section` as any;
        }
      });
    }

    // Extract activities - look for the right section first
    const activitiesSection = findActivitiesSection(sections);
    
    if (activitiesSection?.activities && activitiesSection.activities.length > 0) {
      console.log(`Found ${activitiesSection.activities.length} structured activities`);
      
      // Map the activities to the format expected by createActivities
      parsedLesson.activities = activitiesSection.activities.map(activity => {
        console.log(`Processing activity: ${activity.title} (${activity.duration})`);
        
        return {
          activity_name: activity.title,
          duration: activity.duration || '0 minutes',
          steps: activity.steps
        };
      });
    } else {
      console.warn('No structured activities found in the lesson plan. Creating a default activity.');
      parsedLesson.activities = [{
        activity_name: "Main Activity",
        duration: "0 minutes",
        steps: ["Complete the main activity for this lesson."]
      }];
    }

    console.log(`Processed activities: ${parsedLesson.activities.length}`);
    console.log(parsedLesson.activities);

    // First clean up any existing data for this response ID
    await cleanExistingLessonData(responseId);
    
    // Create the new lesson record
    await createNewLesson(responseId, parsedLesson);

    return sections;
  } catch (error) {
    console.error('Error parsing and storing AI response:', error);
    toast.error(`Failed to create lesson plan: ${(error as Error).message}`);
    throw error;
  }
};
