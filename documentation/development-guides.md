# 📝 Guías de Desarrollo

Documentación práctica para desarrolladores que trabajen en el proyecto.

## 🚀 Setup Inicial

### Prerrequisitos

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Git**
- **VS Code** (recomendado)

### Instalación

```bash
# Clonar el repositorio
git clone [repository-url]
cd cuentas-ingeocimyc

# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env

# Configurar variables de entorno
VITE_API_URL=http://localhost:3000
VITE_APP_ENV=development

# Iniciar servidor de desarrollo
npm run dev
```

### Extensiones de VS Code Recomendadas

```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-json"
  ]
}
```

## 🏗️ Creando Nuevos Features

### 1. Estructura Base

```bash
# Crear nuevo feature
mkdir -p src/features/nuevo-feature/{components,hooks,pages,services,types}

# Estructura resultante:
src/features/nuevo-feature/
├── components/
│   ├── ComponentePrincipal.tsx
│   ├── FormularioCreacion.tsx
│   └── index.ts
├── hooks/
│   ├── useNuevoFeature.ts
│   └── index.ts
├── pages/
│   ├── NuevoFeaturePage.tsx
│   ├── DetalleNuevoFeature.tsx
│   └── index.ts
├── services/
│   └── nuevoFeatureService.ts
├── types/
│   └── nuevoFeature.ts
└── index.ts
```

### 2. Template de Servicio

```tsx
// services/nuevoFeatureService.ts
import { BaseService } from "@/services/api/baseService";
import type {
  NuevoFeature,
  CreateNuevoFeatureRequest,
  NuevoFeatureFilters,
} from "../types/nuevoFeature";

class NuevoFeatureService extends BaseService<
  NuevoFeature,
  CreateNuevoFeatureRequest
> {
  constructor() {
    super("/nuevo-feature");
  }

  async getAll(filters: NuevoFeatureFilters = {}) {
    return this.client.get(`${this.endpoint}`, { params: filters });
  }

  // Métodos específicos del feature
  async getByStatus(status: string) {
    return this.client.get(`${this.endpoint}/status/${status}`);
  }
}

export const nuevoFeatureService = new NuevoFeatureService();
```

### 3. Template de Tipos

```tsx
// types/nuevoFeature.ts
import type { BaseFilters, EntityId } from "@/types/api";

// Entidad principal
export interface NuevoFeature {
  id: EntityId;
  nombre: string;
  descripcion: string;
  estado: "activo" | "inactivo";
  fechaCreacion: string;
  fechaActualizacion: string;
}

// Request para crear
export interface CreateNuevoFeatureRequest {
  nombre: string;
  descripcion: string;
  estado?: string;
}

// Request para actualizar
export interface UpdateNuevoFeatureRequest
  extends Partial<CreateNuevoFeatureRequest> {}

// Filtros
export interface NuevoFeatureFilters extends BaseFilters {
  estado?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  search?: string;
}

// Respuesta de la API
export interface NuevoFeatureResponse {
  data: NuevoFeature[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

### 4. Template de Hook

```tsx
// hooks/useNuevoFeature.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { nuevoFeatureService } from "../services/nuevoFeatureService";
import { useNotifications } from "@/hooks/useNotifications";
import type {
  NuevoFeatureFilters,
  CreateNuevoFeatureRequest,
} from "../types/nuevoFeature";

