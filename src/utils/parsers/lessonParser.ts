
import { Activity, ParsedSection } from "@/types/lesson";
import { 
  cleanMarkdown, 
  extractSections, 
  findSectionContent,
  identifySectionType, 
  findActivitiesSection, 
  validateParsedSections 
} from "./sectionParser";
import { extractActivitiesWithFallbacks } from "./activityParser";

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
      
      // Handle Activities section specially
      // if (sectionTitle === 'Activities') {
      //   console.log('Processing Activities section...');
      //   try {
      //     const activities = extractActivitiesWithFallbacks(contentLines);
          
      //     if (activities.length > 0) {
      //       console.log(`Found ${activities.length} activities`);
      //       sections.push({
      //         title: sectionTitle,
      //         content: contentLines,
      //         activities,
      //         generated: false
      //       });
      //       foundSections.add(sectionTitle);
      //       continue;
      //     } else {
      //       console.warn('No activities found using the extractor');
      //     }
      //   } catch (error) {
      //     console.error('Error extracting activities:', error);
      //   }
      // }
      
      // Default section processing for non-activities or if activity extraction failed
      sections.push({
        title: sectionTitle,
        content: contentLines,
        generated: false
      });
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
        
        // if (potentialActivitiesSection) {
        //   console.log('Found potential activities section:', potentialActivitiesSection.title);
        //   const activities = extractActivitiesWithFallbacks(potentialActivitiesSection.content);
          
        //   if (activities.length > 0) {
        //     sections.push({
        //       title: 'Activities',
        //       content: potentialActivitiesSection.content,
        //       activities,
        //       generated: true
        //     });
        //     foundSections.add('Activities');
        //     missingSections.splice(missingSections.indexOf('Activities'), 1);
        //   }
        // }
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
      
      // if (section.activities) {
      //   console.log('Activities:', section.activities.length);
      //   section.activities.forEach((activity, i) => {
      //     console.log(`  Activity ${i+1}: ${activity.title} (${activity.duration})`);
      //     console.log(`    Steps: ${activity.steps.length}`);
      //     activity.steps.forEach((step, j) => {
      //       console.log(`      ${j+1}. ${step}`);
      //     });
      //   });
      // }
    });
    
    return result;
  } catch (error) {
    console.error('Error parsing AI response:', error);
    throw error;
  }
};
