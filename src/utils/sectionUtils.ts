
import { ParsedSection } from "@/types/lesson";

export const getOrderedSections = (sections: ParsedSection[]) => {
  return sections.sort((a, b) => {
    const order: Record<string, number> = {
      "Learning Objectives": 1,
      "Materials & Resources": 2,
      "Introduction & Hook": 3,
      "Activities": 4,
      "Assessment Strategies": 5,
      "Differentiation Strategies": 6,
      "Close": 7
    };
    return (order[a.title] || 99) - (order[b.title] || 99);
  });
};

export const groupSections = (sections: ParsedSection[]) => {
  const orderedSections = getOrderedSections(sections);
  return {
    topRow: orderedSections.filter(s => 
      s.title === "Learning Objectives" || s.title === "Materials & Resources"
    ),
    introduction: orderedSections.find(s => s.title === "Introduction & Hook"),
    activities: orderedSections.find(s => s.title === "Activities"),
    assessmentRow: orderedSections.filter(s => 
      s.title === "Assessment Strategies" || s.title === "Differentiation Strategies"
    ),
    close: orderedSections.find(s => s.title === "Close")
  };
};
