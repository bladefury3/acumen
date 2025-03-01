
import { ParsedSection } from "@/types/lesson";
import { parseAIResponse } from "@/utils/parsers/lessonParser";
import { toast } from "sonner";
import { 
  findSectionContent, 
  validateParsedSections, 
  findActivitiesSection 
} from "@/utils/parsers/sectionParser";
import { 
  cleanExistingLessonData, 
  createNewLesson, 
  createActivities 
} from "./lesson/databaseOperations";
import { ParsedLesson } from "./lesson/types";

export const parseAndStoreAIResponse = async (aiResponse: string, responseId: string) => {
  try {
    console.log('Parsing AI response for lesson plan...');
    const sections = parseAIResponse(aiResponse);
    console.log('Parsed sections:', sections);

    const parsedLesson: ParsedLesson = {
      learning_objectives: findSectionContent(sections, ['learning objectives', 'learning goals', 'objectives']),
      materials_resources: findSectionContent(sections, ['materials', 'resources', 'supplies']),
      introduction_hook: findSectionContent(sections, ['introduction', 'hook', 'opening']),
      assessment_strategies: findSectionContent(sections, ['assessment', 'evaluation', 'measuring']),
      differentiation_strategies: findSectionContent(sections, ['differentiation', 'accommodations', 'modifications']),
      close: findSectionContent(sections, ['close', 'closure', 'wrap up', 'conclusion']),
      activities: []
    };

    // Validate that we have all required sections
    const missingFields = validateParsedSections(parsedLesson);
    if (missingFields.length > 0) {
      console.warn(`Missing fields in lesson plan: ${missingFields.join(', ')}`);
      // Instead of throwing an error, let's handle missing fields gracefully
      missingFields.forEach(field => {
        parsedLesson[field.toLowerCase().replace(/[\/\s]/g, '_') as keyof ParsedLesson] = 
          `Auto-generated ${field} section`;
      });
    }

    // Extract activities
    const activitiesSection = findActivitiesSection(sections);
    if (!activitiesSection?.activities || activitiesSection.activities.length === 0) {
      console.warn('No structured activities found in the lesson plan, attempting to parse from content');
      
      // Extract activities from any section that might contain them
      for (const section of sections) {
        if (section.content.some(line => 
          line.includes('Activity') || 
          /\(\d+\s*min/i.test(line) ||
          /^\d+\.\s+[^:]+/.test(line)
        )) {
          const extractedActivities = section.content
            .filter(line => 
              line.includes('Activity') || 
              /\(\d+\s*min/i.test(line) ||
              /^\d+\.\s+[^:]+/.test(line)
            )
            .map(activityLine => {
              // Extract title
              let title = activityLine;
              if (activityLine.includes('(')) {
                title = activityLine.split('(')[0];
              }
              if (title.includes(':')) {
                title = title.split(':')[0];
              }
              
              // Clean up title
              title = title.replace(/^Activity\s+\d+:?\s*|\d+\.\s*/i, '').trim();
              
              // Extract duration
              const durationMatch = activityLine.match(/\((\d+)\s*min/i);
              const duration = durationMatch ? `${durationMatch[1]} minutes` : 'Duration not specified';
              
              // Extract description
              let instructions = activityLine;
              if (activityLine.includes(':')) {
                const parts = activityLine.split(':');
                if (parts.length > 1) {
                  instructions = parts.slice(1).join(':').trim();
                }
              }
              
              return {
                activity_name: title,
                description: duration,
                instructions: instructions
              };
            });
          
          if (extractedActivities.length > 0) {
            parsedLesson.activities = extractedActivities;
            break;
          }
        }
      }
      
      // If still no activities, create a default one
      if (parsedLesson.activities.length === 0) {
        console.warn('Creating a default activity as none were found');
        parsedLesson.activities = [{
          activity_name: "Main Activity",
          description: "Duration not specified",
          instructions: "Complete the main activity for this lesson."
        }];
      }
    } else {
      console.log(`Found ${activitiesSection.activities.length} structured activities`);
      
      // Map the structured activities to the format expected by createActivities
      parsedLesson.activities = activitiesSection.activities.map(activity => {
        console.log(`Processing activity: ${activity.title} (${activity.duration})`);
        
        return {
          activity_name: activity.title,
          description: activity.duration || 'Duration not specified',
          instructions: activity.steps.join('\n')
        };
      });
    }

    console.log(`Processed activities: ${parsedLesson.activities.length}`);
    console.log(parsedLesson.activities);

    // First clean up any existing data for this response ID
    await cleanExistingLessonData(responseId);
    
    // Create the new lesson record
    const newLesson = await createNewLesson(responseId, parsedLesson);
    
    // Create activities with proper reference to the lesson ID
    await createActivities(newLesson.id, parsedLesson.activities);

    return sections;
  } catch (error) {
    console.error('Error parsing and storing AI response:', error);
    toast.error(`Failed to create lesson plan: ${error.message}`);
    throw error;
  }
};