export function useNuevoFeatures(filters: NuevoFeatureFilters = {}) {
  return useQuery({
    queryKey: ["nuevo-features", filters],
    queryFn: () => nuevoFeatureService.getAll(filters),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

export function useNuevoFeature(id: number) {
  return useQuery({
    queryKey: ["nuevo-feature", id],
    queryFn: () => nuevoFeatureService.getById(id),
    enabled: !!id,
  });
}

export function useCreateNuevoFeature() {
  const queryClient = useQueryClient();
  const { showNotification } = useNotifications();

  return useMutation({
    mutationFn: (data: CreateNuevoFeatureRequest) =>
      nuevoFeatureService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["nuevo-features"]);
      showNotification({
        type: "success",
        message: "Elemento creado exitosamente",
      });
    },
    onError: () => {
      showNotification({
        type: "error",
        message: "Error al crear elemento",
      });
    },
  });
}
```

### 5. Template de Componente Principal

```tsx
// components/NuevoFeatureTable.tsx
import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { DataTable } from "@/components/common/DataTable";
import { SearchAndFilter } from "@/components/common/SearchAndFilter";
import { useNuevoFeatures } from "../hooks/useNuevoFeature";
import { NuevoFeatureForm } from "./NuevoFeatureForm";
import type { NuevoFeatureFilters } from "../types/nuevoFeature";

export const NuevoFeatureTable: React.FC = () => {
  const [filters, setFilters] = useState<NuevoFeatureFilters>({});
  const [searchValue, setSearchValue] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const { data, isLoading } = useNuevoFeatures(filters);

  const columns = [
    {
      key: "id",
      label: "ID",
      width: 80,
    },
    {
      key: "nombre",
      label: "Nombre",
    },
    {
      key: "descripcion",
      label: "Descripción",
    },
    {
      key: "estado",
      label: "Estado",
      render: (value: string) => (
        <Chip
          label={value}
          color={value === "activo" ? "success" : "default"}
        />
      ),
    },
    {
      key: "fechaCreacion",
      label: "Fecha Creación",
      render: (value: string) => new Date(value).toLocaleDateString("es-ES"),
    },
  ];

  const filterFields = [
    {
      key: "estado",
      label: "Estado",
      type: "select" as const,
      options: [
        { value: "activo", label: "Activo" },
        { value: "inactivo", label: "Inactivo" },
      ],
    },
    {
      key: "fechaDesde",
      label: "Fecha Desde",
      type: "date" as const,
    },
    {
      key: "fechaHasta",
      label: "Fecha Hasta",
      type: "date" as const,
    },
  ];

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4">Nuevo Feature</Typography>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowCreateDialog(true)}
        >
          Crear Nuevo
        </Button>
      </Box>

      <SearchAndFilter
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        filters={filterFields}
        filterValues={filters}
        onFilterChange={handleFilterChange}
      />

      <DataTable
        data={data?.data || []}
        columns={columns}
        loading={isLoading}
        emptyMessage="No hay elementos disponibles"
      />

      {/* Modal de creación */}
      <Dialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Crear Nuevo Elemento</DialogTitle>
        <DialogContent>
          <NuevoFeatureForm
            onSuccess={() => {
              setShowCreateDialog(false);
            }}
            onCancel={() => setShowCreateDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};
```

## 🎨 Convenciones de Código

### Nombres de Archivos

```
PascalCase: Componentes React (UserProfile.tsx)
camelCase: Hooks, utilidades (useAuth.ts, formatDate.ts)
kebab-case: Páginas, directorios (user-profile/, login-page/)
UPPER_CASE: Constantes (API_ENDPOINTS.ts)
```

### Importaciones

```tsx
// Orden de importaciones:
// 1. React y librerías externas
import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";

// 2. Importaciones internas (usando alias @/)
import { DataTable } from "@/components/common/DataTable";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { formatDate } from "@/utils/formatters";

// 3. Importaciones relativas
import { UserForm } from "./UserForm";
import type { User } from "../types/user";
```

### Estructura de Componentes

```tsx
// Template estándar para componentes
import React from 'react';
// ... otras importaciones

// 1. Interfaces
interface ComponentProps {
  title: string;
  onAction: (data: any) => void;
}

// 2. Constantes/Configuración
const DEFAULT_CONFIG = {
  pageSize: 10,
  sortBy: 'created_at'
};

// 3. Componente principal
export const MyComponent: React.FC<ComponentProps> = ({
  title,
  onAction
}) => {
  // 4. Hooks de estado
  const [loading, setLoading] = useState(false);

  // 5. Hooks personalizados
  const { data, isLoading } = useQuery(...);

  // 6. Callbacks y handlers
  const handleSubmit = useCallback((data) => {
    onAction(data);
  }, [onAction]);

  // 7. Effects
  useEffect(() => {
    // lógica de effect
  }, []);

  // 8. Render helpers (si son complejos)
  const renderContent = () => {
    if (isLoading) return <Loading />;
    return <Content />;
  };

  // 9. Return principal
  return (
    <Box>
      <Typography variant="h4">{title}</Typography>
      {renderContent()}
    </Box>
  );
};

// 10. Export por defecto (opcional)
export default MyComponent;
```

## 🔍 Testing (Configuración Futura)

### Setup de Testing

```bash
# Instalar dependencias de testing
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest

# Configuración en vite.config.ts
/// <reference types="vitest" />
import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
});
```

### Template de Test

```tsx
// __tests__/MyComponent.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MyComponent } from "../MyComponent";

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("MyComponent", () => {
  test("renders correctly", () => {
    render(<MyComponent title="Test" onAction={vi.fn()} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText("Test")).toBeInTheDocument();
  });

  test("handles user interaction", () => {
    const mockAction = vi.fn();
    render(<MyComponent title="Test" onAction={mockAction} />, {
      wrapper: createWrapper(),
    });

    fireEvent.click(screen.getByRole("button"));
    expect(mockAction).toHaveBeenCalled();
  });
});
```

## 🚨 Debugging

### React Query DevTools

```tsx
// En App.tsx (solo en desarrollo)
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <YourApp />
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
```

### Debug Utils

```tsx
// utils/debugUtils.ts
export const debugUtils = {
  logQuery: (queryKey: string[], data: any) => {
    if (process.env.NODE_ENV === "development") {
      console.group(`🔍 Query: ${queryKey.join(" → ")}`);
      console.log("Data:", data);
      console.groupEnd();
    }
  },

  logMutation: (mutation: string, variables: any, result?: any) => {
    if (process.env.NODE_ENV === "development") {
      console.group(`🚀 Mutation: ${mutation}`);
      console.log("Variables:", variables);
      if (result) console.log("Result:", result);
      console.groupEnd();
    }
  },

  logError: (context: string, error: any) => {
    console.group(`❌ Error in ${context}`);
    console.error(error);
    console.groupEnd();
  },
};

