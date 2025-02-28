
import { ParsedSection } from "@/types/lesson";

export const groupSections = (sections: ParsedSection[]) => {
  const learningObjectives = sections.find(s => s.title.toLowerCase().includes('learning objectives'));
  const materialsResources = sections.find(s => s.title.toLowerCase().includes('materials'));
  const introduction = sections.find(s => s.title.toLowerCase().includes('introduction'));
  const activities = sections.find(s => s.title.toLowerCase().includes('activities'));
  const assessment = sections.find(s => s.title.toLowerCase().includes('assessment'));
  const differentiation = sections.find(s => s.title.toLowerCase().includes('differentiation'));
  const close = sections.find(s => s.title.toLowerCase().includes('close'));

  return {
    topRow: [
      learningObjectives,
      materialsResources
    ].filter((s): s is ParsedSection => s !== undefined),
    introduction,
    activities,
    assessmentRow: [
      assessment,
      differentiation
    ].filter((s): s is ParsedSection => s !== undefined),
    close
  };
};
