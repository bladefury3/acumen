
import { Separator } from "@/components/ui/separator";
import { ParsedSection } from "@/types/lesson";
import SectionCard from "./SectionCard";

interface LessonSectionsProps {
  groupedSections: {
    topRow: ParsedSection[];
    introduction?: ParsedSection;
    activities?: ParsedSection;
    assessmentRow: ParsedSection[];
    close?: ParsedSection;
  };
  onGenerateMore: (sectionTitle: string) => void;
  generatingSections: Set<string>;
}

const LessonSections = ({
  groupedSections,
  onGenerateMore,
  generatingSections
}: LessonSectionsProps) => {
  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {groupedSections.topRow.map((section, index) => (
          <div key={index}>
            <SectionCard
              section={section}
              onGenerateMore={onGenerateMore}
              isGenerating={generatingSections.has(section.title)}
            />
          </div>
        ))}
      </div>

      <Separator className="bg-primary/10" />

      {groupedSections.introduction && (
        <div className="w-full">
          <SectionCard
            section={groupedSections.introduction}
            onGenerateMore={onGenerateMore}
            isGenerating={generatingSections.has(groupedSections.introduction.title)}
          />
        </div>
      )}

      <Separator className="bg-primary/10" />

      {groupedSections.activities && (
        <div className="w-full">
          <SectionCard
            section={groupedSections.activities}
            onGenerateMore={onGenerateMore}
            isGenerating={generatingSections.has(groupedSections.activities.title)}
          />
        </div>
      )}

      <Separator className="bg-primary/10" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {groupedSections.assessmentRow.map((section, index) => (
          <div key={index}>
            <SectionCard
              section={section}
              onGenerateMore={onGenerateMore}
              isGenerating={generatingSections.has(section.title)}
            />
          </div>
        ))}
      </div>

      {groupedSections.close && (
        <div className="w-full">
          <SectionCard
            section={groupedSections.close}
            onGenerateMore={onGenerateMore}
            isGenerating={generatingSections.has(groupedSections.close.title)}
          />
        </div>
      )}
    </div>
  );
};

export default LessonSections;
