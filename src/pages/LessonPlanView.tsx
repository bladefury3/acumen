
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
  const [sections, setSections] = useState<ParsedSection[]>([]);

  const fetchLessonPlan = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      
      // Fetch the lesson plan data
      const { data: lessonPlanData, error: lessonPlanError } = await supabase
        .from('lesson_plans')
        .select('*')
        .eq('id', id)
        .single();

      if (lessonPlanError) throw lessonPlanError;
      setLessonPlan(lessonPlanData);
      
      // Check if we already have a lesson for this lesson plan
      const { data: lessonData, error: lessonError } = await supabase
        .from('lessons')
        .select('id')
        .eq('response_id', id);
        
      if (lessonError) {
        console.error("Error checking for lesson:", lessonError);
      } else if (lessonData && lessonData.length > 0) {
        setLessonExists(true);
      } else if (lessonPlanData.ai_response) {
        // If there's no lesson but we have an AI response, parse and store it
        try {
          const parsedSections = await parseAndStoreAIResponse(lessonPlanData.ai_response, lessonPlanData.id);
          setSections(parsedSections || []);
          setLessonExists(true);
        } catch (parseError) {
          console.error("Error parsing AI response:", parseError);
          toast.error("Failed to parse lesson plan");
        }
      }
      
      // Check if resources exist
      const { data: resources, error: resourcesError } = await supabase
        .rpc('get_lesson_resources_by_lesson_id', { p_lesson_plan_id: id });
        
      if (resourcesError) {
        console.error("Error checking for resources:", resourcesError);
      } else if (resources && resources.length > 0) {
        setHasResources(true);
        setResourcesId(resources[0].id);
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
      const parsedSections = await parseAndStoreAIResponse(lessonPlan.ai_response, id);
      setSections(parsedSections);
      toast.success("Lesson plan reparsed successfully");
      
      // Refresh the page to show updated content
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
          sections={sections}
          resourcesId={resourcesId}
          hasResources={hasResources}
          onResourcesGenerated={handleResourcesGenerated}
        />
      </div>
    </DashboardLayout>
  );
};

// Add missing function import
const cleanExistingLessonData = async (responseId: string) => {
  try {
    // Delete existing lesson data
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
