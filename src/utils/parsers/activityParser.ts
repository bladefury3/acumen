
import { Activity } from "@/types/lesson";
import { cleanMarkdown } from "./sectionParser";

/**
 * Extract duration from text (various formats)
 */
export const extractDuration = (text: string): string | null => {
  // Pattern 1: Duration in parentheses like "(10 minutes)"
  const pattern1 = text.match(/\((\d+)\s*(?:minute|min|minutes|mins)?\)/i);
  if (pattern1) return `${pattern1[1]} minutes`;
  
  // Pattern 2: Explicit duration indicators like "10 minutes:"
  const pattern2 = text.match(/(\d+)\s*(?:minute|min|minutes|mins)(?:\s*:)/i);
  if (pattern2) return `${pattern2[1]} minutes`;
  
  // Pattern 3: Standalone time reference (e.g., "Duration: 15 minutes")
  const pattern3 = text.match(/duration:?\s*(\d+)\s*(?:minute|min|minutes|mins)/i);
  if (pattern3) return `${pattern3[1]} minutes`;
  
  return null;
};

/**
 * Extract activity title from text
 */
export const extractActivityTitle = (text: string): string => {
  // Remove duration in parentheses
  let titleText = text.split('(')[0];
  
  // Handle "Activity X:" format
  const activityPrefix = /^(?:activity\s+\d+\s*:|[-*•]\s*activity\s+\d+\s*:)/i;
  if (activityPrefix.test(titleText)) {
    titleText = titleText.replace(activityPrefix, '').trim();
  } 
  // Handle numbered list format (e.g., "1. Activity Name")
  else if (/^\d+\.\s+/.test(titleText)) {
    titleText = titleText.replace(/^\d+\.\s+/, '').trim();
  }
  
  // Handle bold formatting
  titleText = titleText.replace(/\*\*([^*]+)\*\*/g, '$1').trim();
  
  // If there's a standalone colon, extract the title before it
  if (titleText.includes(':') && !/^activity\s+\d+\s*$/i.test(titleText.split(':')[0].trim())) {
    titleText = titleText.split(':')[0].trim();
  }
  
  return cleanMarkdown(titleText);
};

/**
 * Parse a chunk of text into steps
 */
export const parseSteps = (content: string): string[] => {
  // Split by common separators: newlines, bullet points, numbered items
  const rawSteps = content
    .split(/(?:\r?\n|\s*[+•-]\s*|\d+\.\s*)/)
    .map(step => step.trim())
    .filter(step => step.length > 0);
  
  // Clean up steps and ensure they end with a period
  return rawSteps.map(step => {
    const cleanStep = cleanMarkdown(step);
    return cleanStep.endsWith('.') ? cleanStep : `${cleanStep}.`;
  });
};

/**
 * Try to extract activities from a list format (1. Activity: description)
 */
export const extractNumberedActivities = (contentLines: string[]): Activity[] => {
  const activities: Activity[] = [];
  
  for (const line of contentLines) {
    if (!line.trim()) continue;
    
    // Match patterns like: "1. Activity Name (10 minutes): description"
    // or "1. **Activity Name** (10 minutes): description"
    const numberedActivityMatch = line.match(/^\d+\.\s*(?:\*\*([^*]+)\*\*|\s*([^:(]+))(?:\s*\((\d+[^)]+)\))?:?(.+)?/);
    
    if (numberedActivityMatch) {
      const title = numberedActivityMatch[1] || numberedActivityMatch[2] || '';
      const duration = numberedActivityMatch[3] ? `${numberedActivityMatch[3].trim()}` : "";
      let description = numberedActivityMatch[4] ? numberedActivityMatch[4].trim() : "";
      
      if (!description && title) {
        description = `Explain ${title}.`;
      }
      
      const steps = description ? [cleanMarkdown(description)] : [`Explain ${cleanMarkdown(title)}.`];
      
      activities.push({
        title: cleanMarkdown(title),
        duration,
        steps
      });
    }
  }
  
  return activities;
};

/**
 * Parse activities from markdown content
 */
