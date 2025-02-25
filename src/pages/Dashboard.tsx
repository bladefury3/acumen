
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, Calendar, Plus, Settings, Trash2 } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import EmptyState from "@/components/dashboard/EmptyState";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
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
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";

interface LessonPlan {
  id: string;
  subject: string;
  grade: string;
  objectives: string;
  created_at: string;
}

// Subject mapping for display names
const subjectDisplayNames: Record<string, string> = {
  "pe": "Physical Education",
  "math": "Mathematics",
  "english": "English",
  "science": "Science",
  // Add more mappings as needed
};

const Dashboard = () => {
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"date" | "subject">("date");
  const [uniqueSubjects, setUniqueSubjects] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("all");

  const fetchLessonPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('lesson_plans')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Extract unique subjects
      const subjects = [...new Set((data || []).map(plan => plan.subject))];
      setUniqueSubjects(subjects);
      setLessonPlans(data || []);
    } catch (error) {
      console.error('Error fetching lesson plans:', error);
      toast.error("Failed to load lesson plans");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('lesson_plans')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setLessonPlans(prev => prev.filter(plan => plan.id !== id));
      toast.success("Lesson plan deleted successfully");
    } catch (error) {
      console.error('Error deleting lesson plan:', error);
      toast.error("Failed to delete lesson plan");
    }
  };

  const getFilteredAndSortedLessonPlans = () => {
    let filtered = [...lessonPlans];
    
    // Filter by subject if one is selected
    if (selectedSubject !== "all") {
      filtered = filtered.filter(plan => plan.subject === selectedSubject);
    }

    // Sort based on selected criteria
    return filtered.sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else {
        return a.subject.localeCompare(b.subject);
      }
    });
  };

  useEffect(() => {
    fetchLessonPlans();
  }, []);

  const sidebarItems = [
    { label: "My Lessons", href: "/dashboard", icon: BookOpen },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  if (isLoading) {
    return (
      <DashboardLayout sidebarItems={sidebarItems}>
        <div className="flex items-center justify-center h-full">
          <div className="flex items-center space-x-4">
            <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground animate-pulse">Loading lesson plans...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const filteredLessonPlans = getFilteredAndSortedLessonPlans();

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">My Lessons</h1>
            <p className="text-muted-foreground">
              Manage and organize your lesson plans.
            </p>
          </div>
          <Button>
            <Link to="/lesson-plan" className="flex items-center">
              <Plus className="mr-2 h-4 w-4" />
              Create Lesson
            </Link>
          </Button>
        </div>

        {lessonPlans.length === 0 ? (
          <EmptyState 
            title="No Lesson Plans Yet"
            description="Create your first lesson plan to get started."
            action={
              <Button>
                <Link to="/lesson-plan" className="flex items-center">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Lesson
                </Link>
              </Button>
            }
          />
        ) : (
          <>
            <div className="flex gap-4">
              <Select
                value={sortBy}
                onValueChange={(value) => setSortBy(value as "date" | "subject")}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Sort by Date</SelectItem>
                  <SelectItem value="subject">Sort by Subject</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={selectedSubject}
                onValueChange={setSelectedSubject}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {uniqueSubjects.map(subject => (
                    <SelectItem key={subject} value={subject}>
                      {subjectDisplayNames[subject] || subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredLessonPlans.map((plan) => (
                <Card
                  key={plan.id}
                  className="group relative overflow-hidden transition-all hover:shadow-lg"
                >
                  <Link
                    to={`/lesson-plan/${plan.id}`}
                    className="block p-6 space-y-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h2 className="text-xl font-semibold tracking-tight hover:text-primary transition-colors">
                            {subjectDisplayNames[plan.subject] || plan.subject}
                          </h2>
                          <p className="text-sm text-muted-foreground">
                            Grade {plan.grade}
                          </p>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                                onClick={(e) => e.preventDefault()}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete lesson plan</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-destructive">
                                  Delete Lesson Plan
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete this lesson plan
                                  and all associated activities.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleDelete(plan.id);
                                  }}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {plan.objectives}
                    </p>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="mr-2 h-4 w-4" />
                      {format(new Date(plan.created_at), "MMMM d, yyyy")}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/40 to-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
