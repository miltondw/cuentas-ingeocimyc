# 📖 Documentación Frontend - INGEOCIMYC

Sistema integral de gestión para servicios de ingeniería, laboratorio y administración.

## 🚀 Inicio Rápido

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Construir para producción
npm run build
```

## 📚 Navegación de la Documentación

### 🏗️ [Arquitectura](./architecture/README.md)

- [Estructura del Proyecto](./architecture/project-structure.md)
- [Stack Tecnológico](./architecture/tech-stack.md)
- [Patrones de Diseño](./architecture/design-patterns.md)
- [Gestión de Estado](./architecture/state-management.md)

### 🧩 [Componentes](./components/README.md)

- [Componentes Reutilizables](./components/reusable-components.md)
- [Layouts](./components/layouts.md)
- [Patrones de UI](./components/ui-patterns.md)
- [Guía de Estilos](./components/styling-guide.md)

### ⚡ [Features/Módulos](./features/README.md)

- [Autenticación](./features/authentication.md)
- [Administración](./features/admin.md)
- [Financiero](./features/financial.md)
- [Laboratorio](./features/lab.md)
- [Cliente](./features/client.md)

### 🌐 [API y Servicios](./api/README.md)

- [Cliente HTTP](./api/http-client.md)
- [Servicios](./api/services.md)
- [Hooks de React Query](./api/react-query-hooks.md)
- [Manejo de Errores](./api/error-handling.md)

### 📖 [Guías de Desarrollo](./guides/README.md)

- [Configuración del Entorno](./guides/environment-setup.md)
- [Convenciones de Código](./guides/coding-conventions.md)
- [Creación de Nuevos Features](./guides/new-feature-guide.md)
- [Testing](./guides/testing.md)
- [Deployment](./guides/deployment.md)

### 💡 [Ejemplos](./examples/README.md)

- [Componentes de Ejemplo](./examples/component-examples.md)
- [Hooks Personalizados](./examples/custom-hooks.md)
- [Casos de Uso Comunes](./examples/common-use-cases.md)

## 🎯 Características Principales

- **PWA Ready**: Aplicación web progresiva con capacidades offline
- **Responsive Design**: Adaptable a dispositivos móviles y escritorio
- **TypeScript**: Tipado estático para mayor robustez
- **Material Design**: Interfaz moderna siguiendo las pautas de Google
- **State Management**: Gestión eficiente con TanStack Query y Zustand
- **Authentication**: Sistema de autenticación basado en tokens JWT
- **Offline Support**: Sincronización automática cuando se recupera conexión

## �️ Herramientas de Desarrollo

- **ESLint**: Linting de código
- **Prettier**: Formateo automático
- **Vite**: Build tool rápido
- **TypeScript**: Verificación de tipos
- **React DevTools**: Debugging de React
- **TanStack Query DevTools**: Debugging de estado del servidor

## 📋 Scripts Disponibles

```bash
npm run dev          # Desarrollo con hot reload
npm run build        # Build de producción
npm run preview      # Preview del build
npm run lint         # Ejecutar ESLint
npm run lint:fix     # Corregir errores de ESLint automáticamente
npm run type-check   # Verificar tipos de TypeScript
npm run test         # Ejecutar tests
npm run test:watch   # Tests en modo watch
```

## 🤝 Contribución

1. Lee las [convenciones de código](./guides/coding-conventions.md)
2. Sigue la [guía para nuevos features](./guides/new-feature-guide.md)
3. Asegúrate de que los tests pasen
4. Mantén la documentación actualizada

## 📞 Soporte

Para preguntas sobre la implementación o arquitectura, consulta la documentación específica de cada módulo o contacta al equipo de desarrollo.
└── config/ # Configuraciones

```

## 🎯 Arquitectura y Patrones

### Feature-Based Architecture
El proyecto sigue una arquitectura basada en features, donde cada módulo de funcionalidad (`features/`) contiene:

