# 🧩 Componentes Reutilizables

Esta documentación cubre los componentes más importantes que puedes reutilizar para evitar duplicación de código.

## 📊 DataTable

Componente principal para mostrar datos tabulares con funcionalidades avanzadas.

### Ubicación

`src/components/common/DataTable.tsx`

### Características

- ✅ Paginación integrada
- ✅ Búsqueda y filtros
- ✅ Ordenamiento por columnas
- ✅ Selección múltiple
- ✅ Acciones por fila
- ✅ Estados de carga
- ✅ Responsive design

### Uso Básico

```tsx
import { DataTable } from "@/components/common/DataTable";

const columns = [
  {
    key: "name",
    label: "Nombre",
    render: (value, row) => <strong>{value}</strong>,
  },
  {
    key: "email",
    label: "Email",
    align: "left" as const,
  },
  {
    key: "status",
    label: "Estado",
    width: 120,
  },
];

const rowActions = [
  {
    label: "Editar",
    icon: <EditIcon />,
    onClick: (row) => console.log("Edit", row),
  },
  {
    label: "Eliminar",
    icon: <DeleteIcon />,
    onClick: (row) => console.log("Delete", row),
    color: "error" as const,
  },
];

function MyTable() {
  return (
    <DataTable
      data={users}
      columns={columns}
      rowActions={rowActions}
      loading={loading}
      title="Lista de Usuarios"
      selectable
      onRowClick={(row) => navigate(`/users/${row.id}`)}
    />
  );
}
```

### Props Principales

```tsx
interface DataTableProps<T> {
  data: T[]; // Datos a mostrar
  columns: ColumnConfig<T>[]; // Configuración de columnas
  loading?: boolean; // Estado de carga
  title?: string; // Título de la tabla

  // Búsqueda y filtros
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filters?: FilterField[];
  filterValues?: Record<string, unknown>;
  onFilterChange?: (
    key: "category" | "hasAdditionalFields" | "createdDateRange",
    value: FilterValue
  ) => void;

  // Selección
  selectable?: boolean;
  selectedRows?: Set<string | number>;
  onSelectionChange?: (selectedIds: Set<string | number>) => void;

  // Acciones
  rowActions?: RowAction<T>[];
  onRowClick?: (row: T) => void;
}
```

## 🔍 SearchAndFilter

Componente para búsqueda y filtrado avanzado.

### Ubicación

`src/components/common/SearchAndFilter.tsx`

### Características

- ✅ Búsqueda con debounce
- ✅ Filtros múltiples
- ✅ Filtros colapsables
- ✅ Conteo de filtros activos
- ✅ Limpiar filtros
- ✅ Responsive design

### Uso Básico

```tsx
import { SearchAndFilter } from "@/components/common/SearchAndFilter";

const filters = [
  {
    key: "status",
    label: "Estado",
    type: "select" as const,
    options: [
      { value: "active", label: "Activo" },
      { value: "inactive", label: "Inactivo" },
    ],
  },
  {
    key: "startDate",
    label: "Fecha inicio",
    type: "date" as const,
  },
  {
    key: "minAmount",
    label: "Monto mínimo",
    type: "number" as const,
    placeholder: "1000",
  },
];

function MySearchFilter() {
  const [searchValue, setSearchValue] = useState("");
  const [filterValues, setFilterValues] = useState({});

  return (
    <SearchAndFilter
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      searchPlaceholder="Buscar proyectos..."
      filters={filters}
      filterValues={filterValues}
      onFilterChange={(key, value) =>
        setFilterValues((prev) => ({ ...prev, [key]: value }))
      }
      showFilterCount
      collapsible
      debounceMs={300}
    />
  );
}
```

### Tipos de Filtros Soportados

```tsx
type FilterType =
  | "text" // Campo de texto
  | "select" // Dropdown
  | "multiselect" // Selección múltiple
  | "date" // Selector de fecha
  | "number" // Campo numérico
  | "boolean"; // Checkbox
```

## 📄 AdvancedPagination

Componente de paginación avanzada con múltiples funcionalidades.

### Ubicación

`src/components/common/AdvancedPagination.tsx`

### Características

- ✅ Navegación de páginas
- ✅ Selector de elementos por página
- ✅ Información de elementos
- ✅ Botones primera/última página
- ✅ Botón de actualizar
- ✅ Responsive design

### Uso Básico

```tsx
import { AdvancedPagination } from "@/components/common/AdvancedPagination";

function MyComponent() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  return (
    <AdvancedPagination
      currentPage={currentPage}
      totalPages={Math.ceil(totalItems / itemsPerPage)}
      totalItems={totalItems}
      itemsPerPage={itemsPerPage}
      onPageChange={setCurrentPage}
      onItemsPerPageChange={setItemsPerPage}
      onRefresh={() => refetch()}
      // Opcionales
      pageSizeOptions={[10, 20, 50, 100]}
      showPageSizeSelector
      showItemsInfo
      showRefreshButton
    />
  );
}
```

### Versión Simple

```tsx
import { SimplePagination } from "@/components/common/AdvancedPagination";

function SimpleExample() {
  return (
    <SimplePagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={setCurrentPage}
    />
  );
}
```

## ⏳ LoadingOverlay

Componente para mostrar estados de carga.

### Ubicación

`src/components/common/LoadingOverlay.tsx`

### Tipos de Loading

```tsx
type LoadingType =
  | "spinner" // Spinner circular
  | "skeleton" // Skeleton loading
  | "linear" // Barra de progreso
  | "dots"; // Puntos animados
```

