# 📁 Estructura del Proyecto

## 🌳 Árbol de Directorios

```
src/
├── 📁 components/           # Componentes reutilizables
│   ├── 📁 common/          # Componentes compartidos entre features
│   │   ├── DataTable.tsx   # Tabla de datos genérica
│   │   ├── SearchAndFilter.tsx # Búsqueda y filtros
│   │   ├── AdvancedPagination.tsx # Paginación avanzada
│   │   ├── LoadingOverlay.tsx # Overlay de carga
│   │   └── ErrorBoundary.tsx # Manejo de errores
│   ├── 📁 layout/          # Layouts de la aplicación
│   │   ├── MainLayout.tsx  # Layout principal
│   │   ├── AuthLayout.tsx  # Layout para autenticación
│   │   └── Navigation.tsx  # Navegación principal
│   └── 📁 ui/              # Componentes básicos de UI
│       └── PageLoadingFallback.tsx
├── 📁 features/            # Módulos por funcionalidad
│   ├── 📁 auth/           # Autenticación
│   │   ├── 📁 components/ # Componentes específicos
│   │   ├── 📁 hooks/      # Hooks del módulo
│   │   ├── 📁 pages/      # Páginas del módulo
│   │   ├── 📁 services/   # Servicios API
│   │   └── 📁 context/    # Contextos React
│   ├── 📁 admin/          # Administración
│   ├── 📁 client/         # Cliente
│   ├── 📁 financial/      # Financiero
│   └── 📁 lab/            # Laboratorio
├── 📁 hooks/              # Hooks personalizados globales
│   ├── useDebounce.ts     # Hook para debounce
│   ├── useNotifications.ts # Hook para notificaciones
│   └── useUrlFilters.ts   # Hook para filtros en URL
├── 📁 services/           # Servicios globales
│   ├── 📁 api/            # Clientes de API
│   └── 📁 storage/        # Almacenamiento local
├── 📁 types/              # Definiciones de TypeScript
│   ├── api.ts             # Tipos de API
│   ├── auth.ts            # Tipos de autenticación
│   ├── admin.ts           # Tipos de administración
│   └── ...                # Otros tipos por feature
├── 📁 utils/              # Utilidades
│   ├── 📁 formatters/     # Formateo de datos
│   ├── 📁 helpers/        # Funciones auxiliares
│   ├── notifications.ts   # Utilidades de notificaciones
│   └── serviceUtils.ts    # Utilidades de servicios
├── 📁 lib/                # Configuraciones de librerías
│   ├── 📁 axios/          # Configuración de Axios
│   └── 📁 validation/     # Esquemas de validación
└── 📁 config/             # Configuraciones
    └── servicesConfig.ts  # Configuración de servicios
```

## 📋 Convenciones de Nomenclatura

### Archivos y Carpetas

- **Componentes**: PascalCase (`UserProfile.tsx`)
- **Hooks**: camelCase con prefijo `use` (`useUserData.ts`)
- **Servicios**: camelCase con sufijo `Service` (`userService.ts`)
- **Tipos**: camelCase (`userTypes.ts`)
- **Utilidades**: camelCase (`formatUtils.ts`)
- **Carpetas**: kebab-case (`user-management/`)

### Componentes

```typescript
// ✅ Bueno
export const UserProfile: React.FC<UserProfileProps> = ({ userId }) => {
  // ...
};

// ❌ Malo
export default function userProfile(props: any) {
  // ...
}
```

### Hooks

```typescript
// ✅ Bueno
export const useUserData = (userId: string) => {
  // ...
};

// ❌ Malo
export const getUserData = (userId: string) => {
  // ...
};
```

## 🏗️ Organización por Features

Cada feature sigue la misma estructura:

```
features/
└── feature-name/
    ├── components/     # Componentes específicos del feature
    ├── hooks/         # Hooks específicos del feature
    ├── pages/         # Páginas/vistas del feature
    ├── services/      # Servicios API del feature
    ├── types/         # Tipos específicos del feature
    └── index.ts       # Exports públicos del feature
```

### Beneficios de esta Organización

1. **Cohesión Alta**: Todo lo relacionado con un feature está junto
2. **Acoplamiento Bajo**: Features independientes entre sí
3. **Escalabilidad**: Fácil agregar nuevos features
4. **Mantenimiento**: Fácil localizar y modificar código
5. **Testing**: Tests colocados cerca del código que prueban

## 📦 Imports y Exports

### Imports Relativos vs Absolutos

```typescript
// ✅ Dentro del mismo feature - Import relativo
import { UserCard } from "./UserCard";
import { useUserData } from "../hooks/useUserData";

// ✅ Entre features diferentes - Import absoluto
import { DataTable } from "@/components/common/DataTable";
import { useNotifications } from "@/hooks/useNotifications";
```

### Index Files para Clean Exports

```typescript
// features/auth/index.ts
export { LoginPage } from "./pages/LoginPage";
export { useAuth } from "./hooks/useAuth";
export { authService } from "./services/authService";
export type { User, AuthState } from "./types/authTypes";
```

## 🎯 Principios de Organización

### 1. **Proximidad**

Código que cambia junto, debe estar junto.

### 2. **Propósito Claro**

Cada carpeta tiene una responsabilidad bien definida.

### 3. **Escalabilidad**

La estructura soporta el crecimiento del proyecto.

### 4. **Convenciones Consistentes**

Mismas reglas en todo el proyecto.

### 5. **Fácil Navegación**

Estructura intuitiva para nuevos desarrolladores.

## 🔍 Localización de Código

### Para encontrar...

- **Componente de UI**: `src/components/common/`
- **Lógica de autenticación**: `src/features/auth/`
- **Tipos de API**: `src/types/api.ts`
- **Utilidades de formato**: `src/utils/formatters/`
- **Configuración de servicios**: `src/config/servicesConfig.ts`
- **Hook personalizado**: `src/hooks/` o `src/features/*/hooks/`
