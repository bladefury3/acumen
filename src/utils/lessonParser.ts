
import { Activity, ParsedSection } from "@/types/lesson";

export const cleanMarkdown = (text: string): string => {
  return text.replace(/[*_`]/g, '').trim();
};

const extractDuration = (text: string): string | null => {
  const durationMatch = text.match(/\((\d+)\s*(?:minute|min|minutes|mins)?\)/i);
  return durationMatch ? `${durationMatch[1]} minutes` : null;
};

const extractActivityTitle = (text: string): string => {
  const titleText = text.split('(')[0];
  return cleanMarkdown(titleText.replace(/^(?:activity\s+\d+:?\s*|[-*•]\s*)/i, ''));
};

const parseSteps = (content: string): string[] => {
  return content
    .split(/(?:\r?\n|\s*[+•-]\s*|\d+\.\s*)/)
    .map(step => step.trim())
    .filter(step => step.length > 0)
    .map(step => {
      const cleanStep = cleanMarkdown(step);
      return cleanStep.endsWith('.') ? cleanStep : `${cleanStep}.`;
    });
};

export const parseActivities = (content: string[]): Activity[] => {
  return content.map(activity => {
    const duration = extractDuration(activity) || "";
    const title = extractActivityTitle(activity);
    
    const descriptionStart = activity.indexOf(')') + 1;
    const description = descriptionStart > 0 ? 
      activity.slice(descriptionStart) : 
      activity;
    
    const steps = parseSteps(description);

    if (!title || steps.length === 0) {
      throw new Error(`Invalid activity format: missing title or steps for "${activity}"`);
    }

    return { title, duration, steps };
  });
};

const findSectionContent = (lines: string[]): string[] => {
  return lines
    .filter(line => {
      const cleaned = line.trim();
      return cleaned && !cleaned.startsWith('#') && 
        (cleaned.startsWith('-') || /^\d+\./.test(cleaned) || cleaned.length > 0);
    })
    .map(line => cleanMarkdown(line.replace(/^[-*•]\s*|\d+\.\s*/, '')))
    .filter(line => line.length > 0);
};

const identifySectionType = (title: string): string => {
  const normalizedTitle = title.toLowerCase();
  
  if (/objective|goal/i.test(normalizedTitle)) return 'Learning Objectives';
  if (/material|resource|supply/i.test(normalizedTitle)) return 'Materials & Resources';
  if (/introduction|hook|opening/i.test(normalizedTitle)) return 'Introduction & Hook';
  if (/activit/i.test(normalizedTitle)) return 'Activities';
  if (/assess|evaluat/i.test(normalizedTitle)) return 'Assessment Strategies';
  if (/different|accommodat|modif/i.test(normalizedTitle)) return 'Differentiation Strategies';
  if (/clos|conclusion|wrap/i.test(normalizedTitle)) return 'Close';
  
  return title;
};

export const parseAIResponse = (aiResponse: string): ParsedSection[] => {
  const sectionTexts = aiResponse.split(/(?=###\s*|\d+\.\s+)/m);
  const sections: ParsedSection[] = [];
  const requiredSections = new Set([
    'Learning Objectives',
    'Materials & Resources',
    'Introduction & Hook',
    'Activities',
    'Assessment Strategies',
    'Differentiation Strategies',
    'Close'
  ]);
  const foundSections = new Set<string>();

  sectionTexts.forEach(sectionText => {
    const lines = sectionText.split('\n').map(line => line.trim()).filter(Boolean);
    if (lines.length === 0) return;

    const titleLine = lines[0];
    let title = cleanMarkdown(titleLine.replace(/^###\s*|\d+\.\s*/, ''));
    title = identifySectionType(title);
    
    if (!title) return;

    const content = findSectionContent(lines.slice(1));
    if (content.length === 0) return;

    foundSections.add(title);

    if (title.toLowerCase().includes('activit')) {
      const activities = parseActivities(content);
      sections.push({ title, content, activities, generated: false });
    } else {
      sections.push({ title, content, generated: false });
    }
  });

  const missingSections = Array.from(requiredSections)
    .filter(section => !foundSections.has(section));

  if (missingSections.length > 0) {
    throw new Error(`Missing required sections: ${missingSections.join(', ')}`);
  }

  return sections;
};
