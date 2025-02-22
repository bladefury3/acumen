
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Onboarding from "@/pages/Onboarding";
import NotFound from "@/pages/NotFound";
import LessonPlan from "@/pages/LessonPlan";
import LessonPlanView from "@/pages/LessonPlanView";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <TooltipProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={
              <Dashboard 
                lessonPlans={[]}
                onCreateLessonPlan={() => console.log('Create lesson plan')}
              />
            } />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/lesson-plan/create" element={<LessonPlan />} />
            <Route path="/lesson-plan/:id" element={<LessonPlanView />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
