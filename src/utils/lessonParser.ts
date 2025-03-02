
// Re-export from the new modular structure for backward compatibility
import { parseAIResponse, manualTestParsing } from './parsers/lessonParser';
import { cleanMarkdown } from './parsers/sectionParser';
import { extractDuration } from './parsers/activityParser';

export {
  parseAIResponse,
  manualTestParsing,
  cleanMarkdown,
  extractDuration
};
