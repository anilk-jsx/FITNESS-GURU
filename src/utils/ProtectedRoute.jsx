import { Navigate } from 'react-router-dom';
import tokenManager from './tokenManager';

const ProtectedRoute = ({ children, adminOnly = false, trainerOnly = false }) => {
  // Check if token is valid (authenticated and not expired/timed out)
  if (!tokenManager.isTokenValid()) {
    // Clear any invalid session data
    tokenManager.clearTokens();
    return <Navigate to="/login" replace />;
  }

  const userData = tokenManager.getUserData();
  const role = userData?.role;

  // Trainer access control
  if (role === 'TRAINER') {
    if (!trainerOnly) {
      return <Navigate to="/trainer-dashboard" replace />;
    }
  } else {
    if (trainerOnly) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Check admin access if required
  if (adminOnly && !tokenManager.isAdmin()) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
