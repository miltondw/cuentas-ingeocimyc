# � Índice de Documentación - Frontend INGEOCIMYC

Documentación completa del frontend del sistema de gestión de servicios de ingeniería y laboratorio.

## 🎯 Introducción

Este proyecto es un frontend moderno construido con React, TypeScript y Material UI que proporciona interfaces para:

- **Gestión de usuarios** y roles
- **Administración de proyectos** de ingeniería
- **Laboratorio** de ensayos y análisis
- **Sistema financiero** de facturación
- **Panel administrativo** completo

## 📂 Estructura de Documentación

### 🏗️ [Arquitectura](./architecture/README.md)

- [📁 Estructura del Proyecto](./architecture/project-structure.md)
- [🛠️ Stack Tecnológico](./architecture/tech-stack.md)
- [🎨 Patrones de Diseño](./architecture/design-patterns.md)
- [🔄 Gestión de Estado](./architecture/state-management.md)

### 🧩 [Componentes](./components/README.md)

- [🔄 Componentes Reutilizables](./components/reusable-components.md)
- [🏗️ Layouts](./components/layouts.md)
- [🎨 Patrones de UI](./components/ui-patterns.md)
- [✨ Guía de Estilos](./components/styling-guide.md)

### ⚡ [Features/Módulos](./features/README.md)

- [🔐 Autenticación](./features/authentication.md)
- [👥 Administración](./features/admin.md)
- [💰 Financiero](./features/financial.md)
- [🧪 Laboratorio](./features/lab.md)
- [👤 Cliente](./features/client.md)

### 🌐 [API y Servicios](./api/README.md)

- [🔌 Cliente HTTP](./api/http-client.md)
- [🛠️ Servicios](./api/services.md)
- [🔄 Hooks de React Query](./api/react-query-hooks.md)
- [⚠️ Manejo de Errores](./api/error-handling.md)

### 📖 [Guías de Desarrollo](./guides/README.md)

- [⚙️ Configuración del Entorno](./guides/environment-setup.md)
- [📝 Convenciones de Código](./guides/coding-conventions.md)
- [🆕 Creación de Nuevos Features](./guides/new-feature-guide.md)
- [🧪 Testing](./guides/testing.md)
- [🚀 Deployment](./guides/deployment.md)

### 💡 [Ejemplos](./examples/README.md)

- [🧩 Ejemplos de Componentes](./examples/component-examples.md)
- [🔗 Hooks Personalizados](./examples/custom-hooks.md)
- [🎯 Casos de Uso Comunes](./examples/common-use-cases.md)

## 🎯 Casos de Uso Comunes

### 👨‍💻 Para Desarrolladores Nuevos

1. **Setup inicial**: [⚙️ Configuración del Entorno](./guides/environment-setup.md)
2. **Entender la estructura**: [📁 Estructura del Proyecto](./architecture/project-structure.md)
3. **Convenciones de código**: [📝 Convenciones](./guides/coding-conventions.md)
4. **Crear primer componente**: [💡 Ejemplos](./examples/README.md)

### 🛠️ Para Desarrollo Día a Día

