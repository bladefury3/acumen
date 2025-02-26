
import { LessonPlanData, ParsedSection } from "@/types/lesson";
import LessonHeader from "./LessonHeader";
import LessonSections from "./LessonSections";
import { Separator } from "@/components/ui/separator";
import DeleteLessonDialog from "./DeleteLessonDialog";

interface LessonPlanContentProps {
  lessonPlan: LessonPlanData;
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

const LessonPlanContent = ({
  lessonPlan,
  groupedSections,
  onGenerateMore,
  generatingSections
}: LessonPlanContentProps) => {
  return (
    <div className="space-y-8 animate-fade-in pb-16">
      <LessonHeader lessonPlan={lessonPlan} />
      <LessonSections
        groupedSections={groupedSections}
        onGenerateMore={onGenerateMore}
        generatingSections={generatingSections}
      />
      <Separator className="my-8" />
      <div className="flex justify-end">
        <DeleteLessonDialog lessonId={lessonPlan.id} />
      </div>
    </div>
  );
};

export default LessonPlanContent;
