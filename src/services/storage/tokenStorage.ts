/**
 * Servicio para el manejo de tokens de autenticación
 * Implementa almacenamiento seguro y gestión de tokens con expiración
 */

interface TokenData {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  userData?: Record<string, unknown>;
}

class TokenStorage {
  private readonly ACCESS_TOKEN_KEY = "access_token";
  private readonly REFRESH_TOKEN_KEY = "refresh_token";
  private readonly TOKEN_EXPIRY_KEY = "token_expiry";
  private readonly USER_DATA_KEY = "userData";

  /**
   * Guarda los tokens de autenticación en el localStorage
   */
  setTokens(
    accessToken: string,
    refreshToken?: string,
    expiresIn?: number
  ): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);

    if (refreshToken) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    }

    if (expiresIn) {
      const expiryTime = Date.now() + expiresIn * 1000;
      localStorage.setItem(this.TOKEN_EXPIRY_KEY, expiryTime.toString());
    }
  }

  /**
   * Obtiene el token de acceso almacenado
   */
  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  /**
   * Obtiene el token de refresco almacenado
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Verifica si el token de acceso ha expirado
   */
  isTokenExpired(): boolean {
    const expiryTime = localStorage.getItem(this.TOKEN_EXPIRY_KEY);

    if (!expiryTime) {
      return false;
    }

    return Date.now() > parseInt(expiryTime, 10);
  }
  /**
   * Guarda los datos del usuario
   */
  setUserData(userData: Record<string, unknown>): void {
    localStorage.setItem(this.USER_DATA_KEY, JSON.stringify(userData));
  }

  /**
   * Obtiene los datos del usuario
   */
  getUserData<T = Record<string, unknown>>(): T | null {
    const userData = localStorage.getItem(this.USER_DATA_KEY);

    if (!userData) {
      return null;
    }

    try {
      return JSON.parse(userData) as T;
    } catch (error) {
      console.error("Error parsing user data from storage", error);
      return null;
    }
  }

  /**
   * Guarda toda la información de autenticación en una sola operación
   */
  saveAuthData(data: TokenData): void {
    if (data.accessToken) {
      localStorage.setItem(this.ACCESS_TOKEN_KEY, data.accessToken);
    }

    if (data.refreshToken) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, data.refreshToken);
    }

    if (data.expiresAt) {
      localStorage.setItem(this.TOKEN_EXPIRY_KEY, data.expiresAt.toString());
    }

    if (data.userData) {
      localStorage.setItem(this.USER_DATA_KEY, JSON.stringify(data.userData));
    }
  }

  /**
   * Elimina todos los tokens y datos de autenticación
   */
  clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.TOKEN_EXPIRY_KEY);
    localStorage.removeItem(this.USER_DATA_KEY);
  }

  /**
   * Verifica si hay un token válido (no expirado)
   */
  hasValidToken(): boolean {
    const token = this.getAccessToken();
    return !!token && !this.isTokenExpired();
  }
}

// Exportar una instancia única del servicio
export const tokenStorage = new TokenStorage();
