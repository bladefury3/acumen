
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { FileText, Settings, Share, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LessonPlanData, ParsedSection } from "@/types/lesson";
import { parseAndStoreAIResponse } from "@/services/lessonService";
import SectionCard from "@/components/lesson-plan/SectionCard";

const LessonPlanView = () => {
  const { id } = useParams();
  const [lessonPlan, setLessonPlan] = useState<LessonPlanData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [parsedSections, setParsedSections] = useState<ParsedSection[]>([]);
  const [generatingSections, setGeneratingSections] = useState<Set<string>>(new Set());

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
          <div className="animate-pulse">Loading lesson plan...</div>
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

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="space-y-8">
        <div className="flex items-center text-sm text-muted-foreground">
          <Link to="/dashboard" className="hover:text-foreground">
            Dashboard
          </Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span className="text-foreground">Lesson Plan</span>
        </div>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-primary">
              {lessonPlan?.subject}: {lessonPlan?.objectives.split('.')[0]}
            </h1>
            <p className="text-muted-foreground mt-2">
              Grade {lessonPlan?.grade} • {lessonPlan?.duration} minutes
            </p>
          </div>
          <Button onClick={() => toast.info("Share functionality coming soon!")} variant="outline">
            <Share className="mr-2 h-4 w-4" />
            Share Lesson
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {parsedSections.map((section, index) => (
            <SectionCard
              key={index}
              section={section}
              onGenerateMore={handleGenerateMore}
              isGenerating={generatingSections.has(section.title)}
            />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LessonPlanView;
