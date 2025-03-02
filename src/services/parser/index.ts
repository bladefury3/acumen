
/**
 * Main parser module for lesson plans
 */
import { extractSections, normalizeSections } from './extractors/sectionExtractor';
import { ensureRequiredSections, validateRequiredSections } from './validators/sectionValidator';
import { formatSectionContent } from './transformers/markdown';
import { SECTION_DISPLAY_NAMES, SECTION_PATTERNS, SECTION_TYPES } from './constants/sections';
import { ParsedLessonContent, Section, ParserError, ParserErrorType } from './types';

/**
 * Main function to parse AI response into structured sections
 */
export function parseAIResponse(aiResponse: string): ParsedLessonContent {
  try {
    console.log("Starting to parse AI response...");

    // Extract sections from the AI response
    const extractedSections = extractSections(aiResponse);
    console.log("Raw sections extracted:", extractedSections);

    if (extractedSections.length === 0) {
      throw new ParserError(
        ParserErrorType.EXTRACTION_FAILED,
        "No valid sections found in AI response"
      );
    }

    // Convert to normalized sections with standard types
    const normalizedSections = normalizeSections(extractedSections);
    
    // Convert to our standard Section format
    const sections: Section[] = normalizedSections.map(section => ({
      type: section.title,
      title: SECTION_DISPLAY_NAMES[section.title] || section.title,
      content: section.content,
      rawContent: aiResponse.slice(section.startIndex, section.endIndex)
    }));
    
    // Ensure all required sections exist
    const completeSections = ensureRequiredSections(sections, aiResponse);
    
    // Check which sections are still missing (should be none)
    const missingTypes = validateRequiredSections(completeSections);

    // Log found and missing sections for debugging
    console.log("Found section types:", completeSections.map(s => s.type));
    if (missingTypes.length > 0) {
      console.log("Missing section types:", missingTypes);
    }

    return {
      sections: completeSections,
      missingTypes
    };
  } catch (error) {
    console.error("Error parsing AI response:", error);
    
    if (error instanceof ParserError) {
      throw error;
    }
    
    throw new ParserError(
      ParserErrorType.INVALID_FORMAT,
      `Failed to parse AI response: ${(error as Error).message}`
    );
  }
}

/**
 * Find a specific section by type
 */
export function findSectionByType(sections: Section[], type: string): Section | undefined {
  return sections.find(section => section.type === type);
}

/**
 * Get section content as a formatted string
 */
export function getSectionContentAsString(sections: Section[], type: string): string {
  const section = findSectionByType(sections, type);
  if (!section) return '';
  return section.content.join('\n');
}

/**
 * Convert parsed sections to a lesson object for database storage
 */
export function createLessonObject(sections: Section[]): Record<string, string> {
  const lessonData: Record<string, string> = {};
  
  // Map each section type to its content
  for (const section of sections) {
    lessonData[section.type] = section.content.join('\n');
  }
  
  return lessonData;
}
