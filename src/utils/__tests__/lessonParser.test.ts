
import { wrapParseAIResponseForTests as parseAIResponse, cleanMarkdown, parseActivities } from "../lessonParser";
import { simpleLessonExample, fullLessonExample } from "./test-utils";

describe('Lesson Parser Functions', () => {
  describe('cleanMarkdown', () => {
    it('removes markdown formatting characters', () => {
      expect(cleanMarkdown('**bold text**')).toBe('bold text');
      expect(cleanMarkdown('_italic text_')).toBe('italic text');
      expect(cleanMarkdown('`code text`')).toBe('code text');
      expect(cleanMarkdown('***bold italic***')).toBe('bold italic');
    });
  });

  describe('parseActivities', () => {
    it('extracts activity title and duration', () => {
      const activities = parseActivities([
        'Activity 1: Understanding Arguments (10 minutes) - Present an example argument and identify components'
      ]);
      
      expect(activities[0].title).toBe('Understanding Arguments');
      expect(activities[0].duration).toBe('10 minutes');
      expect(activities[0].steps.length).toBeGreaterThan(0);
    });

    it('parses steps from activity description', () => {
      const activities = parseActivities([
        'Activity 1: Research and Evidence (15 minutes) - Have students work in groups to find factual evidence. Emphasize the use of credible sources.'
      ]);
      
      expect(activities[0].steps).toContain('Have students work in groups to find factual evidence.');
      expect(activities[0].steps).toContain('Emphasize the use of credible sources.');
    });
  });

  describe('parseAIResponse integration', () => {
    it('successfully parses the example', () => {
      const parsedSections = parseAIResponse(simpleLessonExample);
      expect(parsedSections.length).toBeGreaterThan(0);
      
      const sectionTitles = parsedSections.map(section => section.title);
      expect(sectionTitles.length).toBe(7); // We expect 7 standard sections
    });

    it('handles the full complex example', () => {
      const parsedSections = parseAIResponse(fullLessonExample);
      const activitiesSection = parsedSections.find(section => section.title === 'Activities');
      
      expect(activitiesSection?.activities?.length).toBe(4);
    });
  });

  // Add manual test function that we can run to verify the parsing
  describe('manual testing', () => {
    it('provides a testing utility', () => {
      const manualTestParsing = (aiResponse: string) => {
        try {
          console.log('Testing parseAIResponse with provided AI response...');
          const result = parseAIResponse(aiResponse);
          console.log('Successfully parsed AI response');
          
          result.forEach(section => {
            console.log(`\nSection: ${section.title}`);
            if (section.content) {
              console.log('Content items:', section.content.length);
            }
          });
          
          return result;
        } catch (error) {
          console.error('Error parsing AI response:', error);
          throw error;
        }
      };

      // Just verify the function exists
      expect(typeof manualTestParsing).toBe('function');
    });
  });
});

// This export matches the original file's API
export const manualTestParsing = (aiResponse: string) => {
  try {
    console.log('Testing parseAIResponse with provided AI response...');
    const result = parseAIResponse(aiResponse);
    console.log('Successfully parsed AI response');
    
    if (Array.isArray(result)) {
      result.forEach(section => {
        console.log(`\nSection: ${section.title}`);
        if (section.content) {
          console.log('Content items:', section.content.length);
        }
      });
    }
    
    return result;
  } catch (error) {
    console.error('Error parsing AI response:', error);
    throw error;
  }
};
