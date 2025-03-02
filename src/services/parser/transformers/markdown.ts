
/**
 * Utilities for working with markdown content
 */

/**
 * Remove markdown formatting characters from text
 */
export function cleanMarkdown(text: string): string {
  if (!text) return '';
  
  // Remove common markdown formatting
  return text
    .replace(/[*_`]/g, '')  // Bold, italic, code
    .replace(/#+\s+/g, '')  // Headers
    .trim();
}

/**
 * Extract content lines from a section, excluding headers and empty lines
 */
export function extractContentLines(text: string): string[] {
  if (!text) return [];
  
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0 && !line.startsWith('#'));
}

/**
 * Process content lines to create a clean array of bullet points
 */
export function processContentLines(lines: string[]): string[] {
  return lines
    .map(line => {
      // Clean bullet points and numbering
      let cleaned = line.replace(/^\s*[-*•]\s*|\s*\d+\.\s*/g, '').trim();
      cleaned = cleanMarkdown(cleaned);
      
      // Ensure sentence ends with punctuation
      if (cleaned && !/[.?!]$/.test(cleaned)) {
        cleaned += '.';
      }
      
      return cleaned;
    })
    .filter(line => line.length > 0);
}

/**
 * Format a section's content into an array of bullet points
 */
export function formatSectionContent(content: string): string[] {
  if (!content) return [];
  
  // First try splitting by newlines
  const lines = content.split('\n').filter(line => line.trim().length > 0);
  
  // If we got no lines but have content, it might be all in one line
  if (lines.length === 0 && content.trim().length > 0) {
    // Try to split by bullet points or numbers
    const bulletItems = content.split(/(?:^|\n)(?:\-|\*|\d+\.)\s+/g)
      .filter(item => item.trim().length > 0);
    
    if (bulletItems.length > 0) {
      return bulletItems.map(item => cleanMarkdown(item.trim()));
    }
    
    // If still no items, just return the content as a single item
    return [cleanMarkdown(content.trim())];
  }
  
  return lines.map(cleanMarkdown);
}
