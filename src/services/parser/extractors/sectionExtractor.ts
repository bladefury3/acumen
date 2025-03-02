
/**
 * Functions for extracting sections from AI responses
 */
import { ExtractedSection, ParserError, ParserErrorType } from '../types';
import { identifySectionType } from '../constants/sections';
import { processContentLines } from '../transformers/markdown';

/**
 * Extract section content (excluding headers and empty lines)
 */
export function findSectionContent(lines: string[]): string[] {
  return lines
    .filter(line => {
      const cleaned = line.trim();
      return cleaned && !cleaned.startsWith('#') && 
        (cleaned.startsWith('*') || cleaned.startsWith('-') || /^\d+\./.test(cleaned) || cleaned.length > 0);
    })
    .map(line => line.replace(/^\*\s*|\s*\*$|^[-*•]\s*|\d+\.\s*/, '').trim())
    .filter(line => line.length > 0);
}

/**
 * Extract sections based on markdown headers or numbered format
 */
export function extractSections(aiResponse: string): ExtractedSection[] {
  if (!aiResponse || aiResponse.trim().length === 0) {
    throw new ParserError(
      ParserErrorType.NO_CONTENT,
      'AI response is empty or contains no content'
    );
  }

  // First try to extract sections with markdown headers or numbered formats
  const sectionRegex = /(?:#{1,4}\s*|(?:\d+\.)\s+)([^\n]+)(?:\n|$)/g;
  const sectionMatches = [...aiResponse.matchAll(sectionRegex)];
  
  const sections: ExtractedSection[] = [];
  
  // If we found sections, process them
  if (sectionMatches.length > 0) {
    for (let i = 0; i < sectionMatches.length; i++) {
      const match = sectionMatches[i];
      const sectionTitle = match[1].trim();
      const startIndex = match.index! + match[0].length;
      const endIndex = i < sectionMatches.length - 1 
        ? sectionMatches[i + 1].index 
        : aiResponse.length;
      
      const sectionContent = aiResponse.slice(startIndex, endIndex).trim();
      const contentLines = sectionContent
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
      
      // Skip empty sections
      if (contentLines.length === 0) continue;
      
      // Create the section
      sections.push({
        title: sectionTitle,
        content: findSectionContent(contentLines),
        startIndex,
        endIndex
      });
    }
  } else {
    // Fallback: try to find sections by looking for titles followed by content
    const lines = aiResponse.split('\n').map(line => line.trim());
    let currentSection: ExtractedSection | null = null;
    let currentContent: string[] = [];
    let startIndex = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Check if this line looks like a section title
      if (line.match(/^[A-Z][\w\s]+:$/) || line.match(/^[A-Z][\w\s]+\s*$/) || line.match(/^\d+\.\s+[A-Z]/)) {
        // If we have a current section, add it to our sections
        if (currentSection && currentContent.length > 0) {
          currentSection.content = findSectionContent(currentContent);
          sections.push(currentSection);
        }
        
        // Start a new section
        const title = line.replace(/^(\d+\.\s+|\s*:|\s*)/, '').trim();
        startIndex = aiResponse.indexOf(line);
        currentSection = {
          title,
          content: [],
          startIndex,
          endIndex: aiResponse.length
        };
        currentContent = [];
      } else if (currentSection) {
        // Add this line to the current section content
        currentContent.push(line);
      }
    }
    
    // Don't forget to add the last section
    if (currentSection && currentContent.length > 0) {
      currentSection.content = findSectionContent(currentContent);
      sections.push(currentSection);
    }
  }
  
  // If we still couldn't find any sections, throw an error
  if (sections.length === 0) {
    throw new ParserError(
      ParserErrorType.EXTRACTION_FAILED,
      'Could not extract any sections from the AI response'
    );
  }
  
  return sections;
}

/**
 * Normalize extracted sections to standard section types
 */
export function normalizeSections(sections: ExtractedSection[]): ExtractedSection[] {
  return sections.map(section => ({
    ...section,
    title: identifySectionType(section.title)
  }));
}
