/**
 * Hook mejorado de autenticación con funcionalidades modernas
 * Integra TokenManager, gestión de estado avanzada y mejores prácticas
 */
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/api/useAuth";
import { TokenManager } from "@/api/index";
import type { User } from "@/types/api";

export interface UseAuthenticationOptions {
  redirectOnLogout?: string;
  autoRefresh?: boolean;
  persistSession?: boolean;
}

export interface UseAuthenticationResult {
  // Estado de autenticación
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;

  // Funciones de autenticación
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  register: (
    data: RegisterData
  ) => Promise<{ success: boolean; error?: string }>;

  // Gestión de perfil
  updateProfile: (
    data: Partial<User>
  ) => Promise<{ success: boolean; error?: string }>;
  refreshUserData: () => Promise<boolean>;

  // Gestión de tokens
  refreshToken: () => Promise<boolean>;
  clearSession: () => void;

  // Utilidades de roles
  hasRole: (role: User["role"]) => boolean;
  hasAnyRole: (roles: User["role"][]) => boolean;
  requireRole: (role: User["role"]) => boolean;

  // Gestión de errores
  clearError: () => void;

  // Estado de la sesión
  sessionExpired: boolean;
  tokenExpiring: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  role?: User["role"];
}

export function useAuthentication(
  options: UseAuthenticationOptions = {}
): UseAuthenticationResult {
  const {
    redirectOnLogout = "/login",
    autoRefresh = true,
    persistSession = true,
  } = options;

  const auth = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [tokenExpiring, setTokenExpiring] = useState(false);

  // Función mejorada de login
  const login = useCallback(
    async (email: string, password: string) => {
      try {
        setError(null);
        setSessionExpired(false);

        const result = await auth.login(email, password);

        if (!result.success) {
          const errorMessage =
            result.error?.message || "Error de autenticación";
          setError(errorMessage);
          return { success: false, error: errorMessage };
        }

        return { success: true };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error inesperado";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    [auth]
  );

  // Función mejorada de logout
  const logout = useCallback(async () => {
    try {
      await auth.logout();
      setError(null);
      setSessionExpired(false);
      setTokenExpiring(false);

      if (redirectOnLogout && typeof window !== "undefined") {
        window.location.href = redirectOnLogout;
      }
    } catch (err) {
      console.error("Error durante logout:", err);
      // Incluso si hay error, limpiar el estado local
      TokenManager.clearTokens();
      setError(null);
      setSessionExpired(false);
      setTokenExpiring(false);
    }
  }, [auth, redirectOnLogout]);

  // Función mejorada de registro
  const register = useCallback(
    async (data: RegisterData) => {
      try {
        setError(null);

        const result = await auth.register(data);

        if (!result.success) {
          const errorMessage = result.error?.message || "Error en el registro";
          setError(errorMessage);
          return { success: false, error: errorMessage };
        }

        return { success: true };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error inesperado";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    [auth]
  );

  // Función para actualizar perfil
  const updateProfile = useCallback(
    async (data: Partial<User>) => {
      try {
        setError(null);

        const result = await auth.updateUserProfile(data);

        if (!result.success) {
          const errorMessage = result.error || "Error al actualizar perfil";
          setError(errorMessage);
          return { success: false, error: errorMessage };
        }

        return { success: true };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error inesperado";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    [auth]
  );

  // Función para refrescar datos del usuario
  const refreshUserData = useCallback(async () => {
    try {
      return await auth.refreshToken();
    } catch (err) {
      console.error("Error refrescando datos del usuario:", err);
      return false;
    }
  }, [auth]);

  // Función para refrescar token
  const refreshToken = useCallback(async () => {
    try {
      const success = await auth.refreshToken();
      if (success) {
        setSessionExpired(false);
        setTokenExpiring(false);
      } else {
        setSessionExpired(true);
      }
      return success;
    } catch (err) {
      console.error("Error refrescando token:", err);
      setSessionExpired(true);
      return false;
    }
  }, [auth]);

  // Función para limpiar sesión
  const clearSession = useCallback(() => {
    TokenManager.clearTokens();
    localStorage.removeItem("userData");
    setError(null);
    setSessionExpired(false);
    setTokenExpiring(false);
  }, []);

  // Utilidades de roles mejoradas
  const hasRole = useCallback(
    (role: User["role"]) => {
      return auth.hasRole(role);
    },
    [auth]
  );

  const hasAnyRole = useCallback(
    (roles: User["role"][]) => {
      return auth.hasAnyRole(roles);
    },
    [auth]
  );

  const requireRole = useCallback(
    (role: User["role"]) => {
      const hasPermission = auth.hasRole(role);
      if (!hasPermission) {
        setError(`Acceso denegado. Se requiere rol: ${role}`);
      }
      return hasPermission;
    },
    [auth]
  );

  // Función para limpiar errores
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Efecto para verificar expiración de tokens
  useEffect(() => {
    if (!autoRefresh || !auth.isAuthenticated) return;

    const checkTokenExpiration = () => {
      if (TokenManager.isTokenExpired()) {
        setTokenExpiring(true);

        // Intentar refrescar automáticamente
        refreshToken().then((success) => {
          if (!success) {
            setSessionExpired(true);
          }
        });
      } else {
        // Verificar si el token expira en los próximos 5 minutos
        const expiryTime = localStorage.getItem("token_expiry");
        if (expiryTime) {
          const timeUntilExpiry = parseInt(expiryTime) - Date.now();
          const fiveMinutes = 5 * 60 * 1000;

          if (timeUntilExpiry <= fiveMinutes && timeUntilExpiry > 0) {
            setTokenExpiring(true);
          }
        }
      }
    };

    // Verificar inmediatamente
    checkTokenExpiration();

    // Verificar cada minuto
    const interval = setInterval(checkTokenExpiration, 60000);

    return () => clearInterval(interval);
  }, [autoRefresh, auth.isAuthenticated, refreshToken]);

  // Efecto para limpiar al desmontar
  useEffect(() => {
    return () => {
      if (!persistSession) {
        clearSession();
      }
    };
  }, [persistSession, clearSession]);

  return {
    // Estado de autenticación
    isAuthenticated: auth.isAuthenticated,
    user: auth.user,
    loading: auth.loading,
    error,

    // Funciones de autenticación
    login,
    logout,
    register,

    // Gestión de perfil
    updateProfile,
    refreshUserData,

    // Gestión de tokens
    refreshToken,
    clearSession,

    // Utilidades de roles
    hasRole,
    hasAnyRole,
    requireRole,

    // Gestión de errores
    clearError,

    // Estado de la sesión
    sessionExpired,
    tokenExpiring,
  };
}

export default useAuthentication;
