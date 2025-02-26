
import { ParsedSection } from "@/types/lesson";

export const findSectionContent = (sections: ParsedSection[], titlePatterns: string[]): string => {
  const matchingSection = sections.find(s => 
    titlePatterns.some(pattern => 
      s.title.toLowerCase().includes(pattern.toLowerCase())
    )
  );
  return matchingSection?.content.join('\n') || matchingSection?.activities?.map(a => 
    `${a.title}\n${a.steps.join('\n')}`
  ).join('\n') || '';
};

export const validateParsedSections = (parsedLesson: Record<string, string>) => {
  const missingFields = [];
  if (!parsedLesson.learning_objectives) missingFields.push('Learning Objectives');
  if (!parsedLesson.materials_resources) missingFields.push('Materials/Resources');
  if (!parsedLesson.introduction_hook) missingFields.push('Introduction/Hook');
  if (!parsedLesson.assessment_strategies) missingFields.push('Assessment Strategies');
  if (!parsedLesson.differentiation_strategies) missingFields.push('Differentiation Strategies');
  if (!parsedLesson.close) missingFields.push('Close/Closure');

  if (missingFields.length > 0) {
    throw new Error(`Missing required fields in lesson plan: ${missingFields.join(', ')}`);
  }
};

export const findActivitiesSection = (sections: ParsedSection[]) => {
  return sections.find(s => 
    ['activities', 'main activities', 'learning activities'].some(term => 
      s.title.toLowerCase().includes(term)
    )
  );
};
