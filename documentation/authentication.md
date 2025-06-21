# 🔐 Autenticación y Autorización

Documentación completa del sistema de autenticación, roles y protección de rutas.

## 🏗️ Arquitectura de Autenticación

```
┌─────────────────────────────────────────┐
│           AUTH ARCHITECTURE            │
├─────────────────────────────────────────┤
│  🔑 Auth Provider                       │
│  • Context global                       │
│  • Session management                   │
│  • Token handling                       │
├─────────────────────────────────────────┤
│  🛡️ Route Protection                    │
│  • Role-based access                    │
│  • Route guards                         │
│  • Redirect logic                       │
├─────────────────────────────────────────┤
│  👤 User Management                     │
│  • User profiles                        │
│  • Permissions                          │
│  • Session persistence                  │
└─────────────────────────────────────────┘
```

## 🔑 Auth Provider

### Context de Autenticación

```tsx
// features/auth/context/AuthContext.tsx
import React, { createContext, useContext, ReactNode } from "react";
import type { UserInfo } from "@/types/auth";

interface AuthContextType {
  user: UserInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: RegisterData) => Promise<void>;
  updateProfile: (userData: Partial<UserInfo>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};

export { AuthContext };
```

### Provider Principal

```tsx
// features/auth/providers/AuthProvider.tsx
import React, { useState, useEffect, ReactNode } from "react";
import { AuthContext } from "../context/AuthContext";
import { authService } from "../services/authService";
import { useAuthStore } from "@/stores/authStore";
import { useNotifications } from "@/hooks/useNotifications";
import type { UserInfo, LoginRequest, RegisterRequest } from "@/types/auth";

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const { showNotification } = useNotifications();

  // Zustand store para persistencia
  const {
    user,
    token,
    isAuthenticated,
    login: setAuthData,
    logout: clearAuthData,
    updateUser,
  } = useAuthStore();

  // Verificar sesión al inicializar
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (token) {
          // Verificar si el token sigue siendo válido
          const userData = await authService.verifyToken(token);
          if (userData) {
            setAuthData(userData, token);
          } else {
            clearAuthData();
          }
        }
      } catch (error) {
        console.error("Error verificando sesión:", error);
        clearAuthData();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [token, setAuthData, clearAuthData]);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authService.login({ email, password });

      setAuthData(response.user, response.accessToken);

      showNotification({
        type: "success",
        message: `Bienvenido, ${response.user.name}!`,
      });
    } catch (error) {
      showNotification({
        type: "error",
        message: "Credenciales incorrectas",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await authService.logout();
      }
    } catch (error) {
      console.error("Error en logout:", error);
    } finally {
      clearAuthData();
      showNotification({
        type: "info",
        message: "Sesión cerrada exitosamente",
      });
    }
  };

  const register = async (userData: RegisterRequest) => {
    try {
      setIsLoading(true);
      const response = await authService.register(userData);

      setAuthData(response.user, response.accessToken);

      showNotification({
        type: "success",
        message: "Cuenta creada exitosamente",
      });
    } catch (error) {
      showNotification({
        type: "error",
        message: "Error al crear la cuenta",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (userData: Partial<UserInfo>) => {
    try {
      const updatedUser = await authService.updateProfile(userData);
      updateUser(updatedUser);

      showNotification({
        type: "success",
        message: "Perfil actualizado exitosamente",
      });
    } catch (error) {
      showNotification({
        type: "error",
        message: "Error al actualizar el perfil",
      });
      throw error;
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    register,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
```

## 🎣 Hook de Autenticación

```tsx
// features/auth/hooks/useAuth.ts
import { useAuthContext } from "../context/AuthContext";

export const useAuth = () => {
  return useAuthContext();
};

// Hook para verificar roles específicos
export const useRole = () => {
  const { user } = useAuth();

  const hasRole = (role: UserRole) => {
    return user?.role === role;
  };

  const hasAnyRole = (roles: UserRole[]) => {
    return user?.role && roles.includes(user.role);
  };

  const isAdmin = () => hasRole("admin");
  const isLab = () => hasRole("lab");
  const isClient = () => hasRole("client");

  return {
    currentRole: user?.role,
    hasRole,
    hasAnyRole,
    isAdmin,
    isLab,
    isClient,
  };
};

// Hook para permisos específicos
export const usePermissions = () => {
  const { user } = useAuth();

  const hasPermission = (permission: string) => {
    return user?.permissions?.includes(permission) || false;
  };

  const hasAnyPermission = (permissions: string[]) => {
    return permissions.some((permission) => hasPermission(permission));
  };

  const hasAllPermissions = (permissions: string[]) => {
    return permissions.every((permission) => hasPermission(permission));
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    permissions: user?.permissions || [],
  };
};
```

