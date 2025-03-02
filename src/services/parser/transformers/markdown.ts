
/**
 * Utilities for working with markdown content
 */

/**
 * Format a section's content into an array of bullet points while preserving markdown
 */
export function formatSectionContent(content: string): string[] {
  if (!content) return [];
  
  // Split by newlines to maintain formatting
  const lines = content.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
  
  // If we have no lines but have content, return it as a single item
  if (lines.length === 0 && content.trim().length > 0) {
    return [content.trim()];
  }
  
  return lines;
}

/**
 * Get original markdown content as a string
 */
export function getOriginalMarkdown(content: string): string {
  return content ? content.trim() : '';
}
