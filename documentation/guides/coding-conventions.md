# 📝 Convenciones de Código

Estándares y mejores prácticas para mantener un código consistente y de alta calidad.

## 📂 Estructura de Archivos

### Nomenclatura de Archivos

```bash
# Componentes - PascalCase
UserProfile.tsx
DataTable.tsx
SearchAndFilter.tsx

# Hooks - camelCase con prefijo 'use'
useUserData.ts
useApiCall.ts
useDebounce.ts

# Servicios - camelCase con sufijo 'Service'
userService.ts
authService.ts
apiService.ts

# Tipos - camelCase con sufijo 'Types'
userTypes.ts
apiTypes.ts
authTypes.ts

# Utilidades - camelCase
formatUtils.ts
validationUtils.ts
dateUtils.ts

# Páginas - PascalCase con sufijo 'Page'
LoginPage.tsx
DashboardPage.tsx
UserListPage.tsx

# Carpetas - kebab-case
user-management/
project-settings/
admin-panel/
```

### Organización de Imports

```typescript
// 1. React y librerías externas
import React, { useState, useEffect } from "react";
import { Button, Typography, Box } from "@mui/material";
import { useQuery } from "@tanstack/react-query";

// 2. Imports internos (hooks, servicios, tipos)
import { useUserData } from "@/hooks/useUserData";
import { userService } from "@/services/userService";
import type { User, UserFilters } from "@/types/userTypes";

// 3. Imports relativos
import { UserCard } from "./UserCard";
import { useLocalState } from "../hooks/useLocalState";
```

## 🧩 Componentes

### Estructura Base

```typescript
// UserProfile.tsx
import React from "react";
import { Box, Typography, Card } from "@mui/material";
import type { User } from "@/types/userTypes";

// Definir interface cerca del componente
interface UserProfileProps {
  user: User;
  onEdit?: (user: User) => void;
  variant?: "compact" | "detailed";
}

// Componente principal
export const UserProfile: React.FC<UserProfileProps> = ({
  user,
  onEdit,
  variant = "detailed",
}) => {
  // 1. Hooks de estado
  const [isExpanded, setIsExpanded] = useState(false);

  // 2. Hooks personalizados
  const { data: userDetails } = useUserDetails(user.id);

  // 3. Handlers
  const handleEdit = () => {
    onEdit?.(user);
  };

  // 4. Effects
  useEffect(() => {
    // Effect logic
  }, [user.id]);

  // 5. Render helpers (si son complejos)
  const renderUserInfo = () => (
    <Box>
      <Typography variant="h6">{user.name}</Typography>
      <Typography variant="body2">{user.email}</Typography>
    </Box>
  );

  // 6. JSX principal
  return (
    <Card>
      {renderUserInfo()}
      {variant === "detailed" && <Box>{/* Contenido detallado */}</Box>}
    </Card>
  );
};

// Default props si es necesario
UserProfile.defaultProps = {
  variant: "detailed",
};
```

### Props y TypeScript

```typescript
// ✅ Bueno - Props tipadas y documentadas
interface DataTableProps<T> {
  /** Datos a mostrar en la tabla */
  data: T[];
  /** Configuración de columnas */
  columns: ColumnConfig<T>[];
  /** Indica si está cargando */
  loading?: boolean;
  /** Callback cuando se selecciona una fila */
  onRowSelect?: (row: T) => void;
}

// ✅ Bueno - Usar tipos genéricos
interface ApiResponse<T> {
  data: T;
  status: "success" | "error";
  message?: string;
}

// ❌ Malo - Props sin tipado
interface BadProps {
  data: any;
  onClick: Function;
  config: object;
}
```

### Conditional Rendering

```typescript
// ✅ Bueno - Conditional rendering claro
{
  isLoading && <LoadingSpinner />;
}
{
  error && <ErrorMessage error={error} />;
}
{
  data && <DataTable data={data} columns={columns} />;
}

// ✅ Bueno - Multiple conditions
{
  isLoading ? (
    <LoadingSpinner />
  ) : error ? (
    <ErrorMessage error={error} />
  ) : (
    <DataTable data={data} columns={columns} />
  );
}

// ❌ Malo - Logic compleja en JSX
{
  (() => {
    if (isLoading) return <LoadingSpinner />;
    if (error) return <ErrorMessage error={error} />;
    if (!data || data.length === 0) return <EmptyState />;
    return <DataTable data={data} columns={columns} />;
  })();
}
```

## 🔧 Hooks

### Hooks Personalizados