## 🛡️ Protección de Rutas

### ProtectedRoute Component

```tsx
// features/auth/components/ProtectedRoute.tsx
import React, { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth, useRole } from "../hooks/useAuth";
import { LoadingOverlay } from "@/components/common/LoadingOverlay";
import { UnauthorizedPage } from "@/components/common/UnauthorizedPage";
import type { UserRole } from "@/types/auth";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole;
  requiredRoles?: UserRole[];
  requiredPermission?: string;
  requiredPermissions?: string[];
  fallback?: ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  requiredRoles,
  requiredPermission,
  requiredPermissions,
  fallback = <UnauthorizedPage />,
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const { hasRole, hasAnyRole } = useRole();
  const location = useLocation();

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return <LoadingOverlay loading={true} fullScreen />;
  }

  // Redirigir al login si no está autenticado
  if (!isAuthenticated) {
    return (
      <Navigate to="/auth/login" state={{ from: location.pathname }} replace />
    );
  }

  // Verificar rol específico
  if (requiredRole && !hasRole(requiredRole)) {
    return <>{fallback}</>;
  }

  // Verificar cualquiera de los roles
  if (requiredRoles && !hasAnyRole(requiredRoles)) {
    return <>{fallback}</>;
  }

  // Verificar permisos (si se implementa)
  if (requiredPermission || requiredPermissions) {
    // TODO: Implementar verificación de permisos
    // const { hasPermission, hasAnyPermission } = usePermissions();
  }

  return <>{children}</>;
};

// Componente para rutas públicas (solo para no autenticados)
export const PublicRoute: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingOverlay loading={true} fullScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
```

### Uso en Rutas

```tsx
// routes.tsx
import {
  ProtectedRoute,
  PublicRoute,
} from "@/features/auth/components/ProtectedRoute";

function AppRoutes() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route
        path="/auth/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      <Route
        path="/auth/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />

      {/* Rutas protegidas generales */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      {/* Rutas solo para admin */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminRoutes />
          </ProtectedRoute>
        }
      />

      {/* Rutas para lab y admin */}
      <Route
        path="/lab/*"
        element={
          <ProtectedRoute requiredRoles={["lab", "admin"]}>
            <LabRoutes />
          </ProtectedRoute>
        }
      />

      {/* Rutas para clientes */}
      <Route
        path="/client/*"
        element={
          <ProtectedRoute requiredRole="client">
            <ClientRoutes />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
```

## 🔧 Servicio de Autenticación

```tsx
// features/auth/services/authService.ts
import apiClient from "@/lib/axios/apiClient";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  UserInfo,
} from "@/types/auth";

class AuthService {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>(
      "/auth/login",
      credentials
    );
    return response;
  }

  async register(userData: RegisterRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>(
      "/auth/register",
      userData
    );
    return response;
  }

  async logout(): Promise<void> {
    await apiClient.post("/auth/logout");
  }

  async verifyToken(token: string): Promise<UserInfo | null> {
    try {
      const response = await apiClient.get<UserInfo>("/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response;
    } catch (error) {
      return null;
    }
  }

  async refreshToken(): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>("/auth/refresh");
    return response;
  }

  async updateProfile(userData: Partial<UserInfo>): Promise<UserInfo> {
    const response = await apiClient.put<UserInfo>("/auth/profile", userData);
    return response;
  }

  async changePassword(
    oldPassword: string,
    newPassword: string
  ): Promise<void> {
    await apiClient.post("/auth/change-password", {
      oldPassword,
      newPassword,
    });
  }

  async requestPasswordReset(email: string): Promise<void> {
    await apiClient.post("/auth/forgot-password", { email });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await apiClient.post("/auth/reset-password", {
      token,
      newPassword,
    });
  }
}

export const authService = new AuthService();
```

