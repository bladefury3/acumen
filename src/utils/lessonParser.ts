
import { ParsedSection, Activity } from "@/types/lesson";

export const parseAIResponse = (aiResponse: string): ParsedSection[] => {
  try {
    // Extract sections using regex pattern matching
    const sectionPattern = /## ([^#\n]+)(?:\n|$)([\s\S]*?)(?=\n## |$)/g;
    const sections: ParsedSection[] = [];
    let match;

    while ((match = sectionPattern.exec(aiResponse)) !== null) {
      const title = match[1].trim();
      const content = match[2].trim();

      // Check if this is an activities section
      if (title.toLowerCase().includes("activities")) {
        const activities = parseActivities(content);
        sections.push({
          title,
          content: [],
          activities,
        });
      } else {
        // For non-activity sections, parse as bullet points
        const contentItems = content
          .split(/\n- |^\n- |\n\* |\* /)
          .map((item) => item.trim())
          .filter((item) => item.length > 0);

        sections.push({
          title,
          content: contentItems,
        });
      }
    }

    // If no sections were found using the ## pattern, try alternative patterns
    if (sections.length === 0) {
      return parseAlternativeFormat(aiResponse);
    }

    return sections;
  } catch (error) {
    console.error("Error parsing AI response:", error);
    return [];
  }
};

const parseActivities = (activitiesContent: string): Activity[] => {
  try {
    // Extract activities and their steps
    const activityPattern = /### ([^#\n]+)(?:\n|$)([\s\S]*?)(?=\n### |$)/g;
    const activities: Activity[] = [];
    let match;

    while ((match = activityPattern.exec(activitiesContent)) !== null) {
      const title = match[1].trim();
      const content = match[2].trim();

      // Extract duration if present
      let duration = "15 minutes"; // Default duration
      const durationMatch = title.match(/\((\d+\s*(?:min|minute|minutes))\)/i);
      if (durationMatch) {
        duration = durationMatch[1];
      }

      // Extract steps
      const steps = content
        .split(/\n- |^\n- |\n\* |\* /)
        .map((step) => step.trim())
        .filter((step) => step.length > 0);

      activities.push({
        title: title.replace(/\(.*\)/, "").trim(), // Remove duration from title
        duration,
        steps,
      });
    }

    // If no activities were found using the ### pattern, try simple bullet points
    if (activities.length === 0) {
      const lines = activitiesContent.split("\n").filter((line) => line.trim().length > 0);
      
      // Group by main bullet points (assuming those are activities)
      let currentActivity: Activity | null = null;
      
      for (const line of lines) {
        if (line.startsWith("- ") || line.startsWith("* ")) {
          // This is a main bullet point (activity)
          if (currentActivity) {
            activities.push(currentActivity);
          }
          
          currentActivity = {
            title: line.replace(/^[-*]\s+/, "").trim(),
            duration: "15 minutes",
            steps: [],
          };
        } else if (line.startsWith("  - ") || line.startsWith("  * ") && currentActivity) {
          // This is a sub-bullet point (step)
          currentActivity.steps.push(line.replace(/^[\s-*]+/, "").trim());
        }
      }
      
      if (currentActivity) {
        activities.push(currentActivity);
      }
    }

    return activities;
  } catch (error) {
    console.error("Error parsing activities:", error);
    return [];
  }
};

const parseAlternativeFormat = (aiResponse: string): ParsedSection[] => {
  try {
    const sections: ParsedSection[] = [];
    
    // Try parsing by section titles in bold or with colons
    const alternativeSectionPattern = /(?:\*\*|__)([^*\n]+)(?:\*\*|__)(?::)?([\s\S]*?)(?=(?:\*\*|__)[^*\n]+(?:\*\*|__)|$)/g;
    let match;
    
    while ((match = alternativeSectionPattern.exec(aiResponse)) !== null) {
      const title = match[1].trim();
      const content = match[2].trim();
      
      if (title.toLowerCase().includes("activities")) {
        // Try to parse activities 
        const activities: Activity[] = [];
        const activityLines = content.split("\n");
        let currentActivity: Activity | null = null;
        
        for (const line of activityLines) {
          if (line.match(/^\d+\.\s/) || line.match(/^[-*]\s+/) && line.length > 10) {
            // This looks like an activity
            if (currentActivity) {
              activities.push(currentActivity);
            }
            
            currentActivity = {
              title: line.replace(/^\d+\.\s+|^[-*]\s+/, "").trim(),
              duration: "15 minutes",
              steps: [],
            };
          } else if (line.match(/^\s+[-*]\s+/) && currentActivity) {
            // This looks like a step
            currentActivity.steps.push(line.replace(/^\s+[-*]\s+/, "").trim());
          }
        }
        
        if (currentActivity) {
          activities.push(currentActivity);
        }
        
        sections.push({
          title,
          content: [],
          activities: activities.length > 0 ? activities : undefined,
        });
      } else {
        // For non-activity sections
        const contentItems = content
          .split("\n")
          .filter(line => line.match(/^[-*]\s+/))
          .map(line => line.replace(/^[-*]\s+/, "").trim())
          .filter(item => item.length > 0);
          
        sections.push({
          title,
          content: contentItems.length > 0 ? contentItems : [content],
        });
      }
    }
    
    // If still no sections, split by common section names
    if (sections.length === 0) {
      const commonSections = [
        "Learning Objectives",
        "Materials & Resources",
        "Introduction & Hook",
        "Activities",
        "Assessment Strategies",
        "Differentiation Strategies",
        "Close"
      ];
      
      let currentContent = aiResponse;
      
      for (const sectionName of commonSections) {
        const regex = new RegExp(`(^|\\n)${sectionName}[:\\s]+(.*?)(?=\\n(?:${commonSections.join('|')}):|$)`, 'si');
        const match = currentContent.match(regex);
        
        if (match) {
          const content = match[2].trim();
          const contentItems = content
            .split("\n")
            .filter(line => line.trim().length > 0)
            .map(line => line.replace(/^[-*]\d+\.\s+/, "").trim());
          
          sections.push({
            title: sectionName,
            content: contentItems,
          });
          
          // Remove the processed section from the content
          currentContent = currentContent.replace(match[0], '');
        }
      }
    }
    
    return sections;
  } catch (error) {
    console.error("Error parsing alternative format:", error);
    return [];
  }
};
