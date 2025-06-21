# 🧩 Componentes

Esta sección contiene documentación detallada sobre todos los componentes reutilizables del proyecto.

## 📋 Contenido

- [🔄 Componentes Reutilizables](./reusable-components.md) - Componentes principales que puedes usar en cualquier feature
- [🏗️ Layouts](./layouts.md) - Estructuras de página y navegación
- [🎨 Patrones de UI](./ui-patterns.md) - Patrones comunes de interfaz de usuario
- [✨ Guía de Estilos](./styling-guide.md) - Convenciones de estilos y theming

## 🎯 Componentes por Categoría

### 📊 Datos y Tablas

- **DataTable** - Tabla avanzada con paginación, filtros y acciones
- **AdvancedPagination** - Paginación configurable
- **SearchAndFilter** - Búsqueda y filtros reutilizables

### 📝 Formularios

- **FormField** - Campo de formulario genérico
- **FileUpload** - Subida de archivos con preview
- **DateRangePicker** - Selector de rango de fechas

### 🔄 Estado y Feedback

- **LoadingOverlay** - Overlay de carga
- **ErrorBoundary** - Manejo de errores
- **NotificationSystem** - Sistema de notificaciones

### 🏗️ Layout y Navegación

- **MainLayout** - Layout principal de la aplicación
- **AuthLayout** - Layout para páginas de autenticación
- **Navigation** - Navegación principal

### 🎛️ Controles

- **ConfirmDialog** - Diálogo de confirmación
- **FilterDrawer** - Panel lateral de filtros
- **ActionMenu** - Menú de acciones contextual

## 🔧 Uso de Componentes

### Importación

```typescript
// Componentes comunes
import { DataTable } from "@/components/common/DataTable";
import { LoadingOverlay } from "@/components/common/LoadingOverlay";

// Layouts
import { MainLayout } from "@/components/layout/MainLayout";

// Componentes de UI
import { PageLoadingFallback } from "@/components/ui/PageLoadingFallback";
```

### Principios de Reutilización

1. **Configurabilidad**: Componentes parametrizables vía props
2. **Composabilidad**: Componentes que se pueden combinar
3. **Extensibilidad**: Fácil personalización sin modificar el core
4. **Consistencia**: Mismo look & feel en toda la app
5. **Performance**: Optimizados para re-renders mínimos

## 📦 Estructura de Componentes

```
components/
├── common/              # Componentes compartidos
│   ├── DataTable/      # Componente complejo con sub-componentes
│   │   ├── index.tsx   # Componente principal
│   │   ├── types.ts    # Tipos específicos
│   │   └── hooks.ts    # Hooks internos
│   ├── LoadingOverlay.tsx
│   └── ...
├── layout/             # Layouts de aplicación
│   ├── MainLayout.tsx
│   ├── AuthLayout.tsx
│   └── Navigation.tsx
└── ui/                 # Componentes básicos de UI
    └── PageLoadingFallback.tsx
```

## 🎨 Theming y Estilos

### Uso del Theme

```typescript
import { useTheme } from "@mui/material/styles";

const MyComponent = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.primary.main,
        padding: theme.spacing(2),
        borderRadius: theme.shape.borderRadius,
      }}
    >
      Content
    </Box>
  );
};
```

### Componentes Styled

```typescript
import { styled } from "@mui/material/styles";

const StyledCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(1),
  "&:hover": {
    boxShadow: theme.shadows[4],
  },
}));
```

## 🧪 Testing de Componentes

### Estructura de Tests

```typescript
// DataTable.test.tsx
import { render, screen } from "@testing-library/react";
import { DataTable } from "./DataTable";

describe("DataTable", () => {
  it("renders data correctly", () => {
    render(<DataTable data={mockData} columns={mockColumns} />);

    expect(screen.getByText("Test Data")).toBeInTheDocument();
  });
});
```

## 📋 Checklist para Nuevos Componentes

- [ ] ✅ **TypeScript**: Props tipadas con interfaces
- [ ] 🎨 **Theming**: Usa theme de MUI consistentemente
- [ ] 📱 **Responsive**: Funciona en móviles y desktop
- [ ] ♿ **Accesibilidad**: ARIA labels y keyboard navigation
- [ ] 🧪 **Tests**: Tests unitarios básicos
- [ ] 📚 **Documentación**: Props y ejemplos documentados
- [ ] 🔄 **Reutilización**: Diseñado para múltiples casos de uso
- [ ] ⚡ **Performance**: Memoizado si es necesario
