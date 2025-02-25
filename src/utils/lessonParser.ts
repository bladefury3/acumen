
import { Activity, ParsedSection } from "@/types/lesson";

export const cleanMarkdown = (text: string): string => {
  return text.replace(/\*\*/g, '').trim();
};

export const parseActivities = (content: string[]): Activity[] => {
  return content.map(activity => {
    const titleMatch = activity.match(/Activity\s+\d+:\s+([^(]+)\s*\((\d+)\s*minutes\)/i);
    
    if (!titleMatch) {
      const basicMatch = activity.match(/([^(]+)\s*\((\d+)\s*minutes\)/i);
      if (basicMatch) {
        const [_, title, duration] = basicMatch;
        const restOfContent = activity.split(')').slice(1).join(')').trim();
        const steps = restOfContent.split(/[.!?]\s+/)
          .map(step => step.trim())
          .filter(Boolean)
          .map(step => step.endsWith('.') ? step : `${step}.`);
        
        return {
          title: cleanMarkdown(title.trim()),
          duration: `${duration} minutes`,
          steps
        };
      }
      return { title: cleanMarkdown(activity), duration: "", steps: [] };
    }

    const [_, title, duration] = titleMatch;
    const description = activity.split(':').slice(2).join(':').trim();
    const steps = description.split(/[.!?]\s+/)
      .map(step => step.trim())
      .filter(Boolean)
      .map(step => step.endsWith('.') ? step : `${step}.`);

    return {
      title: cleanMarkdown(title.trim()),
      duration: `${duration} minutes`,
      steps
    };
  });
};

const findSectionContent = (lines: string[]): string[] => {
  return lines
    .filter(line => line.startsWith('-') || /^\d+\./.test(line))
    .map(line => cleanMarkdown(line.replace(/^-\s*/, '').replace(/^\d+\.\s*/, '').trim()));
};

export const parseAIResponse = (aiResponse: string): ParsedSection[] => {
  const sections: ParsedSection[] = [];
  const sectionTexts = aiResponse.split(/(?=###\s*|^\d+\.\s+)/m);

  sectionTexts.forEach(sectionText => {
    const lines = sectionText.split('\n').map(line => line.trim()).filter(Boolean);
    if (lines.length === 0) return;

    const titleLine = lines[0];
    const title = cleanMarkdown(titleLine.replace(/^###\s*/, '').replace(/^\d+\.\s*/, '').trim());
    const content = findSectionContent(lines.slice(1));

    if (!title) return; // Skip sections without titles

    if (title.toLowerCase().includes('activities')) {
      const activities = parseActivities(content);
      if (activities.length > 0) {
        sections.push({
          title,
          content,
          activities,
          generated: false
        });
      }
    } else {
      if (content.length > 0) {
        sections.push({
          title,
          content,
          generated: false
        });
      }
    }
  });

  return sections;
};
