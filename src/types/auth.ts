/**
 * Interfaces de Autenticación
 * @file auth.ts
 * @description Todas las interfaces relacionadas con autenticación, sesiones y usuarios
 */

// =============== TIPOS BASE ===============
export type UserRole = "admin" | "lab" | "client";

// =============== LOGIN INTERFACES ===============
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// DTO para login (alias para LoginRequest)
export type LoginDto = LoginRequest;

export interface LoginResponse {
  accessToken: string;
  user: UserInfo;
  expiresIn: number;
  refreshToken?: string;
}

export interface UserInfo {
  email: string;
  name: string;
  role: UserRole;
}

export interface SessionInfo {
  id: string;
  createdAt: string;
  expiresAt: string;
  lastUsedAt: string;
  deviceInfo: {
    deviceName: string;
    browser: string;
    os: string;
    ip: string;
  };
  isCurrentSession: boolean;
}

// =============== REGISTRO INTERFACES ===============
export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  acceptTerms: boolean;
}

// DTO para registro (alias para RegisterRequest)
export type RegisterDto = RegisterRequest;

export interface RegisterResponse {
  message: string;
  user: Omit<User, "password">;
  requiresVerification?: boolean;
}

// =============== USUARIO INTERFACES ===============
export interface User {
  id: number;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
  lastLogin?: string;
  isActive?: boolean;
  lastDevice?: string;
  lastIp?: string;
  failedAttempts?: number;
}

export interface UserDetails {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  lastLogin: string;
  lastLoginIp: string;
  loginCount: number;
  twoFactorEnabled: boolean;
  isActive: boolean;
  lastPasswordChange: string;
}

export interface UserProfile {
  user: UserDetails;
  sessionStats: SessionStats;
  recentSessions: UserSession[];
}

export interface SessionStats {
  activeSessions: number;
  totalSessions: number;
  rememberMeSessions: number;
  expiredSessions: number;
}

// =============== SESIONES INTERFACES ===============
export interface UserSession {
  id: number;
  ipAddress: string;
  deviceInfo: DeviceInfo;
  country?: string;
  city?: string;
  isRememberMe: boolean;
  lastActivity: string;
  createdAt: string;
  isCurrent: boolean;
}

export interface DeviceInfo {
  os: string;
  device: string;
  engine: string;
  browser: string;
}

export interface LogoutRequest {
  logoutAll?: boolean;
  reason?: string;
}

export interface LogoutResponse {
  message: string;
  sessionsRevoked: number;
}

// =============== CAMBIO DE CONTRASEÑA ===============
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// DTO para cambio de contraseña
export type ChangePasswordDto = ChangePasswordRequest;

export interface ResetPasswordRequest {
  email: string;
}

export interface ResetPasswordResponse {
  message: string;
  resetToken?: string;
}

export interface ChangePasswordResponse {
  message: string;
  user: User;
}

// =============== SEGURIDAD INTERFACES ===============
export interface AuthLog {
  id: number;
  userId: number;
  eventType:
    | "login"
    | "logout"
    | "failed_login"
    | "password_change"
    | "token_refresh";
  success: boolean;
  ipAddress: string;
  userAgent: string;
  deviceInfo?: string;
  details?: string;
  createdAt: string;
}

export interface FailedLoginAttempt {
  id: number;
  email: string;
  ipAddress: string;
  attempts: number;
  lastAttempt: string;
  blocked: boolean;
  blockedUntil?: string;
}

export interface SecurityReport {
  totalUsers: number;
  activeSessions: number;
  failedLoginAttempts: number;
  blockedAccounts: number;
  suspiciousActivities: number;
  recentLogins: AuthLog[];
}

// =============== RESPUESTA AUTH ===============
export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  message?: string;
  sessionId?: string;
  deviceInfo?: {
    deviceName: string;
    browser: string;
    os: string;
    isNew: boolean;
  };
}
