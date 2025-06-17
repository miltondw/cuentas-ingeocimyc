import { createContext, useState, useEffect, ReactNode } from "react";
import api, { TokenManager } from "@/api/index";
import { AxiosError } from "axios";
import type { User, AuthResponse } from "@/types/api";

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  login: (
    email: string,
    password: string
  ) => Promise<{
    success: boolean;
    error?: {
      message?: string;
      waitMinutes?: number;
      remainingAttempts?: number;
    };
    status?: number;
  }>;
  register: (data: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    role?: "admin" | "lab" | "client";
    jwt2?: string; // Para crear admin
  }) => Promise<{
    success: boolean;
    data?: AuthResponse;
    error?: {
      message?: string;
    };
    status?: number;
  }>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  hasRole: (role: "admin" | "lab" | "client") => boolean;
  hasAnyRole: (roles: Array<"admin" | "lab" | "client">) => boolean;
  getCsrfToken: () => Promise<string | undefined>;
  updateUserProfile: (
    data: Partial<User>
  ) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true,
  });
  const getCsrfToken = async (): Promise<string | undefined> => {
    // CSRF no está implementado en la nueva API de NestJS
    console.warn("CSRF token not implemented in NestJS API");
    return undefined;
  };

  const hasRole = (role: "admin" | "lab" | "client"): boolean => {
    return authState.user?.role === role;
  };

  const hasAnyRole = (roles: Array<"admin" | "lab" | "client">): boolean => {
    return authState.user ? roles.includes(authState.user.role) : false;
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("userData") || "null");
        console.log("📝 AuthContext - userData from localStorage:", userData);

        if (!userData) {
          console.log(
            "❌ AuthContext - No userData found, setting unauthenticated"
          );
          setAuthState({ isAuthenticated: false, user: null, loading: false });
          return;
        }

        // Asegurar que userData tenga las propiedades necesarias
        const normalizedUserData = {
          ...userData,
          name: userData.name || userData.email || "Usuario",
        };

        console.log(
          "✅ AuthContext - Normalized userData:",
          normalizedUserData
        );
        if (!navigator.onLine) {
          console.log("📡 AuthContext - Offline mode, using cached data");
          setAuthState({
            isAuthenticated: true,
            user: normalizedUserData,
            loading: false,
          });
          return;
        }

        // Verificar token usando el endpoint /auth/me que sí existe en NestJS
        try {
          const response = await api.get<{ user: User }>("/auth/me");
          console.log("✅ AuthContext - Token verified successfully");
          setAuthState({
            isAuthenticated: true,
            user: response.data.user,
            loading: false,
          });
        } catch (authError) {
          console.log("❌ AuthContext - Token verification failed");

          // Si el token es inválido (401), intentar hacer refresh
          const err = authError as { response?: { status: number } };
          if (err.response?.status === 401) {
            console.log("🔄 AuthContext - Attempting token refresh");
            const refreshed = await refreshToken();
            if (refreshed) {
              console.log("✅ AuthContext - Token refreshed successfully");
              return; // refreshToken ya actualiza el estado
            }
          }

          // Si no se puede verificar ni refrescar, usar datos cached si están disponibles
          console.log("⚠️ AuthContext - Using cached data as fallback");
          setAuthState({
            isAuthenticated: true,
            user: normalizedUserData,
            loading: false,
          });
        }
      } catch (error: unknown) {
        const err = error as { response?: { status: number } };
        if (err.response?.status === 401) {
          // Intentar refrescar el token
          const refreshed = await refreshToken();
          if (refreshed) {
            return; // Si el refresh fue exitoso, la función refreshToken ya actualiza el estado
          }
        }
        console.error(
          "❌ AuthContext - Authentication verification failed:",
          error
        );
        localStorage.removeItem("userData");
        setAuthState({
          isAuthenticated: false,
          user: null,
          loading: false,
        });
      }
    };

    checkAuth();
  }, []);
  const login = async (email: string, password: string) => {
    try {
      console.log("🔐 AuthContext - Attempting login for:", email);

      if (!navigator.onLine) {
        console.log("📡 AuthContext - No internet connection");
        return {
          success: false,
          error: {
            message: "No internet connection. Please try again when online.",
          },
        };
      }

      const response = await api.post<AuthResponse>("/auth/login", {
        email,
        password,
      });
      console.log("✅ AuthContext - Login response received:", response.data);

      // Guardar tokens usando TokenManager
      if (response.data.accessToken) {
        TokenManager.setTokens(
          response.data.accessToken,
          response.data.refreshToken,
          response.data.expiresIn
        );
        console.log("🔑 AuthContext - Tokens saved successfully");
      } else {
        console.warn("⚠️ AuthContext - No access token in response");
      } // Asegurar que el objeto user tenga las propiedades necesarias
      const userData = {
        ...response.data.user,
        name: response.data.user.name || response.data.user.email || "Usuario",
        id: response.data.user.id || Math.floor(Math.random() * 1000000), // Fallback numérico para ID
      };

      console.log("📝 AuthContext - Storing userData:", userData);
      localStorage.setItem("userData", JSON.stringify(userData));

      console.log("🔄 AuthContext - Setting auth state...");
      setAuthState({
        isAuthenticated: true,
        user: userData,
        loading: false,
      });

      console.log("✅ AuthContext - Login successful");
      return { success: true };
    } catch (error: unknown) {
      console.log("❌ AuthContext - Login failed:", error);
      const apiError = error as {
        response?: {
          data?: {
            message?: string;
            waitMinutes?: number;
            remainingAttempts?: number;
          };
          status?: number;
        };
      };
      return {
        success: false,
        error: apiError.response?.data || { message: "Unknown error" },
        status: apiError.response?.status,
      };
    }
  };
  const logout = async () => {
    try {
      if (navigator.onLine) {
        await api.post("/auth/logout");
      }
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      // Limpiar tokens usando TokenManager
      TokenManager.clearTokens();

      localStorage.removeItem("userData");
      document.cookie =
        "accessToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
      document.cookie =
        "refreshToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
      document.cookie =
        "csrf_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
      });
    }
  };

  // Función para registrar usuario
  const register = async (registerData: {
    name?: string;
    firstName?: string;
    lastName?: string;
    email: string;
    password: string;
    role?: "admin" | "lab" | "client";
    jwt2?: string;
  }) => {
    try {
      const response = await api.post<AuthResponse>(
        "/auth/register",
        registerData
      );

      if (response.data.user) {
        localStorage.setItem("userData", JSON.stringify(response.data.user));
        setAuthState({
          isAuthenticated: true,
          user: response.data.user,
          loading: false,
        });
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      const apiError = error as AxiosError<{ message: string }>;
      return {
        success: false,
        error: apiError.response?.data || { message: "Registration failed" },
        status: apiError.response?.status,
      };
    }
  }; // Función para refrescar token
  const refreshToken = async (): Promise<boolean> => {
    try {
      console.log("🔄 AuthContext - Attempting token refresh");

      const currentRefreshToken = TokenManager.getRefreshToken();
      if (!currentRefreshToken) {
        console.log("❌ AuthContext - No refresh token available");
        return false;
      }

      const response = await api.post<AuthResponse>("/auth/refresh", {
        refreshToken: currentRefreshToken,
      });

      console.log("✅ AuthContext - Token refresh response:", response.data);

      if (response.data.accessToken && response.data.user) {
        // Actualizar tokens
        TokenManager.setTokens(
          response.data.accessToken,
          response.data.refreshToken,
          response.data.expiresIn
        ); // Actualizar userData
        const userData = {
          ...response.data.user,
          name:
            response.data.user.name || response.data.user.email || "Usuario",
          id: response.data.user.id || Math.floor(Math.random() * 1000000), // Fallback numérico
        };

        localStorage.setItem("userData", JSON.stringify(userData));
        setAuthState({
          isAuthenticated: true,
          user: userData,
          loading: false,
        });

        console.log("✅ AuthContext - Token refreshed successfully");
        return true;
      }

      console.log("❌ AuthContext - Invalid refresh response");
      return false;
    } catch (error) {
      console.error("❌ AuthContext - Token refresh failed:", error);

      // Limpiar datos de autenticación en caso de error
      TokenManager.clearTokens();
      localStorage.removeItem("userData");
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
      });

      return false;
    }
  };

  // Función para actualizar perfil de usuario
  const updateUserProfile = async (
    data: Partial<User>
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await api.patch<{ user: User }>("/auth/me", data);

      if (response.data.user) {
        const updatedUser = response.data.user;
        localStorage.setItem("userData", JSON.stringify(updatedUser));
        setAuthState((prev) => ({
          ...prev,
          user: updatedUser,
        }));

        return { success: true };
      }

      return { success: false, error: "No se pudo actualizar el perfil" };
    } catch (error) {
      const apiError = error as AxiosError<{ message: string }>;
      return {
        success: false,
        error: apiError.response?.data?.message || "Error al actualizar perfil",
      };
    }
  };
  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        register,
        refreshToken,
        hasRole,
        hasAnyRole,
        getCsrfToken,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
