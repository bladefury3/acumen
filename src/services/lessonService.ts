
import { ParsedSection } from "@/types/lesson";
import { parseAIResponse } from "@/utils/parsers/lessonParser";
import { toast } from "sonner";
import { 
  getSectionContent, 
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
      learning_objectives: getSectionContent(sections, ['learning objectives', 'learning goals', 'objectives']),
      materials_resources: getSectionContent(sections, ['materials', 'resources', 'supplies']),
      introduction_hook: getSectionContent(sections, ['introduction', 'hook', 'opening']),
      assessment_strategies: getSectionContent(sections, ['assessment', 'evaluation', 'measuring']),
      differentiation_strategies: getSectionContent(sections, ['differentiation', 'accommodations', 'modifications']),
      close: getSectionContent(sections, ['close', 'closure', 'wrap up', 'conclusion']),
      activities: []
    };

    // Validate that we have all required sections
    const missingFields = validateParsedSections({
      learning_objectives: parsedLesson.learning_objectives,
      materials_resources: parsedLesson.materials_resources,
      introduction_hook: parsedLesson.introduction_hook,
      assessment_strategies: parsedLesson.assessment_strategies,
      differentiation_strategies: parsedLesson.differentiation_strategies,
      close: parsedLesson.close
    });
    
    if (missingFields.length > 0) {
      console.warn(`Missing fields in lesson plan: ${missingFields.join(', ')}`);
      // Instead of throwing an error, let's handle missing fields gracefully
      missingFields.forEach(field => {
        const key = field.toLowerCase().replace(/[\/\s]/g, '_') as keyof ParsedLesson;
        if (typeof parsedLesson[key] === 'string') {
          parsedLesson[key] = `Auto-generated ${field} section` as any;
        }
      });
    }

    // Extract activities - this is the key improvement part
    const activitiesSection = findActivitiesSection(sections);
    
    if (activitiesSection?.activities && activitiesSection.activities.length > 0) {
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
    } else {
      console.warn('No structured activities found in the lesson plan, looking for activities in all sections');
      
      // Try to find activities in any section that might contain them
      for (const section of sections) {
        // Look for Main Activities or similar titles
        if (section.title.toLowerCase().includes('activit') || 
            section.content.some(line => line.includes('Activity') || /\*\s+\*\*[^*]+\*\*\s*\(\d+/.test(line))) {
          
          console.log(`Attempting to extract activities from section: ${section.title}`);
          
          // Try to parse activities from this section
          const extractedActivities = section.content
            .filter(line => 
              line.includes('Activity') || 
              /\(\d+\s*min/i.test(line) ||
              /\*\s+\*\*[^*]+\*\*/.test(line) ||
              /^\d+\.\s+[^:]+/.test(line)
            );
            
          if (extractedActivities.length > 0) {
            console.log(`Found ${extractedActivities.length} potential activity lines`);
            
            // Use the specialized bullet point parser to extract activities
            const activities = extractedActivities.map(activityLine => {
              // Extract title
              let title = "Activity";
              const titleMatch = activityLine.match(/\*\s+\*\*([^*]+)\*\*/);
              if (titleMatch) {
                title = titleMatch[1].split('(')[0].trim();
              } else if (activityLine.includes(':')) {
                title = activityLine.split(':')[0].replace(/^.*Activity\s+\d+:\s*/i, '').trim();
              }
              
              // Extract duration
              const durationMatch = activityLine.match(/\((\d+)[^)]*\)/);
              const duration = durationMatch ? `${durationMatch[1]} minutes` : 'Duration not specified';
              
              // Extract description/instructions
              let instructions = '';
              if (activityLine.includes(':')) {
                const parts = activityLine.split(':');
                if (parts.length > 1) {
                  instructions = parts.slice(1).join(':').trim();
                }
              } else if (activityLine.includes(')')) {
                const parts = activityLine.split(')');
                if (parts.length > 1) {
                  instructions = parts.slice(1).join(')').trim();
                }
              }
              
              return {
                activity_name: title,
                description: duration,
                instructions: instructions
              };
            });
            
            if (activities.length > 0) {
              parsedLesson.activities = activities;
              break;
            }
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
    toast.error(`Failed to create lesson plan: ${(error as Error).message}`);
    throw error;
  }
};
