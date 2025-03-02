
import { ParsedSection } from "@/types/lesson";
import { parseAIResponse } from "@/utils/parsers/lessonParser";
import { toast } from "sonner";
import { 
  getSectionContent, 
  findSectionByPatterns,
  validateParsedSections
} from "@/utils/parsers/sectionParser";
import { 
  cleanExistingLessonData, 
  createNewLesson 
} from "./lesson/databaseOperations";
import { ParsedLesson } from "./lesson/types";

export const parseAndStoreAIResponse = async (aiResponse: string, responseId: string): Promise<ParsedSection[]> => {
  try {
    console.log('Parsing AI response for lesson plan...');
    const sections = parseAIResponse(aiResponse);
    console.log('Parsed sections:', sections);

    // Create a typed object for lesson data
    const parsedLesson: Record<string, string> = {
      learning_objectives: getSectionContent(sections, ['learning objectives', 'learning goals', 'objectives']),
      materials_resources: getSectionContent(sections, ['materials', 'resources', 'supplies']),
      introduction_hook: getSectionContent(sections, ['introduction', 'hook', 'opening']),
      activities: getSectionContent(sections, ['main activities', 'activities']),
      assessment_strategies: getSectionContent(sections, ['assessment', 'evaluation', 'measuring']),
      differentiation_strategies: getSectionContent(sections, ['differentiation', 'accommodations', 'modifications']),
      close: getSectionContent(sections, ['close', 'closure', 'wrap up', 'conclusion']),
    };

    // Validate that we have all required sections
    const missingFields = validateParsedSections(parsedLesson);
    
    if (missingFields.length > 0) {
      console.warn(`Missing fields in lesson plan: ${missingFields.join(', ')}`);
      
      // Instead of auto-generating placeholder text, try harder to find the content
      // in the AI response for any missing fields
      const aiResponseLines = aiResponse.split('\n');
      
      for (const field of missingFields) {
        const fieldKey = field.toLowerCase().replace(/[\/\s]/g, '_');
        
        // Look for this field in the raw response more aggressively
        const fieldRegex = new RegExp(`${field.replace(/[\/\s]/g, '.*')}[:\\s]`, 'i');
        const lineIndex = aiResponseLines.findIndex(line => fieldRegex.test(line));
        
        if (lineIndex >= 0) {
          // Found a matching line, grab content until the next section
          let content = '';
          let i = lineIndex + 1;
          
          while (i < aiResponseLines.length && 
                 !aiResponseLines[i].match(/^#+\s|^\d+\.\s[A-Z]/) && 
                 !missingFields.some(f => aiResponseLines[i].includes(f))) {
            content += aiResponseLines[i] + '\n';
            i++;
          }
          
          if (content.trim()) {
            parsedLesson[fieldKey] = content.trim();
            continue;
          }
        }
        
        // If we still couldn't find anything, use a placeholder but with more information
        parsedLesson[fieldKey] = `This section was not found in the original lesson plan.`;
      }
    }

    console.log(`Processed lesson data:`, parsedLesson);

    // First clean up any existing data for this response ID
    await cleanExistingLessonData(responseId);
    
    // Create the new lesson record with the parsed data
    await createNewLesson(responseId, parsedLesson as unknown as ParsedLesson);
    
    return sections;
  } catch (error) {
    console.error('Error parsing and storing AI response:', error);
    toast.error(`Failed to create lesson plan: ${(error as Error).message}`);
    throw error;
  }
};
