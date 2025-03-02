
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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

const LessonPlanView = () => {
  const { id } = useParams();
  const [lessonPlan, setLessonPlan] = useState<LessonPlanData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lessonExists, setLessonExists] = useState(false);
  const [hasResources, setHasResources] = useState(false);
  const [resourcesId, setResourcesId] = useState<string | undefined>(undefined);
  const [sections, setSections] = useState<ParsedSection[]>([]);

  useEffect(() => {
    const fetchLessonPlan = async () => {
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

    if (id) {
      fetchLessonPlan();
    }
  }, [id]);

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
        <LessonBreadcrumb />
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

export default LessonPlanView;
