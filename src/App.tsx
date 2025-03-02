import { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import LessonPlanView from './pages/LessonPlanView';
import Settings from './pages/Settings';
import Auth from './pages/Auth';
import { useUser } from '@supabase/auth-helpers-react';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthContextProvider } from './context/AuthContext';
import LessonGenerator from './pages/LessonGenerator';
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"

// Add this import
import { migrateActivitiesToLessons } from '@/services/lesson/databaseOperations';

function App() {
  const user = useUser();

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
    <AuthContextProvider>
      <ThemeProvider defaultTheme="system" storageKey="vite-react-theme">
        <Router>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute user={user}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/settings"
              element={
                <ProtectedRoute user={user}>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lesson/:id"
              element={
                <ProtectedRoute user={user}>
                  <LessonPlanView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/"
              element={
                <ProtectedRoute user={user}>
                  <LessonGenerator />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
        <Toaster />
      </ThemeProvider>
    </AuthContextProvider>
  );
}

export default App;
