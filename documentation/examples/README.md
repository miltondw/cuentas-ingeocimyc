# 💡 Ejemplos Prácticos

Esta sección contiene ejemplos de código y casos de uso comunes para acelerar el desarrollo.

## 📋 Contenido

- [🧩 Ejemplos de Componentes](./component-examples.md) - Componentes típicos con código completo
- [🔗 Hooks Personalizados](./custom-hooks.md) - Hooks útiles para casos comunes
- [🎯 Casos de Uso Comunes](./common-use-cases.md) - Patrones frecuentes en la aplicación

## 🚀 Quick Start Examples

### 📊 Tabla con Filtros y Paginación

```typescript
// pages/UsersPage.tsx
import React, { useState } from "react";
import { DataTable } from "@/components/common/DataTable";
import { SearchAndFilter } from "@/components/common/SearchAndFilter";
import { useUsers } from "@/hooks/useUsers";
import { useUrlFilters } from "@/hooks/useUrlFilters";

const UsersPage = () => {
  // Filtros persistentes en URL
  const { filters, updateFilter, search, updateSearch } = useUrlFilters({
    status: "all",
    role: "",
    dateRange: null,
  });

  // Data con React Query
  const { data: users, isLoading, error } = useUsers(filters);

  // Configuración de columnas
  const columns = [
    {
      key: "name",
      label: "Nombre",
      render: (value: string, user: User) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Avatar src={user.avatar} sx={{ width: 32, height: 32 }}>
            {value.charAt(0)}
          </Avatar>
          <Typography variant="body2">{value}</Typography>
        </Box>
      ),
    },
    {
      key: "email",
      label: "Email",
      align: "left" as const,
    },
    {
      key: "role",
      label: "Rol",
      render: (value: string) => (
        <Chip
          label={value}
          color={value === "admin" ? "primary" : "default"}
          size="small"
        />
      ),
    },
    {
      key: "status",
      label: "Estado",
      render: (value: string) => (
        <Chip
          label={value === "active" ? "Activo" : "Inactivo"}
          color={value === "active" ? "success" : "default"}
          size="small"
        />
      ),
    },
    {
      key: "created_at",
      label: "Fecha Creación",
      render: (value: string) => new Date(value).toLocaleDateString("es-ES"),
    },
  ];

  // Configuración de filtros
  const filterConfig = [
    {
      key: "status",
      label: "Estado",
      type: "select" as const,
      options: [
        { value: "all", label: "Todos" },
        { value: "active", label: "Activos" },
        { value: "inactive", label: "Inactivos" },
      ],
    },
    {
      key: "role",
      label: "Rol",
      type: "select" as const,
      options: [
        { value: "", label: "Todos los roles" },
        { value: "admin", label: "Administrador" },
        { value: "user", label: "Usuario" },
        { value: "viewer", label: "Visor" },
      ],
    },
    {
      key: "dateRange",
      label: "Rango de fechas",
      type: "dateRange" as const,
    },
  ];

  // Acciones por fila
  const rowActions = [
    {
      label: "Ver detalles",
      icon: <VisibilityIcon />,
      onClick: (user: User) => navigate(`/users/${user.id}`),
    },
    {
      label: "Editar",
      icon: <EditIcon />,
      onClick: (user: User) => navigate(`/users/${user.id}/edit`),
    },
    {
      label: "Eliminar",
      icon: <DeleteIcon />,
      onClick: (user: User) => handleDelete(user.id),
      color: "error" as const,
    },
  ];

  if (error) {
    return <ErrorMessage error={error} />;
  }

  return (
    <MainLayout title="Gestión de Usuarios">
      <Stack spacing={3}>
        {/* Filtros */}
        <SearchAndFilter
          searchValue={search}
          onSearchChange={updateSearch}
          searchPlaceholder="Buscar usuarios por nombre o email..."
          filters={filterConfig}
          filterValues={filters}
          onFilterChange={updateFilter}
          showFilterCount
          collapsible
        />

        {/* Tabla */}
        <DataTable
          data={users || []}
          columns={columns}
          rowActions={rowActions}
          loading={isLoading}
          title="Lista de Usuarios"
          selectable
          onRowClick={(user) => navigate(`/users/${user.id}`)}
        />
      </Stack>
    </MainLayout>
  );
};
```

### 📝 Formulario con Validación

