import { Navigate } from 'react-router-dom';
import { ReactNode } from 'react';
import { useAuth } from '../auth';
import { Role } from '../types';

export default function ProtectedRoute({
  children,
  roles,
}: {
  children: ReactNode;
  roles?: Role[];
}) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-8 text-gray-500">Chargement…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/citoyen" replace />;
  return <>{children}</>;
}
