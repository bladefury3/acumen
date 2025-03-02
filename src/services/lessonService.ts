import { ParsedSection } from "@/types/lesson";
import { parseAIResponse } from "@/utils/parsers/lessonParser";
import { toast } from "sonner";
import { 
  getSectionContent, 
  validateParsedSections
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
      activities: getSectionContent(sections, ['activities', 'tasks', 'engagement']),
    };

    // Validate that we have all required sections
    const missingFields = validateParsedSections(parsedLesson);
    
    if (missingFields.length > 0) {
      console.warn(`Missing fields in lesson plan: ${missingFields.join(', ')}`);
      missingFields.forEach(field => {
        const key = field.toLowerCase().replace(/[\/\s]/g, '_') as keyof ParsedLesson;
        if (typeof parsedLesson[key] === 'string') {
          parsedLesson[key] = `Auto-generated ${field} section` as any;
        }
      });
    }

    console.log(`Processed lesson data:`, parsedLesson);

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