### Uso Básico

```tsx
import { LoadingOverlay } from "@/components/common/LoadingOverlay";

function MyComponent() {
  return (
    <LoadingOverlay loading={isLoading} type="skeleton">
      <div>
        {/* Tu contenido aquí */}
        <p>Este contenido se muestra cuando no está cargando</p>
      </div>
    </LoadingOverlay>
  );
}
```

### Casos de Uso

```tsx
// Para tablas
<LoadingOverlay loading={loading} type="skeleton">
  <DataTable data={data} columns={columns} />
</LoadingOverlay>

// Para formularios
<LoadingOverlay loading={submitting} type="spinner">
  <form>
    {/* campos del formulario */}
  </form>
</LoadingOverlay>

// Para páginas completas
<LoadingOverlay loading={loading} type="linear" fullScreen>
  <PageContent />
</LoadingOverlay>
```

## 🔔 Sistema de Notificaciones

Hook y contexto para mostrar notificaciones.

### Ubicación

- `src/hooks/useNotifications.ts`
- `src/components/common/notificationContext.ts`

### Uso Básico

```tsx
import { useNotifications } from "@/hooks/useNotifications";

function MyComponent() {
  const { showNotification, showError, showSuccess } = useNotifications();

  const handleAction = async () => {
    try {
      await api.post("/some-action");
      showSuccess("Acción completada exitosamente");
    } catch (error) {
      showError("Error al realizar la acción");
    }
  };

  return <button onClick={handleAction}>Ejecutar Acción</button>;
}
```

### Tipos de Notificaciones

```tsx
// Notificación básica
showNotification({
  type: "info",
  title: "Información",
  message: "Operación completada",
  duration: 3000,
});

// Notificación de éxito
showSuccess("Datos guardados correctamente");

// Notificación de error
showError("Error al conectar con el servidor");

// Notificación de advertencia
showNotification({
  type: "warning",
  message: "Esta acción no se puede deshacer",
  duration: 5000,
});
```

## 🏗️ Layouts

Componentes de layout para estructurar las páginas.

### MainLayout

Layout principal de la aplicación con navegación.

```tsx
import { MainLayout } from "@/components/layout/MainLayout";

function Dashboard() {
  return (
    <MainLayout>
      <div>{/* Contenido de la página */}</div>
    </MainLayout>
  );
}
```

### AuthLayout

Layout para páginas de autenticación.

```tsx
import { AuthLayout } from "@/components/layout/AuthLayout";

function LoginPage() {
  return (
    <AuthLayout title="Iniciar Sesión">
      <LoginForm />
    </AuthLayout>
  );
}
```

### CardLayout

Layout simple con tarjeta centrada.

```tsx
import { CardLayout } from "@/components/layout/CardLayout";

function SimpleForm() {
  return (
    <CardLayout title="Formulario" maxWidth="md">
      <form>{/* campos del formulario */}</form>
    </CardLayout>
  );
}
```

## 📱 Componentes Responsive

### Uso de Grid2

```tsx
import { Grid2 } from "@mui/material";

function ResponsiveGrid() {
  return (
    <Grid2 container spacing={2}>
      <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
        <Card>Contenido 1</Card>
      </Grid2>
      <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
        <Card>Contenido 2</Card>
      </Grid2>
      <Grid2 size={{ xs: 12, sm: 12, md: 4 }}>
        <Card>Contenido 3</Card>
      </Grid2>
    </Grid2>
  );
}
```

### Breakpoints MUI

```tsx
// En JavaScript
const theme = useTheme();
const isMobile = useMediaQuery(theme.breakpoints.down('md'));

// En SX prop
sx={{
  fontSize: { xs: '14px', md: '16px' },
  padding: { xs: 1, sm: 2, md: 3 }
}}
```

## 🎯 Tips para Evitar Duplicación

### 1. Usa los Componentes Base

Antes de crear un nuevo componente, revisa si puedes usar:

- `DataTable` para listas de datos
- `SearchAndFilter` para filtros
- `LoadingOverlay` para estados de carga
- `AdvancedPagination` para navegación

### 2. Extiende en Lugar de Duplicar

```tsx
// ❌ Malo - duplicar código
function UserTable() {
  return <Table>{/* código repetitivo */}</Table>;
}

// ✅ Bueno - extender componente base
function UserTable() {
  const columns = [
    { key: "name", label: "Nombre" },
    { key: "email", label: "Email" },
  ];

  return <DataTable data={users} columns={columns} title="Usuarios" />;
}
```

### 3. Usa Hooks Personalizados

```tsx
// Hook para filtros comunes
function useTableFilters<T>(defaultFilters: T) {
  const [filters, setFilters] = useState(defaultFilters);
  const [search, setSearch] = useState("");

  const updateFilter = (key: keyof T, value: unknown) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
    setSearch("");
  };

  return {
    filters,
    search,
    updateFilter,
    setSearch,
    clearFilters,
  };
}
```

### 4. Configuración de Columnas Reutilizable

```tsx
// utils/tableColumns.ts
export const commonColumns = {
  id: { key: "id", label: "ID", width: 80 },
  createdAt: {
    key: "created_at",
    label: "Fecha Creación",
    render: (value: string) => new Date(value).toLocaleDateString("es-ES"),
  },
  status: {
    key: "status",
    label: "Estado",
    render: (value: string) => (
      <Chip label={value} color={value === "active" ? "success" : "default"} />
    ),
  },
};
```

---

**Próximo:** [🎨 Patrones de UI](./ui-patterns.md)
