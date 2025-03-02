
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FileText, Settings, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LessonPlanData, ParsedSection } from "@/types/lesson";
import { parseAndStoreAIResponse } from "@/services/lessonService";
import { reparseAndUpdateLesson } from "@/services/lesson/databaseOperations";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import LessonBreadcrumb from "@/components/lesson-plan/LessonBreadcrumb";
import { groupSections } from "@/utils/sectionUtils";
import LessonPlanContent from "@/components/lesson-plan/LessonPlanContent";
import LoadingState from "@/components/lesson-plan/LoadingState";
import NotFoundState from "@/components/lesson-plan/NotFoundState";
import { Button } from "@/components/ui/button";

const LessonPlanView = () => {
  const { id } = useParams();
  const [lessonPlan, setLessonPlan] = useState<LessonPlanData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReparsing, setIsReparsing] = useState(false);
  const [parsedSections, setParsedSections] = useState<ParsedSection[]>([]);
  const [hasResources, setHasResources] = useState(false);
  const [resourcesId, setResourcesId] = useState<string | undefined>(undefined);

  const fetchLessonPlan = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('lesson_plans')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setLessonPlan(data);
      
      if (data.ai_response) {
        const sections = await parseAndStoreAIResponse(data.ai_response, data.id);
        setParsedSections(sections);
      }
      
      // Check if resources exist using RPC function
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
  
  const handleReparse = async () => {
    if (!id) return;
    
    try {
      setIsReparsing(true);
      await reparseAndUpdateLesson(id);
      toast.success("Lesson plan re-parsed successfully");
      
      // Refetch the lesson plan to get the updated data
      await fetchLessonPlan();
    } catch (error) {
      console.error('Error re-parsing lesson plan:', error);
      toast.error("Failed to re-parse lesson plan");
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

  const groupedSections = groupSections(parsedSections);

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
            size="sm"
            onClick={handleReparse}
            disabled={isReparsing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isReparsing ? 'animate-spin' : ''}`} />
            {isReparsing ? 'Processing...' : 'Re-Parse Activities'}
          </Button>
        </div>
        <LessonPlanContent
          lessonPlan={lessonPlan}
          groupedSections={groupedSections}
          resourcesId={resourcesId}
          hasResources={hasResources}
          onResourcesGenerated={handleResourcesGenerated}
        />
      </div>
    </DashboardLayout>
  );
};

export default LessonPlanView;
