
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
    // Extract duration from text like "Activity Title (10 minutes):"
    const durationPattern = /\((\d+)\s*(?:minute|min|minutes|mins)?\)/i;
    const durationMatch = activity.match(durationPattern);
    const duration = durationMatch ? `${durationMatch[1]} minutes` : "";
    
    // Extract title from text, handling both "Activity Title:" and "**Activity Title**" formats
    let title = "";
    if (activity.includes("**")) {
      // Handle format like "**Hands-on Project (20 minutes):**"
      const boldTitleMatch = activity.match(/\*\*([^*]+)\*\*/);
      if (boldTitleMatch) {
        title = boldTitleMatch[1]
          .split('(')[0] // Remove duration part if present
          .trim();
      }
    }
    
    if (!title) {
      title = extractActivityTitle(activity);
    }
    
    // Get activity description and steps
    let description = activity;
    
    // For descriptions with ":" after the title/duration, get the content after that
    const colonIndex = activity.indexOf(':');
    if (colonIndex > 0) {
      description = activity.slice(colonIndex + 1).trim();
    } else if (activity.includes(')')) {
      // For descriptions with format "Title (duration) Description"
      const closingParenIndex = activity.indexOf(')');
      if (closingParenIndex > 0) {
        description = activity.slice(closingParenIndex + 1).trim();
      }
    }
    
    // Parse steps from the description
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
        (cleaned.startsWith('*') || cleaned.startsWith('-') || /^\d+\./.test(cleaned) || cleaned.length > 0);
    })
    .map(line => cleanMarkdown(line.replace(/^\*\s*|\s*\*$|^[-*•]\s*|\d+\.\s*/, '')))
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
      // Look for activity patterns in the content
      const activityLines = contentLines.filter(line => {
        const trimmedLine = line.trim();
        // Match lines that start with * or - and contain activity markers like "**Activity Name**"
        return (trimmedLine.startsWith('*') || trimmedLine.startsWith('-')) && 
               (trimmedLine.includes('**') || 
                /\(\d+\s*(?:minute|min|minutes|mins)?\)/i.test(trimmedLine));
      });
      
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

// Add a manual test function that we can run to verify the parsing
export const manualTestParsing = (aiResponse: string) => {
  try {
    console.log('Testing parseAIResponse with provided AI response...');
    const result = parseAIResponse(aiResponse);
    console.log('Successfully parsed AI response into', result.length, 'sections:');
    
    result.forEach(section => {
      console.log(`\nSection: ${section.title}`);
      console.log('Content items:', section.content.length);
      
      if (section.activities) {
        console.log('Activities:', section.activities.length);
        section.activities.forEach((activity, i) => {
          console.log(`  Activity ${i+1}: ${activity.title} (${activity.duration})`);
          console.log(`    Steps: ${activity.steps.length}`);
          activity.steps.forEach((step, j) => {
            console.log(`      ${j+1}. ${step}`);
          });
        });
      }
    });
    
    return result;
  } catch (error) {
    console.error('Error parsing AI response:', error);
    throw error;
  }
};
