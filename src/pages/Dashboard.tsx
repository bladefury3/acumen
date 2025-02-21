
import { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { FileText, Settings, Plus } from "lucide-react";
import EmptyState from "@/components/dashboard/EmptyState";
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface LessonPlan {
  title: string;
  description: string;
}

interface DashboardProps {
  lessonPlans: LessonPlan[];
  onCreateLessonPlan: () => void;
}

const Dashboard = ({ lessonPlans, onCreateLessonPlan }: DashboardProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
      }
    };
    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const sidebarItems = [
    { label: "My Lessons", href: "/dashboard", icon: FileText },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <DashboardLayout 
      sidebarItems={sidebarItems} 
      sidebarAction={
        <Button 
          onClick={onCreateLessonPlan} 
          className="w-full bg-blue-100 text-blue-600 hover:bg-blue-200"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Lesson Plan
        </Button>
      }
    >
      {lessonPlans.length === 0 ? (
        <EmptyState 
          title="Create New Lesson Plan"
          description="Design an engaging lesson plan that aligns with educational standards and sparks creativity."
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
