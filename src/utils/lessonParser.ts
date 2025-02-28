
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
  const activities: Activity[] = [];
  
  for (let i = 0; i < content.length; i++) {
    const activityLine = content[i].trim();
    
    // Skip empty lines
    if (!activityLine) continue;
    
    // Check if this line contains an activity title (with ** or with "Activity" prefix)
    if (
      activityLine.includes('**') ||
      /^activity\s+\d+:/i.test(activityLine) ||
      /^[-*•]\s*activity/i.test(activityLine)
    ) {
      // Extract title and duration from the activity line
      const title = extractActivityTitle(activityLine);
      const duration = extractDuration(activityLine) || "";
      
      // Look for instructions in the following lines until we hit another activity
      const steps: string[] = [];
      let j = i + 1;
      
      // Find all indented bullet points or numbered lists following the activity
      while (j < content.length) {
        const nextLine = content[j].trim();
        
        // If the next line starts a new activity, break
        if (
          nextLine.includes('**') ||
          /^activity\s+\d+:/i.test(nextLine) ||
          /^[-*•]\s*activity/i.test(nextLine)
        ) {
          break;
        }
        
        // Check if this is an instruction bullet point
        if (nextLine.startsWith('-') || nextLine.startsWith('•') || /^\d+\./.test(nextLine)) {
          // Clean and add the instruction
          const cleanedInstruction = nextLine.replace(/^[-•*]\s*|\d+\.\s*/, '').trim();
          if (cleanedInstruction) {
            steps.push(cleanedInstruction);
          }
        }
        
        j++;
      }
      
      // If no steps were found but there's description text in the activity line
      if (steps.length === 0) {
        // Extract any description text after the title/duration
        const descriptionMatch = activityLine.match(/\)\s*(.+)$/);
        if (descriptionMatch && descriptionMatch[1]) {
          steps.push(descriptionMatch[1].trim());
        } else {
          steps.push(`${title}`);
        }
      }
      
      activities.push({ title, duration, steps });
    }
  }
  
  return activities;
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
    
    // For the Activities section, we need to parse it differently to extract structured activities
    if (standardizedTitle === 'Activities') {
      // Split section content into lines and process
      const contentLines = sectionContent.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
      
      // Look for activity markers and gather all activity-related lines
      const activityLines: string[] = [];
      let isInActivity = false;
      
      for (const line of contentLines) {
        // Detect activity headers or bullet points that start activities
        if (
          line.includes('**Activity') || 
          /^Activity\s+\d+:/i.test(line) ||
          /^[-*•]\s*Activity\s+\d+:/i.test(line)
        ) {
          isInActivity = true;
          activityLines.push(line);
        } 
        // Collect indented instructions or bullet points under activities
        else if (isInActivity && (line.startsWith('-') || line.startsWith('•') || /^\d+\./.test(line) || line.startsWith('  '))) {
          activityLines.push(line);
        }
      }
      
      // If we found structured activities, parse them
      if (activityLines.length > 0) {
        try {
          const activities = parseActivities(activityLines);
          sections.push({ 
            title: standardizedTitle, 
            content: contentLines, 
            activities,
            generated: false 
          });
          foundSections.add(standardizedTitle);
          continue;
        } catch (error) {
          console.error(`Error parsing activities: ${error}`);
          // Fall back to default section parsing if activity parsing fails
        }
      }
    }
    
    // Default section parsing
    const contentLines = sectionContent.split('\n');
    const content = findSectionContent(contentLines);
    
    if (content.length > 0) {
      sections.push({ title: standardizedTitle, content, generated: false });
      foundSections.add(standardizedTitle);
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
