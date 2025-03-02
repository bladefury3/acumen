
import { wrapParseAIResponseForTests as parseAIResponse } from "../lessonParser";
import { simpleLessonExample } from "./test-utils";

describe('Basic Parsing Functionality', () => {
  it('correctly identifies all required sections', () => {
    const parsedSections = parseAIResponse(simpleLessonExample);
    
    const sectionTitles = parsedSections.map(section => section.title);
    expect(sectionTitles).toContain('Learning Objectives');
    expect(sectionTitles).toContain('Materials & Resources');
    expect(sectionTitles).toContain('Introduction & Hook');
    expect(sectionTitles).toContain('Activities');
    expect(sectionTitles).toContain('Assessment Strategies');
    expect(sectionTitles).toContain('Differentiation Strategies');
    expect(sectionTitles).toContain('Close');
  });

  it('extracts content for each section', () => {
    const parsedSections = parseAIResponse(simpleLessonExample);
    
    parsedSections.forEach(section => {
      expect(section.content).toBeDefined();
      expect(Array.isArray(section.content)).toBe(true);
      expect(section.content.length).toBeGreaterThan(0);
    });
  });

  it('preserves markdown content', () => {
    const parsedSections = parseAIResponse(simpleLessonExample);
    
    parsedSections.forEach(section => {
      expect(section.markdownContent).toBeDefined();
      expect(typeof section.markdownContent).toBe('string');
    });
  });
});
