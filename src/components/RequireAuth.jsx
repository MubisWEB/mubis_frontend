import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated, getUserRole } from '@/lib/mockStore';

export function RequireAuth({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export function RequireRole({ roles, children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  const role = getUserRole();
  if (!roles.includes(role)) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
