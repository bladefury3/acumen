
import { useState } from "react";
import { LessonPlanData, ParsedSection } from "@/types/lesson";
import LessonHeader from "./LessonHeader";
import LessonSections from "./LessonSections";
import { Separator } from "@/components/ui/separator";
import DeleteLessonDialog from "./DeleteLessonDialog";
import DownloadLessonPDF from "./DownloadLessonPDF";
import GenerateResourcesButton from "./GenerateResourcesButton";
import ResourcesCard from "./ResourcesCard";

interface LessonPlanContentProps {
  lessonPlan: LessonPlanData;
  groupedSections: {
    topRow: ParsedSection[];
    introduction?: ParsedSection;
    activities?: ParsedSection;
    assessmentRow: ParsedSection[];
    close?: ParsedSection;
  };
  resourcesId?: string;
  hasResources?: boolean;
  onResourcesGenerated?: (id: string) => void;
}

const LessonPlanContent = ({
  lessonPlan,
  groupedSections,
  resourcesId,
  hasResources = false,
  onResourcesGenerated = () => {},
}: LessonPlanContentProps) => {
  const [resourcesGenerated, setResourcesGenerated] = useState(hasResources);
  const [isLoadingResources, setIsLoadingResources] = useState(false);
  const [currentResourcesId, setCurrentResourcesId] = useState<string | undefined>(resourcesId);

  // Convert grouped sections back to array for PDF
  const allSections = [
    ...groupedSections.topRow,
    groupedSections.introduction,
    groupedSections.activities,
    ...groupedSections.assessmentRow,
    groupedSections.close,
  ].filter((section): section is ParsedSection => section !== undefined);

  const handleResourcesGenerated = (id: string) => {
    setResourcesGenerated(true);
    setCurrentResourcesId(id);
    if (onResourcesGenerated) {
      onResourcesGenerated(id);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      <LessonHeader lessonPlan={lessonPlan} />
      <LessonSections groupedSections={groupedSections} />
      <Separator className="my-8" />
      
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <DownloadLessonPDF
            lessonTitle={`${lessonPlan.grade} ${lessonPlan.subject} Lesson Plan`}
            sections={allSections}
          />
          <GenerateResourcesButton 
            lessonPlanId={lessonPlan.id}
            onResourcesGenerated={handleResourcesGenerated}
            disabled={resourcesGenerated || isLoadingResources}
          />
        </div>
        <DeleteLessonDialog lessonId={lessonPlan.id} />
      </div>
      
      {resourcesGenerated && (
        <div className="mt-8">
          <h3 className="text-lg font-medium mb-4">Additional Resources</h3>
          <ResourcesCard 
            lessonPlanId={lessonPlan.id} 
            resourcesId={currentResourcesId} 
            onLoadingChange={setIsLoadingResources}
          />
        </div>
      )}
    </div>
  );
};

export default LessonPlanContent;
