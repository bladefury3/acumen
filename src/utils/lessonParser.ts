
import { Activity, ParsedSection } from "@/types/lesson";

export const cleanMarkdown = (text: string): string => {
  return text.replace(/[*_`]/g, '').trim();
};

const extractDuration = (text: string): string | null => {
  // Look for durations in different formats:
  // 1. In parentheses like "(10 minutes)" 
  // 2. Explicit duration indicators like "10 minutes:"
  const durationMatch = text.match(/\((\d+)\s*(?:minute|min|minutes|mins)?\)/i) || 
                         text.match(/(\d+)\s*(?:minute|min|minutes|mins)(?:\s*:)/i);
  return durationMatch ? `${durationMatch[1]} minutes` : null;
};

const extractActivityTitle = (text: string): string => {
  // Clean up various activity title formats:
  // 1. Remove "Activity X:" prefix
  // 2. Remove bullet points or numbering
  // 3. Remove any bold markdown
  // 4. If there's a colon followed by text, extract just the title part
  let titleText = text.split('(')[0]; // Remove duration if in parentheses
  
  // If there's a colon that's not part of "Activity X:", extract the title before it
  if (!/^(?:activity\s+\d+\s*:|[-*•])/i.test(titleText) && titleText.includes(':')) {
    const parts = titleText.split(':');
    // Only use the part before the colon as title if it looks like a title (not "Activity X")
    if (!/^activity\s+\d+\s*$/i.test(parts[0].trim())) {
      titleText = parts[0];
    }
  }
  
  // Clean up the title
  return cleanMarkdown(titleText.replace(/^(?:activity\s+\d+:?\s*|[-*•]\s*|\d+\.\s*|\*\*[^*]+\*\*\s*)/i, ''));
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
  let currentActivityLines: string[] = [];
  
  // Process Markdown-style numbered lists (1. Title: content)
  const processNumberedActivities = (contentLines: string[]) => {
    for (let i = 0; i < contentLines.length; i++) {
      const line = contentLines[i].trim();
      
      // Skip empty lines
      if (!line) continue;
      
      // Check for numbered activity markers: "1. **Title** (duration):" or "1. **Title:**"
      const numberedActivityMatch = line.match(/^(\d+)\.\s*(?:\*\*([^*]+)\*\*|\s*([^:]+))(?:\s*\((\d+[^)]+)\))?:?/);
      
      if (numberedActivityMatch) {
        // Extract activity details
        const title = numberedActivityMatch[2] || numberedActivityMatch[3] || `Activity ${numberedActivityMatch[1]}`;
        const duration = numberedActivityMatch[4] ? `${numberedActivityMatch[4].trim()}` : "";
        
        // Get the content after the title/duration
        let description = line.substring(line.indexOf(':') + 1).trim();
        const steps = [description];
        
        // Add this as an activity
        activities.push({
          title: cleanMarkdown(title),
          duration,
          steps: steps.filter(s => s.length > 0).map(s => cleanMarkdown(s))
        });
      }
    }
  };
  
  // First pass: try to find structured activities with "Activity X:" format
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
      // If we were collecting lines for a previous activity, process them
      if (currentActivityLines.length > 0) {
        // Process the previous activity
        const title = extractActivityTitle(currentActivityLines[0]);
        const duration = extractDuration(currentActivityLines[0]) || "";
        
        // Join all lines after the first one as steps
        const activityContent = currentActivityLines.slice(1).join('\n');
        const steps = activityContent ? parseSteps(activityContent) : [];
        
        // If no steps were found, use first line description
        if (steps.length === 0) {
          const descriptionMatch = currentActivityLines[0].match(/\)\s*(.+)$/);
          if (descriptionMatch && descriptionMatch[1]) {
            steps.push(descriptionMatch[1].trim());
          } else {
            steps.push(`Explain ${title}.`);
          }
        }
        
        activities.push({ title, duration, steps });
        currentActivityLines = [];
      }
      
      // Start collecting lines for this new activity
      currentActivityLines.push(activityLine);
    } 
    // Add to current activity if we're in one
    else if (currentActivityLines.length > 0) {
      currentActivityLines.push(activityLine);
    }
  }
  
  // Process the last activity if there is one
  if (currentActivityLines.length > 0) {
    const title = extractActivityTitle(currentActivityLines[0]);
    const duration = extractDuration(currentActivityLines[0]) || "";
    
    // Join all lines after the first one as steps
    const activityContent = currentActivityLines.slice(1).join('\n');
    const steps = activityContent ? parseSteps(activityContent) : [];
    
    // If no steps were found, use first line description
    if (steps.length === 0) {
      const descriptionMatch = currentActivityLines[0].match(/\)\s*(.+)$/);
      if (descriptionMatch && descriptionMatch[1]) {
        steps.push(descriptionMatch[1].trim());
      } else {
        steps.push(`Explain ${title}.`);
      }
    }
    
    activities.push({ title, duration, steps });
  }
  
  // If no activities were found with the standard format, try processing numbered lists
  if (activities.length === 0) {
    processNumberedActivities(content);
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
      
      // Try to parse activities - first check for numbered format like "1. **Title** (duration):"
      const hasNumberedActivities = contentLines.some(line => 
        /^\d+\.\s*\*\*[^*]+\*\*(?:\s*\(\d+[^)]+\))?:/.test(line)
      );
      
      if (hasNumberedActivities) {
        try {
          const activities = parseActivities(contentLines);
          if (activities.length > 0) {
            sections.push({ 
              title: standardizedTitle, 
              content: contentLines, 
              activities,
              generated: false 
            });
            foundSections.add(standardizedTitle);
            continue;
          }
        } catch (error) {
          console.error(`Error parsing numbered activities: ${error}`);
        }
      }
      
      // If numbered activities didn't work, look for standard activity markers
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
        // Also include lines that are likely part of an activity description
        else if (isInActivity && !line.includes('**') && !/^activity\s+\d+:/i.test(line)) {
          activityLines.push(line);
        }
      }
      
      // If we found activity lines, parse them
      if (activityLines.length > 0) {
        try {
          const activities = parseActivities(activityLines);
          if (activities.length > 0) {
            sections.push({ 
              title: standardizedTitle, 
              content: contentLines, 
              activities,
              generated: false 
            });
            foundSections.add(standardizedTitle);
            continue;
          }
        } catch (error) {
          console.error(`Error parsing standard activities: ${error}`);
        }
      }
      
      // Last resort: try to parse numbered activities directly
      try {
        const numberedActivities = contentLines.filter(line => /^\d+\./.test(line));
        if (numberedActivities.length > 0) {
          const activities = parseActivities(numberedActivities);
          if (activities.length > 0) {
            sections.push({ 
              title: standardizedTitle, 
              content: contentLines, 
              activities,
              generated: false 
            });
            foundSections.add(standardizedTitle);
            continue;
          }
        }
      } catch (error) {
        console.error(`Error parsing direct numbered activities: ${error}`);
      }
    }
    
    // Default section parsing for non-activity sections or if activity parsing failed
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
