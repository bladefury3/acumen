
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { FileText, Settings, Plus } from "lucide-react";
import EmptyState from "@/components/dashboard/EmptyState";

interface LessonPlan {
  title: string;
  description: string;
}

interface DashboardProps {
  lessonPlans: LessonPlan[];
  onCreateLessonPlan: () => void;
}

const Dashboard = ({ lessonPlans, onCreateLessonPlan }: DashboardProps) => {
  const sidebarItems = [
    { label: "Lesson Plans", href: "/dashboard", icon: FileText },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <DashboardLayout 
      sidebarItems={sidebarItems} 
      sidebarAction={
        <Button onClick={onCreateLessonPlan} className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Create Lesson Plan
        </Button>
      }
    >
      {lessonPlans.length === 0 ? (
        <EmptyState 
          title="No lesson plans yet"
          description="Create your first lesson plan to get started"
          action={
            <Button onClick={onCreateLessonPlan}>
              <Plus className="mr-2 h-4 w-4" />
              Create Lesson Plan
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {lessonPlans.map((plan, index) => (
            <div key={index} className="p-4 border rounded-lg shadow-sm">
              <h3 className="font-medium">{plan.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
