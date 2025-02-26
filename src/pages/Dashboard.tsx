
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, Calendar, Plus, Settings } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import EmptyState from "@/components/dashboard/EmptyState";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, isSameDay } from "date-fns";

interface LessonPlan {
  id: string;
  subject: string;
  grade: string;
  objectives: string;
  created_at: string;
}

const subjectDisplayNames: Record<string, string> = {
  "pe": "Physical Education",
  "math": "Mathematics",
  "english": "English",
  "science": "Science"
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

  const getFilteredAndSortedLessonPlans = () => {
    let filtered = [...lessonPlans];

    if (selectedSubject !== "all") {
      filtered = filtered.filter(plan => plan.subject === selectedSubject);
    }

    return filtered.sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else {
        return a.subject.localeCompare(b.subject);
      }
    });
  };

  const groupLessonPlansByDate = (plans: LessonPlan[]) => {
    const groups: { [key: string]: LessonPlan[] } = {};
    
    plans.forEach(plan => {
      const date = new Date(plan.created_at);
      const dateKey = format(date, 'yyyy-MM-dd');
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(plan);
    });

    return Object.entries(groups).sort(([dateA], [dateB]) => {
      return new Date(dateB).getTime() - new Date(dateA).getTime();
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
    return <DashboardLayout sidebarItems={sidebarItems}>
      <div className="flex items-center justify-center h-full">
        <div className="flex items-center space-x-4">
          <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground animate-pulse">Loading lesson plans...</p>
        </div>
      </div>
    </DashboardLayout>;
  }

  const filteredLessonPlans = getFilteredAndSortedLessonPlans();
  const groupedLessonPlans = groupLessonPlansByDate(filteredLessonPlans);

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="space-y-8">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">My Lessons</h1>
            <p className="text-muted-foreground">
              Manage and organize your lesson plans.
            </p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-500 text-slate-50">
            <Link to="/lesson-plan/create" className="flex items-center">
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
                <Link to="/lesson-plan/create" className="flex items-center">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Lesson
                </Link>
              </Button>
            }
          />
        ) : (
          <>
            <div className="flex gap-4 flex-wrap">
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as "date" | "subject")}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Sort by Date</SelectItem>
                  <SelectItem value="subject">Sort by Subject</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {uniqueSubjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subjectDisplayNames[subject] || subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-6">
              {groupedLessonPlans.map(([date, plans]) => (
                <Card key={date}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      {format(new Date(date), 'MMMM d, yyyy')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {plans.map((plan) => (
                        <Card
                          key={plan.id}
                          className="group relative overflow-hidden transition-all hover:shadow-lg"
                        >
                          <Link
                            to={`/lesson-plan/${plan.id}`}
                            className="block p-4 sm:p-6 space-y-4"
                          >
                            <div className="space-y-2">
                              <div className="space-y-1">
                                <h2 className="text-lg sm:text-xl font-semibold tracking-tight hover:text-primary transition-colors line-clamp-1">
                                  {subjectDisplayNames[plan.subject] || plan.subject}
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                  Grade {plan.grade}
                                </p>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {plan.objectives}
                            </p>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Calendar className="mr-2 h-4 w-4" />
                              {format(new Date(plan.created_at), "MMMM d, yyyy")}
                            </div>
                          </Link>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
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
