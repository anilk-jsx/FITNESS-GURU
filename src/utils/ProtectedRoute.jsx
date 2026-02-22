import { Navigate } from 'react-router-dom';
import tokenManager from './tokenManager';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  // Check if user is authenticated
  if (!tokenManager.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  
  // Check admin access if required
  if (adminOnly && !tokenManager.isAdmin()) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

export default ProtectedRoute;
