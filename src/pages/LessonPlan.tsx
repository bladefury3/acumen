
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

  const handleFieldChange = (field: string, value: string | string[]) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(formData);
    toast.success("Lesson plan saved successfully!");
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
            <Button variant="outline" type="button">
              Save Draft
            </Button>
            <Button type="submit">Create Lesson Plan</Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default LessonPlan;
