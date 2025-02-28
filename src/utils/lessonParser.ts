
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
  return cleanMarkdown(titleText.replace(/^(?:activity\s+\d+:?\s*|[-*•]\s*|\*\*[^*]+\*\*\s*)/i, ''));
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
    
    // For bullet-point style activities, handle indented steps
    let steps: string[] = [];
    if (description.includes('  -') || description.includes('\n-')) {
      // Split by newlines and filter for indented bullet points
      const lines = description.split('\n');
      const stepLines = lines.filter(line => line.trim().startsWith('-'));
      
      if (stepLines.length > 0) {
        steps = stepLines.map(line => {
          const step = line.trim().replace(/^-\s*/, '');
          return cleanMarkdown(step);
        });
      } else {
        steps = parseSteps(description);
      }
    } else {
      steps = parseSteps(description);
    }

    if (!title) {
      throw new Error(`Invalid activity format: missing title for "${activity}"`);
    }

    if (steps.length === 0) {
      // If no steps could be parsed, use the entire description as a single step
      steps = [cleanMarkdown(description)];
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
  // Split the AI response into sections
  // This regex captures sections that start with ### or with numbered headings like "1. "
  const sectionRegex = /(?:###\s*|(?:\d+\.)\s+)([^\n]+)(?:\n|$)/g;
  const sectionMatches = [...aiResponse.matchAll(sectionRegex)];
  
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

  if (sectionMatches.length === 0) {
    throw new Error("No valid sections found in AI response");
  }

  // Process each section
  for (let i = 0; i < sectionMatches.length; i++) {
    const match = sectionMatches[i];
    const sectionTitle = match[1].trim();
    const standardizedTitle = identifySectionType(sectionTitle);
    
    // Find the content of this section (everything until the next section)
    const startIndex = match.index! + match[0].length;
    const endIndex = i < sectionMatches.length - 1 
      ? sectionMatches[i + 1].index 
      : aiResponse.length;
    
    const sectionContent = aiResponse.slice(startIndex, endIndex).trim();
    const contentLines = sectionContent.split('\n');
    
    // Parse the content
    const content = findSectionContent(contentLines);
    
    if (content.length === 0) continue;
    
    foundSections.add(standardizedTitle);
    
    // Handle Activities section specially to extract structured activities
    if (standardizedTitle === 'Activities') {
      const activityLines = contentLines.filter(line => 
        line.trim().startsWith('-') && 
        (line.includes('Activity') || line.includes('**'))
      );
      
      if (activityLines.length > 0) {
        try {
          const activities = parseActivities(activityLines);
          sections.push({ 
            title: standardizedTitle, 
            content, 
            activities,
            generated: false 
          });
        } catch (error) {
          console.error(`Error parsing activities: ${error}`);
          sections.push({ title: standardizedTitle, content, generated: false });
        }
      } else {
        sections.push({ title: standardizedTitle, content, generated: false });
      }
    } else {
      sections.push({ title: standardizedTitle, content, generated: false });
    }
  }

  // Check for missing required sections
  const missingSections = Array.from(requiredSections)
    .filter(section => !foundSections.has(section));

  if (missingSections.length > 0) {
    throw new Error(`Missing required sections: ${missingSections.join(', ')}`);
  }

  return sections;
};
