import { Navigate } from "react-router-dom";
import { authService } from "../../services/authService";

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getCurrentUser();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Redirect to their appropriate dashboard
    if (user?.role === "admin") {
      return <Navigate to="/admin" replace />;
    } else if (user?.role === "team_leader") {
      return <Navigate to="/leader" replace />;
    } else {
      return <Navigate to="/employee" replace />;
    }
  }

  return children;
};
