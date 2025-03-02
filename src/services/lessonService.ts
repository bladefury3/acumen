
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

    // Extract raw activities section from the AI response
    let rawActivitiesContent = '';
    
    // Look for patterns like "### 4. Main Activities" or "#### Main Activities" in the AI response
    const activitiesHeaderPatterns = [
      /#{1,4}\s*\d*\.*\s*Main\s*Activities/i,
      /#{1,4}\s*\d*\.*\s*Activities/i
    ];
    
    // Try to extract the activities section as raw content
    for (const pattern of activitiesHeaderPatterns) {
      const match = aiResponse.match(pattern);
      if (match) {
        const startIdx = match.index;
        if (startIdx !== undefined) {
          // Find the next section header after activities
          const restOfContent = aiResponse.substring(startIdx);
          // Look specifically for the next section header that's NOT part of the activities
          const nextSectionMatch = restOfContent.match(/#{1,4}\s*\d*\.*\s*(Assessment|Differentiation|Close|Closure|Wrap|Conclusion)/i);
          
          if (nextSectionMatch && nextSectionMatch.index) {
            // Extract the content between the activities header and the next section
            rawActivitiesContent = restOfContent.substring(0, nextSectionMatch.index).trim();
          } else {
            // If no next section found, take a more cautious approach - look for any markdown header
            const anyNextSection = restOfContent.match(/#{1,4}\s*\d*\.*\s*[A-Za-z]/);
            if (anyNextSection && anyNextSection.index && anyNextSection.index > 50) { // Ensure it's not just matching itself
              rawActivitiesContent = restOfContent.substring(0, anyNextSection.index).trim();
            } else {
              // If still no clear next section, just take a reasonable chunk (e.g., 1000 chars)
              // and then try to find a good cut-off point like a blank line
              let potentialContent = restOfContent.substring(0, Math.min(2000, restOfContent.length));
              const lastBlankLine = potentialContent.lastIndexOf('\n\n');
              if (lastBlankLine > 100) { // Make sure we have enough content
                rawActivitiesContent = potentialContent.substring(0, lastBlankLine).trim();
              } else {
                rawActivitiesContent = potentialContent.trim();
              }
            }
          }
          break;
        }
      }
    }
    
    // If we still couldn't find the activities section, try a simpler approach
    if (!rawActivitiesContent) {
      const activitySection = findSectionByPatterns(sections, ['activities', 'main activities']);
      if (activitySection) {
        rawActivitiesContent = activitySection.content.join('\n');
      }
    }

    console.log('Extracted activities content:', rawActivitiesContent);

    // Create a typed object for lesson data
    const parsedLesson: Record<string, string> = {
      learning_objectives: getSectionContent(sections, ['learning objectives', 'learning goals', 'objectives']),
      materials_resources: getSectionContent(sections, ['materials', 'resources', 'supplies']),
      introduction_hook: getSectionContent(sections, ['introduction', 'hook', 'opening']),
      assessment_strategies: getSectionContent(sections, ['assessment', 'evaluation', 'measuring']),
      differentiation_strategies: getSectionContent(sections, ['differentiation', 'accommodations', 'modifications']),
      close: getSectionContent(sections, ['close', 'closure', 'wrap up', 'conclusion']),
      // Store the raw activities content instead of parsed content
      activities: getSectionContent(sections, ['Main Activities', 'activities']),
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
