
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  user: any;
  children: React.ReactNode;
}

export const ProtectedRoute = ({ user, children }: ProtectedRouteProps) => {
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};
