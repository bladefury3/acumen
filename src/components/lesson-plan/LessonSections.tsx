
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
}

const LessonSections = ({
  groupedSections,
}: LessonSectionsProps) => {
  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {groupedSections.topRow.map((section, index) => (
          <div key={index}>
            <SectionCard section={section} />
          </div>
        ))}
      </div>

      <Separator className="bg-primary/10" />

      {groupedSections.introduction && (
        <div className="w-full">
          <SectionCard section={groupedSections.introduction} />
        </div>
      )}

      <Separator className="bg-primary/10" />

      {groupedSections.activities && (
        <div className="w-full">
          <SectionCard section={groupedSections.activities} />
        </div>
      )}

      <Separator className="bg-primary/10" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {groupedSections.assessmentRow.map((section, index) => (
          <div key={index}>
            <SectionCard section={section} />
          </div>
        ))}
      </div>

      {groupedSections.close && (
        <div className="w-full">
          <SectionCard section={groupedSections.close} />
        </div>
      )}
    </div>
  );
};

export default LessonSections;
