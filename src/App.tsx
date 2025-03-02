
import { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import LessonPlanView from './pages/LessonPlanView';
import Auth from './pages/Auth';
import { Toaster } from "@/components/ui/toaster";

// Add this import
import { migrateActivitiesToLessons } from '@/services/lesson/databaseOperations';

function App() {
  // Run the migration on app startup
  useEffect(() => {
    // Run migration once
    const runMigration = async () => {
      try {
        if (!localStorage.getItem('activitiesMigrationCompleted')) {
          await migrateActivitiesToLessons();
          localStorage.setItem('activitiesMigrationCompleted', 'true');
        }
      } catch (error) {
        console.error('Migration error:', error);
      }
    };

    runMigration();
  }, []);

  return (
    <>
      <Router>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/lesson/:id" element={<LessonPlanView />} />
          <Route path="/" element={<Dashboard />} />
        </Routes>
      </Router>
      <Toaster />
    </>
  );
}

export default App;
