
/**
 * Validation utilities for sections
 */
import { REQUIRED_SECTIONS, SECTION_DISPLAY_NAMES } from '../constants/sections';
import { Section, ParserError, ParserErrorType } from '../types';

/**
 * Validate that all required sections are present
 */
export function validateRequiredSections(sections: Section[]): string[] {
  const sectionTypes = new Set(sections.map(s => s.type));
  
  return REQUIRED_SECTIONS.filter(type => !sectionTypes.has(type));
}

/**
 * Validate that section content is not empty
 */
export function validateSectionContent(section: Section): boolean {
  return section.content.length > 0 && 
    section.content.some(item => item.trim().length > 0);
}

/**
 * Ensure all required sections exist, using fallbacks if needed
 */
export function ensureRequiredSections(sections: Section[], rawResponse: string): Section[] {
  const missingTypes = validateRequiredSections(sections);
  
  // If all required sections are present, return as is
  if (missingTypes.length === 0) {
    return sections;
  }
  
  // Create fallback sections for missing types
  const fallbackSections = missingTypes.map(type => ({
    type,
    title: SECTION_DISPLAY_NAMES[type] || type,
    content: [`This section was not found in the original lesson plan.`],
    rawContent: ''
  }));
  
  return [...sections, ...fallbackSections];
}