// Uso en componentes
const { data } = useQuery({
  queryKey: ["users"],
  queryFn: () => {
    const result = userService.getAll();
    debugUtils.logQuery(["users"], result);
    return result;
  },
});
```

## 📦 Build y Deploy

### Build de Producción

```bash
# Build optimizado
npm run build

# Preview del build
npm run preview

# Análisis del bundle
npm run build -- --analyze
```

### Variables de Entorno por Ambiente

```bash
# .env.development
VITE_API_URL=http://localhost:3000
VITE_APP_ENV=development

# .env.production
VITE_API_URL=https://api.ingeocimyc.com
VITE_APP_ENV=production

# .env.staging
VITE_API_URL=https://staging-api.ingeocimyc.com
VITE_APP_ENV=staging
```

## 🔧 Herramientas de Desarrollo

### Scripts Útiles

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --ext ts,tsx --fix",
    "typecheck": "tsc --noEmit",
    "clean": "rm -rf dist node_modules/.vite",
    "analyze": "vite build -- --analyze"
  }
}
```

### Configuración de ESLint

```json
{
  "extends": [
    "@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
    "plugin:@tanstack/eslint-plugin-query/recommended"
  ],
  "rules": {
    "react-hooks/exhaustive-deps": "warn",
    "@typescript-eslint/no-unused-vars": "warn",
    "@typescript-eslint/explicit-function-return-type": "off"
  }
}
```

## 🎯 Checklist para PRs

### Antes de crear PR

- [ ] ✅ Código compila sin errores (`npm run build`)
- [ ] ✅ Linting pasa (`npm run lint`)
- [ ] ✅ TypeScript checks pasan (`npm run typecheck`)
- [ ] ✅ Componentes son responsive
- [ ] ✅ Loading states implementados
- [ ] ✅ Error handling implementado
- [ ] ✅ Tipos TypeScript definidos
- [ ] ✅ Hooks de React Query configurados
- [ ] ✅ Notificaciones de éxito/error
- [ ] ✅ Documentación actualizada (si aplica)

### Template de PR

```markdown
## 📝 Descripción

Breve descripción de los cambios realizados.

## 🎯 Tipo de cambio

- [ ] ✨ Nuevo feature
- [ ] 🐛 Bug fix
- [ ] 🔧 Refactor
- [ ] 📚 Documentación
- [ ] 🎨 Mejoras de UI

## 🧪 Testing

- [ ] Probado en Chrome
- [ ] Probado en móvil
- [ ] Probado estados de loading
- [ ] Probado manejo de errores

## 📱 Screenshots (si aplica)

[Adjuntar screenshots de cambios visuales]

## 📋 Checklist

- [ ] El código sigue las convenciones del proyecto
- [ ] Los cambios están tipados correctamente
- [ ] Se añadieron las notificaciones apropiadas
- [ ] El componente es responsive
```

---

**¡Feliz desarrollo! 🚀**
