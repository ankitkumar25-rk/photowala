import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store';

export default function ProtectedRoute({ children }) {
  const user = useAuthStore((s) => s.user);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const location = useLocation();

  // Wait for auth check to complete if not already done
  if (!isInitialized) return null; // Or a smaller spinner

  if (!user) {
    return <Navigate to={`/login?redirect=${location.pathname}`} replace />;
  }
  return children;
}
