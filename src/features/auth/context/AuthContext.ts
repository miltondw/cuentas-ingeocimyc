import { createContext } from "react";
import type { User, AuthResponse, LoginDto, RegisterDto } from "@/types/api";

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
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
    data?: AuthResponse;
  }>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  hasRole: (role: "admin" | "lab" | "client") => boolean;
  hasAnyRole: (roles: Array<"admin" | "lab" | "client">) => boolean;
  updateUserProfile: (
    data: Partial<User>
  ) => Promise<{ success: boolean; error?: string }>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export type { AuthContextType, AuthState };
