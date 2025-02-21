
import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { FileText, Settings, Plus, Clock, Book, Target } from "lucide-react";
import EmptyState from "@/components/dashboard/EmptyState";
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardHeader, CardContent } from "@/components/ui/card";

interface LessonPlan {
  id: string;
  subject: string;
  duration: string;
  objectives: string;
}

interface DashboardProps {
  lessonPlans: LessonPlan[];
  onCreateLessonPlan: () => void;
}

const gradients = [
  "linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)",
  "linear-gradient(to right, #c1c161 0%, #c1c161 0%, #d4d4b1 100%)",
  "linear-gradient(to right, #ffc3a0 0%, #ffafbd 100%)",
  "linear-gradient(to top, #e6b980 0%, #eacda3 100%)",
  "linear-gradient(90deg, hsla(186, 33%, 94%, 1) 0%, hsla(216, 41%, 79%, 1) 100%)",
];

const Dashboard = ({ lessonPlans: propLessonPlans }: DashboardProps) => {
  const navigate = useNavigate();
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([]);

  useEffect(() => {
    const fetchLessonPlans = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase
        .from('lesson_plans')
        .select('id, subject, duration, objectives')
        .eq('user_id', session.user.id);

      if (error) {
        console.error('Error fetching lesson plans:', error);
        return;
      }

      setLessonPlans(data || []);
    };

    fetchLessonPlans();
  }, [navigate]);

  const handleCreateLessonPlan = () => {
    navigate('/lesson-plan/create');
  };

  const sidebarItems = [
    { label: "My Lessons", href: "/dashboard", icon: FileText },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <DashboardLayout 
      sidebarItems={sidebarItems} 
      sidebarAction={
        <Button 
          onClick={handleCreateLessonPlan} 
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
            <Button onClick={handleCreateLessonPlan}>
              <Plus className="mr-2 h-4 w-4" />
              Create Lesson Plan
            </Button>
          }
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {lessonPlans.map((plan, index) => (
            <Link 
              to={`/lesson-plan/${plan.id}`}
              key={plan.id}
              className="block transition-transform hover:scale-105"
            >
              <Card 
                className="h-full cursor-pointer overflow-hidden"
                style={{ 
                  background: gradients[index % gradients.length],
                  border: 'none'
                }}
              >
                <CardHeader>
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <Book className="h-5 w-5" />
                    {plan.subject}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4" />
                      {plan.duration} minutes
                    </div>
                    <div className="flex items-start gap-2">
                      <Target className="h-4 w-4 mt-1" />
                      <p className="text-sm line-clamp-3">
                        {plan.objectives.split('.')[0]}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
