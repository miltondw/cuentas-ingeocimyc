# 📊 Módulos de Funcionalidad (Features)

Documentación detallada de cada módulo de funcionalidad del sistema.

## 🏗️ Arquitectura por Features

Cada feature sigue la misma estructura:

```
features/[feature]/
├── components/        # Componentes específicos
├── hooks/            # Hooks del feature
├── pages/            # Páginas del feature
├── services/         # Servicios API
├── types/            # Tipos TypeScript
└── providers/        # Context providers
```

## 🔐 Auth - Autenticación y Autorización

### Ubicación

`src/features/auth/`

### Funcionalidades

- ✅ Login/Logout
- ✅ Registro de usuarios
- ✅ Gestión de perfil
- ✅ Protección de rutas por roles
- ✅ Persistencia de sesión

### Componentes Principales

```tsx
// AuthProvider - Context principal
import { AuthProvider } from "@/features/auth/providers/AuthProvider";

// Hook principal
import { useAuth } from "@/features/auth/hooks/useAuth";

function App() {
  return (
    <AuthProvider>
      <Router>{/* Tu app */}</Router>
    </AuthProvider>
  );
}

function MyComponent() {
  const { user, login, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return <div>Bienvenido {user?.name}</div>;
}
```

### Páginas Disponibles

- **LoginPage** - `/auth/login`
- **RegisterPage** - `/auth/register`
- **ProfilePage** - `/profile`
- **LogoutPage** - `/auth/logout`

### Tipos de Usuario

```tsx
type UserRole = "admin" | "lab" | "client";

interface UserInfo {
  email: string;
  name: string;
  role: UserRole;
  permissions?: string[];
}
```

### Protección de Rutas

```tsx
import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";

function AdminRoute() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminDashboard />
    </ProtectedRoute>
  );
}
```

## 👑 Admin - Panel Administrativo

### Ubicación

`src/features/admin/`

### Funcionalidades

- ✅ Gestión de usuarios
- ✅ Configuración del sistema
- ✅ Reportes administrativos
- ✅ Solicitudes de servicios
- ✅ Monitoreo del sistema

### Componentes Clave

```tsx
// Dashboard principal
import AdminDashboard from "@/features/admin/pages/AdminDashboard";

// Gestión de servicios
import { AdminServices } from "@/features/admin/components/AdminServices";

// Hook para datos admin
import { useAdminData } from "@/features/admin/hooks/useAdminData";
```

### Servicios Disponibles

- **AdminServices** - Gestión de servicios del sistema
- **UserManagement** - Administración de usuarios
- **SystemConfig** - Configuración del sistema

## 💰 Financial - Gestión Financiera

### Ubicación

`src/features/financial/`

### Funcionalidades

- ✅ Gestión de gastos empresariales
- ✅ Tabla de utilidades mensuales
- ✅ Proyectos y facturación
- ✅ Reportes financieros
- ✅ Filtros avanzados

### Componentes Principales

#### TablaGastosEmpresa

Gestión de gastos mensuales de la empresa.

```tsx
import { TablaGastosEmpresa } from "@/features/financial/components/gasto-mes";

// Características:
// - Filtros por año, mes, monto
// - Ordenamiento por múltiples campos
// - Paginación avanzada
// - CRUD completo de gastos
```

#### TablaUtilidades

Resumen financiero mensual con utilidades.

```tsx
import { TablaUtilidades } from "@/features/financial/components/TablaUtilidades";

// Características:
// - Consolidación de ingresos y gastos
// - Cálculo automático de utilidades
// - Ordenamiento por cualquier columna
// - Exportación de datos
```

#### TablaGastosProject

Gestión de proyectos y sus gastos asociados.

```tsx
import TablaGastosProject from "@/features/financial/components/TablaGastosProject";

// Características:
// - Gestión completa de proyectos
// - Tracking de gastos por proyecto
// - Estados de pago y facturación
// - Filtros avanzados por fechas, cliente, estado
```

### Páginas Disponibles

- **GastosEmpresaPage** - `/financial/gastos-empresa`
- **TablaUtilidadesPage** - `/financial/utilidades`
- **GastosProjectPage** - `/financial/proyectos`

### Tipos Principales

```tsx
interface GastoEmpresa {
  id: number;
  mes: string;
  empresa: number;
  luz?: number;
  agua?: number;
  arriendo?: number;
  internet?: number;
  salud?: number;
  otros_campos?: Record<string, number>;
}

interface Project {
  id: number;
  nombreProyecto: string;
  solicitante: string;
  fecha: string;
  costoServicio: number;
  estado: "activo" | "completado" | "suspendido";
  metodoDePago: string;
}
```

### Filtros Financieros

```tsx
interface FinancialFilters {
  year?: string;
  month?: string;
  minAmount?: string;
  maxAmount?: string;
  empresa?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
  page?: number;
  limit?: number;
}
```

## 🧪 Lab - Laboratorio

### Ubicación

`src/features/lab/`

### Funcionalidades

- ✅ Gestión de proyectos de laboratorio
- ✅ Apiques y perfiles geológicos
- ✅ Dashboard con estadísticas
- ✅ Filtros avanzados
- ✅ Exportación de datos

### Componente Principal

#### ProjectsDashboard

Dashboard principal del laboratorio con gestión completa de proyectos.

```tsx
import ProjectsDashboard from "@/features/lab/pages/ProjectsDashboard";

// Características principales:
// - Lista paginada de proyectos
// - Filtros por múltiples campos
// - Búsqueda en tiempo real con debounce
// - Estadísticas resumidas
// - Navegación a detalles de proyecto
```

### Funcionalidades del Dashboard

#### Filtros Avanzados

