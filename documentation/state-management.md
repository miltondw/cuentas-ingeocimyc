# 🔗 Gestión de Estado

Documentación completa sobre cómo se maneja el estado en la aplicación.

## 🏗️ Arquitectura de Estado

La aplicación utiliza un enfoque híbrido para la gestión de estado:

```
┌─────────────────────────────────────────┐
│                ESTADO                   │
├─────────────────────────────────────────┤
│  🌐 Servidor (TanStack Query)          │
│  • Datos remotos                       │
│  • Caché inteligente                   │
│  • Sincronización                      │
├─────────────────────────────────────────┤
│  🏠 Cliente Global (Zustand)           │
│  • Auth state                          │
│  • UI preferences                      │
│  • App configuration                   │
├─────────────────────────────────────────┤
│  📍 Local (useState/useReducer)        │
│  • Component state                     │
│  • Form state                          │
│  • UI state                            │
└─────────────────────────────────────────┘
```

## 🌐 Estado del Servidor - TanStack Query

### Configuración Base

```tsx
// App.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutos
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <YourApp />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### Patrones de Queries

#### Query Básica

```tsx
import { useQuery } from "@tanstack/react-query";
import { projectsService } from "@/services/api/projectsService";

function ProjectsList() {
  const {
    data: projects,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["projects"],
    queryFn: projectsService.getAll,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      {projects?.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
```

#### Query con Parámetros

```tsx
function ProjectsWithFilters() {
  const [filters, setFilters] = useState({
    status: "active",
    page: 1,
    limit: 10,
  });

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["projects", filters],
    queryFn: () => projectsService.getAll(filters),
    keepPreviousData: true, // Para paginación suave
    enabled: !!filters, // Solo ejecutar si hay filtros
  });

  return (
    <div>
      <SearchAndFilter filters={filters} onFiltersChange={setFilters} />

      <LoadingOverlay loading={isFetching}>
        <ProjectsList projects={data?.projects} />
      </LoadingOverlay>

      <Pagination
        current={filters.page}
        total={data?.pagination.totalPages}
        onChange={(page) => setFilters((prev) => ({ ...prev, page }))}
      />
    </div>
  );
}
```

#### Query Dependiente

```tsx
function ProjectDetails({ projectId }) {
  // Query principal
  const { data: project } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => projectsService.getById(projectId),
  });

  // Query dependiente - solo se ejecuta si hay proyecto
  const { data: expenses } = useQuery({
    queryKey: ["project-expenses", projectId],
    queryFn: () => expensesService.getByProject(projectId),
    enabled: !!project, // Depende del primer query
  });

  return (
    <div>
      {project && <ProjectInfo project={project} />}
      {expenses && <ExpensesList expenses={expenses} />}
    </div>
  );
}
```

### Patrones de Mutations

#### Mutation Básica

```tsx
import { useMutation, useQueryClient } from "@tanstack/react-query";

function CreateProjectForm() {
  const queryClient = useQueryClient();
  const { showNotification } = useNotifications();

  const createMutation = useMutation({
    mutationFn: projectsService.create,
    onSuccess: (newProject) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries(["projects"]);

      // O actualizar directamente el caché
      queryClient.setQueryData(["project", newProject.id], newProject);

      showNotification({
        type: "success",
        message: "Proyecto creado exitosamente",
      });
    },
    onError: (error) => {
      showNotification({
        type: "error",
        message: "Error al crear proyecto",
      });
    },
  });

  const handleSubmit = (formData) => {
    createMutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* campos del formulario */}

      <LoadingButton loading={createMutation.isLoading} type="submit">
        Crear Proyecto
      </LoadingButton>
    </form>
  );
}
```

#### Optimistic Updates

```tsx
function UpdateProjectMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: projectsService.update,
    onMutate: async (updatedProject) => {
      // Cancelar queries en progreso
      await queryClient.cancelQueries(["project", updatedProject.id]);

      // Snapshot del valor anterior
      const previousProject = queryClient.getQueryData([
        "project",
        updatedProject.id,
      ]);

      // Actualización optimista
      queryClient.setQueryData(["project", updatedProject.id], updatedProject);

      // Retornar contexto con el valor anterior
      return { previousProject };
    },
    onError: (err, updatedProject, context) => {
      // Revertir en caso de error
      queryClient.setQueryData(
        ["project", updatedProject.id],
        context.previousProject
      );
    },
    onSettled: (updatedProject) => {
      // Refetch para asegurar consistencia
      queryClient.invalidateQueries(["project", updatedProject.id]);
    },
  });
}
```

### Hooks Personalizados con React Query

```tsx
// hooks/useProjects.ts
export function useProjects(filters = {}) {
  return useQuery({
    queryKey: ["projects", filters],
    queryFn: () => projectsService.getAll(filters),
    select: (data) => ({
      projects: data.data,
      pagination: data.pagination,
      summary: data.summary,
    }),
    staleTime: 1000 * 60 * 5,
  });
}