## 📱 Páginas de Autenticación

### Login Page

```tsx
// features/auth/pages/LoginPage.tsx
import React from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Box,
  TextField,
  Button,
  Typography,
  Link,
  Checkbox,
  FormControlLabel,
  Alert,
} from "@mui/material";
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { LoadingButton } from "@mui/lab";

const loginSchema = yup.object({
  email: yup.string().email("Email inválido").required("Email es requerido"),
  password: yup
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .required("Contraseña es requerida"),
  rememberMe: yup.boolean(),
});

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

const LoginPage: React.FC = () => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from || "/dashboard";

  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      navigate(from, { replace: true });
    } catch (error) {
      setError("root", {
        message: "Credenciales incorrectas",
      });
    }
  };

  return (
    <AuthLayout
      title="Iniciar Sesión"
      subtitle="Accede a tu cuenta de INGEOCIMYC"
    >
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        {errors.root && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors.root.message}
          </Alert>
        )}

        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              error={!!errors.email}
              helperText={errors.email?.message}
              autoComplete="email"
              autoFocus
            />
          )}
        />

        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Contraseña"
              type="password"
              fullWidth
              margin="normal"
              error={!!errors.password}
              helperText={errors.password?.message}
              autoComplete="current-password"
            />
          )}
        />

        <Controller
          name="rememberMe"
          control={control}
          render={({ field: { value, onChange } }) => (
            <FormControlLabel
              control={
                <Checkbox checked={value} onChange={onChange} color="primary" />
              }
              label="Recordarme"
              sx={{ mt: 1 }}
            />
          )}
        />

        <LoadingButton
          type="submit"
          fullWidth
          variant="contained"
          loading={isLoading}
          sx={{ mt: 3, mb: 2 }}
          size="large"
        >
          Iniciar Sesión
        </LoadingButton>

        <Box textAlign="center">
          <Link component={RouterLink} to="/auth/register" variant="body2">
            ¿No tienes cuenta? Regístrate aquí
          </Link>
        </Box>

        <Box textAlign="center" mt={1}>
          <Link
            component={RouterLink}
            to="/auth/forgot-password"
            variant="body2"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </Box>
      </Box>
    </AuthLayout>
  );
};

export default LoginPage;
```

### Profile Page

