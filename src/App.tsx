
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Onboarding from "@/pages/Onboarding";
import NotFound from "@/pages/NotFound";
import LessonPlan from "@/pages/LessonPlan";
import LessonPlanView from "@/pages/LessonPlanView";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/lesson-plan/create" element={<LessonPlan />} />
        <Route path="/lesson-plan/:id" element={<LessonPlanView />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
