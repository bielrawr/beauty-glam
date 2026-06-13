import { Navigate } from 'react-router-dom';
import type { ReactElement } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function ProtectedRoute({ children }: { children: ReactElement }) {
  const { user, loadingAuth } = useAuth();

  if (loadingAuth) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!user.emailVerified) {
    return <Navigate to="/verify-email" />;
  }

  return children;
}
