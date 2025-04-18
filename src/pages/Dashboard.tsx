
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, Calendar, Plus, Settings, MoreHorizontal, 
  Grid, List, Search, ChevronLeft, ChevronRight
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import EmptyState from "@/components/dashboard/EmptyState";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, isSameDay } from "date-fns";
import { Input } from "@/components/ui/input";

interface LessonPlan {
  id: string;
  subject: string;
  grade: string;
  objectives: string;
  created_at: string;
  duration: string;
}

const subjectDisplayNames: Record<string, string> = {
  "pe": "Physical Education",
  "math": "Mathematics",
  "english": "English",
  "science": "Science"
};

const subjectColors = {
  Math: 'bg-indigo-100 text-indigo-600',
  Science: 'bg-green-100 text-green-600',
  History: 'bg-yellow-100 text-yellow-600',
  English: 'bg-blue-100 text-blue-600',
  Art: 'bg-pink-100 text-pink-600',
  default: 'bg-gray-100 text-gray-600'
};

const Dashboard = () => {
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"date" | "subject">("date");
  const [uniqueSubjects, setUniqueSubjects] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; // Number of cards per page in grid view

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
    
    // Subject filtering
    if (selectedSubject !== "all") {
      filtered = filtered.filter(plan => plan.subject === selectedSubject);
    }
    
    // Search filtering
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(plan => 
        plan.subject.toLowerCase().includes(query) ||
        plan.objectives.toLowerCase().includes(query) ||
        plan.grade.toLowerCase().includes(query)
      );
    }
    
    // Sorting
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

  const filteredLessonPlans = getFilteredAndSortedLessonPlans();
  const groupedLessonPlans = groupLessonPlansByDate(filteredLessonPlans);
  
  // Pagination logic
  const totalPages = Math.ceil(filteredLessonPlans.length / itemsPerPage);
  const paginatedLessonPlans = filteredLessonPlans.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const sidebarItems = [{
    label: "My Lessons",
    href: "/dashboard",
    icon: BookOpen
  }];

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

  const renderLessonPlanCard = (plan: LessonPlan) => {
    const subjectColor = subjectColors[plan.subject] || subjectColors.default;
    
    return (
      <Link 
        key={plan.id} 
        to={`/lesson-plan/${plan.id}`} 
        className="block p-4 space-y-2 rounded-lg border bg-white hover:shadow-md transition-shadow hover:no-underline"
      >
        <div className="flex justify-between items-start">
          <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${subjectColor}`}>
            {plan.duration} minutes
          </span>
          <button className="text-muted-foreground hover:text-[#003C5A]">
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>
        <h3 className="text-lg font-bold text-gray-900">
          {plan.subject}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {plan.objectives}
        </p>
        <div className="flex justify-between items-center text-sm text-muted-foreground mt-2">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {format(new Date(plan.created_at), "MMM d")}
          </div>
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
            Grade {plan.grade}
          </span>
        </div>
      </Link>
    );
  };

  const renderLessonPlanListItem = (plan: LessonPlan) => {
    const subjectColor = subjectColors[plan.subject] || subjectColors.default;
    
    return (
      <Link 
        key={plan.id} 
        to={`/lesson-plan/${plan.id}`} 
        className="flex items-center justify-between p-4 border-b hover:bg-slate-50 transition-colors hover:no-underline"
      >
        <div className="flex items-center gap-4">
          <div className={`w-2 h-12 rounded ${subjectColor.split(' ')[0]}`}></div>
          <div>
            <h3 className="font-medium text-gray-900">{plan.subject}</h3>
            <p className="text-sm text-muted-foreground line-clamp-1">{plan.objectives}</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-sm text-muted-foreground">
            {format(new Date(plan.created_at), "MMM d, yyyy")}
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
            Grade {plan.grade}
          </span>
          <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${subjectColor}`}>
            {plan.duration} min
          </span>
          <button className="text-muted-foreground hover:text-[#003C5A]">
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>
      </Link>
    );
  };

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
          <Button className="bg-[#003C5A] text-[#C3CFF5] hover:bg-[#003C5A]/90">
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
              <Button className="bg-[#003C5A] text-[#C3CFF5]">
                <Link to="/lesson-plan/create" className="flex items-center">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Lesson
                </Link>
              </Button>
            } 
          />
        ) : (
          <>
            <div className="flex flex-col md:flex-row md:items-center gap-4 flex-wrap">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input 
                    placeholder="Search lessons..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as "date" | "subject")}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Sort by Date</SelectItem>
                    <SelectItem value="subject">Sort by Subject</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filter subject" />
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
                
                <div className="flex border rounded-md overflow-hidden">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className={viewMode === "grid" ? "bg-[#003C5A] text-[#C3CFF5]" : ""}
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className={viewMode === "list" ? "bg-[#003C5A] text-[#C3CFF5]" : ""}
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {viewMode === "grid" ? (
                <>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {paginatedLessonPlans.map(renderLessonPlanCard)}
                  </div>
                  
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-8">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="border rounded-lg overflow-hidden bg-white">
                  <div className="flex items-center justify-between p-4 bg-slate-50 border-b">
                    <div className="flex-1 font-medium">Subject</div>
                    <div className="flex items-center gap-6">
                      <span className="w-20">Date</span>
                      <span className="w-16">Grade</span>
                      <span className="w-16">Duration</span>
                      <span className="w-6"></span> {/* For actions button */}
                    </div>
                  </div>
                  {filteredLessonPlans.map(renderLessonPlanListItem)}
                </div>
              )}
              
              {filteredLessonPlans.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Search className="h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="font-medium text-xl mb-1">No results found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
