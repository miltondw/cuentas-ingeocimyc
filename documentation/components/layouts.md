# 🏗️ Layouts

Los layouts proporcionan la estructura base para las páginas de la aplicación, incluyendo navegación, sidebars y áreas de contenido.

## 📋 Layouts Disponibles

### 1. MainLayout

Layout principal con navegación completa

- **Uso**: Páginas principales de la aplicación
- **Características**: Header, sidebar, breadcrumbs

### 2. AuthLayout

Layout para páginas de autenticación

- **Uso**: Login, registro, recuperación de contraseña
- **Características**: Centrado, sin navegación

### 3. CardLayout

Layout simple con tarjeta

- **Uso**: Formularios simples, páginas de configuración
- **Características**: Contenido en tarjeta centrada

## 🎯 MainLayout

### Ubicación

`src/components/layout/MainLayout.tsx`

### Estructura

```
┌─────────────────────────────────┐
│            Header               │ ← Navigation bar
├───────────┬─────────────────────┤
│           │    Breadcrumbs      │
│  Sidebar  ├─────────────────────┤
│           │                     │
│           │     Content         │
│           │      Area          │
│           │                     │
└───────────┴─────────────────────┘
```

### Uso Básico

```tsx
import { MainLayout } from "@/components/layout/MainLayout";

function DashboardPage() {
  return (
    <MainLayout>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      {/* Contenido de la página */}
    </MainLayout>
  );
}
```

### Props Disponibles

```tsx
interface MainLayoutProps {
  children: ReactNode;
  title?: string; // Título para breadcrumbs
  breadcrumbs?: BreadcrumbItem[];
  hideDrawer?: boolean; // Ocultar sidebar
  maxWidth?: false | "xs" | "sm" | "md" | "lg" | "xl";
}
```

### Ejemplo con Breadcrumbs

```tsx
const breadcrumbs = [
  { label: "Inicio", href: "/" },
  { label: "Usuarios", href: "/users" },
  { label: "Perfil", href: "/users/123" },
];

function UserProfile() {
  return (
    <MainLayout title="Perfil de Usuario" breadcrumbs={breadcrumbs}>
      <UserProfileForm />
    </MainLayout>
  );
}
```

### Customización de Sidebar

```tsx
// El sidebar se controla desde Navigation.tsx
// Se puede configurar qué elementos mostrar según el rol del usuario

const navigationItems = [
  {
    label: "Dashboard",
    icon: <DashboardIcon />,
    path: "/dashboard",
    roles: ["admin", "user"],
  },
  {
    label: "Administración",
    icon: <AdminIcon />,
    path: "/admin",
    roles: ["admin"], // Solo para admins
  },
];
```

## 🔐 AuthLayout

### Ubicación

`src/components/layout/AuthLayout.tsx`

### Estructura

```
┌─────────────────────────────────┐
│                                 │
│              Logo               │
│                                 │
│        ┌─────────────┐          │
│        │             │          │
│        │   Content   │          │
│        │    Card     │          │
│        │             │          │
│        └─────────────┘          │
│                                 │
└─────────────────────────────────┘
```

### Uso Básico

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

### Props Disponibles

```tsx
interface AuthLayoutProps {
  children: ReactNode;
  title?: string; // Título de la página
  subtitle?: string; // Subtítulo opcional
  maxWidth?: "xs" | "sm" | "md";
  showLogo?: boolean; // Mostrar logo de la empresa
}
```

### Variaciones

```tsx
// Página de registro
<AuthLayout
  title="Crear Cuenta"
  subtitle="Complete el formulario para registrarse"
  maxWidth="md"
>
  <RegisterForm />
</AuthLayout>

// Recuperación de contraseña
<AuthLayout
  title="Recuperar Contraseña"
  subtitle="Ingrese su email para recibir instrucciones"
  maxWidth="sm"
>
  <ForgotPasswordForm />
</AuthLayout>
```

## 📄 CardLayout

### Ubicación

`src/components/layout/CardLayout.tsx`

### Estructura

```
┌─────────────────────────────────┐
│                                 │
│        ┌─────────────┐          │
│        │    Title    │          │
│        ├─────────────┤          │
│        │             │          │
│        │   Content   │          │
│        │             │          │
│        └─────────────┘          │
│                                 │
└─────────────────────────────────┘
```

### Uso Básico

```tsx
import { CardLayout } from "@/components/layout/CardLayout";

function SettingsPage() {
  return (
    <CardLayout title="Configuración">
      <SettingsForm />
    </CardLayout>
  );
}
```

### Props Disponibles

```tsx
interface CardLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  maxWidth?: false | "xs" | "sm" | "md" | "lg" | "xl";
  actions?: ReactNode; // Botones en el header
  padding?: number; // Padding personalizado
}
```

### Ejemplo con Acciones

```tsx
const actions = (
  <Stack direction="row" spacing={2}>
    <Button variant="outlined" onClick={handleCancel}>
      Cancelar
    </Button>
    <Button variant="contained" onClick={handleSave}>
      Guardar
    </Button>
  </Stack>
);

function EditForm() {
  return (
    <CardLayout
      title="Editar Proyecto"
      subtitle="Modifique los datos del proyecto"
      actions={actions}
      maxWidth="lg"
    >
      <ProjectForm />
    </CardLayout>
  );
}
```