- **Usar DataTable**: [🔄 Componentes Reutilizables](./components/reusable-components.md#datatable)
- **Crear formulario**: [💡 Ejemplos](./examples/README.md)
- **Integrar API**: [🌐 API y Servicios](./api/README.md)
- **Manejar estado**: [🔄 Gestión de Estado](./architecture/state-management.md)

### 🎨 Para UI/UX

- **Sistema de layouts**: [🏗️ Layouts](./components/layouts.md)
- **Patrones de UI**: [🎨 Patrones de UI](./components/ui-patterns.md)
- **Guía de estilos**: [✨ Guía de Estilos](./components/styling-guide.md)
- **Responsive design**: [🧩 Componentes](./components/README.md)

### � Para Administradores

- **Gestión de usuarios**: [👥 Administración](./features/admin.md)
- **Deploy del proyecto**: [🚀 Deployment](./guides/deployment.md)
- **Configuración de servicios**: [🛠️ Servicios](./api/services.md)

## �️ Stack Tecnológico

```typescript
// 🎯 Core Technologies
React 18 + TypeScript + Vite

// 🎨 UI Framework
Material UI 6 + Emotion

// � State Management
TanStack Query 5 + Zustand + React Hook Form

// 🛣️ Routing
React Router 7

// 🌐 HTTP & Validation
Axios + Yup + Zod

// 🧪 Testing & Tools
Vitest + Testing Library + ESLint + Prettier
```

## � Métricas del Proyecto

| Categoría                    | Cantidad | Estado         |
| ---------------------------- | -------- | -------------- |
| 🧩 Componentes reutilizables | 15+      | ✅ Documentado |
| ⚡ Features principales      | 5        | ✅ Documentado |
| 🔗 Hooks personalizados      | 20+      | ✅ Documentado |
| 🌐 Servicios API             | 8+       | ✅ Documentado |
| 📄 Páginas                   | 25+      | ✅ Documentado |
| 🎨 Layouts                   | 3        | ✅ Documentado |

## 🚀 Quick Start

```bash
# 1. Clonar y setup
git clone [repo-url]
npm install

# 2. Desarrollo
npm run dev

# 3. Build
npm run build

# 4. Testing
npm run test
```

## 🔄 Actualizaciones

**Última actualización**: Diciembre 2024  
**Versión documentación**: 2.0.0  
**Cobertura**: Documentación completa con estructura organizada

## � Soporte

Para preguntas específicas, consulta:

- **Arquitectura**: [🏗️ Arquitectura](./architecture/README.md)
- **Componentes**: [🧩 Componentes](./components/README.md)
- **Features**: [⚡ Features](./features/README.md)
- **API**: [🌐 API](./api/README.md)
- **Desarrollo**: [📖 Guías](./guides/README.md)
- **Ejemplos**: [💡 Ejemplos](./examples/README.md)

- **TanStack Query** - Estado del servidor, caché, sincronización
- **Zustand** - Estado global del cliente
- **useState/useReducer** - Estado local de componentes
- **URL State** - Filtros persistentes en URL
- **Offline/Online** - Sincronización automática

### 🌐 [Servicios y API](./api-services.md)

**Cliente HTTP, servicios y comunicación con backend**

- **API Client** - Configuración Axios, interceptors
- **Servicios por Feature** - Patrones de servicios tipados
- **React Query Hooks** - Hooks personalizados para API
- **Caché y Sincronización** - Estrategias de invalidación
- **Upload de Archivos** - Servicio de uploads con progreso
- **Manejo de Errores** - Error handling global

### 🔐 [Autenticación](./authentication.md)

**Sistema completo de auth y protección de rutas**

- **Auth Provider** - Context global de autenticación
- **Protección de Rutas** - Guards por roles y permisos
- **Servicios de Auth** - Login, registro, perfil
- **Páginas de Auth** - Login, register, profile
- **Seguridad** - Tokens, logout automático, CSRF

### 📝 [Guías de Desarrollo](./development-guides.md)

**Guías prácticas para desarrolladores**

- **Setup Inicial** - Instalación y configuración
- **Creando Features** - Templates y estructuras
- **Convenciones** - Nomenclatura y organización
- **Testing** - Configuración futura de tests
- **Debugging** - Herramientas y técnicas
- **Deploy** - Build y variables de entorno

## 🎯 Casos de Uso Comunes

### 📊 Crear una Nueva Tabla de Datos

1. Leer [Componentes → DataTable](./components.md#📊-datatable)
2. Ver ejemplo en [Features → Financial](./features.md#💰-financial---gestión-financiera)
3. Aplicar patrones de [State Management](./state-management.md#🌐-estado-del-servidor---tanstack-query)

### 🔍 Implementar Búsqueda y Filtros

1. Usar [SearchAndFilter component](./components.md#🔍-searchandfilter)
2. Configurar [URL State persistence](./state-management.md#🔄-sincronización-de-estado)
3. Ver ejemplo en [Lab Dashboard](./features.md#🧪-lab---laboratorio)

### 🛡️ Proteger Rutas por Rol

1. Usar [ProtectedRoute component](./authentication.md#🛡️-protección-de-rutas)
2. Configurar [roles y permisos](./authentication.md#🎣-hook-de-autenticación)
3. Ver ejemplos en [Auth documentation](./authentication.md)

### 🎨 Crear Componente Responsive

1. Seguir [patrones responsive](./ui-patterns.md#📱-sistema-responsive)
2. Usar [Grid2 system](./ui-patterns.md#📱-sistema-responsive)
3. Aplicar [breakpoints MUI](./ui-patterns.md#📱-sistema-responsive)

### 🌐 Conectar con API

1. Crear [servicio tipado](./api-services.md#🔧-servicios-por-feature)
2. Implementar [React Query hooks](./api-services.md#🎣-hooks-de-api)
3. Manejar [estados de loading](./state-management.md#🌐-estado-del-servidor---tanstack-query)

### 📱 Agregar Nuevo Feature

1. Seguir [estructura base](./development-guides.md#🏗️-creando-nuevos-features)
2. Usar [templates](./development-guides.md#2-template-de-servicio)
3. Aplicar [convenciones](./development-guides.md#🎨-convenciones-de-código)

## 🔧 Herramientas y Recursos

### 🛠️ Desarrollo

- **React DevTools** - Para debugging de componentes
- **TanStack Query DevTools** - Para gestión de estado del servidor
- **MUI Theme Inspector** - Para debugging de temas
- **VS Code Extensions** - Ver [setup inicial](./development-guides.md#extensiones-de-vs-code-recomendadas)

### 📚 Documentación Externa

- [Material UI Docs](https://mui.com/) - Componentes y theming
- [TanStack Query](https://tanstack.com/query/latest) - State management
- [React Hook Form](https://react-hook-form.com/) - Formularios
- [React Router](https://reactrouter.com/) - Navegación
- [TypeScript Handbook](https://www.typescriptlang.org/docs/) - Tipado

### 🎨 Design System

- **Colores**: Palette definida en `src/theme.js`
- **Spacing**: Sistema base de 8px
- **Breakpoints**: xs(0), sm(600), md(960), lg(1280), xl(1920)
- **Typography**: Roboto font family

## 🚀 Quick Start para Nuevos Desarrolladores

### 1. **Setup** (10 min)

```bash
git clone [repo]
npm install
cp .env.example .env
npm run dev
```

### 2. **Explorar Features** (30 min)

- Revisar `src/features/` para entender la estructura
- Ejecutar la app y navegar por las diferentes secciones
- Revisar `src/components/common/` para componentes reutilizables

### 3. **Primer Componente** (1 hora)

- Leer [Guías de Desarrollo](./development-guides.md)
- Crear un componente simple usando [DataTable](./components.md#📊-datatable)
- Seguir [convenciones de código](./development-guides.md#🎨-convenciones-de-código)

### 4. **Conectar con API** (30 min)

- Revisar servicios existentes en `src/services/api/`
- Crear hook personalizado con [React Query](./api-services.md#🎣-hooks-de-api)
- Implementar [manejo de errores](./api-services.md#🚨-manejo-de-errores)

---

## 💡 Tips de Navegación

- **Ctrl+F** para buscar términos específicos en cualquier documento
- Usar los **enlaces internos** para navegar entre secciones
- **Código de ejemplo** en cada sección es funcional y probado
- **Copiar y adaptar** los templates según necesidades específicas

---

**Última actualización:** Diciembre 2024  
**Versión de la documentación:** 1.0.0

¡Feliz desarrollo! 🚀
