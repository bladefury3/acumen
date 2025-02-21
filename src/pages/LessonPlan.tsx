
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { FileText, Settings, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import BasicInformation from "@/components/lesson-plan/BasicInformation";
import AdditionalSettings from "@/components/lesson-plan/AdditionalSettings";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface LessonPlanForm {
  objectives: string;
  grade: string;
  subject: string;
  funElements: string;
  duration: string;
  curriculum: string;
  learningTools: string[];
  learningNeeds: string[];
  activities: string[];
  assessments: string[];
}

const LessonPlan = () => {
  const [formData, setFormData] = useState<LessonPlanForm>({
    objectives: "",
    grade: "",
    subject: "",
    funElements: "",
    duration: "45",
    curriculum: "",
    learningTools: [],
    learningNeeds: [],
    activities: [],
    assessments: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  const handleFieldChange = (field: string, value: string | string[]) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to create a lesson plan");
        return;
      }

      // Call OpenAI via edge function
      const { data: aiData, error: aiError } = await supabase.functions.invoke(
        'generate-lesson-plan',
        {
          body: formData,
        }
      );

      if (aiError) throw aiError;

      const aiResponse = aiData.response;
      setAiResponse(aiResponse);

      // Save to database
      const { error: dbError } = await supabase
        .from('lesson_plans')
        .insert({
          user_id: user.id,
          objectives: formData.objectives,
          grade: formData.grade,
          subject: formData.subject,
          fun_elements: formData.funElements,
          duration: formData.duration,
          curriculum: formData.curriculum,
          learning_tools: formData.learningTools,
          learning_needs: formData.learningNeeds,
          activities: formData.activities,
          assessments: formData.assessments,
          ai_response: aiResponse,
        });

      if (dbError) throw dbError;

      toast.success("Lesson plan generated and saved successfully!");
    } catch (error) {
      console.error('Error:', error);
      toast.error("Failed to generate lesson plan. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const sidebarItems = [
    { label: "My Lessons", href: "/dashboard", icon: FileText },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="space-y-8">
        <div className="flex items-center text-sm text-muted-foreground">
          <Link to="/dashboard" className="hover:text-foreground">
            Dashboard
          </Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span className="text-foreground">Create Lesson Plan</span>
        </div>

        <div>
          <h1 className="text-3xl font-bold text-primary">Create Lesson Plan</h1>
          <p className="text-muted-foreground mt-2">
            Design an engaging lesson for your students
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <BasicInformation
            objectives={formData.objectives}
            grade={formData.grade}
            subject={formData.subject}
            funElements={formData.funElements}
            duration={formData.duration}
            onFieldChange={handleFieldChange}
          />

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="settings">
              <AccordionTrigger>Additional Settings</AccordionTrigger>
              <AccordionContent>
                <AdditionalSettings
                  curriculum={formData.curriculum}
                  learningTools={formData.learningTools}
                  learningNeeds={formData.learningNeeds}
                  activities={formData.activities}
                  assessments={formData.assessments}
                  onFieldChange={handleFieldChange}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="flex justify-end space-x-4">
            <Button variant="outline" type="button" disabled={isLoading}>
              Save Draft
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Generating..." : "Create Lesson Plan"}
            </Button>
          </div>
        </form>

        {aiResponse && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Generated Lesson Plan</CardTitle>
              <CardDescription>
                AI-generated lesson plan based on your inputs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                {aiResponse}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default LessonPlan;
