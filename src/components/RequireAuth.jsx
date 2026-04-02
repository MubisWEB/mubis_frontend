import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, isAdminRole, getRedirectForRole } from '@/lib/AuthContext';

export function RequireAuth({ children }) {
  const { isAuthenticated, user, isLoadingAuth } = useAuth();
  if (isLoadingAuth) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdminRole(user?.role) && user?.verification_status !== 'VERIFIED') {
    return <Navigate to="/PendienteVerificacion" replace />;
  }
  return children;
}

export function RequireRole({ roles, children }) {
  const { isAuthenticated, user, isLoadingAuth } = useAuth();
  if (isLoadingAuth) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!roles.includes(user?.role)) return <Navigate to={getRedirectForRole(user?.role)} replace />;
  if (!isAdminRole(user?.role) && user?.verification_status !== 'VERIFIED') {
    return <Navigate to="/PendienteVerificacion" replace />;
  }
  return children;
}
