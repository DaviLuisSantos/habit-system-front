'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '@/lib/api/auth';
import { LoginRequest, RegisterRequest, UserProfile } from '@/lib/types/auth';

interface AuthContextData {
  user: UserProfile | null;
  loading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextData | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    try {
      if (authService.isAuthenticated()) {
        const userData = await authService.getCurrentUser();
        setUser(userData);
      }
    } catch (error) {
      console.error('Failed to load user', error);
      authService.logout();
    } finally {
      setLoading(false);
    }
  }

  async function refreshUser() {
    try {
      if (authService.isAuthenticated()) {
        const userData = await authService.getCurrentUser();
        setUser(userData);
      }
    } catch (error) {
      console.error('Failed to refresh user', error);
    }
  }

  async function login(data: LoginRequest) {
    await authService.login(data);
    // Fetch full profile so plan + isEmailVerified are accurate
    const userData = await authService.getCurrentUser();
    setUser(userData);
  }

  async function register(data: RegisterRequest) {
    await authService.register(data);
    // Fetch full profile so plan + isEmailVerified are accurate
    const userData = await authService.getCurrentUser();
    setUser(userData);
  }

  function logout() {
    authService.logout();
    setUser(null);
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
