import React, { createContext, useState, useContext, useEffect } from 'react';
import { authApi } from '@/api/services';
import { connectSocket, disconnectSocket, joinNotifications } from '@/api/socket';

const AuthContext = createContext();

// Backend devuelve roles en MAYÚSCULA → normalizamos a minúscula para
// mantener compatibilidad con RequireRole existentes.
const normalizeUser = (user) =>
  user ? { ...user, role: user.role?.toLowerCase() } : null;

export const getRedirectForRole = (role) => {
  switch (role?.toLowerCase()) {
    case 'admin':       return '/AdminDashboard';
    case 'perito':      return '/PeritajesPendientes';
    case 'dealer':      return '/MisSubastas';
    case 'recomprador': return '/Comprar';
    default:            return '/login';
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    const restore = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) { setIsLoadingAuth(false); return; }
      try {
        const raw = await authApi.me();
        const normalized = normalizeUser(raw);
        setUser(normalized);
        connectSocket();
        if (normalized?.id) joinNotifications(normalized.id);
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      } finally {
        setIsLoadingAuth(false);
      }
    };
    restore();
  }, []);

  const login = async (email, password, tenantSlug) => {
    const raw = await authApi.login(email, password, tenantSlug);
    const normalized = normalizeUser(raw);
    setUser(normalized);
    connectSocket();
    if (normalized?.id) joinNotifications(normalized.id);
    return normalized;
  };

  const logout = async () => {
    await authApi.logout();
    disconnectSocket();
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const raw = await authApi.me();
      setUser(normalizeUser(raw));
    } catch { /* ignore */ }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoadingAuth,
      login,
      logout,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
