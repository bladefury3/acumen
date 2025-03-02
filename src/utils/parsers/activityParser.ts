import { Activity } from "@/types/lesson";
import { cleanMarkdown } from "./sectionParser";

/**
 * Extract duration from text in various formats
 */
export const extractDuration = (text: string): string | null => {
  // Check for explicit Duration: label
  const explicitDurationMatch = text.match(/Duration:\s*(\d+)\s*(?:minutes?|mins?)/i);
  if (explicitDurationMatch) return `${explicitDurationMatch[1]} minutes`;
  
  // Pattern for duration in parentheses: (15 minutes)
  const durationMatch = text.match(/\((\d+)\s*(?:minutes?|mins?)?\)/i);
  if (durationMatch) return `${durationMatch[1]} minutes`;
  
  // Fallback: if there's any number in the text, assume it's minutes
  const numMatch = text.match(/(\d+)/);
  if (numMatch) return `${numMatch[1]} minutes`;
  
  return null;
};

/**
 * Extract activity title from text
 */
export const extractActivityTitle = (text: string): string => {
  // Format 1: "- **Activity X: Title (duration)**"
  const activityPattern = /\*\*Activity\s+\d+:\s+([^(]*)/i;
  const match = text.match(activityPattern);
  if (match) {
    return cleanMarkdown(match[1].trim());
  }
  
  // Format 2: "- **Title (duration)**"
  const titlePattern = /\*\*([^(]*)/i;
  const titleMatch = text.match(titlePattern);
  if (titleMatch) {
    return cleanMarkdown(titleMatch[1].trim());
  }
  
  // Format 3: "#### Activity X: Title (duration)"
  const headingActivityPattern = /####\s*Activity\s+\d+:\s+([^(]*)/i;
  const headingMatch = text.match(headingActivityPattern);
  if (headingMatch) {
    return cleanMarkdown(headingMatch[1].trim());
  }
  
  // Fallback: just clean the text and use what we have
  return cleanMarkdown(text.split('(')[0].trim());
};

/**
 * Parse numbered step format:
 * 1. **Step 1**: Step description...
 * 2. **Step 2**: Step description...
 */
export const parseNumberedStepsFormat = (contentLines: string[]): string[] => {
  const steps: string[] = [];
  
  for (const line of contentLines) {
    // Match pattern: "1. **Step X**: Description"
    const stepMatch = line.match(/^\d+\.\s*\*\*Step\s+\d+\*\*:\s*(.*)/i);
    if (stepMatch) {
      steps.push(cleanMarkdown(stepMatch[1].trim()));
    }
    // Also try to match just numbered lines without the Step label
    else if (/^\d+\.\s+/.test(line)) {
      const description = line.replace(/^\d+\.\s+/, '');
      steps.push(cleanMarkdown(description.trim()));
    }
  }
  
  return steps;
};

/**
 * Parse activities with explicit steps from the format:
 * #### Activity X: Title (duration)
 * ##### Step 1: Step Title
 * Step description...
 * ##### Step 2: Step Title
 * Step description...
 */
export const parseActivitiesWithExplicitSteps = (contentLines: string[]): Activity[] => {
  const activities: Activity[] = [];
  let currentActivity: Activity | null = null;
  let currentStep: string | null = null;
  let stepDescription: string[] = [];
  let inDurationSection = false;
  
  for (let i = 0; i < contentLines.length; i++) {
    const line = contentLines[i].trim();
    if (!line) continue;
    
    // Check if this is an activity heading (starts with #### Activity)
    const isActivityHeading = /^####\s+Activity/.test(line);
    
    // Check if this is a step heading (starts with ##### Step)
    const isStepHeading = /^#####\s+Step/.test(line);
    
    // Check if this is a duration heading
    const isDurationHeading = /^#####\s+Duration:/.test(line);
    
    // Check if this is a numbered step format: "1. **Step 1**: ..."
    const isNumberedStep = /^\d+\.\s*\*\*Step\s+\d+\*\*:/.test(line);
    
    if (isActivityHeading) {
      // If we were processing an activity, add its last step and then add it to our list
      if (currentActivity && currentStep && stepDescription.length > 0) {
        currentActivity.steps.push(stepDescription.join(' '));
      }
      
      // If we were processing an activity, add it to our list
      if (currentActivity) {
        activities.push(currentActivity);
      }
      
      // Start a new activity
      const title = extractActivityTitle(line);
      const duration = extractDuration(line) || "0 minutes";
      
      currentActivity = {
        title: title,
        duration: duration,
        steps: []
      };
      
      // Reset step tracking
      currentStep = null;
      stepDescription = [];
      inDurationSection = false;
    } 
    else if (isDurationHeading && currentActivity) {
      // Update the duration if there's an explicit duration heading
      const duration = extractDuration(line);
      if (duration) {
        currentActivity.duration = duration;
      }
      inDurationSection = true;
    }
    else if (isNumberedStep && currentActivity) {
      // If we were already tracking a numbered step, add it before starting the new one
      if (stepDescription.length > 0) {
        currentActivity.steps.push(stepDescription.join(' '));
        stepDescription = [];
      }
      
      // Start tracking the new numbered step
      const stepMatch = line.match(/^\d+\.\s*\*\*Step\s+\d+\*\*:\s*(.*)/i);
      if (stepMatch) {
        stepDescription.push(cleanMarkdown(stepMatch[1].trim()));
      }
    }
    else if (isStepHeading && currentActivity) {
      // If we were processing a step, save it before starting a new one
      if (currentStep && stepDescription.length > 0) {
        currentActivity.steps.push(stepDescription.join(' '));
      }
      
      // Start tracking a new step
      currentStep = line.replace(/^#####\s+Step\s+\d+:\s*/, '').trim();
      stepDescription = [];
    }
    else if (currentActivity) {
      // Skip duration section content as we already extracted the duration
      if (inDurationSection) {
        inDurationSection = false;  // End of duration section
        continue;
      }
      
      // This is part of the current step description or activity content
      if (currentStep || stepDescription.length > 0 || isNumberedStep) {
        stepDescription.push(cleanMarkdown(line));
      }
    }
  }
  
  // Don't forget to add the last step and the last activity
  if (currentActivity && stepDescription.length > 0) {
    currentActivity.steps.push(stepDescription.join(' '));
  }
  
  if (currentActivity) {
    activities.push(currentActivity);
  }
  
  return activities;
};

/**
 * Parse activities from the new format:
 * - **Activity X: Title (duration)**
 *   - Step 1
 *   - Step 2
 */
export const parseActivitiesNewFormat = (contentLines: string[]): Activity[] => {
  const activities: Activity[] = [];
  let currentActivity: Activity | null = null;
  
  for (let i = 0; i < contentLines.length; i++) {
    const line = contentLines[i].trim();
    if (!line) continue;
    
    // Check if this is an activity heading
    // Pattern: "- **Activity X: Title (duration)**" or similar
    const isActivityHeading = line.startsWith('-') && 
                             line.includes('**') && 
                             (line.includes('Activity') || /\*\*[^*]+\*\*\s*\(\d+/.test(line));
    
    if (isActivityHeading) {
      // If we were processing an activity, add it to our list
      if (currentActivity) {
        activities.push(currentActivity);
      }
      
      // Start a new activity
      const title = extractActivityTitle(line);
      const duration = extractDuration(line) || "0 minutes";
      
      currentActivity = {
        title: title,
        duration: duration,
        steps: []
      };
    } 
    // If this is an indented bullet point and we're already processing an activity, it's a step
    else if (currentActivity && (line.startsWith('  -') || line.startsWith('    -'))) {
      const step = cleanMarkdown(line.replace(/^\s*-\s+/, '').trim());
      if (step) {
        currentActivity.steps.push(step);
      }
    }
  }
  
  // Don't forget to add the last activity
  if (currentActivity) {
    activities.push(currentActivity);
  }
  
  return activities;
};

/**
 * Process format with numbered steps like:
 * #### Activity 1: Title (duration)
 * ##### Duration: 15 minutes
 * 1. **Step 1**: Description...
 * 2. **Step 2**: Description...
 */
export const parseActivitiesWithNumberedSteps = (contentLines: string[]): Activity[] => {
  const activities: Activity[] = [];
  let currentActivity: Activity | null = null;
  let currentActivityLines: string[] = [];
  
  for (let i = 0; i < contentLines.length; i++) {
    const line = contentLines[i].trim();
    if (!line) continue;
    
    // Check if this is an activity heading (starts with #### Activity)
    const isActivityHeading = /^####\s+Activity/.test(line);
    
    if (isActivityHeading) {
      // If we were processing an activity, parse its steps and add it to our list
      if (currentActivity && currentActivityLines.length > 0) {
        // Try to extract steps from numbered format
        const steps = parseNumberedStepsFormat(currentActivityLines);
        if (steps.length > 0) {
          currentActivity.steps = steps;
        }
        activities.push(currentActivity);
      }
      
      // Start a new activity
      const title = extractActivityTitle(line);
      const duration = extractDuration(line) || "0 minutes";
      
      currentActivity = {
        title: title,
        duration: duration,
        steps: []
      };
      
      // Reset activity content lines
      currentActivityLines = [];
    } 
    else if (currentActivity) {
      // Check if this is a duration line
      if (/^#####\s+Duration:/.test(line)) {
        const duration = extractDuration(line);
        if (duration) {
          currentActivity.duration = duration;
        }
      } else {
        // Add this line to the current activity's content
        currentActivityLines.push(line);
      }
    }
  }
  
  // Don't forget to process and add the last activity
  if (currentActivity && currentActivityLines.length > 0) {
    // Try to extract steps from numbered format
    const steps = parseNumberedStepsFormat(currentActivityLines);
    if (steps.length > 0) {
      currentActivity.steps = steps;
    }
    activities.push(currentActivity);
  }
  
  return activities;
};

/**
 * Main function to extract activities from content
 */
export const extractActivitiesWithFallbacks = (contentLines: string[]): Activity[] => {
  try {
    console.log('Extracting activities from content lines...');
    
    // First try the explicit steps format (most detailed)
    const explicitStepActivities = parseActivitiesWithExplicitSteps(contentLines);
    if (explicitStepActivities.length > 0) {
      console.log('Successfully parsed activities with explicit steps format:', explicitStepActivities);
      return explicitStepActivities;
    }
    
    // Then try the numbered steps format
    const numberedStepActivities = parseActivitiesWithNumberedSteps(contentLines);
    if (numberedStepActivities.length > 0) {
      console.log('Successfully parsed activities with numbered steps format:', numberedStepActivities);
      return numberedStepActivities;
    }
    
    // Then try the new format parser (more common in AI responses)
    const activities = parseActivitiesNewFormat(contentLines);
    if (activities.length > 0) {
      console.log('Successfully parsed activities with new format:', activities);
      return activities;
    }
    
    console.warn('No activities found using any parser');
    return [];
  } catch (error) {
    console.error('Error extracting activities:', error);
    return [];
  }
};
