'use client';

import React, { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { authService } from '@/lib/api/auth';
import { SESSION_EXPIRED_EVENT } from '@/lib/api/client';
import { isApiError } from '@/lib/api/errors';
import { clearTokens, getRefreshToken, REFRESH_TOKEN_KEY } from '@/lib/api/tokens';
import { LoginRequest, RegisterRequest, UserProfile } from '@/lib/types/auth';

interface AuthContextData {
  user: UserProfile | null;
  loading: boolean;
  /** true quando há sessão salva mas o perfil não pôde ser carregado (rede/servidor). */
  loadError: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  retry: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextData | undefined>(undefined);

const USER_CACHE_KEY = 'arco:user';

function readCachedUser(): UserProfile | null {
  try {
    const raw = window.localStorage.getItem(USER_CACHE_KEY);
    return raw ? (JSON.parse(raw) as UserProfile) : null;
  } catch {
    return null;
  }
}

function writeCachedUser(user: UserProfile | null): void {
  try {
    if (user) window.localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
    else window.localStorage.removeItem(USER_CACHE_KEY);
  } catch {
    // ignore
  }
}

/** Erros que significam "sessão inválida" — os demais (rede, 5xx, 429) são transitórios. */
function isSessionInvalid(error: unknown): boolean {
  if (!isApiError(error)) return false;
  if (error.code === 'session_expired') return true;
  return error.status === 401 || error.status === 403 || error.status === 404;
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const clearSession = useCallback(() => {
    clearTokens();
    writeCachedUser(null);
    setUser(null);
    setLoadError(false);
    queryClient.clear();
  }, [queryClient]);

  const loadUser = useCallback(async () => {
    try {
      if (!authService.isAuthenticated()) {
        writeCachedUser(null);
        setUser(null);
        return;
      }
      const userData = await authService.getCurrentUser();
      writeCachedUser(userData);
      setUser(userData);
      setLoadError(false);
    } catch (error) {
      if (isSessionInvalid(error)) {
        clearSession();
      } else {
        // Falha transitória: mantém os tokens e usa o perfil em cache, se houver.
        const cached = readCachedUser();
        if (cached) {
          setUser(cached);
          setLoadError(false);
        } else {
          setLoadError(true);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [clearSession]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // Sincroniza login/logout entre abas e reage à expiração da sessão.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== null && event.key !== REFRESH_TOKEN_KEY) return;

      if (!getRefreshToken()) {
        writeCachedUser(null);
        setUser(null);
        setLoadError(false);
        queryClient.clear();
      } else if (event.oldValue === null) {
        // Login em outra aba (rotação de token não precisa recarregar o perfil).
        loadUser();
      }
    };

    const onSessionExpired = () => {
      writeCachedUser(null);
      setUser(null);
      setLoadError(false);
      queryClient.clear();
    };

    window.addEventListener('storage', onStorage);
    window.addEventListener(SESSION_EXPIRED_EVENT, onSessionExpired);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(SESSION_EXPIRED_EVENT, onSessionExpired);
    };
  }, [loadUser, queryClient]);

  const refreshUser = useCallback(async () => {
    try {
      if (authService.isAuthenticated()) {
        const userData = await authService.getCurrentUser();
        writeCachedUser(userData);
        setUser(userData);
      }
    } catch {
      // mantém o usuário atual
    }
  }, []);

  const retry = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    await loadUser();
  }, [loadUser]);

  const login = useCallback(async (data: LoginRequest) => {
    await authService.login(data);
    queryClient.clear();
    // Busca o perfil completo para isEmailVerified ficar correto
    const userData = await authService.getCurrentUser();
    writeCachedUser(userData);
    setUser(userData);
    setLoadError(false);
  }, [queryClient]);

  const register = useCallback(async (data: RegisterRequest) => {
    await authService.register(data);
    queryClient.clear();
    const userData = await authService.getCurrentUser();
    writeCachedUser(userData);
    setUser(userData);
    setLoadError(false);
  }, [queryClient]);

  const logout = useCallback(async () => {
    await authService.logout();
    clearSession();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }, [clearSession]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loadError,
        login,
        register,
        logout,
        refreshUser,
        retry,
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