```typescript
// useUserData.ts
interface UseUserDataOptions {
  includeProjects?: boolean;
  refetchInterval?: number;
}

interface UseUserDataReturn {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useUserData = (
  userId: string,
  options: UseUserDataOptions = {}
): UseUserDataReturn => {
  const { includeProjects = false, refetchInterval } = options;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["user", userId, { includeProjects }],
    queryFn: () => userService.getUser(userId, { includeProjects }),
    refetchInterval,
    enabled: !!userId,
  });

  return {
    user: data || null,
    isLoading,
    error,
    refetch,
  };
};
```

### Hook Dependencies

```typescript
// ✅ Bueno - Dependencies explícitas
useEffect(() => {
  if (userId) {
    fetchUserData(userId);
  }
}, [userId, fetchUserData]);

// ✅ Bueno - Usar useCallback para estabilidad
const fetchUserData = useCallback(async (id: string) => {
  const data = await userService.getUser(id);
  setUser(data);
}, []);

// ❌ Malo - Missing dependencies
useEffect(() => {
  fetchUserData(userId);
}, []); // userId debería estar en dependencies
```

## 🎨 Estilos

### Material UI Styling

```typescript
// ✅ Bueno - Usar sx prop para estilos dinámicos
<Box
  sx={{
    p: 2,
    mb: { xs: 1, md: 2 },
    backgroundColor: (theme) => theme.palette.primary.main,
    "&:hover": {
      boxShadow: (theme) => theme.shadows[4],
    },
  }}
>
  Content
</Box>;

// ✅ Bueno - Styled components para estilos complejos
const StyledCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(1),
  transition: theme.transitions.create(["box-shadow"]),
  "&:hover": {
    boxShadow: theme.shadows[4],
  },
}));

// ❌ Malo - Estilos inline complejos
<div
  style={{
    padding: "16px",
    margin: "8px 0",
    backgroundColor: "#1976d2",
    borderRadius: "4px",
  }}
>
  Content
</div>;
```

### Responsive Design

```typescript
// ✅ Bueno - Mobile first approach
sx={{
  fontSize: { xs: '14px', sm: '16px', md: '18px' },
  padding: { xs: 1, sm: 2, md: 3 },
  display: { xs: 'block', md: 'flex' },
}}

// ✅ Bueno - Usar theme breakpoints
const theme = useTheme();
const isMobile = useMediaQuery(theme.breakpoints.down('md'));

return (
  <Grid container spacing={{ xs: 1, sm: 2, md: 3 }}>
    <Grid item xs={12} md={6}>
      {isMobile ? <MobileComponent /> : <DesktopComponent />}
    </Grid>
  </Grid>
);
```

## 🔄 Estado y Side Effects

### useState

```typescript
// ✅ Bueno - Estado tipado
const [user, setUser] = useState<User | null>(null);
const [filters, setFilters] = useState<UserFilters>({
  status: "all",
  role: "",
  dateRange: null,
});

// ✅ Bueno - Functional updates
setFilters((prev) => ({ ...prev, status: "active" }));

// ❌ Malo - Mutación directa
filters.status = "active"; // No hagas esto
setFilters(filters);
```

### useEffect

```typescript
// ✅ Bueno - Effect específico
useEffect(() => {
  const timer = setTimeout(() => {
    onSearchChange?.(debouncedValue);
  }, 300);

  return () => clearTimeout(timer);
}, [debouncedValue, onSearchChange]);

// ✅ Bueno - Cleanup function
useEffect(() => {
  const subscription = eventEmitter.subscribe(handleEvent);
  return () => subscription.unsubscribe();
}, []);

// ❌ Malo - Effect que hace demasiado
useEffect(() => {
  // Fetching data
  fetchUsers();
  // Setting up listeners
  window.addEventListener("resize", handleResize);
  // Updating title
  document.title = "Users Page";

  return () => {
    window.removeEventListener("resize", handleResize);
  };
}, []); // Debería ser múltiples effects
```

## 📡 API y Servicios

### Servicios

```typescript
// userService.ts
class UserService {
  private baseURL = "/api/users";

  async getUsers(filters?: UserFilters): Promise<User[]> {
    const params = new URLSearchParams();

    if (filters?.status && filters.status !== "all") {
      params.append("status", filters.status);
    }

    if (filters?.role) {
      params.append("role", filters.role);
    }

    const response = await apiClient.get(`${this.baseURL}?${params}`);
    return response.data;
  }

  async createUser(userData: CreateUserRequest): Promise<User> {
    const response = await apiClient.post(this.baseURL, userData);
    return response.data;
  }

  async updateUser(id: string, userData: UpdateUserRequest): Promise<User> {
    const response = await apiClient.put(`${this.baseURL}/${id}`, userData);
    return response.data;
  }
}

export const userService = new UserService();
```

