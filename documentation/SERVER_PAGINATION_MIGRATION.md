# Guía de Migración a Paginación de Servidor

## Formato de API Soportado

Este sistema está diseñado para trabajar con APIs que retornan datos en el siguiente formato estándar:

```json
{
  "data": [...],     // Array de elementos
  "total": 13,       // Total de elementos en todas las páginas
  "page": 1,         // Página actual
  "limit": 10        // Elementos por página
}
```

## Pasos para Migrar una Tabla Existente

### 1. Actualizar el Servicio de API

Si tu servicio no soporta este formato, agrégalo:

```typescript
// En tu servicio (ej: projectsService.ts)
export class ProjectsService {
  // ...métodos existentes...

  /**
   * Nuevo método con paginación de servidor
   */
  async getProjectsPaginated(
    page: number = 1,
    limit: number = 10,
    filters?: Record<string, any>
  ): Promise<{
    data: Project[];
    total: number;
    page: number;
    limit: number;
  }> {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", limit.toString());

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, String(value));
        }
      });
    }

    const response = await api.get<{
      data: Project[];
      total: number;
      page: number;
      limit: number;
    }>(`/projects?${params.toString()}`);

    return response.data;
  }
}
```

### 2. Crear un Hook Personalizado

Crea un hook que combine react-query con el hook de paginación de servidor:

```typescript
// hooks/useProjectsPaginated.ts
import { useQuery } from "@tanstack/react-query";
import { useServerPagination } from "@/hooks/useServerPagination";
import { projectsService } from "@/api/services";

export const useProjectsPaginated = ({
  page,
  limit,
  filters,
  enabled = true,
}) => {
  const queryResult = useQuery({
    queryKey: ["projects-paginated", page, limit, filters],
    queryFn: () => projectsService.getProjectsPaginated(page, limit, filters),
    enabled,
  });

  return useServerPagination({
    apiResponse: queryResult.data,
    isLoading: queryResult.isLoading,
    error: queryResult.error,
  });
};
```

### 3. Migrar el Componente de Página

#### ANTES (Paginación Cliente):

```tsx
const ProjectsPage = () => {
  const { data: allProjects, isLoading } = useAllProjects();
  const [searchValue, setSearchValue] = useState("");

  // Filtrar en el cliente
  const filteredProjects =
    allProjects?.filter((project) => project.name.includes(searchValue)) || [];

  // Paginación en el cliente
  const { paginatedData, paginationData, setPage, setItemsPerPage } =
    usePagination({
      data: filteredProjects,
      initialItemsPerPage: 10,
    });

  return (
    <>
      <SearchField value={searchValue} onChange={setSearchValue} />

      <DataTable data={paginatedData} columns={columns} loading={isLoading} />

      <DataTablePagination
        paginationData={paginationData}
        onPageChange={setPage}
        onRowsPerPageChange={setItemsPerPage}
      />
    </>
  );
};
```

#### DESPUÉS (Paginación Servidor):

```tsx
const ProjectsPage = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchValue, setSearchValue] = useState("");

  // Los filtros se envían al servidor
  const { data, isLoading, paginationData, isEmpty } = useProjectsPaginated({
    page,
    limit,
    filters: { search: searchValue },
  });

  // Resetear página cuando cambien los filtros
  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    setPage(1); // ¡IMPORTANTE!
  };

  return (
    <>
      <SearchField value={searchValue} onChange={handleSearchChange} />

      <DataTable
        data={data} // Datos ya vienen paginados del servidor
        columns={columns}
        loading={isLoading}
      />

      {!isEmpty && (
        <DataTablePagination
          paginationData={paginationData}
          onPageChange={setPage}
          onRowsPerPageChange={setLimit}
        />
      )}
    </>
  );
};
```

## Diferencias Clave

### Paginación Cliente vs Servidor

