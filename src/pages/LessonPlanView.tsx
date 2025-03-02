import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FileText, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LessonPlanData, ParsedSection } from "@/types/lesson";
import { parseAndStoreAIResponse } from "@/services/lessonService";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import LessonBreadcrumb from "@/components/lesson-plan/LessonBreadcrumb";
import LessonPlanContent from "@/components/lesson-plan/LessonPlanContent";
import LoadingState from "@/components/lesson-plan/LoadingState";
import NotFoundState from "@/components/lesson-plan/NotFoundState";
import { Button } from "@/components/ui/button";

const LessonPlanView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lessonPlan, setLessonPlan] = useState<LessonPlanData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReparsing, setIsReparsing] = useState(false);
  const [lessonExists, setLessonExists] = useState(false);
  const [hasResources, setHasResources] = useState(false);
  const [resourcesId, setResourcesId] = useState<string | undefined>(undefined);
  const [parsedSections, setParsedSections] = useState<ParsedSection[]>([]);

  const fetchLessonPlan = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      
      const { data: lessonPlanData, error: lessonPlanError } = await supabase
        .from('lesson_plans')
        .select('*')
        .eq('id', id)
        .single();

      if (lessonPlanError) throw lessonPlanError;
      setLessonPlan(lessonPlanData);
      
      const { data: lessonData, error: lessonError } = await supabase
        .from('lessons')
        .select('id')
        .eq('response_id', id);
        
      if (lessonError) {
        console.error("Error checking for lesson:", lessonError);
      } else if (lessonData && lessonData.length > 0) {
        setLessonExists(true);
      } else if (lessonPlanData.ai_response) {
        try {
          await parseAndStoreAIResponse(lessonPlanData.ai_response, lessonPlanData.id);
          setLessonExists(true);
        } catch (parseError) {
          console.error("Error parsing AI response:", parseError);
          toast.error("Failed to parse lesson plan");
        }
      }
      
      const { data: resources, error: resourcesError } = await supabase
        .rpc('get_lesson_resources_by_lesson_id', { p_lesson_plan_id: id });
        
      if (resourcesError) {
        console.error("Error checking for resources:", resourcesError);
      } else if (resources && resources.length > 0) {
        setHasResources(true);
        setResourcesId(resources[0].id);
      }
      
      if (lessonPlanData) {
        const basicSections: ParsedSection[] = [
          {
            title: "Learning Objectives",
            content: lessonPlanData.objectives ? lessonPlanData.objectives.split('\n').filter(line => line.trim()) : []
          },
          {
            title: "Materials & Resources",
            content: lessonPlanData.learning_tools ? 
              lessonPlanData.learning_tools.map(tool => tool.trim()).filter(Boolean) : []
          }
        ];
        setParsedSections(basicSections);
      }
    } catch (error) {
      console.error('Error fetching lesson plan:', error);
      toast.error("Failed to load lesson plan");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLessonPlan();
  }, [id]);

  const handleReparseLesson = async () => {
    if (!lessonPlan || !lessonPlan.ai_response || !id) {
      toast.error("Cannot reparse: No AI response available");
      return;
    }
    
    try {
      setIsReparsing(true);
      await cleanExistingLessonData(id);
      await parseAndStoreAIResponse(lessonPlan.ai_response, id);
      toast.success("Lesson plan reparsed successfully");
      
      window.location.reload();
    } catch (error) {
      console.error("Error reparsing lesson:", error);
      toast.error(`Failed to reparse lesson: ${(error as Error).message}`);
    } finally {
      setIsReparsing(false);
    }
  };

  const sidebarItems = [
    { label: "My Lessons", href: "/dashboard", icon: FileText },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  if (isLoading) {
    return (
      <DashboardLayout sidebarItems={sidebarItems}>
        <LoadingState />
      </DashboardLayout>
    );
  }

  if (!lessonPlan) {
    return (
      <DashboardLayout sidebarItems={sidebarItems}>
        <NotFoundState />
      </DashboardLayout>
    );
  }

  const handleResourcesGenerated = (id: string) => {
    setResourcesId(id);
    setHasResources(true);
  };

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="space-y-8 animate-fade-in pb-16">
        <div className="flex justify-between items-center">
          <LessonBreadcrumb />
          <Button 
            variant="outline" 
            onClick={handleReparseLesson}
            disabled={isReparsing}
            className="bg-[#003C5A] text-[#C3CFF5] hover:bg-[#00293d] hover:text-[#C3CFF5]"
          >
            {isReparsing ? "Processing..." : "Reparse Lesson"}
          </Button>
        </div>
        <LessonPlanContent
          lessonPlan={lessonPlan}
          resourcesId={resourcesId}
          hasResources={hasResources}
          onResourcesGenerated={handleResourcesGenerated}
          sections={parsedSections}
        />
      </div>
    </DashboardLayout>
  );
};

const cleanExistingLessonData = async (responseId: string) => {
  try {
    await supabase
      .from('lessons')
      .delete()
      .eq('response_id', responseId);
  } catch (error) {
    console.error('Error cleaning existing lesson data:', error);
    throw new Error('Failed to clean up existing data');
  }
};

export default LessonPlanView;
