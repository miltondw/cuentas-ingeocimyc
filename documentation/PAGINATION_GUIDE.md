# Guía de Paginación y Tablas de Datos

## Resumen

Esta guía documenta el sistema de paginación reutilizable y el componente DataTable optimizado que han sido implementados para mejorar la experiencia de usuario en las tablas del sistema.

## Componentes Principales

### 1. DataTable (`src/components/common/DataTable.tsx`)

Componente de tabla reutilizable con las siguientes características:

- **Responsive Design**: Se adapta a diferentes tamaños de pantalla
- **Sticky Headers**: Encabezados fijos al hacer scroll
- **Manejo de Texto Largo**: Trunca texto largo con tooltips
- **Acciones por Fila**: Botones de acción configurables
- **Click en Filas**: Navegación configurable
- **Estados de Carga y Vacío**: Indicadores visuales apropiados

#### Propiedades

```typescript
interface DataTableProps<T> {
  data: T[];
  columns: ColumnConfig[];
  keyField?: keyof T | string;
  rowActions?: RowAction[];
  loading?: boolean;
  title?: string;
  emptyMessage?: string;
  onRowClick?: (row: T, index: number) => void;
  maxHeight?: string | number;
  stickyHeader?: boolean;
  showRowNumber?: boolean;
}
```

#### Ejemplo de Uso

```tsx
import {
  DataTable,
  ColumnConfig,
  RowAction,
} from "@/components/common/DataTable";

const columns: ColumnConfig[] = [
  {
    key: "id",
    label: "ID",
    sortable: true,
  },
  {
    key: "name",
    label: "Nombre",
    sortable: true,
    render: (value) => <strong>{value}</strong>,
  },
  {
    key: "status",
    label: "Estado",
    render: (value) => (
      <Chip label={value} color={value === "active" ? "success" : "error"} />
    ),
  },
];

const rowActions: RowAction[] = [
  {
    key: "edit",
    label: "Editar",
    icon: <EditIcon />,
    action: (row) => navigate(`/edit/${row.id}`),
  },
  {
    key: "delete",
    label: "Eliminar",
    icon: <DeleteIcon />,
    color: "error",
    action: (row) => handleDelete(row),
  },
];

<DataTable
  data={users}
  columns={columns}
  keyField="id"
  rowActions={rowActions}
  title="Lista de Usuarios"
  onRowClick={(user) => navigate(`/users/${user.id}`)}
/>;
```

### 2. DataTablePagination (`src/components/common/DataTablePagination.tsx`)

Componente de paginación reutilizable que se adapta a diferentes dispositivos.

#### Características

- **Modo Responsivo**: Vista compacta en móviles, completa en desktop
- **Navegación Completa**: Primera, anterior, siguiente, última página
- **Selección de Elementos por Página**: Dropdown configurable
- **Información de Estado**: Muestra elementos actuales del total

#### Propiedades

```typescript
interface DataTablePaginationProps {
  paginationData: PaginationData;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  rowsPerPageOptions?: number[];
  labelRowsPerPage?: string;
  showFirstLastButtons?: boolean;
  showRowsPerPage?: boolean;
  compact?: boolean;
}
```

#### Ejemplo de Uso

```tsx
import DataTablePagination from "@/components/common/DataTablePagination";

<DataTablePagination
  paginationData={paginationData}
  onPageChange={setPage}
  onRowsPerPageChange={setItemsPerPage}
  rowsPerPageOptions={[5, 10, 25, 50]}
  labelRowsPerPage="Elementos por página:"
  showFirstLastButtons={true}
  showRowsPerPage={true}
/>;
```

### 3. usePagination Hook (`src/hooks/usePagination.ts`)

Hook personalizado para manejar la lógica de paginación.

#### Características

- **Paginación Cliente**: Manejo automático de datos locales
- **Paginación Servidor**: Soporte para APIs paginadas
- **Navegación Inteligente**: Métodos convenientes para navegación
- **Persistencia de Estado**: Mantiene estado al cambiar filtros

