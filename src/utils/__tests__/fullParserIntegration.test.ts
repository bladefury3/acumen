
import { wrapParseAIResponseForTests as parseAIResponse } from "../lessonParser";
import { fullLessonExample } from "./test-utils";

describe('Full Parser Integration', () => {
  it('handles the full real-world example', () => {
    const parsedSections = parseAIResponse(fullLessonExample);
    
    // Check that all sections are identified
    const sectionTitles = parsedSections.map(section => section.title);
    expect(sectionTitles).toContain('Learning Objectives');
    expect(sectionTitles).toContain('Materials & Resources');
    expect(sectionTitles).toContain('Introduction & Hook');
    expect(sectionTitles).toContain('Activities');
    expect(sectionTitles).toContain('Assessment Strategies');
    expect(sectionTitles).toContain('Differentiation Strategies');
    expect(sectionTitles).toContain('Close');
    
    // Check activities
    const activitiesSection = parsedSections.find(section => section.title === 'Activities');
    expect(activitiesSection?.activities?.length).toBe(4);
    
    // Check specific activities
    if (activitiesSection?.activities) {
      expect(activitiesSection.activities[0].title).toBe('Understanding Arguments');
      expect(activitiesSection.activities[0].duration).toBe('10 minutes');
      
      expect(activitiesSection.activities[1].title).toBe('Research and Evidence');
      expect(activitiesSection.activities[1].duration).toBe('15 minutes');
      
      expect(activitiesSection.activities[2].title).toBe('Group Discussion');
      expect(activitiesSection.activities[2].duration).toBe('10 minutes');
      
      expect(activitiesSection.activities[3].title).toBe('Presentations');
      expect(activitiesSection.activities[3].duration).toBe('5 minutes');
    }
  });

  it('preserves markdown content in all sections', () => {
    const parsedSections = parseAIResponse(fullLessonExample);
    
    parsedSections.forEach(section => {
      expect(section.markdownContent).toBeDefined();
      expect(typeof section.markdownContent).toBe('string');
      expect(section.markdownContent?.length).toBeGreaterThan(0);
    });
  });

  it('handles content with special characters', () => {
    const specialExample = fullLessonExample + "\n\n### Additional Section\n- Contains & special < characters > that \"might\" cause 'problems'";
    const parsedSections = parseAIResponse(specialExample);
    
    // Should parse without errors
    expect(parsedSections.length).toBeGreaterThan(7); // Original 7 sections plus the additional one
  });
});
