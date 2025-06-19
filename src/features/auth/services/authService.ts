import apiClient from "@/lib/axios/apiClient";
import type {
  LoginDto,
  RegisterDto,
  AuthResponse,
  User,
  SessionInfo,
  ChangePasswordDto,
} from "@/types/auth";

/**
 * Servicio para manejar las operaciones de autenticación y perfil de usuario
 */
class AuthService {
  /**
   * Iniciar sesión
   * @param credentials Credenciales de inicio de sesión
   */
  async login(credentials: LoginDto) {
    return apiClient.post<AuthResponse>("/auth/login", credentials);
  }

  /**
   * Registrar un nuevo usuario
   * @param data Datos de registro
   */
  async register(data: RegisterDto) {
    return apiClient.post<AuthResponse>("/auth/register", data);
  }

  /**
   * Cerrar sesión (invalidar token actual)
   */
  async logout() {
    return apiClient.post<{ success: boolean }>("/auth/logout");
  }

  /**
   * Renovar token de acceso usando refresh token
   * @param refreshToken Token de refresco
   */
  async refreshToken(refreshToken: string) {
    return apiClient.post<AuthResponse>("/auth/refresh", { refreshToken });
  }
  /**
   * Validar el token actual usando el endpoint de perfil
   */
  async validateToken() {
    try {
      const response = await apiClient.get<{ user: User }>("/auth/profile");
      return {
        data: {
          valid: true,
          user: response.data.user,
        },
      };
    } catch (_error) {
      return {
        data: {
          valid: false,
        },
      };
    }
  }

  /**
   * Obtener perfil del usuario actual
   */
  async getProfile() {
    return apiClient.get<{ user: User }>("/auth/profile");
  }

  /**
   * Actualizar perfil de usuario
   * @param data Datos a actualizar
   */
  async updateProfile(data: Partial<User>) {
    return apiClient.patch<{ user: User }>("/auth/profile", data);
  }

  /**
   * Cambiar contraseña
   * @param data Contraseña actual y nueva
   */
  async changePassword(data: ChangePasswordDto) {
    return apiClient.post<{ success: boolean }>("/auth/change-password", data);
  }

  /**
   * Obtener todas las sesiones activas del usuario
   */
  async getSessions() {
    return apiClient.get<{ sessions: SessionInfo[] }>("/auth/sessions");
  }

  /**
   * Revocar una sesión específica
   * @param sessionId ID de la sesión a revocar
   */
  async revokeSession(sessionId: string) {
    return apiClient.delete<{ success: boolean }>(
      `/auth/sessions/${sessionId}`
    );
  }

  /**
   * Revocar todas las otras sesiones excepto la actual
   */
  async revokeAllOtherSessions() {
    return apiClient.delete<{ success: boolean; count: number }>(
      "/auth/sessions/others"
    );
  }
}

export const authService = new AuthService();
