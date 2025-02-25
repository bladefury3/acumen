
import { ParsedSection } from "@/types/lesson";

export const getOrderedSections = (sections: ParsedSection[]) => {
  return sections.sort((a, b) => {
    const order: Record<string, number> = {
      "Learning Objectives": 1,
      "Materials & Resources": 2,
      "Materials and Resources": 2, // Add variant
      "Introduction & Hook": 3,
      "Introduction/Hook": 3, // Add variant
      "Activities": 4,
      "Main Activities": 4, // Add variant
      "Basic Drumming Technique": 4, // Add specific activity
      "Rhythm Introduction": 4, // Add specific activity
      "Practice with Taylor Swift": 4, // Add specific activity
      "Assessment Strategies": 5,
      "Differentiation Strategies": 6,
      "Close": 7,
      "Closure": 7, // Add variant
    };
    return (order[a.title] || 99) - (order[b.title] || 99);
  });
};

const matchesTitle = (title: string, patterns: string[]): boolean => {
  return patterns.some(pattern => 
    title.toLowerCase().includes(pattern.toLowerCase())
  );
};

export const groupSections = (sections: ParsedSection[]) => {
  const orderedSections = getOrderedSections(sections);
  return {
    topRow: orderedSections.filter(s => 
      matchesTitle(s.title, ["Learning Objectives", "Materials & Resources", "Materials and Resources"])
    ),
    introduction: orderedSections.find(s => 
      matchesTitle(s.title, ["Introduction", "Hook"])
    ),
    activities: orderedSections.find(s => 
      matchesTitle(s.title, ["Activities", "Main Activities"])
    ) || {
      title: "Activities",
      content: orderedSections
        .filter(s => matchesTitle(s.title, ["Technique", "Practice", "Activity"]))
        .map(s => s.content)
        .flat(),
      activities: orderedSections
        .filter(s => matchesTitle(s.title, ["Technique", "Practice", "Activity"]))
        .map(s => ({
          title: s.title,
          duration: s.title.includes("(") ? s.title.match(/\((\d+)[^)]*\)/)?.[1] + " minutes" : "",
          steps: s.content
        }))
    },
    assessmentRow: orderedSections.filter(s => 
      matchesTitle(s.title, ["Assessment", "Differentiation"])
    ),
    close: orderedSections.find(s => 
      matchesTitle(s.title, ["Close", "Closure"])
    )
  };
};
