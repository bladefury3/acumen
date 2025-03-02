
// Re-export from the new modular structure for backward compatibility
import { parseAIResponse, createLessonObject } from '@/services/parser';
import { formatSectionContent } from '@/services/parser/transformers/markdown';

export {
  parseAIResponse,
  createLessonObject,
  formatSectionContent
};