```tsx
interface LabProjectFilters {
  // Búsqueda de texto
  nombreProyecto?: string;
  solicitante?: string;
  obrero?: string;

  // Filtros de estado
  estado?: "todos" | "activo" | "completado" | "pausado" | "cancelado";

  // Filtros de fecha
  startDate?: string;
  endDate?: string;

  // Filtros por conteo
  hasApiques?: boolean;
  hasProfiles?: boolean;
  minApiques?: number;
  maxApiques?: number;
  minProfiles?: number;
  maxProfiles?: number;

  // Paginación y ordenamiento
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}
```

#### Búsqueda con Debounce

El dashboard implementa búsqueda inteligente:

- **Búsqueda inmediata**: Al presionar Enter
- **Búsqueda automática**: Después de 1 segundo de inactividad
- **Indicadores visuales**: Muestra cuando está buscando
- **Estado persistente**: Filtros se mantienen en URL

#### Gestión de Estado en URL

Los filtros se persisten en la URL para:

- **Bookmarkeable**: URLs que se pueden guardar
- **Navegación**: Botón atrás/adelante funciona
- **Compartible**: URLs que se pueden compartir

### Páginas Disponibles

- **ProjectsDashboard** - `/lab/projects`
- **ProjectDetails** - `/lab/projects/:id`
- **ApiqueDetails** - `/lab/apiques/:id`
- **ProfileDetails** - `/lab/profiles/:id`

### Tipos Principales

```tsx
interface LabProject {
  proyecto_id: number;
  nombre_proyecto: string;
  solicitante: string;
  obrero: string;
  fecha: string;
  estado: string;
  total_apiques: number;
  total_profiles: number;
}

interface LabProjectsResponse {
  data: LabProject[];
  summary: {
    totalProjects: number;
    totalApiques: number;
    totalProfiles: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

## 👥 Client - Portal del Cliente

### Ubicación

`src/features/client/`

### Funcionalidades

- ✅ Portal de clientes
- ✅ Solicitud de servicios
- ✅ Seguimiento de proyectos
- ✅ Histórico de servicios

### Componentes Principales

```tsx
// Portal principal del cliente
import ClientDashboard from "@/features/client/pages/ClientDashboard";

// Solicitud de servicios
import { ServiceRequestForm } from "@/features/client/components/ServiceRequestForm";

// Seguimiento de proyectos
import { ProjectTracking } from "@/features/client/components/ProjectTracking";
```

### Páginas Disponibles

- **ClientDashboard** - `/client/dashboard`
- **ServiceRequest** - `/client/service-request`
- **ProjectTracking** - `/client/projects`
- **ServiceHistory** - `/client/history`

## 🔗 Integración entre Features

### Servicios Compartidos

Los features comparten servicios comunes:

```tsx
// API client compartido
import api from "@/api";

// Hooks de notificaciones
import { useNotifications } from "@/hooks/useNotifications";

// Tipos comunes
import type { PaginationParams, StandardListResponse } from "@/types/api";
```

### Context Providers

Cada feature puede tener su propio context:

```tsx
// AuthContext - Global
import { AuthProvider } from "@/features/auth/providers/AuthProvider";

// FinancialContext - Feature específico
import { FinancialProvider } from "@/features/financial/providers/FinancialProvider";
```

## 🔄 Patrones de Datos

### React Query Integration

Todos los features usan React Query para gestión de estado:

```tsx
// Query para listar datos
const { data, isLoading, error } = useQuery({
  queryKey: ["projects", filters],
  queryFn: () => projectsService.getAll(filters),
  staleTime: 5 * 60 * 1000, // 5 minutos
});

// Mutation para crear/actualizar
const mutation = useMutation({
  mutationFn: projectsService.create,
  onSuccess: () => {
    queryClient.invalidateQueries(["projects"]);
    showSuccess("Proyecto creado correctamente");
  },
  onError: (error) => {
    showError("Error al crear proyecto");
  },
});
```

### Filtros URL-Persistent

Pattern común para filtros que persisten en URL:

```tsx
import { useUrlFilters } from "@/hooks/useUrlFilters";

const { filters, updateFilter, updateFilters, clearFilters, hasActiveFilters } =
  useUrlFilters({
    defaultFilters: {
      page: 1,
      limit: 10,
      sortBy: "created_at",
      sortOrder: "DESC",
    },
    debounceMs: 300,
  });
```

## 🎯 Buenas Prácticas por Feature

### 1. Estructura Consistente

Cada feature mantiene la misma estructura de carpetas.

### 2. Servicios Tipados

```tsx
// services/projectsService.ts
export const projectsService = {
  getAll: (filters: ProjectFilters): Promise<ProjectsResponse> =>
    api.get("/projects", { params: filters }),

  getById: (id: number): Promise<Project> => api.get(`/projects/${id}`),

  create: (data: CreateProjectRequest): Promise<Project> =>
    api.post("/projects", data),

  update: (id: number, data: UpdateProjectRequest): Promise<Project> =>
    api.put(`/projects/${id}`, data),

  delete: (id: number): Promise<void> => api.delete(`/projects/${id}`),
};
```

### 3. Hooks Personalizados

```tsx
// hooks/useProjects.ts
export function useProjects(filters: ProjectFilters) {
  return useQuery({
    queryKey: ["projects", filters],
    queryFn: () => projectsService.getAll(filters),
    select: (data) => ({
      projects: data.data,
      pagination: data.pagination,
    }),
  });
}
```

### 4. Componentes Modulares

Cada feature divide sus componentes en:

- **Pages**: Componentes de página completa
- **Components**: Componentes reutilizables del feature
- **Forms**: Formularios específicos
- **Modals**: Diálogos y modales

---

**Siguiente:** [🔗 Gestión de Estado](./state-management.md)
