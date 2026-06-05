import { apiClient } from './client';
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  UserProfile,
  RefreshRequest,
  RefreshResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
  ChangePasswordRequest,
  DeleteAccountRequest,
  PlanInfo,
} from '../types/auth';

class AuthService {
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/auth/register', data);
    if (response.data.accessToken) {
      this.setTokens(response.data.accessToken, response.data.refreshToken);
    }
    return response.data;
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/auth/login', data);
    if (response.data.accessToken) {
      this.setTokens(response.data.accessToken, response.data.refreshToken);
    }
    return response.data;
  }

  async getCurrentUser(): Promise<UserProfile> {
    const response = await apiClient.get<UserProfile>('/api/auth/me', {
      headers: { Authorization: `Bearer ${this.getAccessToken()}` },
    });
    return response.data;
  }

  async refreshToken(): Promise<RefreshResponse> {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();

    if (!accessToken || !refreshToken) {
      throw new Error('No tokens available');
    }

    const response = await apiClient.post<RefreshResponse>('/api/auth/refresh', {
      accessToken,
      refreshToken,
    });

    this.setTokens(response.data.accessToken, response.data.refreshToken);
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

  async resendVerification(): Promise<void> {
    await apiClient.post('/api/auth/resend-verification', {});
  }

  async changePassword(data: ChangePasswordRequest): Promise<void> {
    await apiClient.put('/api/account/password', data);
  }

  async deleteAccount(data: DeleteAccountRequest): Promise<void> {
    await apiClient.delete('/api/account', { data });
  }

  async getPlan(): Promise<PlanInfo> {
    const response = await apiClient.get<PlanInfo>('/api/account/plan');
    return response.data;
  }

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }

  getAccessToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  }

  getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('refreshToken');
    }
    return null;
  }

  setTokens(accessToken: string, refreshToken: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
    }
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}

export const authService = new AuthService();
