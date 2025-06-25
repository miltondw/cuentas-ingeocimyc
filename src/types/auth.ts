/**
 * Interfaces de Autenticación
 * @file auth.ts
 * @description Todas las interfaces relacionadas con autenticación, sesiones y usuarios
 * Actualizado para coincidir con la API backend refactorizada
 */

// =============== TIPOS BASE ===============
export type UserRole = "admin" | "lab" | "client";

// =============== USUARIO PRINCIPAL ===============
export interface UserDto {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  lastLogin?: string;
  loginCount?: number;
  twoFactorEnabled?: boolean;
  isActive?: boolean;
}

// =============== DEVICE INFO ===============
export interface DeviceInfo {
  deviceName?: string;
  browser?: string;
  os?: string;
  ip?: string;
}

// =============== AUTENTICACIÓN - RESPUESTA ===============
export interface AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserDto;
}

// =============== LOGIN DTO ===============
export interface LoginDto {
  email: string;
  password: string;
  rememberMe?: boolean;
  deviceInfo?: DeviceInfo;
}

// =============== REGISTRO DTO ===============
export interface RegisterDto {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  role?: "client" | "admin";
}

// =============== CAMBIO DE CONTRASEÑA DTO ===============
export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

// =============== SESIONES ===============
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

// =============== LOGOUT ===============
export interface LogoutRequest {
  logoutAllDevices?: boolean;
}

export interface LogoutResponse {
  message: string;
  sessionsRevoked: number;
}

// =============== CAMBIO DE CONTRASEÑA RESPUESTA ===============
export interface ChangePasswordResponse {
  message: string;
  sessionsRevoked: number;
}

// =============== PERFIL DE USUARIO ===============
export interface UserProfile {
  user: UserDto;
  sessionStats: {
    activeSessions: number;
    totalSessions: number;
    lastLoginFromDifferentDevice?: string;
  };
  recentSessions: UserSession[];
  securitySettings: {
    twoFactorEnabled: boolean;
    lastPasswordChange?: string;
    lastSecurityEvent?: string;
  };
}

// =============== LOGS Y SEGURIDAD ===============
export interface AuthLog {
  id: string;
  userId: string;
  action: "login" | "logout" | "register" | "password_change" | "failed_login";
  timestamp: string;
  ipAddress: string;
  userAgent?: string;
  success: boolean;
  details?: Record<string, unknown>;
}

export interface FailedLoginAttempt {
  id: string;
  email: string;
  ipAddress: string;
  timestamp: string;
  attemptCount: number;
  blocked: boolean;
  blockExpiresAt?: string;
}

export interface SecurityReport {
  failedLogins: FailedLoginAttempt[];
  activeSessions: UserSession[];
  recentActivity: AuthLog[];
  securityAlerts: {
    type: "suspicious_login" | "password_breach" | "multiple_devices";
    message: string;
    timestamp: string;
    severity: "low" | "medium" | "high";
  }[];
}
