
import { Activity, ParsedSection } from "@/types/lesson";
import { 
  cleanMarkdown, 
  extractSections, 
  findSectionContent,
  identifySectionType, 
  findActivitiesSection, 
  validateParsedSections 
} from "./sectionParser";

/**
 * Main function to parse AI response into structured sections
 */
export const parseAIResponse = (aiResponse: string): ParsedSection[] => {
  try {
    console.log('Starting to parse AI response...');
    
    // Extract sections from the AI response
    const rawSections = extractSections(aiResponse);
    
    if (rawSections.length === 0) {
      throw new Error("No valid sections found in AI response");
    }
    
    // Required sections that we need to find
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
    const sections: ParsedSection[] = [];
    
    // Process each extracted section
    for (const rawSection of rawSections) {
      const sectionTitle = identifySectionType(rawSection.title);
      const contentLines = rawSection.content.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
      
      // For Activities section, extract activity information
      const section: ParsedSection = {
        title: sectionTitle,
        content: contentLines,
        generated: false
      };
      
      if (sectionTitle === 'Activities') {
        console.log('Processing Activities section...');
        try {
          // Parse activity content into structured activities
          const activities = parseActivitiesFromContent(contentLines);
          if (activities.length > 0) {
            console.log(`Found ${activities.length} activities`);
            section.activities = activities;
          }
        } catch (error) {
          console.error('Error extracting activities:', error);
        }
      }
      
      sections.push(section);
      foundSections.add(sectionTitle);
    }
    
    // Check for missing required sections
    const missingSections = Array.from(requiredSections)
      .filter(section => !foundSections.has(section));
    
    if (missingSections.length > 0) {
      console.warn(`Missing sections: ${missingSections.join(', ')}`);
      
      // Try to find a section that might contain activities if Activities is missing
      if (missingSections.includes('Activities')) {
        const potentialActivitiesSection = sections.find(s => 
          s.title.includes('Activity') || s.title.includes('Main') || s.content.some(line => 
            /activity\s+\d+:/i.test(line) || /\d+\.\s+[^:]+\s*\(\d+/.test(line)
          )
        );
        
        if (potentialActivitiesSection) {
          console.log('Found potential activities section:', potentialActivitiesSection.title);
          // Parse activities from this section
          const activities = parseActivitiesFromContent(potentialActivitiesSection.content);
          
          if (activities.length > 0) {
            sections.push({
              title: 'Activities',
              content: potentialActivitiesSection.content,
              activities,
              generated: true
            });
            foundSections.add('Activities');
            missingSections.splice(missingSections.indexOf('Activities'), 1);
          }
        }
      }
      
      // If there are still missing sections, try to generate them from the content
      if (missingSections.length > 0) {
        for (const missingSection of missingSections) {
          console.log(`Generating missing section: ${missingSection}`);
          sections.push({
            title: missingSection,
            content: [`Auto-generated ${missingSection.toLowerCase()} section`],
            generated: true
          });
        }
      }
    }
    
    return sections;
  } catch (error) {
    console.error('Error parsing AI response:', error);
    throw new Error(`Failed to parse AI response: ${error.message}`);
  }
};

/**
 * Parse activities from content lines
 */
export const parseActivitiesFromContent = (contentLines: string[]): Activity[] => {
  const activities: Activity[] = [];
  let currentActivity: Partial<Activity> | null = null;
  
  for (const line of contentLines) {
    // Skip empty lines
    if (!line.trim()) continue;
    
    // Check for activity title patterns
    const activityTitleMatch = line.match(/^\s*(?:Activity\s+(\d+)|(\*\*[^*]+\*\*)|\d+\.\s+([^:]+))(?:\s*\(([^)]+)\))?(?:\s*:)?/i);
    
    if (activityTitleMatch) {
      // If we have a current activity, add it to the list
      if (currentActivity?.title) {
        activities.push(currentActivity as Activity);
      }
      
      // Extract title and duration
      let title = activityTitleMatch[1] ? `Activity ${activityTitleMatch[1]}` : 
                 activityTitleMatch[2] ? activityTitleMatch[2].replace(/\*\*/g, '') : 
                 activityTitleMatch[3] ? activityTitleMatch[3].trim() : 'Activity';
      
      const duration = activityTitleMatch[4] || 'Duration not specified';
      
      // Start a new activity
      currentActivity = {
        title,
        duration,
        steps: []
      };
    } else if (currentActivity) {
      // This line is part of the current activity's steps
      // Clean the line of markdown formatting and leading bullet points
      const cleanedLine = line.replace(/^\s*[-*•]\s*|\d+\.\s*/, '').trim();
      if (cleanedLine) {
        currentActivity.steps = currentActivity.steps || [];
        currentActivity.steps.push(cleanedLine);
      }
    }
  }
  
  // Add the last activity if it exists
  if (currentActivity?.title) {
    activities.push(currentActivity as Activity);
  }
  
  // If no activities were found but there are content lines, create a default activity
  if (activities.length === 0 && contentLines.length > 0) {
    activities.push({
      title: 'Main Activity',
      duration: 'Duration not specified',
      steps: contentLines.map(line => line.replace(/^\s*[-*•]\s*|\d+\.\s*/, '').trim()).filter(Boolean)
    });
  }
  
  return activities;
};

/**
 * Utility function for manual testing of parser
 */
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
