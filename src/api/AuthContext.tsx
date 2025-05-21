import {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import api from "@api/index";

interface User {
  id: string;
  email: string;
  rol: string;
  [key: string]: string | number | boolean | object | null | undefined; // For additional user properties
}

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
  }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true,
  });

  const getCsrfToken = async (): Promise<string | undefined> => {
    try {
      const response = await api.get<{ csrfToken: string }>("/auth/csrf");
      return response.data.csrfToken;
    } catch (error) {
      console.warn("Failed to fetch CSRF token:", error);
      return undefined;
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("userData") || "null");
        if (!userData) {
          setAuthState({ isAuthenticated: false, user: null, loading: false });
          return;
        }

        if (!navigator.onLine) {
          setAuthState({
            isAuthenticated: true,
            user: userData,
            loading: false,
          });
          return;
        }

        const response = await api.get<{ user: User }>("/auth/verify");
        setAuthState({
          isAuthenticated: true,
          user: response.data.user,
          loading: false,
        });
      } catch (error: unknown) {
        const err = error as { response?: { status: number } };
        if (err.response?.status === 401) {
          try {
            const refreshResponse = await api.post("/auth/refresh");
            if (refreshResponse.status === 200) {
              const response = await api.get<{ user: User }>("/auth/verify");
              setAuthState({
                isAuthenticated: true,
                user: response.data.user,
                loading: false,
              });
              return;
            }
          } catch (refreshError) {
            console.error("Failed to refresh token:", refreshError);
          }
        }
        console.error("Authentication verification failed:", error);
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
      if (!navigator.onLine) {
        return {
          success: false,
          error: {
            message: "No internet connection. Please try again when online.",
          },
        };
      }

      const response = await api.post<{ user: User }>("/auth/login", {
        email,
        password,
      });
      localStorage.setItem("userData", JSON.stringify(response.data.user));

      setAuthState({
        isAuthenticated: true,
        user: response.data.user,
        loading: false,
      });

      return { success: true };
    } catch (error: unknown) {
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

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