```typescript
// components/UserForm.tsx
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Stack,
} from "@mui/material";

// Schema de validación
const userSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  email: z.string().email("Email inválido"),
  role: z.enum(["admin", "user", "viewer"]),
  phone: z.string().optional(),
});

type UserFormData = z.infer<typeof userSchema>;

interface UserFormProps {
  initialData?: Partial<UserFormData>;
  onSubmit: (data: UserFormData) => Promise<void>;
  isLoading?: boolean;
}

export const UserForm: React.FC<UserFormProps> = ({
  initialData,
  onSubmit,
  isLoading = false,
}) => {
  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "user",
      phone: "",
      ...initialData,
    },
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      await onSubmit(data);
      form.reset();
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  });

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={3}>
        <TextField
          {...form.register("name")}
          label="Nombre completo"
          error={!!form.formState.errors.name}
          helperText={form.formState.errors.name?.message}
          fullWidth
        />

        <TextField
          {...form.register("email")}
          label="Email"
          type="email"
          error={!!form.formState.errors.email}
          helperText={form.formState.errors.email?.message}
          fullWidth
        />

        <FormControl fullWidth error={!!form.formState.errors.role}>
          <InputLabel>Rol</InputLabel>
          <Select
            {...form.register("role")}
            value={form.watch("role")}
            label="Rol"
          >
            <MenuItem value="admin">Administrador</MenuItem>
            <MenuItem value="user">Usuario</MenuItem>
            <MenuItem value="viewer">Visor</MenuItem>
          </Select>
          {form.formState.errors.role && (
            <FormHelperText>
              {form.formState.errors.role.message}
            </FormHelperText>
          )}
        </FormControl>

        <TextField
          {...form.register("phone")}
          label="Teléfono (opcional)"
          error={!!form.formState.errors.phone}
          helperText={form.formState.errors.phone?.message}
          fullWidth
        />

        <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
          <Button
            type="button"
            variant="outlined"
            onClick={() => form.reset()}
            disabled={isLoading}
          >
            Limpiar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading || !form.formState.isValid}
          >
            {isLoading ? "Guardando..." : "Guardar"}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
};
```

### 🔄 Hook para Gestión de Estado

```typescript
// hooks/useTableState.ts
import { useState, useMemo } from "react";
import { useDebounce } from "./useDebounce";

interface UseTableStateOptions<T> {
  data: T[];
  searchFields: (keyof T)[];
  defaultSort?: {
    field: keyof T;
    direction: "asc" | "desc";
  };
}

export const useTableState = <T extends Record<string, any>>({
  data,
  searchFields,
  defaultSort,
}: UseTableStateOptions<T>) => {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState(defaultSort);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const debouncedSearch = useDebounce(search, 300);

  // Filtrar por búsqueda
  const filteredData = useMemo(() => {
    if (!debouncedSearch) return data;

    return data.filter((item) =>
      searchFields.some((field) =>
        String(item[field])
          .toLowerCase()
          .includes(debouncedSearch.toLowerCase())
      )
    );
  }, [data, debouncedSearch, searchFields]);

  // Ordenar
  const sortedData = useMemo(() => {
    if (!sort) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sort.field];
      const bValue = b[sort.field];

      if (aValue < bValue) return sort.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sort.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, sort]);

  // Paginar
  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, page, pageSize]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  // Selección
  const toggleRowSelection = (id: string) => {
    setSelectedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const selectAllRows = () => {
    const allIds = paginatedData.map((item) => item.id);
    setSelectedRows(new Set(allIds));
  };

  const clearSelection = () => {
    setSelectedRows(new Set());
  };

  return {
    // Data
    data: paginatedData,
    totalItems: sortedData.length,
    totalPages,

    // Search
    search,
    setSearch,

    // Sort
    sort,
    setSort,

    // Pagination
    page,
    setPage,
    pageSize,
    setPageSize,

    // Selection
    selectedRows,
    toggleRowSelection,
    selectAllRows,
    clearSelection,
    hasSelection: selectedRows.size > 0,
  };
};
```

### 🌐 Service con Error Handling

```typescript
// services/projectService.ts
import { apiClient } from "@/lib/axios/apiClient";
import type {
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
  ProjectFilters,
} from "@/types/projectTypes";

class ProjectService {
  private baseURL = "/projects";

  async getProjects(filters?: ProjectFilters): Promise<Project[]> {
    try {
      const params = this.buildParams(filters);
      const response = await apiClient.get(this.baseURL, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error, "Error al obtener proyectos");
    }
  }

  async getProject(id: string): Promise<Project> {
    try {
      const response = await apiClient.get(`${this.baseURL}/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error, `Error al obtener proyecto ${id}`);
    }
  }

  async createProject(data: CreateProjectRequest): Promise<Project> {
    try {
      const response = await apiClient.post(this.baseURL, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error, "Error al crear proyecto");
    }
  }

  async updateProject(
    id: string,
    data: UpdateProjectRequest
  ): Promise<Project> {
    try {
      const response = await apiClient.put(`${this.baseURL}/${id}`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error, `Error al actualizar proyecto ${id}`);
    }
  }

  async deleteProject(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.baseURL}/${id}`);
    } catch (error) {
      throw this.handleError(error, `Error al eliminar proyecto ${id}`);
    }
  }

  // Upload de archivos
  async uploadDocument(projectId: string, file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await apiClient.post(
        `${this.baseURL}/${projectId}/documents`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const percentage = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 1)
            );
            // Emitir evento de progreso
            window.dispatchEvent(
              new CustomEvent("uploadProgress", { detail: percentage })
            );
          },
        }
      );

      return response.data.documentUrl;
    } catch (error) {
      throw this.handleError(error, "Error al subir documento");
    }
  }

  private buildParams(filters?: ProjectFilters): Record<string, any> {
    if (!filters) return {};

    const params: Record<string, any> = {};

    if (filters.status && filters.status !== "all") {
      params.status = filters.status;
    }

    if (filters.clientId) {
      params.clientId = filters.clientId;
    }

    if (filters.dateRange) {
      params.startDate = filters.dateRange.start;
      params.endDate = filters.dateRange.end;
    }

    if (filters.search) {
      params.search = filters.search;
    }

    return params;
  }

  private handleError(error: any, defaultMessage: string): Error {
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }

    if (error.message) {
      return new Error(error.message);
    }

    return new Error(defaultMessage);
  }
}

export const projectService = new ProjectService();
```

