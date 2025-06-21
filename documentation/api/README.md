# 🌐 API y Servicios

Esta sección documenta la arquitectura de servicios, integración con APIs y patrones de comunicación con el backend.

## 📋 Contenido

- [🔌 Cliente HTTP](./http-client.md) - Configuración de Axios y interceptors
- [🛠️ Servicios](./services.md) - Servicios por feature y patrones de API
- [🔄 Hooks de React Query](./react-query-hooks.md) - Gestión de estado del servidor
- [⚠️ Manejo de Errores](./error-handling.md) - Estrategias de error handling

## 🏗️ Arquitectura de Servicios

### Estructura General

```
src/
├── api/
│   ├── index.ts              # Re-exports principales
│   ├── hooks/                # React Query hooks globales
│   │   ├── useApiData.ts
│   │   └── useAdminServices.ts
│   └── services/             # Servicios organizados por feature
│       ├── index.ts          # Exports de servicios
│       ├── admin.ts          # Servicios de administración
│       ├── authService.ts    # Servicios de autenticación
│       ├── projectsService.ts
│       ├── servicesService.ts
│       └── apiquesService.ts
├── lib/
│   └── axios/
│       └── apiClient.ts      # Cliente HTTP configurado
└── features/
    └── [feature]/
        ├── services/         # Servicios específicos del feature
        └── hooks/           # Hooks específicos del feature
```

## 🔌 Cliente HTTP Base

### Configuración Principal

```typescript
// lib/axios/apiClient.ts
import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Logging en desarrollo
    if (import.meta.env.DEV) {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect a login
      window.location.href = "/auth/login";
    }

    if (import.meta.env.DEV) {
      console.error("[API Error]", error.response?.data || error.message);
    }

    return Promise.reject(error);
  }
);

export { apiClient };
```

## 🛠️ Patrones de Servicios

### Service Base Class

```typescript
// services/BaseService.ts
abstract class BaseService {
  protected baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  protected async get<T>(
    endpoint: string,
    params?: Record<string, any>
  ): Promise<T> {
    const response = await apiClient.get(`${this.baseURL}${endpoint}`, {
      params,
    });
    return response.data;
  }

  protected async post<T>(endpoint: string, data?: any): Promise<T> {
    const response = await apiClient.post(`${this.baseURL}${endpoint}`, data);
    return response.data;
  }

  protected async put<T>(endpoint: string, data?: any): Promise<T> {
    const response = await apiClient.put(`${this.baseURL}${endpoint}`, data);
    return response.data;
  }

  protected async delete<T>(endpoint: string): Promise<T> {
    const response = await apiClient.delete(`${this.baseURL}${endpoint}`);
    return response.data;
  }
}
```

### Service Implementation

```typescript
// services/userService.ts
import { BaseService } from "./BaseService";
import type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  UserFilters,
} from "@/types/userTypes";

class UserService extends BaseService {
  constructor() {
    super("/users");
  }

  async getUsers(filters?: UserFilters): Promise<User[]> {
    return this.get("/", filters);
  }

  async getUser(id: string): Promise<User> {
    return this.get(`/${id}`);
  }

  async createUser(userData: CreateUserRequest): Promise<User> {
    return this.post("/", userData);
  }

  async updateUser(id: string, userData: UpdateUserRequest): Promise<User> {
    return this.put(`/${id}`, userData);
  }

  async deleteUser(id: string): Promise<void> {
    return this.delete(`/${id}`);
  }

  // Métodos específicos
  async activateUser(id: string): Promise<User> {
    return this.post(`/${id}/activate`);
  }

  async deactivateUser(id: string): Promise<User> {
    return this.post(`/${id}/deactivate`);
  }

  async resetPassword(id: string): Promise<{ temporaryPassword: string }> {
    return this.post(`/${id}/reset-password`);
  }
}

export const userService = new UserService();
```

## 🔄 React Query Integration

### Query Hooks

