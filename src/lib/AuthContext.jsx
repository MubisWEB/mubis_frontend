import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { authApi } from '@/api/services';
import { connectSocket, disconnectSocket, joinNotifications } from '@/api/socket';
import socket from '@/api/socket';
import { getRedirectForRole as getRoleRedirect, isAdminRole, normalizeRole } from '@/lib/roles';

const fallbackAuthContext = {
  user: null,
  isAuthenticated: false,
  isLoadingAuth: false,
  login: async () => {
    throw new Error('AuthProvider unavailable');
  },
  logout: async () => {},
  refreshUser: async () => {},
};

const AuthContext = createContext(fallbackAuthContext);

const normalizeUser = (user) =>
  user ? { ...user, role: normalizeRole(user.role) } : null;

export const getRedirectForRole = (role, userId = null) => {
  if (userId) {
    try {
      const settingsKey = `mubis_user_settings_${userId}`;
      const raw = localStorage.getItem(settingsKey);

      if (raw) {
        const settings = JSON.parse(raw);
        if (settings.default_landing_page) {
          return settings.default_landing_page;
        }
      }
    } catch {
      // Ignore invalid local preferences and fall back to role defaults.
    }
  }

  return getRoleRedirect(role);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    const restore = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setIsLoadingAuth(false);
        return;
      }

      try {
        const raw = await authApi.me();
        const normalized = normalizeUser(raw);
        setUser(normalized);
        connectSocket();
        if (normalized?.id) joinNotifications(normalized.id);
      } catch {
        disconnectSocket();
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      } finally {
        setIsLoadingAuth(false);
      }
    };

    restore();
  }, []);

  // Listener global de notificaciones push por WebSocket
  useEffect(() => {
    if (!user?.id) return;

    const handleNotif = (notif) => {
      const isWinNotif = ['AUCTION_WON', 'PENDING_DECISION'].includes(notif.type);
      if (isWinNotif) {
        toast.success(notif.title, {
          description: notif.body,
          duration: 10000,
          action: notif.auctionId
            ? { label: 'Ver subasta', onClick: () => { window.location.assign('/Ganados'); } }
            : undefined,
        });
      } else if (notif.title) {
        toast(notif.title, { description: notif.body, duration: 6000 });
      }
    };

    socket.on('notification_created', handleNotif);
    return () => socket.off('notification_created', handleNotif);
  }, [user?.id]);

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
    } catch {
      // Ignore refresh errors and keep the current session state.
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoadingAuth,
        login,
        logout,
        refreshUser,
        isSubscriptionActive: user?.role === 'recomprador' && user?.subscriptionStatus === 'ACTIVE',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { isAdminRole };

export const useAuth = () => useContext(AuthContext);
