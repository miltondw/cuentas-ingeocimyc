# 🛠️ Stack Tecnológico

## 🧩 Core Framework

### React 18

```json
"react": "^18.2.0"
```

- **Hook-based architecture**: Componentes funcionales con hooks
- **Concurrent features**: Suspense, transitions, etc.
- **StrictMode**: Detección de side effects en desarrollo

### TypeScript

```json
"typescript": "^5.0.0"
```

- **Strict mode**: Configuración estricta para mayor seguridad
- **Path mapping**: Imports absolutos configurados
- **Type safety**: Tipado fuerte en toda la aplicación

### Vite

```json
"vite": "^5.0.0"
```

- **Fast HMR**: Hot Module Replacement ultra rápido
- **ES Modules**: Soporte nativo para módulos ES
- **Build optimization**: Optimización automática para producción

## 🎨 UI Framework

### Material UI (MUI) 6

```json
"@mui/material": "^6.0.0",
"@mui/icons-material": "^6.0.0",
"@mui/lab": "^6.0.0"
```

**Componentes Utilizados:**

- `DataGrid` - Tablas avanzadas
- `Autocomplete` - Selección con búsqueda
- `DatePicker` - Selección de fechas
- `Dialog` - Modales y diálogos
- `Drawer` - Navegación lateral
- `Snackbar` - Notificaciones

**Theming:**

```typescript
// theme.js
const theme = createTheme({
  palette: {
    primary: { main: "#1976d2" },
    secondary: { main: "#dc004e" },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: "none" },
      },
    },
  },
});
```

### Emotion

```json
"@emotion/react": "^11.11.0",
"@emotion/styled": "^11.11.0"
```

- **CSS-in-JS**: Estilos dinámicos basados en props
- **Theme integration**: Integración con MUI theme
- **Performance**: Optimización automática de CSS

## 🔄 Estado y Data Fetching

### TanStack Query (React Query) 5

```json
"@tanstack/react-query": "^5.0.0"
```

**Características Utilizadas:**

- **Server state caching**: Cache automático de datos del servidor
- **Background updates**: Actualizaciones en segundo plano
- **Optimistic updates**: Actualizaciones optimistas
- **Invalidation**: Invalidación inteligente de cache

**Ejemplo de uso:**

```typescript
export const useUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: () => userService.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};
```

### Zustand

```json
"zustand": "^4.4.0"
```

**Para estado del cliente:**

- **User preferences**: Configuraciones de usuario
- **UI state**: Estado de UI global
- **Theme settings**: Configuración de tema

```typescript
const useAppStore = create<AppState>((set) => ({
  theme: "light",
  sidebarOpen: true,
  setTheme: (theme) => set({ theme }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));
```

### React Hook Form

```json
"react-hook-form": "^7.45.0"
```

- **Performance**: Menos re-renders
- **Validation**: Integración con Yup/Zod
- **TypeScript**: Tipado fuerte de formularios

## 🛣️ Routing

### React Router 7

```json
"react-router": "^7.0.0"
```

**Características:**

- **Nested routing**: Rutas anidadas
- **Lazy loading**: Carga diferida de componentes
- **Protected routes**: Rutas protegidas por autenticación

```typescript
const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { path: "dashboard", element: <Dashboard /> },
      { path: "users", lazy: () => import("./features/users") },
    ],
  },
]);
```

## ✅ Validación

### Yup

```json
"yup": "^1.2.0"
```

**Para validación de formularios:**

```typescript
const userSchema = yup.object({
  name: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  age: yup.number().positive().integer().min(18),
});
```

### Zod

```json
"zod": "^3.21.0"
```

**Para validación de tipos API:**

```typescript
const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
});

type User = z.infer<typeof UserSchema>;
```

## 🌐 HTTP Client

### Axios

```json
"axios": "^1.4.0"
```

**Configuración personalizada:**

```typescript
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
});

// Interceptors para auth, logging, etc.
apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

## 🛠️ Utilidades

### Day.js

```json
"dayjs": "^1.11.0"
```

- **Lightweight**: Alternativa ligera a Moment.js
- **Immutable**: API inmutable
- **Plugins**: Soporte para timezone, parsing, etc.

### Lodash

```json
"lodash": "^4.17.21"
```

**Funciones utilizadas:**

- `debounce` - Para búsquedas
- `groupBy` - Agrupación de datos
- `sortBy` - Ordenamiento
- `pick/omit` - Manipulación de objetos

### UUID

```json
"uuid": "^9.0.0"
```

- **Unique IDs**: Generación de identificadores únicos
- **Client-side**: IDs temporales para optimistic updates

## 🧪 Testing (Configurado para futuro uso)

### Vitest

```json
"vitest": "^1.0.0"
```

- **Fast**: Testing framework rápido
- **Vite integration**: Integración nativa con Vite

### Testing Library

```json
"@testing-library/react": "^14.0.0",
"@testing-library/jest-dom": "^6.0.0"
```

- **User-focused**: Tests centrados en el usuario
- **Accessibility**: Queries accesibles por defecto

## 🔧 Development Tools

### ESLint

```json
"eslint": "^8.0.0"
```

**Configuraciones:**

- React hooks rules
- TypeScript rules
- Import ordering
- Accessibility rules

### Prettier

```json
"prettier": "^3.0.0"
```

**Configuración:**

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

## 📱 PWA

### Vite PWA Plugin

```json
"vite-plugin-pwa": "^0.16.0"
```

- **Service Worker**: Generación automática
- **Offline support**: Funcionalidad offline
- **Install prompt**: Instalación como app nativa

## 🎯 Criterios de Selección

### ¿Por qué estas tecnologías?

1. **React 18**: Ecosistema maduro, comunidad activa, concurrent features
2. **TypeScript**: Seguridad de tipos, mejor DX, refactoring seguro
3. **MUI**: Componentes probados, accesibilidad, theming robusto
4. **React Query**: Simplifica estado del servidor, cache inteligente
5. **Vite**: Build rápido, HMR instantáneo, configuración mínima
6. **Zustand**: Boilerplate mínimo, TypeScript first, performance

### Alternativas Consideradas

| Tecnología  | Alternativa         | Razón de No Selección                 |
| ----------- | ------------------- | ------------------------------------- |
| React Query | Redux Toolkit Query | Más boilerplate, learning curve       |
| MUI         | Ant Design          | Menos flexible para theming           |
| Zustand     | Redux               | Overkill para estado cliente simple   |
| Axios       | Fetch               | Necesitamos interceptors y transforms |
| Vite        | Webpack             | Configuración compleja, build lento   |
