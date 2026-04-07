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

  async function login(data: LoginRequest) {
    const response = await authService.login(data);
    setUser({
      userId: response.userId,
      email: response.email,
      name: response.name,
      timezone: 'America/Sao_Paulo',
      createdAt: new Date().toISOString(),
    });
  }

  async function register(data: RegisterRequest) {
    const response = await authService.register(data);
    setUser({
      userId: response.userId,
      email: response.email,
      name: response.name,
      timezone: data.timezone || 'America/Sao_Paulo',
      createdAt: new Date().toISOString(),
    });
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
