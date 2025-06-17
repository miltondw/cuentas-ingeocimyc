import { useState, useEffect, ReactNode } from "react";
import { User, LoginDto, RegisterDto } from "@/types/api";
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
    return authState.user ? roles.includes(authState.user.role) : false;
  };

  // Inicializar estado de autenticación al cargar
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = tokenStorage.getUserData<User>();
        // console.info("📝 AuthContext - userData from storage:", userData);
        if (!userData) {
          /*  console.info(
            "❌ AuthContext - No userData found, setting unauthenticated"
          ); */
          setAuthState({ isAuthenticated: false, user: null, loading: false });
          return;
        }

        // Asegurar que userData tenga las propiedades necesarias
        const normalizedUserData = {
          ...userData,
          name: userData.name || userData.email || "Usuario",
        };
        /* console.info(
          "✅ AuthContext - Normalized userData:",
          normalizedUserData
        ); */

        // Si estamos offline, usar datos almacenados
        if (!navigator.onLine) {
          console.info("📡 AuthContext - Offline mode, using cached data");
          setAuthState({
            isAuthenticated: true,
            user: normalizedUserData,
            loading: false,
          });
          return;
        }

        // Validar el token con el backend (si estamos online)
        try {
          // Solo verificar el token si parece ser válido
          if (tokenStorage.hasValidToken()) {
            const { data } = await authService.validateToken();
            console.info("🔑 AuthContext - Token validation:", data);

            if (data?.user) {
              // Actualizar datos de usuario con la información más reciente
              const updatedUser = {
                ...normalizedUserData,
                ...data.user,
              };

              // Actualizar datos en localStorage
              tokenStorage.setUserData(updatedUser);

              setAuthState({
                isAuthenticated: true,
                user: updatedUser,
                loading: false,
              });
              return;
            }
          }

          // Si llegamos aquí, el token no es válido
          tokenStorage.clearTokens();
          setAuthState({ isAuthenticated: false, user: null, loading: false });
        } catch (error) {
          console.error("❌ AuthContext - Error validating token:", error);

          // En caso de error de conexión pero con token, mantener sesión
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
      } catch (error) {
        console.error("❌ AuthContext - Error in auth check:", error);
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

      const { accessToken, user, refreshToken, expiresIn } = response.data; // Guardar tokens y datos de usuario
      tokenStorage.setTokens(accessToken, refreshToken, expiresIn);
      tokenStorage.setUserData(user as unknown as Record<string, unknown>);

      // Actualizar estado de autenticación
      setAuthState({
        isAuthenticated: true,
        user,
        loading: false,
      });

      return { success: true };
    } catch (error: unknown) {
      const errorObj = error as {
        response?: { data?: unknown; status?: number };
      };
      console.error("Login error:", errorObj.response?.data || error);

      // Manejar errores específicos
      const errorData = errorObj.response?.data as
        | {
            message?: string;
            waitMinutes?: number;
            remainingAttempts?: number;
          }
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
      return { success: true, data: response.data };
    } catch (error: unknown) {
      const errorObj = error as {
        response?: { data?: { message?: string }; status?: number };
      };
      console.error("Register error:", errorObj.response?.data || error);
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
      // Intentar hacer logout en el servidor
      if (navigator.onLine) {
        await authService.logout();
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Limpiar localStorage y estado aunque falle el logout en servidor
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
      } = response.data;

      tokenStorage.setTokens(accessToken, newRefreshToken, expiresIn);
      return true;
    } catch (error) {
      console.error("Error refreshing token:", error);
      return false;
    }
  };

  /**
   * Actualizar perfil de usuario
   */
  const updateUserProfile = async (data: Partial<User>) => {
    try {
      const response = await authService.updateProfile(data);

      // Actualizar estado local con los nuevos datos
      if (response.data?.user) {
        const updatedUser = {
          ...authState.user,
          ...response.data.user,
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
      console.error("Update profile error:", error);
      return {
        success: false,
        error: errorObj.response?.data?.message || "Error al actualizar perfil",
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
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
