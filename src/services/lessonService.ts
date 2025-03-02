
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

    // Check if we have activities but they weren't properly extracted
    if (!parsedLesson.activities || parsedLesson.activities.trim() === '') {
      // Look for Main Activities section specifically
      const mainActivitiesSection = sections.find(section => 
        section.title.includes('Activities') || 
        section.type === 'main_activities' || 
        section.type === 'activities');
        
      if (mainActivitiesSection) {
        // Use the full markdown content of the activities section
        parsedLesson.activities = mainActivitiesSection.markdownContent || 
                                  mainActivitiesSection.content.join('\n');
                                  
        console.log('Using main activities section content:', parsedLesson.activities);
      } else {
        // If we still don't have activities, search through the entire AI response
        const activitiesMatch = aiResponse.match(/(?:main activities|activities)(?:\s*\(\d+\s*minutes\))?:?([\s\S]*?)(?=(?:assessment|differentiation|close|closure):|\s*$)/i);
        
        if (activitiesMatch && activitiesMatch[1]) {
          parsedLesson.activities = activitiesMatch[1].trim();
          console.log('Extracted activities from AI response:', parsedLesson.activities);
        }
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
