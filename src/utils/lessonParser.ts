
import { Activity } from "@/types/lesson";
import { parseAIResponse } from "@/services/parser";
import { formatSectionContent } from "@/services/parser/transformers/markdown";

// Special compatibility layer for tests
export const cleanMarkdown = (text: string) => {
  if (!text) return '';
  return text.replace(/[*_`]/g, '').replace(/#+\s+/g, '').trim();
};

// Legacy parseActivities for tests compatibility
export const parseActivities = (content: string[]): Activity[] => {
  if (!Array.isArray(content)) {
    console.warn('parseActivities called with non-array content');
    return [];
  }
  
  return content.map(item => {
    // Extract title and duration using regex
    const titleDurationMatch = item.match(/^(?:Activity\s+\d+:\s+)?([^(]+)(?:\s*\(([^)]+)\))?/);
    const title = titleDurationMatch ? titleDurationMatch[1].trim() : item;
    const duration = titleDurationMatch && titleDurationMatch[2] ? titleDurationMatch[2].trim() : "";
    
    // Extract steps from the description
    const descriptionPart = item.replace(/^(?:Activity\s+\d+:\s+)?[^-]+-\s*/, '').trim();
    const steps = descriptionPart ? descriptionPart.split(/\.\s+/).filter(step => step.trim().length > 0).map(step => step.trim() + '.') : [];
    
    return {
      title,
      duration,
      steps
    };
  });
};

// Legacy parseAIResponse wrapper for tests compatibility
export { parseAIResponse };

// Create a compatibility wrapper for tests
export const wrapParseAIResponseForTests = (aiResponse: string) => {
  const result = parseAIResponse(aiResponse);
  // Add array methods to the result for test compatibility
  const sections = result.sections || [];
  
  // Return an array-like object that also has the sections property
  const compatResult = [...sections] as any;
  compatResult.sections = sections;
  
  return compatResult;
};

// Export the wrapper as the default parseAIResponse for tests
export default wrapParseAIResponseForTests;

// Additional exports needed for tests
export { formatSectionContent };
