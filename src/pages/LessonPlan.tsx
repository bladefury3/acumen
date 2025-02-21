
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { FileText, Settings } from "lucide-react";
import LessonPlanPage from "@/components/lesson-plan/LessonPlanPage";

const LessonPlan = () => {
  const [title, setTitle] = useState("Mathematics: Introduction to Fractions");
  const [description, setDescription] = useState("A comprehensive lesson plan for teaching basic fractions to elementary students");

  const sidebarItems = [
    { label: "My Lessons", href: "/dashboard", icon: FileText },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  const userInputControls = [
    <div key="title" className="space-y-2">
      <Label htmlFor="title">Lesson Title</Label>
      <Input
        id="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter lesson title"
      />
    </div>,
    <div key="description" className="space-y-2">
      <Label htmlFor="description">Description</Label>
      <Textarea
        id="description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Enter lesson description"
      />
    </div>,
  ];

  const lessonPlan = {
    title,
    description,
    pdfContent: "Sample PDF content",
  };

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <LessonPlanPage
        lessonPlan={lessonPlan}
        userInputControls={userInputControls}
      />
    </DashboardLayout>
  );
};

export default LessonPlan;
