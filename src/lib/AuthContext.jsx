import React, { createContext, useState, useContext, useEffect } from 'react';
import { getCurrentUser, logoutUser, isAuthenticated } from '@/lib/mockStore';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    const currentUser = isAuthenticated() ? getCurrentUser() : null;
    setUser(currentUser);
    setIsLoadingAuth(false);
  }, []);

  const logout = () => {
    logoutUser();
    setUser(null);
  };

  const refreshUser = () => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoadingAuth,
      logout,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