```tsx
// features/auth/pages/ProfilePage.tsx
import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid2,
  Avatar,
  Divider,
  Tabs,
  Tab,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { useAuth } from "../hooks/useAuth";
import { MainLayout } from "@/components/layout/MainLayout";

interface ProfileFormData {
  name: string;
  email: string;
  phone?: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);

  const profileForm = useForm<ProfileFormData>({
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onUpdateProfile = async (data: ProfileFormData) => {
    try {
      setIsUpdating(true);
      await updateProfile(data);
    } finally {
      setIsUpdating(false);
    }
  };

  const onChangePassword = async (data: PasswordFormData) => {
    // TODO: Implementar cambio de contraseña
    console.log("Change password:", data);
  };

  return (
    <MainLayout>
      <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Mi Perfil
        </Typography>

        <Card>
          <CardContent>
            {/* Avatar y info básica */}
            <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
              <Avatar sx={{ width: 80, height: 80, mr: 3 }} src={user?.avatar}>
                {user?.name?.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="h5">{user?.name}</Typography>
                <Typography color="text.secondary" variant="body2">
                  {user?.role === "admin" && "Administrador"}
                  {user?.role === "lab" && "Laboratorio"}
                  {user?.role === "client" && "Cliente"}
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  {user?.email}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Tabs */}
            <Tabs
              value={activeTab}
              onChange={(_, newValue) => setActiveTab(newValue)}
              sx={{ mb: 3 }}
            >
              <Tab label="Información Personal" />
              <Tab label="Seguridad" />
            </Tabs>

            {/* Tab 1: Información Personal */}
            {activeTab === 0 && (
              <Box
                component="form"
                onSubmit={profileForm.handleSubmit(onUpdateProfile)}
              >
                <Grid2 container spacing={3}>
                  <Grid2 size={{ xs: 12, sm: 6 }}>
                    <Controller
                      name="name"
                      control={profileForm.control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Nombre completo"
                          fullWidth
                          required
                        />
                      )}
                    />
                  </Grid2>

                  <Grid2 size={{ xs: 12, sm: 6 }}>
                    <Controller
                      name="email"
                      control={profileForm.control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Email"
                          type="email"
                          fullWidth
                          required
                          disabled // No permitir cambiar email
                        />
                      )}
                    />
                  </Grid2>

                  <Grid2 size={{ xs: 12, sm: 6 }}>
                    <Controller
                      name="phone"
                      control={profileForm.control}
                      render={({ field }) => (
                        <TextField {...field} label="Teléfono" fullWidth />
                      )}
                    />
                  </Grid2>

                  <Grid2 size={12}>
                    <LoadingButton
                      type="submit"
                      variant="contained"
                      loading={isUpdating}
                    >
                      Actualizar Perfil
                    </LoadingButton>
                  </Grid2>
                </Grid2>
              </Box>
            )}

            {/* Tab 2: Seguridad */}
            {activeTab === 1 && (
              <Box
                component="form"
                onSubmit={passwordForm.handleSubmit(onChangePassword)}
              >
                <Grid2 container spacing={3}>
                  <Grid2 size={12}>
                    <Typography variant="h6" gutterBottom>
                      Cambiar Contraseña
                    </Typography>
                  </Grid2>

                  <Grid2 size={12}>
                    <Controller
                      name="currentPassword"
                      control={passwordForm.control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Contraseña actual"
                          type="password"
                          fullWidth
                          required
                        />
                      )}
                    />
                  </Grid2>

                  <Grid2 size={{ xs: 12, sm: 6 }}>
                    <Controller
                      name="newPassword"
                      control={passwordForm.control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Nueva contraseña"
                          type="password"
                          fullWidth
                          required
                        />
                      )}
                    />
                  </Grid2>

                  <Grid2 size={{ xs: 12, sm: 6 }}>
                    <Controller
                      name="confirmPassword"
                      control={passwordForm.control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Confirmar contraseña"
                          type="password"
                          fullWidth
                          required
                        />
                      )}
                    />
                  </Grid2>

                  <Grid2 size={12}>
                    <Button type="submit" variant="contained" color="warning">
                      Cambiar Contraseña
                    </Button>
                  </Grid2>
                </Grid2>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </MainLayout>
  );
};

export default ProfilePage;
```

## 🎯 Buenas Prácticas de Seguridad

### 1. Almacenamiento Seguro de Tokens

```tsx
// stores/authStore.ts - Solo información no sensible en localStorage
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // ... estado
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user, // Solo datos del usuario
        // NO almacenar el token en localStorage por seguridad
      }),
    }
  )
);

// En su lugar, usar httpOnly cookies para tokens (configurado en el backend)
```

### 2. Verificación de Tokens

```tsx
// Verificar token periódicamente
useEffect(() => {
  const verifyTokenPeriodically = () => {
    if (token && isAuthenticated) {
      authService.verifyToken(token).then((userData) => {
        if (!userData) {
          logout();
        }
      });
    }
  };

  // Verificar cada 15 minutos
  const interval = setInterval(verifyTokenPeriodically, 15 * 60 * 1000);

  return () => clearInterval(interval);
}, [token, isAuthenticated]);
```

### 3. Logout Automático por Inactividad

```tsx
// hooks/useIdleTimer.ts
export function useIdleTimer(timeoutMs = 30 * 60 * 1000) {
  // 30 minutos
  const { logout, isAuthenticated } = useAuth();
  const timeoutRef = useRef<number>();

  const resetTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (isAuthenticated) {
      timeoutRef.current = window.setTimeout(() => {
        logout();
      }, timeoutMs);
    }
  }, [isAuthenticated, logout, timeoutMs]);

  useEffect(() => {
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
    ];

    events.forEach((event) => {
      document.addEventListener(event, resetTimer, true);
    });

    resetTimer(); // Iniciar timer

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, resetTimer, true);
      });

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [resetTimer]);
}
```

### 4. Protección CSRF

```tsx
// En el cliente HTTP
axios.defaults.xsrfCookieName = "XSRF-TOKEN";
axios.defaults.xsrfHeaderName = "X-XSRF-TOKEN";
```

---

**Siguiente:** [📝 Guías de Desarrollo](./development-guides.md)
