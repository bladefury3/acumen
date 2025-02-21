import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { FileText, Settings, Share, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

interface LessonPlanData {
  id: string;
  objectives: string;
  grade: string;
  subject: string;
  fun_elements: string;
  duration: string;
  curriculum: string;
  learning_tools: string[];
  learning_needs: string[];
  activities: string[];
  assessments: string[];
  ai_response: string;
}

const LessonPlanView = () => {
  const { id } = useParams();
  const [lessonPlan, setLessonPlan] = useState<LessonPlanData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const sidebarItems = [
    { label: "My Lessons", href: "/dashboard", icon: FileText },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

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
      } catch (error) {
        console.error('Error fetching lesson plan:', error);
        toast.error("Failed to load lesson plan");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchLessonPlan();
  }, [id]);

  const handleGenerateMore = async (section: string) => {
    toast.info(`Generating more content for ${section}...`);
    // Implementation for generating more content for a specific section
  };

  const handleShareLesson = () => {
    toast.info("Share functionality coming soon!");
  };

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

  const formatContentAsBullets = (content: string) => {
    return content.split(',').map(item => item.trim());
  };

  const sections = [
    { title: "Learning Objectives", content: lessonPlan.objectives.split('.').filter(Boolean) },
    { title: "Materials and Resources", content: formatContentAsBullets(lessonPlan.learning_tools.join(", ")) },
    { title: "Activities", content: formatContentAsBullets(lessonPlan.activities.join(", ")) },
    { title: "Assessment Strategies", content: formatContentAsBullets(lessonPlan.assessments.join(", ")) },
    { title: "Learning Needs", content: formatContentAsBullets(lessonPlan.learning_needs.join(", ")) },
  ];

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      {/* Breadcrumb */}
      <div className="space-y-8">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-muted-foreground">
          <Link to="/dashboard" className="hover:text-foreground">
            Dashboard
          </Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span className="text-foreground">Lesson Plan</span>
        </div>

        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-primary">
              {`${lessonPlan.subject}: ${lessonPlan.objectives.split('.')[0]}`}
            </h1>
            <p className="text-muted-foreground mt-2">
              Grade {lessonPlan.grade} • {lessonPlan.duration} minutes
            </p>
          </div>
          <Button onClick={handleShareLesson} variant="outline">
            <Share className="mr-2 h-4 w-4" />
            Share Lesson
          </Button>
        </div>

        {/* Lesson Details Card */}
        <Card>
          <CardHeader>
            <CardTitle>Lesson Overview</CardTitle>
            <CardDescription>Basic information about this lesson</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <h3 className="font-medium">Subject</h3>
              <p className="text-muted-foreground">{lessonPlan.subject}</p>
            </div>
            <div>
              <h3 className="font-medium">Grade Level</h3>
              <p className="text-muted-foreground">{lessonPlan.grade}</p>
            </div>
            <div>
              <h3 className="font-medium">Duration</h3>
              <p className="text-muted-foreground">{lessonPlan.duration} minutes</p>
            </div>
          </CardContent>
        </Card>

        {/* Content Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sections.map((section, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>{section.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="prose prose-sm max-w-none">
                  <ul className="list-disc pl-4 space-y-2">
                    {section.content.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
                <Link 
                  to={`/lesson-plan/${id}/edit/${section.title.toLowerCase().replace(/\s+/g, '-')}`}
                  className={cn(buttonVariants({ variant: "secondary", className: "w-full" }))}
                >
                  Generate More for {section.title}
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LessonPlanView;
