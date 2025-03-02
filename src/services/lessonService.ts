
import { toast } from "sonner";
import { 
  parseAIResponse,
  createLessonObject
} from "@/services/parser";
import { 
  cleanExistingLessonData, 
  createNewLesson 
} from "./lesson/databaseOperations";
import { ParsedLesson } from "./lesson/types";

export const parseAndStoreAIResponse = async (aiResponse: string, responseId: string): Promise<void> => {
  try {
    console.log('Parsing AI response for lesson plan...');
    
    // Use our parser to extract all sections
    const { sections, missingTypes } = parseAIResponse(aiResponse);
    console.log('Parsed sections:', sections);
    
    if (missingTypes.length > 0) {
      console.warn(`Missing sections in lesson plan: ${missingTypes.join(', ')}`);
    }

    // Convert sections to a lesson object for database storage
    // Ensure we preserve markdown content
    const parsedLesson = createLessonObject(sections);
    console.log(`Processed lesson data:`, parsedLesson);

    // First clean up any existing data for this response ID
    await cleanExistingLessonData(responseId);
    
    // Create the new lesson record with the parsed data
    await createNewLesson(responseId, parsedLesson as unknown as ParsedLesson);
  } catch (error) {
    console.error('Error parsing and storing AI response:', error);
    toast.error(`Failed to create lesson plan: ${(error as Error).message}`);
    throw error;
  }
};
