
/**
 * Functions for extracting sections from AI responses
 */
import { ExtractedSection, ParserError, ParserErrorType } from '../types';
import { identifySectionType } from '../constants/sections';

/**
 * Extract section content (preserving markdown formatting)
 */
export function findSectionContent(text: string): string[] {
  if (!text) return [];
  
  // Check if the text contains markdown formatting
  const hasMarkdown = text.includes('#') || 
                      text.includes('*') || 
                      text.includes('_') || 
                      text.includes('```') ||
                      text.includes('- ');
  
  // If it has markdown, preserve it instead of splitting into lines
  if (hasMarkdown) {
    return [text.trim()];
  }
  
  return text
    .split('\n')
    .map(line => line.trim())
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

  // Enhanced section regex to catch more formats including numbered sections and bold sections
  const sectionRegex = /(?:#{1,4}\s*|(?:\d+\.\s+)|(?:\*\*\d+\.\s*)|(?:\*\*[^*]+\*\*:\s*))([^\n]+)(?:\n|$)/g;
  const sectionMatches = [...aiResponse.matchAll(sectionRegex)];
  
  const sections: ExtractedSection[] = [];
  
  // If we found sections, process them
  if (sectionMatches.length > 0) {
    for (let i = 0; i < sectionMatches.length; i++) {
      const match = sectionMatches[i];
      const sectionTitle = match[1].replace(/\*\*/g, '').trim();
      const startIndex = match.index! + match[0].length;
      const endIndex = i < sectionMatches.length - 1 
        ? sectionMatches[i + 1].index 
        : aiResponse.length;
      
      const sectionContent = aiResponse.slice(startIndex, endIndex).trim();
      
      // Create the section - preserve markdown content
      sections.push({
        title: sectionTitle,
        content: findSectionContent(sectionContent),
        markdownContent: sectionContent,
        startIndex,
        endIndex
      });
    }
  } else {
    // Fallback: try to find sections by looking for titles followed by content
    const lines = aiResponse.split('\n').map(line => line.trim());
    let currentSection: ExtractedSection | null = null;
    let currentContent: string[] = [];
    let markdownContent = '';
    let startIndex = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Enhanced pattern matching for section titles - looking for capitalized words followed by colon
      if (line.match(/^[A-Z][\w\s]+:$/) || 
          line.match(/^[A-Z][\w\s]+\s*$/) || 
          line.match(/^\d+\.\s+[A-Z]/) ||
          line.match(/^\*\*[^*]+\*\*:?\s*$/)) {
        // If we have a current section, add it to our sections
        if (currentSection && currentContent.length > 0) {
          currentSection.content = currentContent;
          currentSection.markdownContent = markdownContent;
          sections.push(currentSection);
        }
        
        // Start a new section
        const title = line.replace(/^(\d+\.\s+|\s*:|\s*|\*\*|\*\*)/, '').trim();
        startIndex = aiResponse.indexOf(line);
        currentSection = {
          title,
          content: [],
          markdownContent: '',
          startIndex,
          endIndex: aiResponse.length
        };
        currentContent = [];
        markdownContent = '';
      } else if (currentSection) {
        // Add this line to the current section content
        currentContent.push(line);
        markdownContent += line + '\n';
      }
    }
    
    // Don't forget to add the last section
    if (currentSection && currentContent.length > 0) {
      currentSection.content = currentContent;
      currentSection.markdownContent = markdownContent;
      sections.push(currentSection);
    }
  }
  
  // If we still couldn't find any sections, try one more approach
  if (sections.length === 0) {
    // Look for patterns like "Learning Objectives:", "Materials and Resources:", etc.
    const commonSectionTitles = [
      "Learning Objectives",
      "Materials and Resources",
      "Introduction/Hook",
      "Main Activities",
      "Activities",
      "Assessment Strategies",
      "Differentiation Strategies",
      "Closure",
      "Close"
    ];
    
    for (const title of commonSectionTitles) {
      const titlePattern = new RegExp(`(?:${title}:|${title}\\s*\\(.*?\\):)\\s*([\\s\\S]*?)(?=(?:${commonSectionTitles.join('|')}):|\$)`, 'i');
      const match = aiResponse.match(titlePattern);
      
      if (match && match[1] && match[1].trim()) {
        const content = match[1].trim();
        sections.push({
          title,
          content: findSectionContent(content),
          markdownContent: content,
          startIndex: match.index || 0,
          endIndex: (match.index || 0) + match[0].length
        });
      }
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
