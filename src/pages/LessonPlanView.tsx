import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { FileText, Settings, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LessonPlanData, ParsedSection } from "@/types/lesson";
import { parseAndStoreAIResponse } from "@/services/lessonService";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import LessonBreadcrumb from "@/components/lesson-plan/LessonBreadcrumb";
import LessonHeader from "@/components/lesson-plan/LessonHeader";
import LessonSections from "@/components/lesson-plan/LessonSections";
import { groupSections } from "@/utils/sectionUtils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const LessonPlanView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lessonPlan, setLessonPlan] = useState<LessonPlanData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [parsedSections, setParsedSections] = useState<ParsedSection[]>([]);
  const [generatingSections, setGeneratingSections] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!id || isDeleting) return;

    setIsDeleting(true);
    
    try {
      // 1. Delete activities first
      const { error: activitiesError } = await supabase
        .from('activities_detail')
        .delete()
        .eq('lesson_id', id);

      if (activitiesError) {
        console.error('Error deleting activities:', activitiesError);
        throw new Error('Failed to delete activities');
      }

      // 2. Delete lessons
      const { error: lessonsError } = await supabase
        .from('lessons')
        .delete()
        .eq('response_id', id);

      if (lessonsError) {
        console.error('Error deleting lessons:', lessonsError);
        throw new Error('Failed to delete lessons');
      }

      // 3. Finally delete the lesson plan
      const { error: lessonPlanError } = await supabase
        .from('lesson_plans')
        .delete()
        .eq('id', id);

      if (lessonPlanError) {
        console.error('Error deleting lesson plan:', lessonPlanError);
        throw new Error('Failed to delete lesson plan');
      }

      toast.success("Lesson plan and all related items deleted successfully");
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error('Error during deletion:', error);
      toast.error("Failed to delete lesson plan and related items");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleGenerateMore = async (sectionTitle: string) => {
    if (!id || generatingSections.has(sectionTitle)) return;

    setGeneratingSections(prev => new Set([...prev, sectionTitle]));
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-lesson-plan', {
        body: {
          prompt: `Generate 3 more ${sectionTitle.toLowerCase()} for this lesson plan that are different from the existing ones.`,
          existingContent: parsedSections.find(s => s.title === sectionTitle)?.content || []
        }
      });

      if (error) throw error;

      const newContent = data.response.split('\n')
        .filter((line: string) => line.trim().startsWith('- '))
        .map((line: string) => line.trim().replace('- ', ''));

      setParsedSections(prev => prev.map(section => {
        if (section.title === sectionTitle) {
          return {
            ...section,
            content: [...section.content, ...newContent],
            generated: true
          };
        }
        return section;
      }));

      toast.success(`Generated new ${sectionTitle.toLowerCase()}`);
    } catch (error) {
      console.error('Error generating content:', error);
      toast.error(`Failed to generate new ${sectionTitle.toLowerCase()}`);
    } finally {
      setGeneratingSections(prev => {
        const next = new Set(prev);
        next.delete(sectionTitle);
        return next;
      });
    }
  };

  useEffect(() => {
    const fetchLessonPlan = async () => {
      try {
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
        <div className="flex items-center justify-center h-full">
          <div className="flex items-center space-x-4">
            <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground animate-pulse">Loading lesson plan...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!lessonPlan) {
    return (
      <DashboardLayout sidebarItems={sidebarItems}>
        <div className="text-center">
          <h1 className="text-2xl font-bold">Lesson Plan Not Found</h1>
          <Link to="/dashboard" className="text-primary hover:underline">
            Return to Dashboard
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const groupedSections = groupSections(parsedSections);

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="space-y-8 animate-fade-in pb-16">
        <LessonBreadcrumb />
        <LessonHeader lessonPlan={lessonPlan} />
        <LessonSections
          groupedSections={groupedSections}
          onGenerateMore={handleGenerateMore}
          generatingSections={generatingSections}
        />
        <Separator className="my-8" />
        <div className="flex justify-end">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive" 
                className="flex items-center gap-2"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                {isDeleting ? "Deleting..." : "Delete Lesson Plan"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-destructive">
                  Delete Lesson Plan
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete this lesson plan
                  and all associated activities, lessons, and related content.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={isDeleting}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LessonPlanView;
