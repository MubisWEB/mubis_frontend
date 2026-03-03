import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated, getUserRole, getCurrentUser } from '@/lib/mockStore';

export function RequireAuth({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  const user = getCurrentUser();
  const role = user?.role;
  // Admin always passes
  if (role !== 'admin') {
    const status = user?.verification_status || 'PENDING';
    if (status !== 'VERIFIED') {
      return <Navigate to="/PendienteVerificacion" replace />;
    }
  }
  return children;
}

export function RequireRole({ roles, children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  const user = getCurrentUser();
  const role = user?.role || getUserRole();
  if (!roles.includes(role)) {
    return <Navigate to="/login" replace />;
  }
  // Admin always passes verification
  if (role !== 'admin') {
    const status = user?.verification_status || 'PENDING';
    if (status !== 'VERIFIED') {
      return <Navigate to="/PendienteVerificacion" replace />;
    }
  }
  return children;
}
