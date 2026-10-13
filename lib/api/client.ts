import axios, { AxiosError, AxiosHeaders, InternalAxiosRequestConfig } from 'axios';
import { ApiError } from './errors';
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from './tokens';

export const SESSION_EXPIRED_EVENT = 'arco:session-expired';

function resolveApiUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (url) return url.replace(/\/+$/, '');

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'NEXT_PUBLIC_API_URL não está definida. Configure a URL da API antes do build de produção.',
    );
  }

  return 'http://localhost:5232';
}

export const API_URL = resolveApiUrl();

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/** Cliente "cru" (sem interceptors) para refresh/logout, evitando recursão. */
export const rawClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

interface RefreshResponseBody {
  accessToken: string;
  refreshToken: string;
}

function bearerOf(config: InternalAxiosRequestConfig): string | null {
  const header = AxiosHeaders.from(config.headers).get('Authorization');
  if (typeof header !== 'string') return null;
  return header.startsWith('Bearer ') ? header.slice(7) : null;
}

function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ error?: string; code?: string }>;
    if (!axiosError.response) {
      return new ApiError(axiosError.message || 'Network error', undefined, 'network');
    }
    const { status, data } = axiosError.response;
    const message = (data && typeof data === 'object' && data.error) || axiosError.message;
    const code = data && typeof data === 'object' ? data.code : undefined;
    return new ApiError(message, status, code);
  }

  return new ApiError(error instanceof Error ? error.message : 'Unknown error');
}

function expireSession(): void {
  clearTokens();
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
  }
}

/**
 * Executa `fn` com exclusão mútua entre abas (Web Locks API) quando disponível.
 * Sem suporte, executa diretamente — a checagem de "token já rotacionado"
 * continua cobrindo a maior parte das corridas.
 */
async function withCrossTabLock<T>(fn: () => Promise<T>): Promise<T> {
  if (typeof navigator !== 'undefined' && navigator.locks?.request) {
    return navigator.locks.request('arco-token-refresh', fn) as Promise<T>;
  }
  return fn();
}

let refreshPromise: Promise<string> | null = null;

/**
 * Obtém um access token válido após um 401.
 * - Se outra aba já rotacionou os tokens (o token em storage difere do que falhou),
 *   apenas reutiliza o novo access token.
 * - Caso contrário, chama /api/auth/refresh. Se o refresh for rejeitado (4xx),
 *   encerra a sessão. Falhas transitórias (rede/5xx) não apagam os tokens.
 */
function getFreshAccessToken(failedAccessToken: string | null): Promise<string> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = withCrossTabLock(async () => {
    const storedAccess = getAccessToken();
    const storedRefresh = getRefreshToken();

    if (!storedAccess || !storedRefresh) {
      expireSession();
      throw new ApiError('No tokens available', 401, 'session_expired');
    }

    if (failedAccessToken && storedAccess !== failedAccessToken) {
      return storedAccess;
    }

    try {
      const { data } = await rawClient.post<RefreshResponseBody>('/api/auth/refresh', {
        accessToken: storedAccess,
        refreshToken: storedRefresh,
      });
      setTokens(data.accessToken, data.refreshToken);
      return data.accessToken;
    } catch (err) {
      const apiError = toApiError(err);

      // Outra aba (sem Web Locks) pode ter rotacionado durante a nossa chamada.
      const latestRefresh = getRefreshToken();
      const latestAccess = getAccessToken();
      if (latestRefresh && latestAccess && latestRefresh !== storedRefresh) {
        return latestAccess;
      }

      const isRejected =
        apiError.status !== undefined && apiError.status >= 400 && apiError.status < 500 && apiError.status !== 429;
      if (isRejected) {
        expireSession();
        throw new ApiError(apiError.message, 401, 'session_expired');
      }
      throw apiError;
    }
  }).finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error) || !error.config) {
      return Promise.reject(toApiError(error));
    }

    const originalRequest = error.config as RetriableConfig;
    const isAuthEndpoint =
      originalRequest.url?.includes('/api/auth/login') ||
      originalRequest.url?.includes('/api/auth/register') ||
      originalRequest.url?.includes('/api/auth/refresh');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint && getRefreshToken()) {
      originalRequest._retry = true;
      try {
        const token = await getFreshAccessToken(bearerOf(originalRequest));
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        return Promise.reject(toApiError(refreshError));
      }
    }

    return Promise.reject(toApiError(error));
  },
);
