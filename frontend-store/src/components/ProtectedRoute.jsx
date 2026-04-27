import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store';

export default function ProtectedRoute({ children }) {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  if (!user) {
    return <Navigate to={`/login?redirect=${location.pathname}`} replace />;
  }
  return children;
}