export function useProject(id) {
  return useQuery({
    queryKey: ["project", id],
    queryFn: () => projectsService.getById(id),
    enabled: !!id,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  const { showNotification } = useNotifications();

  return useMutation({
    mutationFn: projectsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries(["projects"]);
      showNotification({
        type: "success",
        message: "Proyecto creado exitosamente",
      });
    },
  });
}

// Uso en componentes
function ProjectsPage() {
  const [filters, setFilters] = useState({});
  const { data, isLoading } = useProjects(filters);
  const createProject = useCreateProject();

  return (
    <div>
      <DataTable
        data={data?.projects}
        loading={isLoading}
        onCreate={(projectData) => createProject.mutate(projectData)}
      />
    </div>
  );
}
```

## 🏠 Estado Global del Cliente - Zustand

### Store de Autenticación

```tsx
// stores/authStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: (user, token) => {
        set({
          user,
          token,
          isAuthenticated: true,
        });
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      updateUser: (userData) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData },
          });
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
```

### Store de Configuración de UI

```tsx
// stores/uiStore.ts
interface UIState {
  theme: "light" | "dark";
  sidebarOpen: boolean;
  notifications: Notification[];
  loading: Record<string, boolean>;

  setTheme: (theme: "light" | "dark") => void;
  toggleSidebar: () => void;
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
  setLoading: (key: string, loading: boolean) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  theme: "light",
  sidebarOpen: true,
  notifications: [],
  loading: {},

  setTheme: (theme) => set({ theme }),

  toggleSidebar: () =>
    set((state) => ({
      sidebarOpen: !state.sidebarOpen,
    })),

  addNotification: (notification) =>
    set((state) => ({
      notifications: [...state.notifications, notification],
    })),

  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  setLoading: (key, loading) =>
    set((state) => ({
      loading: { ...state.loading, [key]: loading },
    })),
}));
```

### Uso de Stores

```tsx
// En componentes
function NavigationBar() {
  const { user, logout } = useAuthStore();
  const { sidebarOpen, toggleSidebar } = useUIStore();

  return (
    <AppBar>
      <Toolbar>
        <IconButton onClick={toggleSidebar}>
          <MenuIcon />
        </IconButton>

        <Typography variant="h6">Bienvenido, {user?.name}</Typography>

        <Button onClick={logout}>Cerrar Sesión</Button>
      </Toolbar>
    </AppBar>
  );
}
```

## 📍 Estado Local - React Hooks

### Formularios con React Hook Form

```tsx
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

function ProjectForm({ initialData, onSubmit }) {
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    resolver: yupResolver(projectSchema),
    defaultValues: initialData || {
      name: "",
      description: "",
      startDate: "",
      budget: 0,
    },
  });

  // Watchers para valores dependientes
  const budgetValue = watch("budget");
  const startDate = watch("startDate");

  // Efectos basados en cambios del formulario
  useEffect(() => {
    if (budgetValue > 1000000) {
      setValue("requiresApproval", true);
    }
  }, [budgetValue, setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid2 container spacing={2}>
        <Grid2 size={{ xs: 12, md: 6 }}>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Nombre del Proyecto"
                error={!!errors.name}
                helperText={errors.name?.message}
                fullWidth
              />
            )}
          />
        </Grid2>

        {/* Más campos... */}

        <Grid2 size={12}>
          <LoadingButton
            loading={isSubmitting}
            type="submit"
            variant="contained"
            disabled={!isDirty}
          >
            Guardar Proyecto
          </LoadingButton>
        </Grid2>
      </Grid2>
    </form>
  );
}
```

### Estado Complejo con useReducer

```tsx
// Para estado complejo como filtros de tabla
interface FilterState {
  search: string;
  filters: Record<string, any>;
  sorting: { field: string; direction: "asc" | "desc" };
  pagination: { page: number; limit: number };
}

type FilterAction =
  | { type: "SET_SEARCH"; payload: string }
  | { type: "SET_FILTER"; payload: { key: string; value: any } }
  | {
      type: "SET_SORTING";
      payload: { field: string; direction: "asc" | "desc" };
    }
  | { type: "SET_PAGE"; payload: number }
  | { type: "RESET_FILTERS" };

function filterReducer(state: FilterState, action: FilterAction): FilterState {
  switch (action.type) {
    case "SET_SEARCH":
      return {
        ...state,
        search: action.payload,
        pagination: { ...state.pagination, page: 1 }, // Reset page
      };

    case "SET_FILTER":
      return {
        ...state,
        filters: {
          ...state.filters,
          [action.payload.key]: action.payload.value,
        },
        pagination: { ...state.pagination, page: 1 },
      };

    case "SET_SORTING":
      return {
        ...state,
        sorting: action.payload,
      };

    case "SET_PAGE":
      return {
        ...state,
        pagination: { ...state.pagination, page: action.payload },
      };

    case "RESET_FILTERS":
      return {
        search: "",
        filters: {},
        sorting: { field: "created_at", direction: "desc" },
        pagination: { page: 1, limit: 10 },
      };

    default:
      return state;
  }
}