## 🧭 Navigation

### Ubicación

`src/components/layout/Navigation.tsx`

### Características

- **Responsive**: Se adapta a móviles con drawer
- **Role-based**: Muestra elementos según el rol del usuario
- **Active state**: Resalta la página actual
- **Collapsible**: Secciones colapsables en el sidebar

### Configuración de Menú

```tsx
// config/navigationConfig.ts
export const navigationConfig = [
  {
    section: "Principal",
    items: [
      {
        label: "Dashboard",
        icon: <DashboardIcon />,
        path: "/dashboard",
        roles: ["admin", "user", "viewer"],
      },
      {
        label: "Proyectos",
        icon: <FolderIcon />,
        path: "/projects",
        roles: ["admin", "user"],
      },
    ],
  },
  {
    section: "Administración",
    items: [
      {
        label: "Usuarios",
        icon: <PeopleIcon />,
        path: "/admin/users",
        roles: ["admin"],
      },
      {
        label: "Configuración",
        icon: <SettingsIcon />,
        path: "/admin/settings",
        roles: ["admin"],
      },
    ],
  },
];
```

### Personalización del Header

```tsx
// components/layout/Navigation.tsx
const AppBar = () => {
  const { user } = useAuth();

  return (
    <MuiAppBar position="fixed">
      <Toolbar>
        <IconButton onClick={toggleDrawer}>
          <MenuIcon />
        </IconButton>

        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          INGEOCIMYC
        </Typography>

        {/* Notificaciones */}
        <IconButton>
          <Badge badgeContent={notificationCount} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>

        {/* Avatar del usuario */}
        <UserAvatar user={user} />
      </Toolbar>
    </MuiAppBar>
  );
};
```

## 📱 Responsive Behavior

### Breakpoints

```tsx
// xs: 0px-599px    (móviles)
// sm: 600px-899px  (tablets)
// md: 900px-1199px (laptops)
// lg: 1200px-1535px (desktops)
// xl: 1536px+      (pantallas grandes)
```

### MainLayout en Móviles

- Sidebar se convierte en drawer temporal
- Header ocupa toda la anchura
- Contenido se ajusta al viewport

### AuthLayout en Móviles

- Reduce padding lateral
- Ajusta el tamaño de la tarjeta
- Logo se hace más pequeño

### CardLayout en Móviles

- Ocupa toda la anchura disponible
- Reduce padding interno
- Botones se apilan verticalmente

## 🎨 Theming y Estilos

### Variables de Layout

```tsx
// theme.js
const layoutTokens = {
  header: {
    height: 64,
    zIndex: 1201,
  },
  sidebar: {
    width: 240,
    collapsedWidth: 56,
  },
  content: {
    padding: { xs: 1, sm: 2, md: 3 },
  },
};
```

### Customización de Colores

```tsx
const theme = createTheme({
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#1976d2",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        },
      },
    },
  },
});
```

## 🔧 Extensión de Layouts

### Crear Layout Personalizado

```tsx
// components/layout/CustomLayout.tsx
import { MainLayout } from "./MainLayout";

interface CustomLayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
}

export const CustomLayout: React.FC<CustomLayoutProps> = ({
  children,
  showSidebar = true,
}) => {
  return (
    <MainLayout hideDrawer={!showSidebar}>
      <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
        {children}
      </Container>
    </MainLayout>
  );
};
```

### Layout con Tabs

```tsx
interface TabbedLayoutProps {
  children: ReactNode;
  tabs: TabConfig[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const TabbedLayout: React.FC<TabbedLayoutProps> = ({
  children,
  tabs,
  activeTab,
  onTabChange,
}) => {
  return (
    <MainLayout>
      <Tabs value={activeTab} onChange={(_, value) => onTabChange(value)}>
        {tabs.map((tab) => (
          <Tab key={tab.value} label={tab.label} value={tab.value} />
        ))}
      </Tabs>
      <TabPanel>{children}</TabPanel>
    </MainLayout>
  );
};
```

## 📋 Mejores Prácticas

### 1. Selección de Layout

- **MainLayout**: Para páginas de la aplicación con navegación
- **AuthLayout**: Para páginas de autenticación sin navegación
- **CardLayout**: Para formularios o contenido simple

### 2. Breadcrumbs

- Usa breadcrumbs para navegación profunda
- Incluye enlaces funcionales
- Mantén máximo 4-5 niveles

### 3. Responsive Design

- Testa en diferentes tamaños de pantalla
- Usa breakpoints de MUI consistentemente
- Considera touch interactions en móviles

### 4. Performance

- Los layouts se renderizan en cada página
- Mantén la lógica mínima
- Usa React.memo para optimización si es necesario

### 5. Accesibilidad

- Incluye landmarks (nav, main, aside)
- Soporta navegación por teclado
- Usa roles ARIA apropiados
