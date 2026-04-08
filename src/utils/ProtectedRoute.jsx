import { Navigate } from 'react-router-dom';
import tokenManager from './tokenManager';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  // Check if token is valid (authenticated and not expired/timed out)
  if (!tokenManager.isTokenValid()) {
    // Clear any invalid session data
    tokenManager.clearTokens();
    return <Navigate to="/login" replace />;
  }

  // Check admin access if required
  if (adminOnly && !tokenManager.isAdmin()) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