```typescript
// hooks/useUsers.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "@/services/userService";
import { useNotifications } from "@/hooks/useNotifications";

// Query para lista de usuarios
export const useUsers = (filters?: UserFilters) => {
  return useQuery({
    queryKey: ["users", filters],
    queryFn: () => userService.getUsers(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos (anteriormente cacheTime)
    refetchOnWindowFocus: false,
  });
};

// Query para usuario específico
export const useUser = (id: string) => {
  return useQuery({
    queryKey: ["user", id],
    queryFn: () => userService.getUser(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
};

// Mutation para crear usuario
export const useCreateUser = () => {
  const queryClient = useQueryClient();
  const { showNotification } = useNotifications();

  return useMutation({
    mutationFn: userService.createUser,
    onSuccess: (newUser) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ["users"] });

      // Actualizar cache optimísticamente si tenemos la lista
      queryClient.setQueryData<User[]>(["users"], (oldData) => {
        return oldData ? [...oldData, newUser] : [newUser];
      });

      showNotification({
        type: "success",
        message: "Usuario creado exitosamente",
      });
    },
    onError: (error) => {
      showNotification({
        type: "error",
        message: `Error al crear usuario: ${error.message}`,
      });
    },
  });
};

// Mutation para actualizar usuario
export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  const { showNotification } = useNotifications();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) =>
      userService.updateUser(id, data),
    onSuccess: (updatedUser) => {
      // Actualizar cache específico del usuario
      queryClient.setQueryData(["user", updatedUser.id], updatedUser);

      // Actualizar en la lista de usuarios
      queryClient.setQueryData<User[]>(["users"], (oldData) => {
        return oldData?.map((user) =>
          user.id === updatedUser.id ? updatedUser : user
        );
      });

      showNotification({
        type: "success",
        message: "Usuario actualizado exitosamente",
      });
    },
    onError: (error) => {
      showNotification({
        type: "error",
        message: `Error al actualizar usuario: ${error.message}`,
      });
    },
  });
};

// Mutation para eliminar usuario
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  const { showNotification } = useNotifications();

  return useMutation({
    mutationFn: userService.deleteUser,
    onSuccess: (_, deletedId) => {
      // Remover de todas las queries
      queryClient.removeQueries({ queryKey: ["user", deletedId] });

      // Actualizar lista
      queryClient.setQueryData<User[]>(["users"], (oldData) => {
        return oldData?.filter((user) => user.id !== deletedId);
      });

      showNotification({
        type: "success",
        message: "Usuario eliminado exitosamente",
      });
    },
    onError: (error) => {
      showNotification({
        type: "error",
        message: `Error al eliminar usuario: ${error.message}`,
      });
    },
  });
};
```

### Custom Hook with Multiple Operations

```typescript
// hooks/useUserManagement.ts
export const useUserManagement = () => {
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const handleCreate = useCallback(
    async (userData: CreateUserRequest) => {
      try {
        await createUser.mutateAsync(userData);
        return { success: true };
      } catch (error) {
        return { success: false, error };
      }
    },
    [createUser]
  );

  const handleUpdate = useCallback(
    async (id: string, userData: UpdateUserRequest) => {
      try {
        await updateUser.mutateAsync({ id, data: userData });
        return { success: true };
      } catch (error) {
        return { success: false, error };
      }
    },
    [updateUser]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await deleteUser.mutateAsync(id);
        return { success: true };
      } catch (error) {
        return { success: false, error };
      }
    },
    [deleteUser]
  );

  return {
    create: handleCreate,
    update: handleUpdate,
    delete: handleDelete,
    isLoading:
      createUser.isPending || updateUser.isPending || deleteUser.isPending,
  };
};
```

## 📊 Gestión de Cache

### Cache Strategies

