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
  // First, handle "* **Activity Name (duration):**" format, which is common in our AI responses
  const bulletPointFormat = text.match(/\*\s*\*\*([^*]+)\*\*/i);
  if (bulletPointFormat) {
    // Remove any duration in parentheses
    return cleanMarkdown(bulletPointFormat[1].split('(')[0].trim());
  }
  
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
 * Extract the description part from an activity line 
 * e.g., "* **Activity Name (10 minutes):** Description here" -> "Description here"
 */
export const extractActivityDescription = (text: string): string => {
  // Look for description after the colon
  const parts = text.split(':');
  if (parts.length > 1) {
    // Join all parts after the first colon (in case there are multiple colons)
    return cleanMarkdown(parts.slice(1).join(':').trim());
  }
  
  // If no colon is found, try to extract description after parentheses
  const parenParts = text.split(')');
  if (parenParts.length > 1) {
    return cleanMarkdown(parenParts.slice(1).join(')').trim());
  }
  
  // If no structured format is found, just return the cleaned text
  return cleanMarkdown(text);
};

/**
 * Parse a chunk of text into steps
 */
export const parseSteps = (content: string): string[] => {
  // If the content is empty, return an empty array
  if (!content.trim()) {
    return [];
  }
  
  // If the content already contains bullet points or numbers, split by them
  if (/[-•*]\s|^\d+\.\s/m.test(content)) {
    return content
      .split(/(?:\r?\n|\s*[+•*-]\s*|\d+\.\s*)/)
      .map(step => step.trim())
      .filter(step => step.length > 0)
      .map(step => {
        const cleanStep = cleanMarkdown(step);
        return cleanStep.endsWith('.') ? cleanStep : `${cleanStep}.`;
      });
  }
  
  // Otherwise, treat the whole content as a single step
  const cleanContent = cleanMarkdown(content);
  return [cleanContent.endsWith('.') ? cleanContent : `${cleanContent}.`];
};

/**
 * Parse activities from bullet point format: * **Activity Name (duration):** Description
 * This format is commonly used in the AI responses
 */
export const parseBulletPointActivities = (contentLines: string[]): Activity[] => {
  const activities: Activity[] = [];
  
  for (const line of contentLines) {
    if (!line.trim()) continue;
    
    // Check if line matches the bullet point activity pattern
    // Pattern: * **Activity Name (10 minutes):** Description
    const bulletActivityMatch = line.match(/\*\s*\*\*([^*]+)\*\*\s*(?:\(([^)]+)\))?\s*:\s*(.*)/i);
    
    if (bulletActivityMatch) {
      const title = bulletActivityMatch[1].trim();
      const duration = bulletActivityMatch[2] ? bulletActivityMatch[2].trim() : "";
      const description = bulletActivityMatch[3] ? bulletActivityMatch[3].trim() : "";
      
      // Parse description into steps
      const steps = description ? parseSteps(description) : [`Explain ${cleanMarkdown(title)}.`];
      
      activities.push({
        title: cleanMarkdown(title),
        duration: duration,
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
  // First try to extract bullet point activities (most common format in AI responses)
  const bulletPointActivities = parseBulletPointActivities(content);
  if (bulletPointActivities.length > 0) {
    return bulletPointActivities;
  }
  
  // If bullet point extraction failed, try other formats
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
          const description = extractActivityDescription(currentActivityLines[0]);
          if (description) {
            steps.push(description);
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
      const description = extractActivityDescription(currentActivityLines[0]);
      if (description) {
        steps.push(description);
      } else {
        steps.push(`Explain ${title}.`);
      }
    }
    
    activities.push({ title, duration, steps });
  }
  
  return activities;
};

/**
 * Main function to extract activities from content
 * Simplified to focus on the most common formats used in the AI responses
 */
export const extractActivitiesWithFallbacks = (contentLines: string[]): Activity[] => {
  try {
    console.log('Extracting activities from content lines:', contentLines);
    
    // Strategy 1: Try to parse bullet point activities (most common format)
    const bulletActivities = parseBulletPointActivities(contentLines);
    if (bulletActivities.length > 0) {
      console.log('Successfully parsed bullet point activities:', bulletActivities);
      return bulletActivities;
    }
    
    // Strategy 2: Use the general activity parser
    const activities = parseActivities(contentLines);
    if (activities.length > 0) {
      console.log('Successfully parsed activities using general parser:', activities);
      return activities;
    }
    
    // Strategy 3: Look for any lines with duration patterns
    const durationLines = contentLines.filter(line => /\(\d+\s*(?:min|minute|minutes)\)/i.test(line));
    if (durationLines.length > 0) {
      const parsedDurationActivities = parseActivities(durationLines);
      if (parsedDurationActivities.length > 0) {
        console.log('Parsed activities from duration lines:', parsedDurationActivities);
        return parsedDurationActivities;
      }
    }
    
    console.warn('No activities found using any parsing strategy');
    return [];
  } catch (error) {
    console.error('Error extracting activities:', error);
    return [];
  }
};