| Aspecto            | Cliente                   | Servidor               |
| ------------------ | ------------------------- | ---------------------- |
| **Datos cargados** | Todos a la vez            | Solo página actual     |
| **Filtros**        | Se aplican en el frontend | Se envían a la API     |
| **Performance**    | Lenta con muchos datos    | Rápida siempre         |
| **Búsqueda**       | Instantánea               | Requiere llamada a API |
| **Memoria**        | Usa más memoria           | Usa menos memoria      |

### Cuándo Usar Cada Una

**Paginación Cliente:**

- ✅ Conjuntos de datos pequeños (< 1000 elementos)
- ✅ Búsqueda instantánea requerida
- ✅ Funcionalidad offline
- ✅ API simple sin paginación

**Paginación Servidor:**

- ✅ Conjuntos de datos grandes (> 1000 elementos)
- ✅ Performance es crítica
- ✅ API ya soporta paginación
- ✅ Filtros complejos en base de datos

## Ejemplo Completo con Filtros

```tsx
const ProjectsWithFiltersPage = () => {
  // Estados de paginación
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Estados de filtros
  const [searchValue, setSearchValue] = useState("");
  const [filters, setFilters] = useState({
    estado: "all",
    minCosto: "",
    maxCosto: "",
  });

  // Hook con paginación de servidor
  const { data, isLoading, paginationData, isEmpty } = useProjectsPaginated({
    page,
    limit,
    filters: {
      search: searchValue || undefined,
      estado: filters.estado !== "all" ? filters.estado : undefined,
      minCosto: filters.minCosto ? Number(filters.minCosto) : undefined,
      maxCosto: filters.maxCosto ? Number(filters.maxCosto) : undefined,
    },
  });

  // Handlers que resetean la página
  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    setPage(1);
  };

  const handleFilterChange = (key: string, value: unknown) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  return (
    <>
      <SearchAndFilter
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        filters={filterFields}
        filterValues={filters}
        onFilterChange={handleFilterChange}
      />

      <DataTable
        data={data}
        columns={columns}
        keyField="id"
        loading={isLoading}
      />

      {!isEmpty && (
        <DataTablePagination
          paginationData={paginationData}
          onPageChange={setPage}
          onRowsPerPageChange={setLimit}
        />
      )}
    </>
  );
};
```

## Consideraciones Importantes

### 1. Reset de Página

Siempre resetea la página a 1 cuando cambien los filtros:

```tsx
const handleFilterChange = (newFilter) => {
  setFilters(newFilter);
  setPage(1); // ¡CRÍTICO!
};
```

### 2. Estados de Carga

El hook `useServerPagination` maneja automáticamente los estados:

```tsx
const { data, isLoading, isEmpty, error } = useServerPagination(queryResult);

// isEmpty = true cuando no hay datos y no está cargando
// isLoading = true durante las llamadas a la API
// error = contiene el error si algo falló
```

### 3. Keys de React Query

Incluye todos los parámetros que afectan la consulta:

```tsx
queryKey: ["projects-paginated", page, limit, filters];
```

### 4. Optimización

- Usa `staleTime` para evitar requests innecesarios
- Usa `gcTime` para controlar el cache
- Considera debouncing para búsquedas

```tsx
const { queryResult } = useQuery({
  queryKey: ["projects", page, limit, debouncedSearch],
  queryFn: () => fetchProjects(page, limit, debouncedSearch),
  staleTime: 5 * 60 * 1000, // 5 minutos
  gcTime: 10 * 60 * 1000, // 10 minutos
});
```

## Debugging

Para debuggear problemas de paginación:

```tsx
// Agregar logs temporales
console.log("Pagination Data:", paginationData);
console.log("API Response:", queryResult.data);
console.log("Current filters:", { page, limit, filters });
```

## Ejemplos de APIs Compatibles

El sistema funciona con cualquier API que retorne:

```json
{
  "data": [
    /* elementos */
  ],
  "total": 150,
  "page": 2,
  "limit": 25
}
```

URLs de ejemplo:

- `GET /api/projects?page=1&limit=10`
- `GET /api/projects?page=2&limit=25&search=estudio&estado=activo`
- `GET /api/projects?page=1&limit=50&minCosto=1000000&maxCosto=5000000`
