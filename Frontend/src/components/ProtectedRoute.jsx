import { Navigate } from 'react-router-dom';

export const ProtectedRoute = ({ element, user }) => {
  if (!user || !user.id) {
    return <Navigate to="/login" replace />;
  }
  return element;
};
