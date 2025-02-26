
import { LessonPlanData, ParsedSection } from "@/types/lesson";
import LessonHeader from "./LessonHeader";
import LessonSections from "./LessonSections";
import { Separator } from "@/components/ui/separator";
import DeleteLessonDialog from "./DeleteLessonDialog";
import DownloadLessonPDF from "./DownloadLessonPDF";

interface LessonPlanContentProps {
  lessonPlan: LessonPlanData;
  groupedSections: {
    topRow: ParsedSection[];
    introduction?: ParsedSection;
    activities?: ParsedSection;
    assessmentRow: ParsedSection[];
    close?: ParsedSection;
  };
}

const LessonPlanContent = ({
  lessonPlan,
  groupedSections,
}: LessonPlanContentProps) => {
  // Convert grouped sections back to array for PDF
  const allSections = [
    ...groupedSections.topRow,
    groupedSections.introduction,
    groupedSections.activities,
    ...groupedSections.assessmentRow,
    groupedSections.close,
  ].filter((section): section is ParsedSection => section !== undefined);

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      <LessonHeader lessonPlan={lessonPlan} />
      <LessonSections groupedSections={groupedSections} />
      <Separator className="my-8" />
      <div className="flex justify-between items-center">
        <DownloadLessonPDF
          lessonTitle={`${lessonPlan.grade} ${lessonPlan.subject} Lesson Plan`}
          sections={allSections}
        />
        <DeleteLessonDialog lessonId={lessonPlan.id} />
      </div>
    </div>
  );
};

export default LessonPlanContent;