```typescript
// config/queryConfig.ts
export const queryConfig = {
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // No reintentar en errores 4xx
        if (error.response?.status >= 400 && error.response?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
    },
    mutations: {
      retry: 1,
    },
  },
};

// Configuración específica por tipo de data
export const cacheStrategies = {
  // Data que cambia frecuentemente
  realtime: {
    staleTime: 0,
    gcTime: 1 * 60 * 1000, // 1 minuto
    refetchInterval: 30 * 1000, // 30 segundos
  },

  // Data que cambia ocasionalmente
  frequent: {
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
  },

  // Data que rara vez cambia
  static: {
    staleTime: 30 * 60 * 1000, // 30 minutos
    gcTime: 60 * 60 * 1000, // 1 hora
  },

  // Data de configuración
  config: {
    staleTime: Infinity,
    gcTime: Infinity,
  },
};
```

### Cache Invalidation Patterns

```typescript
// utils/cacheUtils.ts
export const cacheUtils = {
  // Invalidar todas las queries de un feature
  invalidateFeature: (queryClient: QueryClient, feature: string) => {
    queryClient.invalidateQueries({ queryKey: [feature] });
  },

  // Invalidar queries relacionadas
  invalidateRelated: (queryClient: QueryClient, entity: string, id: string) => {
    queryClient.invalidateQueries({ queryKey: [entity] });
    queryClient.invalidateQueries({ queryKey: [entity, id] });
    queryClient.invalidateQueries({
      predicate: (query) =>
        query.queryKey.some(
          (key) => typeof key === "string" && key.includes(entity)
        ),
    });
  },

  // Limpiar cache de usuario al logout
  clearUserCache: (queryClient: QueryClient) => {
    queryClient.clear();
  },

  // Prefetch data común
  prefetchCommonData: async (queryClient: QueryClient) => {
    await queryClient.prefetchQuery({
      queryKey: ["user-preferences"],
      queryFn: () => userService.getPreferences(),
    });
  },
};
```

## 🔄 Optimistic Updates

### Pattern Implementation

```typescript
// hooks/useOptimisticUpdate.ts
export const useOptimisticUserUpdate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) =>
      userService.updateUser(id, data),

    // Actualización optimista
    onMutate: async ({ id, data }) => {
      // Cancelar queries pendientes
      await queryClient.cancelQueries({ queryKey: ["user", id] });
      await queryClient.cancelQueries({ queryKey: ["users"] });

      // Snapshot del estado actual
      const previousUser = queryClient.getQueryData<User>(["user", id]);
      const previousUsers = queryClient.getQueryData<User[]>(["users"]);

      // Aplicar actualización optimista
      if (previousUser) {
        const optimisticUser = { ...previousUser, ...data };
        queryClient.setQueryData(["user", id], optimisticUser);

        if (previousUsers) {
          queryClient.setQueryData(
            ["users"],
            previousUsers.map((user) =>
              user.id === id ? optimisticUser : user
            )
          );
        }
      }

      // Retornar contexto para rollback
      return { previousUser, previousUsers };
    },

    // Rollback en caso de error
    onError: (err, { id }, context) => {
      if (context?.previousUser) {
        queryClient.setQueryData(["user", id], context.previousUser);
      }
      if (context?.previousUsers) {
        queryClient.setQueryData(["users"], context.previousUsers);
      }
    },

    // Refetch para asegurar consistencia
    onSettled: (data, error, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["user", id] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};
```

## 📡 Real-time Updates

### WebSocket Integration

```typescript
// services/websocketService.ts
class WebSocketService {
  private ws: WebSocket | null = null;
  private queryClient: QueryClient;

  constructor(queryClient: QueryClient) {
    this.queryClient = queryClient;
  }

  connect() {
    const wsUrl = import.meta.env.VITE_WS_URL || "ws://localhost:3000";
    this.ws = new WebSocket(wsUrl);

    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.handleMessage(message);
    };
  }

  private handleMessage(message: any) {
    switch (message.type) {
      case "USER_UPDATED":
        this.queryClient.setQueryData(["user", message.data.id], message.data);
        this.queryClient.invalidateQueries({ queryKey: ["users"] });
        break;

      case "PROJECT_STATUS_CHANGED":
        this.queryClient.invalidateQueries({ queryKey: ["projects"] });
        break;

      case "NOTIFICATION":
        // Actualizar notificaciones
        this.queryClient.invalidateQueries({ queryKey: ["notifications"] });
        break;
    }
  }

  disconnect() {
    this.ws?.close();
  }
}

export const websocketService = new WebSocketService(queryClient);
```