### 🎨 Componente con Theme y Responsive

```typescript
// components/StatCard.tsx
import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { styled } from "@mui/material/styles";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon?: React.ReactNode;
  color?: "primary" | "secondary" | "success" | "warning" | "error";
}

const StyledCard = styled(Card)<{ color: string }>(({ theme, color }) => ({
  position: "relative",
  overflow: "visible",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: theme.palette[color as keyof typeof theme.palette].main,
  },
}));

const IconWrapper = styled(Box)<{ color: string }>(({ theme, color }) => ({
  position: "absolute",
  top: -10,
  right: 16,
  width: 48,
  height: 48,
  borderRadius: "50%",
  backgroundColor: theme.palette[color as keyof typeof theme.palette].main,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: theme.palette[color as keyof typeof theme.palette].contrastText,
}));

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  icon,
  color = "primary",
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const formatValue = (val: string | number) => {
    if (typeof val === "number") {
      return val.toLocaleString("es-ES");
    }
    return val;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return theme.palette.success.main;
    if (change < 0) return theme.palette.error.main;
    return theme.palette.text.secondary;
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return "↗";
    if (change < 0) return "↘";
    return "→";
  };

  return (
    <StyledCard color={color} elevation={2}>
      <CardContent sx={{ pb: 2 }}>
        {icon && <IconWrapper color={color}>{icon}</IconWrapper>}

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            fontSize: isMobile ? "0.75rem" : "0.875rem",
            fontWeight: 500,
            mb: 1,
          }}
        >
          {title}
        </Typography>

        <Typography
          variant="h4"
          component="div"
          sx={{
            fontWeight: 700,
            fontSize: isMobile ? "1.5rem" : "2rem",
            mb: change !== undefined ? 1 : 0,
          }}
        >
          {formatValue(value)}
        </Typography>

        {change !== undefined && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Typography
              variant="body2"
              sx={{
                color: getChangeColor(change),
                fontWeight: 600,
                fontSize: "0.75rem",
              }}
            >
              {getChangeIcon(change)} {Math.abs(change)}%
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: "0.75rem" }}
            >
              vs mes anterior
            </Typography>
          </Box>
        )}
      </CardContent>
    </StyledCard>
  );
};
```

### 🔔 Hook para Notificaciones

```typescript
// hooks/useNotifications.ts
import { useCallback, useContext } from "react";
import { NotificationContext } from "@/components/common/notificationContext";

export interface NotificationOptions {
  type: "success" | "error" | "warning" | "info";
  title?: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const useNotifications = () => {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }

  const { addNotification, removeNotification } = context;

  const showNotification = useCallback(
    (options: NotificationOptions) => {
      const id = Math.random().toString(36).substr(2, 9);

      addNotification({
        id,
        ...options,
        duration: options.duration || 5000,
      });

      return id;
    },
    [addNotification]
  );

  const showSuccess = useCallback(
    (message: string, title?: string) => {
      return showNotification({
        type: "success",
        message,
        title,
      });
    },
    [showNotification]
  );

  const showError = useCallback(
    (message: string, title?: string) => {
      return showNotification({
        type: "error",
        message,
        title,
        duration: 7000, // Errores duran más tiempo
      });
    },
    [showNotification]
  );

  const showWarning = useCallback(
    (message: string, title?: string) => {
      return showNotification({
        type: "warning",
        message,
        title,
      });
    },
    [showNotification]
  );

  const showInfo = useCallback(
    (message: string, title?: string) => {
      return showNotification({
        type: "info",
        message,
        title,
      });
    },
    [showNotification]
  );

  return {
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeNotification,
  };
};
```

## 🎯 Templates Rápidos

### Nuevo Component Template

```bash
# Crear un nuevo componente con este template
# components/MyComponent.tsx
import React from 'react';
import { Box } from '@mui/material';

interface MyComponentProps {
  // Props aquí
}

export const MyComponent: React.FC<MyComponentProps> = ({
  // Destructuring props
}) => {
  return (
    <Box>
      {/* Contenido del componente */}
    </Box>
  );
};
```

### Nuevo Hook Template

```bash
# hooks/useMyHook.ts
import { useState, useEffect, useCallback } from 'react';

interface UseMyHookOptions {
  // Opciones aquí
}

export const useMyHook = (options?: UseMyHookOptions) => {
  const [state, setState] = useState();

  // Lógica del hook

  return {
    // Valores y funciones a retornar
  };
};
```

### Nueva Página Template

```bash
# pages/MyPage.tsx
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';

export const MyPage = () => {
  return (
    <MainLayout title="Mi Página">
      {/* Contenido de la página */}
    </MainLayout>
  );
};
```
