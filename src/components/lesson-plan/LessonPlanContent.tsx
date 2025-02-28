
import { LessonPlanData, ParsedSection } from "@/types/lesson";
import LessonHeader from "./LessonHeader";
import { useRef } from "react";
import SectionCard from "./SectionCard";
import AIAssistantSection from "./AIAssistantSection";
import ResourcesSection from "./ResourcesSection";
import DifferentiationSection from "./DifferentiationSection";
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
  const downloadButtonRef = useRef<HTMLDivElement>(null);

  // Convert grouped sections back to array for PDF
  const allSections = [
    ...groupedSections.topRow,
    groupedSections.introduction,
    groupedSections.activities,
    ...groupedSections.assessmentRow,
    groupedSections.close,
  ].filter((section): section is ParsedSection => section !== undefined);

  const handleDownload = () => {
    if (downloadButtonRef.current) {
      // Find and click the download button
      const downloadButton = downloadButtonRef.current.querySelector("button");
      if (downloadButton) {
        downloadButton.click();
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16 max-w-7xl mx-auto">
      <LessonHeader lessonPlan={lessonPlan} onDownload={handleDownload} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Left Column (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Learning Objectives */}
          {groupedSections.topRow[0] && (
            <SectionCard section={groupedSections.topRow[0]} />
          )}
          
          {/* Introduction & Activities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {groupedSections.introduction && (
              <SectionCard section={groupedSections.introduction} />
            )}
            {groupedSections.topRow[1] && (
              <SectionCard section={groupedSections.topRow[1]} />
            )}
          </div>
          
          {/* Main Activities Section */}
          {groupedSections.activities && (
            <SectionCard section={groupedSections.activities} />
          )}
          
          {/* Assessment & Close */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {groupedSections.assessmentRow.map((section, index) => (
              <SectionCard key={index} section={section} />
            ))}
          </div>
          
          {groupedSections.close && (
            <SectionCard section={groupedSections.close} className="md:col-span-2" />
          )}
        </div>
        
        {/* Sidebar - Right Column (1/3 width) */}
        <div className="space-y-6">
          <AIAssistantSection />
          <ResourcesSection />
          <DifferentiationSection />
          
          {/* Hidden download button */}
          <div ref={downloadButtonRef} className="hidden">
            <DownloadLessonPDF
              lessonTitle={`${lessonPlan.grade} ${lessonPlan.subject} Lesson Plan`}
              sections={allSections}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonPlanContent;