function useTableState() {
  const [state, dispatch] = useReducer(filterReducer, {
    search: "",
    filters: {},
    sorting: { field: "created_at", direction: "desc" },
    pagination: { page: 1, limit: 10 },
  });

  const setSearch = (search: string) =>
    dispatch({ type: "SET_SEARCH", payload: search });

  const setFilter = (key: string, value: any) =>
    dispatch({ type: "SET_FILTER", payload: { key, value } });

  const setSorting = (field: string, direction: "asc" | "desc") =>
    dispatch({ type: "SET_SORTING", payload: { field, direction } });

  const setPage = (page: number) =>
    dispatch({ type: "SET_PAGE", payload: page });

  const resetFilters = () => dispatch({ type: "RESET_FILTERS" });

  return {
    state,
    setSearch,
    setFilter,
    setSorting,
    setPage,
    resetFilters,
  };
}
```

## 🔄 Sincronización de Estado

### URL State Synchronization

```tsx
// hooks/useUrlFilters.ts
import { useSearchParams } from "react-router-dom";
import { useMemo, useCallback } from "react";

export function useUrlFilters<T extends Record<string, any>>(
  defaultFilters: T,
  options: {
    debounceMs?: number;
    excludeFromUrl?: (keyof T)[];
  } = {}
) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { debounceMs = 300, excludeFromUrl = [] } = options;

  // Leer filtros desde URL
  const filters = useMemo(() => {
    const result = { ...defaultFilters };

    for (const [key, value] of searchParams.entries()) {
      if (key in defaultFilters) {
        // Parsear según el tipo del valor por defecto
        const defaultValue = defaultFilters[key];
        if (typeof defaultValue === "number") {
          result[key] = parseInt(value) || defaultValue;
        } else if (typeof defaultValue === "boolean") {
          result[key] = value === "true";
        } else {
          result[key] = value;
        }
      }
    }

    return result;
  }, [searchParams, defaultFilters]);

  // Actualizar URL
  const updateFilters = useCallback(
    (newFilters: Partial<T>) => {
      const updatedFilters = { ...filters, ...newFilters };
      const params = new URLSearchParams();

      Object.entries(updatedFilters).forEach(([key, value]) => {
        if (
          value !== undefined &&
          value !== null &&
          value !== "" &&
          !excludeFromUrl.includes(key as keyof T)
        ) {
          params.set(key, String(value));
        }
      });

      setSearchParams(params);
    },
    [filters, setSearchParams, excludeFromUrl]
  );

  const updateFilter = useCallback(
    (key: keyof T, value: T[keyof T]) => {
      updateFilters({ [key]: value } as Partial<T>);
    },
    [updateFilters]
  );

  const clearFilters = useCallback(() => {
    setSearchParams(new URLSearchParams());
  }, [setSearchParams]);

  const hasActiveFilters = useMemo(() => {
    return Object.entries(filters).some(([key, value]) => {
      const defaultValue = defaultFilters[key as keyof T];
      return value !== defaultValue && value !== "" && value !== null;
    });
  }, [filters, defaultFilters]);

  return {
    filters,
    updateFilters,
    updateFilter,
    clearFilters,
    hasActiveFilters,
    isLoading: false, // Placeholder for debounced loading state
  };
}
```

### Estado Offline/Online

```tsx
// hooks/useOfflineSync.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useOnlineStatus } from "./useOnlineStatus";

export function useOfflineSync() {
  const isOnline = useOnlineStatus();
  const queryClient = useQueryClient();

  // Detectar cuando volvemos online
  useEffect(() => {
    if (isOnline) {
      // Refetch todas las queries stale
      queryClient.refetchQueries({
        stale: true,
      });

      // Procesar mutations pendientes
      queryClient.resumePausedMutations();
    }
  }, [isOnline, queryClient]);

  return { isOnline };
}

function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}
```

## 🎯 Mejores Prácticas

### 1. Separación de Responsabilidades

- **Server State**: TanStack Query para datos remotos
- **Global Client State**: Zustand para configuración global
- **Local Component State**: useState/useReducer para UI local

### 2. Invalidación Inteligente

```tsx
// Invalidar queries específicas
queryClient.invalidateQueries(["projects"]);

// Invalidar queries con filtros
queryClient.invalidateQueries(["projects", { status: "active" }]);

// Invalidar todas las queries de un tipo
queryClient.invalidateQueries({
  predicate: (query) => query.queryKey[0] === "projects",
});
```

### 3. Error Boundaries

```tsx
function QueryErrorBoundary({ children }) {
  return (
    <ErrorBoundary
      fallback={({ error, resetError }) => (
        <Box textAlign="center" p={4}>
          <Typography color="error">Error: {error.message}</Typography>
          <Button onClick={resetError}>Reintentar</Button>
        </Box>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}
```

### 4. Performance Optimization

```tsx
// Memoización de queries complejas
const expensiveQuery = useQuery({
  queryKey: ["expensive-data", filters],
  queryFn: () => computeExpensiveData(filters),
  select: useCallback((data) => {
    return data.map((item) => ({
      ...item,
      computed: expensiveCalculation(item),
    }));
  }, []),
  staleTime: 1000 * 60 * 10, // 10 minutos
});
```

---

**Siguiente:** [🌐 Servicios y API](./api-services.md)