#### Propiedades

```typescript
interface UsePaginationProps {
  data: unknown[];
  initialPage?: number;
  initialItemsPerPage?: number;
  serverSide?: boolean;
  totalItems?: number;
  totalPages?: number;
}
```

#### Ejemplo de Uso

```tsx
import { usePagination } from "@/hooks/usePagination";

const {
  paginatedData,
  paginationData,
  setPage,
  setItemsPerPage,
  goToFirstPage,
} = usePagination({
  data: filteredData,
  initialPage: 1,
  initialItemsPerPage: 10,
});

// Resetear página al cambiar filtros
const handleFilterChange = (newFilters) => {
  setFilters(newFilters);
  goToFirstPage();
};
```

## Patrones de Implementación

### 1. Tabla Simple con Paginación

```tsx
const MyTablePage = () => {
  const [searchValue, setSearchValue] = useState("");
  const { data, isLoading } = useMyData();

  // Filtrar datos
  const filteredData =
    data?.filter((item) =>
      item.name.toLowerCase().includes(searchValue.toLowerCase())
    ) || [];

  // Paginación
  const {
    paginatedData,
    paginationData,
    setPage,
    setItemsPerPage,
    goToFirstPage,
  } = usePagination({
    data: filteredData,
    initialItemsPerPage: 10,
  });

  // Resetear página al buscar
  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    goToFirstPage();
  };

  return (
    <>
      <SearchField value={searchValue} onChange={handleSearchChange} />

      <DataTable
        data={paginatedData}
        columns={columns}
        keyField="id"
        loading={isLoading}
      />

      {paginationData.totalItems > 0 && (
        <DataTablePagination
          paginationData={paginationData}
          onPageChange={setPage}
          onRowsPerPageChange={setItemsPerPage}
        />
      )}
    </>
  );
};
```

### 2. Tabla con Paginación de Servidor

```tsx
const MyServerTablePage = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { data, isLoading } = useMyServerData({ page, limit });

  const paginationData = {
    currentPage: page,
    totalPages: data?.meta.totalPages || 0,
    totalItems: data?.meta.totalItems || 0,
    itemsPerPage: limit,
    startItem: (page - 1) * limit + 1,
    endItem: Math.min(page * limit, data?.meta.totalItems || 0),
  };

  return (
    <>
      <DataTable
        data={data?.items || []}
        columns={columns}
        keyField="id"
        loading={isLoading}
      />

      <DataTablePagination
        paginationData={paginationData}
        onPageChange={setPage}
        onRowsPerPageChange={setLimit}
      />
    </>
  );
};
```

## Migración desde Tablas Anteriores

### Antes (MUI Table)

```tsx
<TableContainer>
  <Table>
    <TableHead>
      <TableRow>
        <TableCell>Nombre</TableCell>
        <TableCell>Estado</TableCell>
        <TableCell>Acciones</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {data.map((row) => (
        <TableRow key={row.id}>
          <TableCell>{row.name}</TableCell>
          <TableCell>{row.status}</TableCell>
          <TableCell>
            <IconButton onClick={() => edit(row)}>
              <EditIcon />
            </IconButton>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</TableContainer>

<TablePagination
  component="div"
  count={total}
  page={page}
  onPageChange={handlePageChange}
  rowsPerPage={rowsPerPage}
  onRowsPerPageChange={handleRowsPerPageChange}
/>
```

### Después (DataTable)

```tsx
const columns: ColumnConfig[] = [
  { key: 'name', label: 'Nombre', sortable: true },
  {
    key: 'status',
    label: 'Estado',
    render: (value) => <Chip label={value} />
  },
];

const rowActions: RowAction[] = [
  {
    key: 'edit',
    label: 'Editar',
    icon: <EditIcon />,
    action: (row) => edit(row),
  },
];

<DataTable
  data={paginatedData}
  columns={columns}
  keyField="id"
  rowActions={rowActions}
/>

<DataTablePagination
  paginationData={paginationData}
  onPageChange={setPage}
  onRowsPerPageChange={setItemsPerPage}
/>
```

