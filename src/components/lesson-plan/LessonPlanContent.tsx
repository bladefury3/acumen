
import { useState, useEffect } from "react";
import { LessonPlanData, ParsedSection } from "@/types/lesson";
import LessonHeader from "./LessonHeader";
import LessonSections from "./LessonSections";
import { Separator } from "@/components/ui/separator";
import DeleteLessonDialog from "./DeleteLessonDialog";
import DownloadLessonPDF from "./DownloadLessonPDF";
import GenerateResourcesButton from "./GenerateResourcesButton";
import ResourcesCard from "./ResourcesCard";
import { supabase } from "@/integrations/supabase/client";

interface LessonPlanContentProps {
  lessonPlan: LessonPlanData;
  sections: ParsedSection[];
  resourcesId?: string;
  hasResources?: boolean;
  onResourcesGenerated?: (id: string) => void;
}

const LessonPlanContent = ({
  lessonPlan,
  sections,
  resourcesId,
  hasResources = false,
  onResourcesGenerated = () => {},
}: LessonPlanContentProps) => {
  const [resourcesGenerated, setResourcesGenerated] = useState(hasResources);
  const [isLoadingResources, setIsLoadingResources] = useState(false);
  const [currentResourcesId, setCurrentResourcesId] = useState<string | undefined>(resourcesId);
  const [allSections, setAllSections] = useState<ParsedSection[]>(sections);

  useEffect(() => {
    // Fetch all lesson sections to ensure complete data for PDF
    const fetchAllSections = async () => {
      if (!lessonPlan.id) return;
      
      try {
        const { data, error } = await supabase
          .from('lessons')
          .select('*')
          .eq('response_id', lessonPlan.id);
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          // Organize the sections in a logical order
          const sectionOrder = [
            "Learning Objectives",
            "Materials & Resources",
            "Introduction & Hook",
            "Activities",
            "Assessment Strategies",
            "Differentiation Strategies",
            "Close"
          ];
          
          const formattedSections: ParsedSection[] = [...sections]; // Start with existing sections
          
          // Map database fields to section titles
          const dbFieldToSectionTitle: Record<string, string> = {
            learning_objectives: "Learning Objectives",
            materials_resources: "Materials & Resources",
            introduction_hook: "Introduction & Hook",
            activities: "Activities",
            assessment_strategies: "Assessment Strategies",
            differentiation_strategies: "Differentiation Strategies",
            close: "Close"
          };
          
          // Add sections from the database that aren't already included
          sectionOrder.forEach(sectionTitle => {
            // Skip if we already have this section
            if (formattedSections.some(s => s.title === sectionTitle)) return;
            
            // Find the database field that corresponds to this section title
            const dbField = Object.keys(dbFieldToSectionTitle).find(
              key => dbFieldToSectionTitle[key] === sectionTitle
            );
            
            if (!dbField) return;
            
            // Find the section data in the database
            const lessonData = data[0];
            
            if (lessonData && lessonData[dbField as keyof typeof lessonData]) {
              try {
                // Parse the content from JSON if it's stored that way, or split by newlines
                let content: string[] = [];
                const rawContent = lessonData[dbField as keyof typeof lessonData] as string;
                
                if (typeof rawContent === 'string') {
                  try {
                    content = JSON.parse(rawContent);
                  } catch {
                    content = rawContent.split('\n').filter(Boolean);
                  }
                } else if (Array.isArray(rawContent)) {
                  content = rawContent;
                }
                
                formattedSections.push({
                  title: sectionTitle,
                  content
                });
              } catch (error) {
                console.error(`Error parsing content for ${sectionTitle}:`, error);
              }
            }
          });
          
          setAllSections(formattedSections);
        }
      } catch (error) {
        console.error('Error fetching lesson sections:', error);
      }
    };
    
    fetchAllSections();
  }, [lessonPlan.id, sections]);

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
      <LessonSections lessonId={lessonPlan.id} />
      <Separator className="my-8" />
      
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <DownloadLessonPDF
            lessonTitle={`${lessonPlan.grade} ${lessonPlan.subject} Lesson Plan`}
            sections={allSections}
            lessonId={lessonPlan.id}
            subject={lessonPlan.subject}
            objectives={lessonPlan.objectives}
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
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Additional Resources</h3>
          </div>
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
