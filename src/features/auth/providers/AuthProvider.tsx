import { useState, useEffect, ReactNode } from "react";
import {
  UserDto,
  LoginDto,
  RegisterDto,
  ChangePasswordDto,
} from "@/types/auth";
import { authService } from "@/features/auth/services/authService";
import { tokenStorage } from "@/services/storage/tokenStorage";
import {
  AuthContext,
  type AuthContextType,
  type AuthState,
} from "@/features/auth/context";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true,
  });

  // Función para verificar si el usuario tiene un rol específico
  const hasRole = (role: "admin" | "lab" | "client"): boolean => {
    return authState.user?.role === role;
  };

  // Función para verificar si el usuario tiene alguno de los roles especificados
  const hasAnyRole = (roles: Array<"admin" | "lab" | "client">): boolean => {
    return authState.user
      ? roles.includes(authState.user.role as "admin" | "lab" | "client")
      : false;
  };

  // Inicializar estado de autenticación al cargar
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = tokenStorage.getUserData<UserDto>();
        if (!userData) {
          setAuthState({ isAuthenticated: false, user: null, loading: false });
          return;
        }

        // Asegurar que userData tenga las propiedades necesarias
        const normalizedUserData = {
          ...userData,
          name: userData.name || userData.email || "Usuario",
        };

        // Si estamos offline, usar datos almacenados
        if (!navigator.onLine) {
          setAuthState({
            isAuthenticated: true,
            user: normalizedUserData,
            loading: false,
          });
          return;
        }

        // Validar el token con el backend (si estamos online)
        try {
          if (tokenStorage.hasValidToken()) {
            const { data } = await authService.validateToken();
            if (data?.user) {
              const updatedUser = {
                ...normalizedUserData,
                ...data.user,
              };
              tokenStorage.setUserData(updatedUser);
              setAuthState({
                isAuthenticated: true,
                user: updatedUser,
                loading: false,
              });
              return;
            }
          }
          tokenStorage.clearTokens();
          setAuthState({ isAuthenticated: false, user: null, loading: false });
        } catch (_error) {
          const tokenExists = tokenStorage.getAccessToken();
          if (tokenExists) {
            setAuthState({
              isAuthenticated: true,
              user: normalizedUserData,
              loading: false,
            });
          } else {
            tokenStorage.clearTokens();
            setAuthState({
              isAuthenticated: false,
              user: null,
              loading: false,
            });
          }
        }
      } catch (_error) {
        setAuthState({ isAuthenticated: false, user: null, loading: false });
      }
    };
    checkAuth();
  }, []);

  /**
   * Iniciar sesión
   */
  const login = async (credentials: LoginDto) => {
    try {
      const response = await authService.login(credentials);
      const { accessToken, refreshToken, expiresIn, user } = response.data.data;
      tokenStorage.setTokens(accessToken, refreshToken, expiresIn);
      // Normalizar el usuario antes de guardar
      const normalizedUser: UserDto = {
        ...user,
        name: user?.name || user?.email || "Usuario",
      };
      tokenStorage.setUserData(
        normalizedUser as unknown as Record<string, unknown>
      );
      setAuthState({
        isAuthenticated: true,
        user: normalizedUser,
        loading: false,
      });
      return { success: true };
    } catch (error: unknown) {
      const errorObj = error as {
        response?: { data?: unknown; status?: number };
      };
      // Manejar errores específicos
      const errorData = errorObj.response?.data as
        | { message?: string; waitMinutes?: number; remainingAttempts?: number }
        | undefined;
      return {
        success: false,
        error: {
          message: errorData?.message || "Error al iniciar sesión",
          waitMinutes: errorData?.waitMinutes,
          remainingAttempts: errorData?.remainingAttempts,
        },
        status: errorObj.response?.status,
      };
    }
  };

  /**
   * Registrar nuevo usuario
   */
  const register = async (data: RegisterDto) => {
    try {
      const response = await authService.register(data);
      return { success: true, data: response.data.data };
    } catch (error: unknown) {
      const errorObj = error as {
        response?: { data?: { message?: string }; status?: number };
      };
      return {
        success: false,
        error: {
          message:
            errorObj.response?.data?.message || "Error al registrar usuario",
        },
        status: errorObj.response?.status,
      };
    }
  };

  /**
   * Cerrar sesión
   */
  const logout = async () => {
    try {
      if (navigator.onLine) {
        await authService.logout();
      }
    } catch (_error) {
      // No hacer nada, limpiar igual
    } finally {
      tokenStorage.clearTokens();
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
      });
    }
  };

  /**
   * Renovar token
   */
  const refreshToken = async (): Promise<boolean> => {
    try {
      const refreshTokenValue = tokenStorage.getRefreshToken();
      if (!refreshTokenValue) {
        return false;
      }
      const response = await authService.refreshToken(refreshTokenValue);
      const {
        accessToken,
        refreshToken: newRefreshToken,
        expiresIn,
      } = response.data.data;
      tokenStorage.setTokens(accessToken, newRefreshToken, expiresIn);
      return true;
    } catch (_error) {
      return false;
    }
  };

  /**
   * Actualizar perfil de usuario
   */
  const updateUserProfile = async (data: Partial<UserDto>) => {
    try {
      const response = await authService.updateProfile(data);
      if (response.data.data?.user) {
        const updatedUser = {
          ...authState.user,
          ...response.data.data.user,
        };
        tokenStorage.setUserData(updatedUser);
        setAuthState({
          ...authState,
          user: updatedUser,
        });
      }
      return { success: true };
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } };
      return {
        success: false,
        error: errorObj.response?.data?.message || "Error al actualizar perfil",
      };
    }
  };

  // Agregar método para cambio de contraseña usando la nueva API
  const changePassword = async (data: ChangePasswordDto) => {
    try {
      const response = await authService.changePassword(data);
      if (response.data && response.data.success) {
        return { success: true };
      }
      return {
        success: false,
        error: response.data?.message || "Error al cambiar la contraseña",
      };
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } };
      return {
        success: false,
        error:
          errorObj.response?.data?.message || "Error al cambiar la contraseña",
      };
    }
  };

  const contextValue: AuthContextType = {
    ...authState,
    login,
    register,
    logout,
    refreshToken,
    hasRole,
    hasAnyRole,
    updateUserProfile,
    changePassword, // <-- nuevo método expuesto
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
