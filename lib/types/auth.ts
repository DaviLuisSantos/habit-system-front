export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  timezone?: string;
}

export interface AuthResponse {
  userId: string;
  email: string;
  name: string;
  accessToken: string;
  refreshToken: string;
}

export type Plan = 'Free' | 'Pro';

export interface UserProfile {
  userId: string;
  email: string;
  name: string;
  timezone: string;
  createdAt: string;
  plan: Plan;
  isEmailVerified: boolean;
}

export interface RefreshRequest {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface DeleteAccountRequest {
  password: string;
}

export interface PlanInfo {
  plan: Plan;
  isEmailVerified: boolean;
  activeHabits: number;
  habitLimit: number; // -1 = unlimited
}
