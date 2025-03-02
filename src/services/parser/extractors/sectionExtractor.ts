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
  
  // Simplified section regex to catch headings like "### 1. Learning Objectives"
  const sectionRegex = /(?:#{1,4}\s*\d*\.*\s*)([^#\n]+)(?:\n|$)/g;
  const sectionMatches = [...aiResponse.matchAll(sectionRegex)];
  
  const sections: ExtractedSection[] = [];
  
  // If we found sections, process them
  if (sectionMatches.length > 0) {
    for (let i = 0; i < sectionMatches.length; i++) {
      const match = sectionMatches[i];
      // Clean up section title removing markdown and timing in parentheses
      let sectionTitle = match[1].replace(/\*\*/g, '').trim();
      
      // Remove numbering from title if present (e.g., "1. Learning Objectives" -> "Learning Objectives")
      sectionTitle = sectionTitle.replace(/^\d+\.\s*/, '');
      
      // Remove timing info in parentheses if present
      sectionTitle = sectionTitle.replace(/\s*\(\d+\s*(?:minutes|mins|minute|min)\)/i, '');
      
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
      // Now also catches titles like "Main Activities (25 minutes):"
      if (line.match(/^[A-Z][\w\s]+(?:\s*\(\d+\s*(?:minutes|mins|minute|min)\))?:$/) || 
          line.match(/^[A-Z][\w\s]+\s*$/) || 
          line.match(/^\d+\.\s+[A-Z]/) ||
          line.match(/^\*\*[^*]+\*\*:?\s*$/)) {
        // If we have a current section, add it to our sections
        if (currentSection && currentContent.length > 0) {
          currentSection.content = currentContent;
          currentSection.markdownContent = markdownContent;
          sections.push(currentSection);
        }
        
        // Extract title and clean up
        let title = line.replace(/^(\d+\.\s+|\s*:|\s*|\*\*|\*\*)/, '').trim();
        // Remove timing info if present
        title = title.replace(/\s*\(\d+\s*(?:minutes|mins|minute|min)\)/i, '');
        
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
  
  // Special handling for main activity section - they might be numbered sub-activities
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    if (section.title.toLowerCase().includes('main activities') || 
        section.title.toLowerCase() === 'activities') {
      // Extract activity information if available (looking for numbered activities)
      const activityRegex = /(?:^|\n)(?:Activity\s+\d+:|(?:\d+\.)\s+(?:[A-Z][^:]*))(.*?)(?=(?:\n+Activity\s+\d+:|(?:\n+\d+\.)\s+[A-Z]|\n+(?:#{1,3}|[A-Z][\w\s]+:)|$))/gs;
      const activitiesContent = section.markdownContent || section.content.join('\n');
      const activityMatches = [...activitiesContent.matchAll(activityRegex)];

      // If we found activities, add them to the section
      if (activityMatches.length > 0) {
        section.activities = activityMatches.map(match => {
          // Extract title, duration, and steps
          const fullText = match[0];
          
          // Extract title - look for patterns like "Activity 1: Understanding Arguments"
          let title = '';
          const titleMatch = fullText.match(/(?:Activity\s+\d+:|(?:\d+\.)\s+)([^(:]*)(?:\(|\:|$)/);
          if (titleMatch && titleMatch[1]) {
            title = titleMatch[1].trim();
          } else {
            // Fallback to first few words
            title = fullText.split(' ').slice(0, 3).join(' ');
          }
          
          // Extract duration if available - look for patterns like "(10 minutes)" or "(5 min)"
          let duration = '';
          const durationMatch = fullText.match(/\((\d+\s*(?:minutes|mins|minute|min))\)/i);
          if (durationMatch && durationMatch[1]) {
            duration = durationMatch[1].trim();
          }
          
          // Extract steps - rest of the content after title/duration
          const descriptionText = fullText.replace(/(?:Activity\s+\d+:|(?:\d+\.)\s+)([^:]*)(?::|-|–)\s*(?:\(\d+\s*(?:minutes|mins|minute|min)\)\s*)?/i, '').trim();
          
          // Split into steps if multiple sentences
          let steps: string[] = [];
          if (descriptionText.includes('.')) {
            steps = descriptionText.split(/(?<=\.)\s+/)
              .filter(step => step.trim().length > 0)
              .map(step => step.trim());
          } else {
            steps = [descriptionText];
          }
          
          return {
            title,
            duration,
            steps
          };
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
