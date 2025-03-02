import { toast } from "sonner";
import { parseAIResponse } from "@/services/parser";
import { formatSectionContent } from "@/services/parser/transformers/markdown";

// Legacy functions to keep tests working
export const cleanMarkdown = (text: string) => {
  if (!text) return '';
  return text.replace(/[*_`]/g, '').replace(/#+\s+/g, '').trim();
};

export const parseActivities = (content: string) => {
  const { sections } = parseAIResponse(content);
  const activitiesSection = sections.find(section => section.type === 'activities');
  return activitiesSection ? activitiesSection.content : [];
};

// Other needed exports for tests
export { formatSectionContent };
export { parseAIResponse };
