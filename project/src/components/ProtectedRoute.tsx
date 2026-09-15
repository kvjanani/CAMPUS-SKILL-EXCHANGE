import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import LoadingState from './LoadingState';

interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
}

export default function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { session, profile, loading, isAdmin } = useAuth();

  if (loading) return <LoadingState message="Loading..." />;

  if (!session) return <Navigate to="/login" replace />;

  if (profile && !profile.is_active) return <Navigate to="/unauthorized" replace />;

  if (adminOnly && !isAdmin) return <Navigate to="/unauthorized" replace />;

  return <>{children}</>;
}
