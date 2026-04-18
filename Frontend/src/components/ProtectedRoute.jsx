import { Navigate } from 'react-router-dom';

export const ProtectedRoute = ({ element, user, allowedRoles }) => {
  if (!user || !user.id) {
    return <Navigate to="/login" replace />;
  }

  if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
    const role = user?.role || 'USER';
    if (!allowedRoles.includes(role)) {
      return <Navigate to="/dashboard" replace />;
    }
  }
  return element;
};