## Beneficios de la Nueva Implementación

1. **Reutilización**: Componentes y lógica reutilizables en toda la aplicación
2. **Consistencia**: UX uniforme en todas las tablas
3. **Responsive**: Adaptación automática a diferentes dispositivos
4. **Accesibilidad**: Mejores prácticas de accesibilidad implementadas
5. **Mantenimiento**: Código más limpio y fácil de mantener
6. **Performance**: Optimizaciones para grandes conjuntos de datos
7. **Flexibilidad**: Configuración fácil para diferentes casos de uso

## Páginas Migradas

Las siguientes páginas ya han sido migradas al nuevo sistema:

- ✅ `ServicesManagementPage` - Panel de administración de servicios
- ✅ `ProjectsDashboard` - Dashboard de proyectos
- ✅ `TablaGastosProject` - Tabla de gastos por proyecto
- ✅ `TablaUtilidades` - Tabla de utilidades
- ✅ `ReviewAndConfirmForm` - Formulario de revisión y confirmación

## Páginas Pendientes de Migración

Las siguientes páginas aún utilizan el sistema anterior y se recomienda migrarlas:

- 🔄 `ServiceRequestsManagementPage` - Gestión de solicitudes de servicio
- 🔄 `CategoriesManagementPage` - Gestión de categorías
- 🔄 `GastosMes` - Gastos mensuales
- 🔄 `PerfilDeSuelos` - Perfiles de suelos
- 🔄 `ApiquesDeSuelos` - Apiques de suelos

## Consideraciones Técnicas

### Keys Únicos en Filas

Es importante especificar `keyField` para evitar warnings de React:

```tsx
<DataTable
  data={data}
  columns={columns}
  keyField="id" // O cualquier campo único
/>
```

### Texto Largo

El componente automáticamente trunca texto largo y muestra tooltips:

```tsx
const columns: ColumnConfig[] = [
  {
    key: "description",
    label: "Descripción",
    maxWidth: 200, // Ancho máximo antes de truncar
  },
];
```

### Performance

Para grandes conjuntos de datos, considera usar paginación de servidor:

```tsx
const { paginatedData, paginationData } = usePagination({
  data: [], // Datos vacíos en modo servidor
  serverSide: true,
  totalItems: serverData.total,
  totalPages: serverData.pages,
});
```

## Troubleshooting

### Problema: Warning sobre keys duplicadas

**Solución**: Asegúrate de especificar `keyField` con un campo único.

### Problema: Paginación no se resetea al filtrar

**Solución**: Usa `goToFirstPage()` en los handlers de filtros.

### Problema: Tabla no es responsive

**Solución**: Verifica que el contenedor tenga suficiente espacio y considera usar `maxHeight`.

### Problema: Tooltips no aparecen

**Solución**: Asegúrate de que las celdas con texto largo tengan `maxWidth` definido en la configuración de columna.

## Paginación del Lado del Servidor

### Formato de API Soportado

El sistema soporta APIs que devuelven datos en el siguiente formato:

```json
{
  "data": [...],        // Array de elementos
  "total": 13,          // Total de elementos en todas las páginas
  "page": 1,            // Página actual
  "limit": 10           // Elementos por página
}
```

### Ejemplo Completo con API