```

features/[feature]/
├── components/ # Componentes específicos del feature
├── hooks/ # Hooks del feature
├── pages/ # Páginas del feature
├── services/ # Servicios API del feature
├── types/ # Tipos específicos
└── providers/ # Context providers (si aplica)

````

### Componentes Reutilizables
Los componentes están organizados en tres niveles:

1. **UI Components** (`components/ui/`) - Componentes básicos
2. **Common Components** (`components/common/`) - Componentes compartidos complejos
3. **Feature Components** (`features/*/components/`) - Componentes específicos

## 🔧 Configuración y Scripts

### Scripts Disponibles
```bash
npm run dev         # Servidor de desarrollo
npm run build       # Build de producción
npm run lint        # Ejecutar ESLint
npm run lint:fix    # Arreglar errores de ESLint
npm run typecheck   # Verificar tipos
npm run preview     # Preview del build
npm run clean       # Limpiar cache
````

### Variables de Entorno

```env
VITE_API_URL=         # URL de la API backend
VITE_APP_ENV=         # Entorno (development/production)
```

## 📋 Guías de Desarrollo

### [🧩 Componentes Reutilizables](./components.md)

- DataTable
- SearchAndFilter
- AdvancedPagination
- LoadingOverlay
- Modales y Diálogos

### [🎨 Patrones de UI](./ui-patterns.md)

- Sistema de tema
- Responsive design
- Layouts
- Formularios

### [🔗 Gestión de Estado](./state-management.md)

- React Query para servidor
- Zustand para cliente
- Context patterns

### [🌐 Servicios y API](./api-services.md)

- Cliente HTTP
- Interceptores
- Manejo de errores
- Caché y sincronización

### [🔐 Autenticación](./authentication.md)

- Sistema de auth
- Protección de rutas
- Roles y permisos

### [📊 Módulos de Funcionalidad](./features.md)

- Admin
- Financial
- Lab
- Client

## 🎯 Buenas Prácticas

### Convenciones de Código

- **Nombres**: camelCase para variables, PascalCase para componentes
- **Archivos**: kebab-case para archivos, PascalCase para componentes
- **Imports**: Usar alias de path (`@/`)

### Estructura de Componentes

```tsx
// 1. Imports (libs primero, locales después)
import React, { useState, useCallback } from "react";
import { Box, Typography } from "@mui/material";
import { CustomComponent } from "@/components/common";

// 2. Interfaces y tipos
interface ComponentProps {
  title: string;
  onAction: () => void;
}

// 3. Componente principal
export const MyComponent: React.FC<ComponentProps> = ({ title, onAction }) => {
  // 4. Hooks
  const [state, setState] = useState();

  // 5. Callbacks
  const handleAction = useCallback(() => {
    onAction();
  }, [onAction]);

  // 6. Render
  return (
    <Box>
      <Typography>{title}</Typography>
    </Box>
  );
};

// 7. Export por defecto (opcional)
export default MyComponent;
```

### Gestión de Estado

- **Servidor**: TanStack Query para datos remotos
- **Cliente**: Zustand para estado global, useState para local
- **Formularios**: React Hook Form con validación

### Performance

- Lazy loading para rutas y componentes pesados
- Memoización con useMemo/useCallback cuando sea necesario
- Paginación y virtualización para listas grandes

## 🚀 PWA Features

La aplicación incluye funcionalidades de Progressive Web App:

- Service Worker para caché offline
- Manifest para instalación
- Notificaciones push
- Sincronización en background

## 📱 Responsive Design

- **Mobile First**: Diseño responsivo desde mobile
- **Breakpoints MUI**: xs, sm, md, lg, xl
- **Grid System**: MUI Grid2 para layouts flexibles

## 🔍 Testing (Próximamente)

Preparado para:

- Unit testing con Jest/Vitest
- Component testing con Testing Library
- E2E testing con Playwright

## 📚 Recursos Adicionales

- [Material UI Documentation](https://mui.com/)
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [React Hook Form](https://react-hook-form.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**Versión:** 1.0.0  
**Última actualización:** Diciembre 2024
