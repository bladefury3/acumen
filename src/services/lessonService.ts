
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

    // Special handling for activities section which often fails to parse
    if (!parsedLesson.activities || parsedLesson.activities.trim() === '') {
      // Look for "### 4. Main Activities" or "### 4. Activities" section
      const activitiesRegex = /#{1,4}\s*\d*\.*\s*(?:Main\s+)?Activities[^#]*?([\s\S]*?)(?=#{1,4}\s*\d*\.|$)/i;
      const activitiesMatch = aiResponse.match(activitiesRegex);
      
      if (activitiesMatch && activitiesMatch[1]) {
        parsedLesson.activities = activitiesMatch[1].trim();
        console.log('Extracted activities directly from regex:', parsedLesson.activities);
      }
    }

    // First clean up any existing data for this response ID
    await cleanExistingLessonData(responseId);
    
    // Create the new lesson record with the parsed data
    await createNewLesson(responseId, parsedLesson as unknown as ParsedLesson);
    
    toast.success("Lesson plan created successfully");
  } catch (error) {
    console.error('Error parsing and storing AI response:', error);
    toast.error(`Failed to create lesson plan: ${(error as Error).message}`);
    throw error;
  }
};
