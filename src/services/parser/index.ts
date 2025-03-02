
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
    console.log("Normalized sections:", normalizedSections);
    
    // Convert to our standard Section format, preserving markdown
    const sections: Section[] = normalizedSections.map(section => ({
      type: section.title,
      title: SECTION_DISPLAY_NAMES[section.title] || section.title,
      content: section.content,
      markdownContent: section.markdownContent || section.content.join('\n'),
      rawContent: aiResponse.slice(section.startIndex, section.endIndex),
      activities: section.activities
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
  
  // Return markdown content if available, otherwise join content
  return section.markdownContent || section.content.join('\n');
}

/**
 * Convert parsed sections to a lesson object for database storage
 */
export function createLessonObject(sections: Section[]): Record<string, string> {
  const lessonData: Record<string, string> = {};
  
  // Standard mapping of section types to database fields
  const mappings: Record<string, string> = {
    "learning_objectives": "learning_objectives",
    "materials_resources": "materials_resources",
    "introduction_hook": "introduction_hook",
    "assessment_strategies": "assessment_strategies",
    "differentiation_strategies": "differentiation_strategies",
    "close": "close",
    "activities": "activities"
  };
  
  // Initialize all fields with empty strings
  for (const field of Object.values(mappings)) {
    lessonData[field] = '';
  }
  
  // Map each section type to its database field
  for (const section of sections) {
    const fieldName = mappings[section.type];
    if (fieldName) {
      lessonData[fieldName] = section.markdownContent || section.content.join('\n');
    } else if (section.type === "main_activities") {
      // Special case for main activities - map to activities field
      lessonData["activities"] = section.markdownContent || section.content.join('\n');
    }
  }
  
  // Special handling for the "activities" section
  // If we have specially extracted activities, format them
  const activitiesSection = sections.find(s => 
    s.type === "activities" || s.type === "main_activities");
    
  if (activitiesSection && activitiesSection.activities && activitiesSection.activities.length > 0) {
    // Format activities in a markdown-friendly way
    const formattedActivities = activitiesSection.activities.map((activity, index) => {
      const title = activity.title.trim();
      const duration = activity.duration ? ` (${activity.duration})` : '';
      const steps = activity.steps.join('\n- ');
      
      return `### Activity ${index + 1}: ${title}${duration}\n- ${steps}`;
    }).join('\n\n');
    
    lessonData["activities"] = formattedActivities;
  } else if (!lessonData["activities"] || lessonData["activities"].trim() === '') {
    // Try to find another section with activities in the title
    const altActivitiesSection = sections.find(s => 
      s.title.toLowerCase().includes('activities') && 
      s.type !== "activities" && 
      s.type !== "main_activities");
      
    if (altActivitiesSection) {
      lessonData["activities"] = altActivitiesSection.markdownContent || altActivitiesSection.content.join('\n');
    }
  }
  
  return lessonData;
}