export const parseActivities = (content: string[]): Activity[] => {
  // First try to extract numbered activities
  const numberedActivities = extractNumberedActivities(content);
  if (numberedActivities.length > 0) {
    return numberedActivities;
  }
  
  // If numbered extraction failed, try other formats
  const activities: Activity[] = [];
  let currentActivityLines: string[] = [];
  
  // Process content line by line
  for (let i = 0; i < content.length; i++) {
    const line = content[i].trim();
    if (!line) continue;
    
    // Activity marker patterns
    const isActivityStart = 
      line.includes('**Activity') || 
      /^Activity\s+\d+:/i.test(line) ||
      /^[-*•]\s*Activity\s+\d+:/i.test(line) ||
      /^\*\*[^*]+\*\*\s*\(\d+\s*min/i.test(line) || // Bold title with duration
      /^\d+\.\s+\*\*[^*]+\*\*/i.test(line);         // Numbered with bold title
    
    if (isActivityStart) {
      // Process previous activity if any
      if (currentActivityLines.length > 0) {
        const title = extractActivityTitle(currentActivityLines[0]);
        const duration = extractDuration(currentActivityLines[0]) || "";
        
        const activityContent = currentActivityLines.slice(1).join('\n');
        const steps = activityContent ? parseSteps(activityContent) : [];
        
        if (steps.length === 0) {
          const descMatch = currentActivityLines[0].match(/\)\s*(.+)$/);
          if (descMatch && descMatch[1]) {
            steps.push(cleanMarkdown(descMatch[1].trim()));
          } else {
            steps.push(`Explain ${title}.`);
          }
        }
        
        activities.push({ title, duration, steps });
        currentActivityLines = [];
      }
      
      // Start new activity
      currentActivityLines.push(line);
    } 
    // Add to current activity if we're processing one
    else if (currentActivityLines.length > 0) {
      currentActivityLines.push(line);
    }
  }
  
  // Process the last activity if any
  if (currentActivityLines.length > 0) {
    const title = extractActivityTitle(currentActivityLines[0]);
    const duration = extractDuration(currentActivityLines[0]) || "";
    
    const activityContent = currentActivityLines.slice(1).join('\n');
    const steps = activityContent ? parseSteps(activityContent) : [];
    
    if (steps.length === 0) {
      const descMatch = currentActivityLines[0].match(/\)\s*(.+)$/);
      if (descMatch && descMatch[1]) {
        steps.push(cleanMarkdown(descMatch[1].trim()));
      } else {
        steps.push(`Explain ${title}.`);
      }
    }
    
    activities.push({ title, duration, steps });
  }
  
  // Fallback for sections with distinct structure (like the pokémon example)
  if (activities.length === 0) {
    // Look for numbered activities (e.g. "1. Continent Introduction (10 minutes): description")
    const numberedItems = content.filter(line => /^\d+\.\s+[^:]+\s*\(\d+/.test(line));
    if (numberedItems.length > 0) {
      for (const item of numberedItems) {
        const titleMatch = item.match(/^\d+\.\s+([^(]+)/);
        const durationMatch = item.match(/\((\d+)[^)]*\)/);
        const description = item.includes(':') ? item.split(':')[1].trim() : '';
        
        if (titleMatch) {
          activities.push({
            title: cleanMarkdown(titleMatch[1]),
            duration: durationMatch ? `${durationMatch[1]} minutes` : '',
            steps: description ? [cleanMarkdown(description)] : [`Conduct the ${titleMatch[1].trim()} activity.`]
          });
        }
      }
    }
  }
  
  return activities;
};

/**
 * Attempt to extract activities with multiple strategies
 */
export const extractActivitiesWithFallbacks = (contentLines: string[]): Activity[] => {
  try {
    // Strategy 1: Try to parse marked activities (with ** or "Activity" prefix)
    const activities = parseActivities(contentLines);
    if (activities.length > 0) return activities;
    
    // Strategy 2: Check for numbered activities
    const numberedActivities = contentLines.filter(line => /^\d+\.\s+/.test(line));
    if (numberedActivities.length > 0) {
      return parseActivities(numberedActivities);
    }
    
    // Strategy 3: Look for any lines with duration patterns
    const durationLines = contentLines.filter(line => /\(\d+\s*(?:min|minute|minutes)\)/i.test(line));
    if (durationLines.length > 0) {
      return parseActivities(durationLines);
    }
    
    // Strategy 4: Extract anything that looks like an activity
    // This is the most flexible but least accurate approach
    const potentialActivities = contentLines.filter(line => 
      line.length > 30 && // Arbitrary length to avoid short headers
      !line.startsWith('#') && 
      !/^[-*•]/.test(line) // Not just a bullet point
    );
    
    if (potentialActivities.length > 0) {
      return potentialActivities.map(line => {
        const title = line.split(':')[0].trim() || "Activity";
        return {
          title: cleanMarkdown(title),
          duration: extractDuration(line) || "",
          steps: [cleanMarkdown(line.includes(':') ? line.split(':')[1].trim() : line)]
        };
      });
    }
    
    return [];
  } catch (error) {
    console.error('Error extracting activities:', error);
    return [];
  }
};
