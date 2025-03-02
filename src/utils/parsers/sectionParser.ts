
import { ParsedSection } from "@/types/lesson";

/**
 * Identifies the standardized section type based on title
 */
export const identifySectionType = (title: string): string => {
  const normalizedTitle = title.toLowerCase();
  
  if (/learning objective|objective|goal/i.test(normalizedTitle)) return 'Learning Objectives';
  if (/material|resource|supply/i.test(normalizedTitle)) return 'Materials & Resources';
  if (/introduction|hook|opening/i.test(normalizedTitle)) return 'Introduction & Hook';
  if (/activit|main activities/i.test(normalizedTitle)) return 'Activities';
  if (/assess|evaluat/i.test(normalizedTitle)) return 'Assessment Strategies';
  if (/different|accommodat|modif/i.test(normalizedTitle)) return 'Differentiation Strategies';
  if (/clos|conclusion|wrap/i.test(normalizedTitle)) return 'Close';
  
  return title;
};

/**
 * Finds section content excluding headers and empty lines
 */
export const findSectionContent = (lines: string[]): string[] => {
  return lines
    .filter(line => {
      const cleaned = line.trim();
      return cleaned && !cleaned.startsWith('#') && 
        (cleaned.startsWith('*') || cleaned.startsWith('-') || /^\d+\./.test(cleaned) || cleaned.length > 0);
    })
    .map(line => cleanMarkdown(line.replace(/^\*\s*|\s*\*$|^[-*•]\s*|\d+\.\s*/, '')))
    .filter(line => line.length > 0);
};

/**
 * Cleans markdown formatting from text
 */
export const cleanMarkdown = (text: string): string => {
  return text.replace(/[*_`]/g, '').trim();
};

/**
 * Extracts sections from AI response based on markdown headers or numbered format (X. Section Title)
 */
export const extractSections = (aiResponse: string): ParsedSection[] => {
  // Split the AI response into sections using both markdown headers and numbered formats
  // This regex handles both "### Section Title" and "X. Section Title" formats
  const sectionRegex = /(?:###\s*|(?:\d+\.)\s+)([^\n]+)(?:\n|$)/g;
  const sectionMatches = [...aiResponse.matchAll(sectionRegex)];
  
  console.log("Section matches:", sectionMatches.length);
  
  const sections: ParsedSection[] = [];
  
  for (let i = 0; i < sectionMatches.length; i++) {
    const match = sectionMatches[i];
    const sectionTitle = match[1].trim();
    const startIndex = match.index! + match[0].length;
    const endIndex = i < sectionMatches.length - 1 
      ? sectionMatches[i + 1].index 
      : aiResponse.length;
    
    const sectionContent = aiResponse.slice(startIndex, endIndex).trim();
    
    sections.push({
      title: identifySectionType(sectionTitle),
      content: sectionContent.split('\n').map(line => line.trim()).filter(line => line.length > 0),
    });
  }
  
  return sections;
};

/**
 * Find a specific section by matching titles with patterns
 */
export const findSectionByPatterns = (sections: ParsedSection[], titlePatterns: string[]): ParsedSection | undefined => {
  return sections.find(s => 
    titlePatterns.some(pattern => 
      s.title.toLowerCase().includes(pattern.toLowerCase())
    )
  );
};

/**
 * Extract the content from a section matching the title patterns
 */
export const getSectionContent = (sections: ParsedSection[], titlePatterns: string[]): string => {
  const matchingSection = findSectionByPatterns(sections, titlePatterns);
  return matchingSection?.content.join('\n') || '';
};

/**
 * Validate that all required sections are present
 */
export const validateParsedSections = (parsedLesson: Record<string, string>): string[] => {
  const requiredFields = [
    'learning_objectives',
    'materials_resources',
    'introduction_hook',
    'activities',
    'assessment_strategies',
    'differentiation_strategies',
    'close'
  ];
  
  const fieldLabels = {
    'learning_objectives': 'Learning Objectives',
    'materials_resources': 'Materials/Resources',
    'introduction_hook': 'Introduction/Hook',
    'activities': 'Activities',
    'assessment_strategies': 'Assessment Strategies',
    'differentiation_strategies': 'Differentiation Strategies',
    'close': 'Close/Closure'
  };
  
  return requiredFields
    .filter(field => !parsedLesson[field])
    .map(field => fieldLabels[field as keyof typeof fieldLabels]);
};
