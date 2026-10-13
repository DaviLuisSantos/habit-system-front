import { apiClient, rawClient } from './client';
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from './tokens';
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  UserProfile,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
  ChangePasswordRequest,
  DeleteAccountRequest,
} from '../types/auth';

class AuthService {
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/auth/register', data);
    if (response.data.accessToken) {
      setTokens(response.data.accessToken, response.data.refreshToken);
    }
    return response.data;
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/auth/login', data);
    if (response.data.accessToken) {
      setTokens(response.data.accessToken, response.data.refreshToken);
    }
    return response.data;
  }

  async getCurrentUser(): Promise<UserProfile> {
    const response = await apiClient.get<UserProfile>('/api/auth/me');
    return response.data;
  }

  async forgotPassword(data: ForgotPasswordRequest): Promise<void> {
    await apiClient.post('/api/auth/forgot-password', data);
  }

  async resetPassword(data: ResetPasswordRequest): Promise<void> {
    await apiClient.post('/api/auth/reset-password', data);
  }

  async verifyEmail(data: VerifyEmailRequest): Promise<void> {
    await apiClient.post('/api/auth/verify-email', data);
  }

  /** Requer autenticação: o backend identifica o usuário pelo token. */
  async resendVerification(): Promise<void> {
    await apiClient.post('/api/auth/resend-verification', {});
  }

  /** O backend revoga todas as sessões e devolve um novo par de tokens para esta. */
  async changePassword(data: ChangePasswordRequest): Promise<void> {
    const response = await apiClient.put<Partial<AuthResponse>>('/api/account/password', data);
    if (response.data.accessToken && response.data.refreshToken) {
      setTokens(response.data.accessToken, response.data.refreshToken);
    }
  }

  async deleteAccount(data: DeleteAccountRequest): Promise<void> {
    await apiClient.delete('/api/account', { data });
  }

  /**
   * Revoga o refresh token no servidor (melhor esforço) e limpa os tokens locais.
   * Erros são ignorados: o logout local sempre acontece.
   */
  async logout(): Promise<void> {
    const refreshToken = getRefreshToken();
    const accessToken = getAccessToken();

    if (refreshToken) {
      try {
        await rawClient.post(
          '/api/auth/logout',
          { refreshToken },
          {
            timeout: 5000,
            headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
          },
        );
      } catch {
        // melhor esforço
      }
    }

    clearTokens();
  }

  isAuthenticated(): boolean {
    return !!getAccessToken();
  }
}

export const authService = new AuthService();