## 📊 Performance Optimization

### Lazy Loading de Data

```typescript
// hooks/useLazyData.ts
export const useLazyUserData = () => {
  const [enabled, setEnabled] = useState(false);

  const query = useQuery({
    queryKey: ["users"],
    queryFn: () => userService.getUsers(),
    enabled,
  });

  const loadData = useCallback(() => {
    setEnabled(true);
  }, []);

  return {
    ...query,
    loadData,
    isReady: enabled,
  };
};
```

### Parallel Queries

```typescript
// hooks/useParallelData.ts
export const useParallelUserData = (userId: string) => {
  const userQuery = useUser(userId);
  const projectsQuery = useUserProjects(userId);
  const settingsQuery = useUserSettings(userId);

  return {
    user: userQuery.data,
    projects: projectsQuery.data,
    settings: settingsQuery.data,
    isLoading:
      userQuery.isLoading || projectsQuery.isLoading || settingsQuery.isLoading,
    error: userQuery.error || projectsQuery.error || settingsQuery.error,
  };
};
```

### Infinite Queries

```typescript
// hooks/useInfiniteUsers.ts
export const useInfiniteUsers = (filters?: UserFilters) => {
  return useInfiniteQuery({
    queryKey: ["users", "infinite", filters],
    queryFn: ({ pageParam = 1 }) =>
      userService.getUsers({ ...filters, page: pageParam, limit: 20 }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) => {
      const nextPage = pages.length + 1;
      return lastPage.length === 20 ? nextPage : undefined;
    },
  });
};
```

## 🛡️ Error Handling

### Global Error Handler

```typescript
// hooks/useGlobalErrorHandler.ts
export const useGlobalErrorHandler = () => {
  const { showNotification } = useNotifications();

  useEffect(() => {
    const handleQueryError = (event: CustomEvent) => {
      const error = event.detail;

      // Diferentes tipos de error
      if (error.response?.status === 401) {
        showNotification({
          type: "error",
          message: "Sesión expirada. Por favor, inicia sesión nuevamente.",
        });
      } else if (error.response?.status === 403) {
        showNotification({
          type: "error",
          message: "No tienes permisos para realizar esta acción.",
        });
      } else if (error.response?.status >= 500) {
        showNotification({
          type: "error",
          message: "Error del servidor. Intenta nuevamente más tarde.",
        });
      } else {
        showNotification({
          type: "error",
          message: error.message || "Ha ocurrido un error inesperado.",
        });
      }
    };

    window.addEventListener("queryError", handleQueryError);
    return () => window.removeEventListener("queryError", handleQueryError);
  }, [showNotification]);
};
```

## 📋 Best Practices

### Service Design

- **Single Responsibility**: Cada servicio maneja una entidad
- **Consistent Interface**: Métodos estándar (get, create, update, delete)
- **Error Handling**: Manejo consistente de errores
- **Type Safety**: Tipos TypeScript para requests/responses

### React Query Usage

- **Query Keys**: Descriptivas y consistentes
- **Cache Timing**: Apropiado para cada tipo de data
- **Optimistic Updates**: Para mejor UX en operaciones críticas
- **Error Boundaries**: Manejo de errores en UI

### Performance

- **Lazy Loading**: Cargar data solo cuando se necesita
- **Prefetching**: Anticipar data que el usuario necesitará
- **Cache Invalidation**: Estrategia inteligente de invalidación
- **Bundle Splitting**: Separar servicios por feature
