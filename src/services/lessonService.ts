
import { Activity, ParsedSection } from "@/types/lesson";
import { parseAIResponse, parseActivitiesFromContent } from "@/utils/parsers/lessonParser";
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

    // Structure for the lesson data
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
      // Handle missing fields gracefully
      missingFields.forEach(field => {
        const key = field.toLowerCase().replace(/[\/\s]/g, '_') as keyof ParsedLesson;
        if (typeof parsedLesson[key] === 'string') {
          parsedLesson[key] = `Auto-generated ${field} section` as any;
        }
      });
    }

    // Extract activities from the activities section
    const activitiesSection = findActivitiesSection(sections);
    
    if (activitiesSection?.activities && activitiesSection.activities.length > 0) {
      console.log(`Found ${activitiesSection.activities.length} structured activities`);
      parsedLesson.activities = activitiesSection.activities;
    } else {
      console.warn('No structured activities found in the lesson plan, looking for activities in all sections');
      
      // Try to find activities in any section that might contain them
      for (const section of sections) {
        if (section.title.toLowerCase().includes('activit') || 
            section.content.some(line => line.includes('Activity') || /\*\s+\*\*[^*]+\*\*\s*\(\d+/.test(line))) {
          
          console.log(`Attempting to extract activities from section: ${section.title}`);
          
          // Try to parse activities from this section content
          const activities = parseActivitiesFromContent(section.content);
            
          if (activities.length > 0) {
            console.log(`Found ${activities.length} activities`);
            parsedLesson.activities = activities;
            break;
          }
        }
      }
      
      // If still no activities, create a default one
      if (parsedLesson.activities.length === 0) {
        console.warn('Creating a default activity as none were found');
        parsedLesson.activities = [{
          title: "Main Activity",
          duration: "Duration not specified",
          steps: ["Complete the main activity for this lesson."]
        }];
      }
    }

    console.log(`Processed activities: ${parsedLesson.activities.length}`);
    console.log(parsedLesson.activities);

    // First clean up any existing data for this response ID
    await cleanExistingLessonData(responseId);
    
    // Create the new lesson record with activities directly in the lessons table
    const newLesson = await createNewLesson(responseId, parsedLesson);

    return sections;
  } catch (error) {
    console.error('Error parsing and storing AI response:', error);
    toast.error(`Failed to create lesson plan: ${(error as Error).message}`);
    throw error;
  }
};
