import apiClient from "@/lib/axios/apiClient";
import type { ResponseDto } from "@/types/api";
import type {
  LoginDto,
  RegisterDto,
  AuthResponseDto,
  UserDto,
  UserSession,
  ChangePasswordDto,
  UserProfile,
  LogoutRequest,
  LogoutResponse,
  ChangePasswordResponse,
} from "@/types/auth";

/**
 * Servicio para manejar las operaciones de autenticación y perfil de usuario
 * Actualizado para usar la nueva estructura ResponseDto del backend
 */
class AuthService {
  /**
   * Iniciar sesión
   * @param credentials Credenciales de inicio de sesión
   */
  async login(credentials: LoginDto) {
    return apiClient.post<ResponseDto<AuthResponseDto>>(
      "/auth/login",
      credentials
    );
  }

  /**
   * Registrar un nuevo usuario
   * @param data Datos de registro
   */
  async register(data: RegisterDto) {
    return apiClient.post<ResponseDto<AuthResponseDto>>("/auth/register", data);
  }

  /**
   * Cerrar sesión
   * @param logoutAllDevices Si cerrar sesión en todos los dispositivos
   */
  async logout(logoutAllDevices?: boolean) {
    const body: LogoutRequest = { logoutAllDevices };
    return apiClient.post<ResponseDto<LogoutResponse>>("/auth/logout", body);
  }

  /**
   * Renovar token de acceso usando refresh token
   * @param refreshToken Token de refresco
   */
  async refreshToken(refreshToken: string) {
    return apiClient.post<ResponseDto<AuthResponseDto>>(
      "/auth/refresh",
      {},
      {
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      }
    );
  }

  /**
   * Validar el token actual usando el endpoint de perfil
   */
  async validateToken() {
    try {
      const response = await apiClient.get<ResponseDto<UserProfile>>(
        "/auth/profile"
      );
      return {
        data: {
          valid: true,
          user: response.data.data.user,
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
   * Obtener perfil completo del usuario actual
   */
  async getProfile() {
    return apiClient.get<ResponseDto<UserProfile>>("/auth/profile");
  }

  /**
   * Actualizar perfil de usuario
   * @param data Datos a actualizar
   */
  async updateProfile(data: Partial<UserDto>) {
    return apiClient.patch<ResponseDto<{ user: UserDto }>>(
      "/auth/profile",
      data
    );
  }

  /**
   * Cambiar contraseña
   * @param data Contraseña actual y nueva
   */
  async changePassword(data: ChangePasswordDto) {
    return apiClient.patch<ResponseDto<ChangePasswordResponse>>(
      "/auth/change-password",
      data
    );
  }

  /**
   * Obtener todas las sesiones activas del usuario
   */
  async getSessions() {
    return apiClient.get<ResponseDto<UserSession[]>>("/auth/sessions");
  }

  /**
   * Revocar una sesión específica
   * @param sessionId ID de la sesión a revocar
   */
  async revokeSession(sessionId: string) {
    return apiClient.delete<ResponseDto<{ success: boolean }>>(
      `/auth/sessions/${sessionId}`
    );
  }

  /**
   * Revocar todas las otras sesiones excepto la actual
   */
  async revokeAllOtherSessions() {
    return apiClient.delete<ResponseDto<{ success: boolean; count: number }>>(
      "/auth/sessions/others"
    );
  }
}

export const authService = new AuthService();