### React Query Hooks

```typescript
// hooks/useUsers.ts
export const useUsers = (filters?: UserFilters) => {
  return useQuery({
    queryKey: ["users", filters],
    queryFn: () => userService.getUsers(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
    enabled: true,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userService.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
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
```

## 🔍 Validación y Tipos

### Zod Schemas

```typescript
// types/userTypes.ts
import { z } from "zod";

export const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["admin", "user", "viewer"]),
  status: z.enum(["active", "inactive"]),
  createdAt: z.string().datetime(),
});

export type User = z.infer<typeof UserSchema>;

export const CreateUserSchema = UserSchema.omit({
  id: true,
  createdAt: true,
});

export type CreateUserRequest = z.infer<typeof CreateUserSchema>;
```

### Form Validation

```typescript
// components/UserForm.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export const UserForm: React.FC<UserFormProps> = ({ onSubmit }) => {
  const form = useForm<CreateUserRequest>({
    resolver: zodResolver(CreateUserSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "user",
      status: "active",
    },
  });

  const handleSubmit = form.handleSubmit((data) => {
    onSubmit(data);
  });

  return (
    <form onSubmit={handleSubmit}>
      <TextField
        {...form.register("name")}
        error={!!form.formState.errors.name}
        helperText={form.formState.errors.name?.message}
        label="Name"
        fullWidth
      />
      {/* más campos */}
    </form>
  );
};
```

## 📝 Comentarios y Documentación

### JSDoc Comments

```typescript
/**
 * Hook para gestionar datos de usuario con cache y invalidación automática
 *
 * @param userId - ID único del usuario
 * @param options - Opciones de configuración
 * @returns Objeto con datos del usuario y funciones de control
 *
 * @example
 * const { user, isLoading, refetch } = useUserData('123', {
 *   includeProjects: true
 * });
 */
export const useUserData = (
  userId: string,
  options: UseUserDataOptions = {}
): UseUserDataReturn => {
  // Implementation
};
```

### Comentarios Inline

```typescript
// ✅ Bueno - Comentarios que explican el "por qué"
// Debounce para evitar múltiples llamadas API mientras el usuario escribe
const debouncedSearch = useDebounce(searchValue, 300);

// Validación personalizada requerida por el backend legacy
if (user.role === "admin" && !user.permissions?.includes("manage_users")) {
  throw new Error("Admin user must have manage_users permission");
}

// ❌ Malo - Comentarios que explican el "qué" (obvio del código)
// Incrementar contador
setCount(count + 1);

// Retornar true
return true;
```

## 🧪 Testing

### Nombres de Tests

```typescript
// ✅ Bueno - Nombres descriptivos
describe("UserProfile", () => {
  it("should display user name and email when user data is provided", () => {
    // Test implementation
  });

  it("should call onEdit callback when edit button is clicked", () => {
    // Test implementation
  });

  it("should show loading state when user data is being fetched", () => {
    // Test implementation
  });
});

// ❌ Malo - Nombres vagos
describe("UserProfile", () => {
  it("works correctly", () => {
    // Test implementation
  });

  it("handles click", () => {
    // Test implementation
  });
});
```

## 📋 Checklist de Code Review

### Componentes

- [ ] Props tipadas con interfaces claras
- [ ] Handling de estados de loading/error
- [ ] Responsive design implementado
- [ ] Accesibilidad considerada (ARIA labels, keyboard navigation)
- [ ] Performance optimizado (memo, useMemo, useCallback cuando es necesario)

### Hooks

- [ ] Dependencies array correctas en useEffect
- [ ] Cleanup functions implementadas
- [ ] Tipos de retorno bien definidos
- [ ] Casos edge manejados

### Estado

- [ ] Estado local vs global apropiado
- [ ] Immutabilidad mantenida
- [ ] Loading/error states manejados
- [ ] Cache invalidation considerado

### API

- [ ] Error handling robusto
- [ ] Loading states
- [ ] Types para requests/responses
- [ ] Optimistic updates donde apropiado

### General

- [ ] No console.log en código de producción
- [ ] Imports organizados y limpios
- [ ] Nomenclatura consistente
- [ ] Comentarios útiles (no obvios)
- [ ] Tests unitarios incluidos
