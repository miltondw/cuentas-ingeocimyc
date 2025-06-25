import { createContext } from "react";
import type {
  UserDto,
  AuthResponseDto,
  LoginDto,
  RegisterDto,
  ChangePasswordDto,
} from "@/types/auth";

interface AuthState {
  isAuthenticated: boolean;
  user: UserDto | null;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  login: (credentials: LoginDto) => Promise<{
    success: boolean;
    error?: {
      message?: string;
      waitMinutes?: number;
      remainingAttempts?: number;
    };
    status?: number;
  }>;
  register: (data: RegisterDto) => Promise<{
    success: boolean;
    error?: { message?: string };
    status?: number;
    data?: AuthResponseDto;
  }>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  hasRole: (role: "admin" | "lab" | "client") => boolean;
  hasAnyRole: (roles: Array<"admin" | "lab" | "client">) => boolean;
  updateUserProfile: (
    data: Partial<UserDto>
  ) => Promise<{ success: boolean; error?: string }>;
  changePassword: (
    data: ChangePasswordDto
  ) => Promise<{ success: boolean; error?: string }>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export type { AuthContextType, AuthState };
