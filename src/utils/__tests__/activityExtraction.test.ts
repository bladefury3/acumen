
import { wrapParseAIResponseForTests as parseAIResponse } from "../lessonParser";
import { fullLessonExample } from "./test-utils";

describe('Activity Extraction', () => {
  it('extracts activities from the Main Activities section', () => {
    const parsedSections = parseAIResponse(fullLessonExample);
    
    const activitiesSection = parsedSections.find(section => 
      section.title === 'Activities' || section.title.includes('Activities')
    );
    
    expect(activitiesSection).toBeDefined();
    expect(activitiesSection?.activities).toBeDefined();
    expect(activitiesSection?.activities?.length).toBe(4);
  });

  it('correctly parses activity details', () => {
    const parsedSections = parseAIResponse(fullLessonExample);
    const activitiesSection = parsedSections.find(section => section.title === 'Activities');
    
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

  it('extracts steps for each activity', () => {
    const parsedSections = parseAIResponse(fullLessonExample);
    const activitiesSection = parsedSections.find(section => section.title === 'Activities');
    
    if (activitiesSection?.activities) {
      // First activity should have 2 steps
      expect(activitiesSection.activities[0].steps.length).toBe(2);
      // Second activity should have 2 steps
      expect(activitiesSection.activities[1].steps.length).toBe(2);
    }
  });
});