```tsx
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DataTable, ColumnConfig } from "@/components/common/DataTable";
import DataTablePagination from "@/components/common/DataTablePagination";

interface ApiResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

interface Project {
  id: number;
  fecha: string;
  solicitante: string;
  nombreProyecto: string;
  costoServicio: string;
  estado: string;
}

const ProjectsPage = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Hook para llamar a la API
  const { data: apiResponse, isLoading } = useQuery<ApiResponse<Project>>({
    queryKey: ["projects", page, limit],
    queryFn: () =>
      fetch(`/api/projects?page=${page}&limit=${limit}`).then((res) =>
        res.json()
      ),
  });

  // Configurar datos de paginación
  const paginationData = {
    currentPage: apiResponse?.page || 1,
    totalPages: Math.ceil((apiResponse?.total || 0) / limit),
    totalItems: apiResponse?.total || 0,
    itemsPerPage: limit,
    startItem: apiResponse?.total === 0 ? 0 : (page - 1) * limit + 1,
    endItem: Math.min(page * limit, apiResponse?.total || 0),
  };

  const columns: ColumnConfig[] = [
    { key: "id", label: "ID", sortable: true },
    {
      key: "nombreProyecto",
      label: "Proyecto",
      render: (value) => (
        <Typography variant="body2" sx={{ maxWidth: 200 }}>
          {value}
        </Typography>
      ),
    },
    { key: "solicitante", label: "Solicitante" },
    {
      key: "costoServicio",
      label: "Costo",
      render: (value) => `$${Number(value).toLocaleString()}`,
    },
    {
      key: "estado",
      label: "Estado",
      render: (value) => (
        <Chip
          label={value}
          color={value === "completado" ? "success" : "warning"}
        />
      ),
    },
  ];

  return (
    <>
      <DataTable
        data={apiResponse?.data || []}
        columns={columns}
        keyField="id"
        loading={isLoading}
        title="Proyectos"
        emptyMessage="No hay proyectos disponibles"
      />

      {paginationData.totalItems > 0 && (
        <DataTablePagination
          paginationData={paginationData}
          onPageChange={setPage}
          onRowsPerPageChange={setLimit}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="Proyectos por página:"
          showFirstLastButtons={true}
          showRowsPerPage={true}
        />
      )}
    </>
  );
};
```

### Hook Personalizado para APIs con este Formato

También puedes crear un hook personalizado para manejar este tipo de APIs:

```tsx
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { PaginationData } from "@/components/common/DataTablePagination";

interface UseServerPaginationProps {
  queryKey: string[];
  queryFn: () => Promise<ApiResponse<any>>;
  page: number;
  limit: number;
}

interface UseServerPaginationReturn<T> {
  data: T[];
  isLoading: boolean;
  error: Error | null;
  paginationData: PaginationData;
}

export const useServerPagination = <T,>({
  queryKey,
  queryFn,
  page,
  limit,
}: UseServerPaginationProps): UseServerPaginationReturn<T> => {
  const {
    data: apiResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey,
    queryFn,
  });

  const paginationData = useMemo((): PaginationData => {
    const total = apiResponse?.total || 0;
    const currentPage = apiResponse?.page || 1;
    const itemsPerPage = apiResponse?.limit || limit;

    return {
      currentPage,
      totalPages: Math.ceil(total / itemsPerPage),
      totalItems: total,
      itemsPerPage,
      startItem: total === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1,
      endItem: Math.min(currentPage * itemsPerPage, total),
    };
  }, [apiResponse, limit]);

  return {
    data: apiResponse?.data || [],
    isLoading,
    error,
    paginationData,
  };
};

// Uso del hook
const ProjectsPage = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { data, isLoading, paginationData } = useServerPagination<Project>({
    queryKey: ["projects", page, limit],
    queryFn: () =>
      fetch(`/api/projects?page=${page}&limit=${limit}`).then((res) =>
        res.json()
      ),
    page,
    limit,
  });

  return (
    <>
      <DataTable
        data={data}
        columns={columns}
        keyField="id"
        loading={isLoading}
      />

      <DataTablePagination
        paginationData={paginationData}
        onPageChange={setPage}
        onRowsPerPageChange={setLimit}
      />
    </>
  );
};
```
