# 🎨 Patrones de UI y Design System

Esta documentación cubre los patrones de diseño, sistema de tema y mejores prácticas de UI.

## 🎭 Sistema de Tema

### Ubicación

`src/theme.js`

### Configuración Base

```tsx
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
      light: "#42a5f5",
      dark: "#1565c0",
    },
    secondary: {
      main: "#dc004e",
    },
    background: {
      default: "#f5f5f5",
      paper: "#ffffff",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: "2.5rem",
      fontWeight: 600,
    },
    h2: {
      fontSize: "2rem",
      fontWeight: 600,
    },
    // ... más configuraciones
  },
  spacing: 8, // 8px base unit
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
});
```

### Uso del Tema

```tsx
import { useTheme } from "@mui/material/styles";

function MyComponent() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        color: theme.palette.primary.main,
        padding: theme.spacing(2),
        [theme.breakpoints.down("md")]: {
          padding: theme.spacing(1),
        },
      }}
    >
      Contenido
    </Box>
  );
}
```

## 📱 Sistema Responsive

### Breakpoints Estándar

```tsx
const breakpoints = {
  xs: "0px", // Mobile portrait
  sm: "600px", // Mobile landscape / Tablet portrait
  md: "960px", // Tablet landscape / Small desktop
  lg: "1280px", // Desktop
  xl: "1920px", // Large desktop
};
```

### Patrones Responsive Comunes

#### 1. Grid Responsive

```tsx
import { Grid2 } from "@mui/material";

function ResponsiveGrid() {
  return (
    <Grid2 container spacing={2}>
      {/* Móvil: 1 columna, Tablet: 2 columnas, Desktop: 3 columnas */}
      <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
        <Card>Item 1</Card>
      </Grid2>
      <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
        <Card>Item 2</Card>
      </Grid2>
      <Grid2 size={{ xs: 12, sm: 12, md: 4 }}>
        <Card>Item 3</Card>
      </Grid2>
    </Grid2>
  );
}
```

#### 2. Typography Responsive

```tsx
<Typography
  variant="h1"
  sx={{
    fontSize: {
      xs: "1.5rem", // Móvil
      sm: "2rem", // Tablet
      md: "2.5rem", // Desktop
    },
    textAlign: {
      xs: "center", // Centrado en móvil
      md: "left", // Izquierda en desktop
    },
  }}
>
  Título Responsive
</Typography>
```

#### 3. Layout Adaptive

```tsx
<Stack
  direction={{ xs: "column", md: "row" }}
  spacing={{ xs: 1, sm: 2, md: 4 }}
  alignItems={{ xs: "stretch", md: "center" }}
>
  <Box>Item 1</Box>
  <Box>Item 2</Box>
</Stack>
```

#### 4. Visibilidad Condicional

```tsx
import { useMediaQuery, useTheme } from "@mui/material";

function ResponsiveComponent() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));

  return (
    <Box>
      {isMobile && <MobileNavigation />}
      {isDesktop && <DesktopSidebar />}

      <Box
        sx={{
          display: { xs: "none", md: "block" }, // Solo en desktop
        }}
      >
        Desktop only content
      </Box>
    </Box>
  );
}
```

## 🧱 Componentes de Layout

### MainLayout

Layout principal con navegación y sidebar.

```tsx
import { MainLayout } from "@/components/layout/MainLayout";

function DashboardPage() {
  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        {/* Contenido de la página */}
      </Box>
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
    <AuthLayout title="Iniciar Sesión" subtitle="Accede a tu cuenta" showLogo>
      <LoginForm />
    </AuthLayout>
  );
}
```

### CardLayout

Layout simple con tarjeta centrada.

```tsx
import { CardLayout } from "@/components/layout/CardLayout";

function SettingsPage() {
  return (
    <CardLayout title="Configuración" maxWidth="md" elevation={2}>
      <SettingsForm />
    </CardLayout>
  );
}
```

## 📋 Patrones de Formularios

### Formulario Básico con React Hook Form

```tsx
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const schema = yup.object({
  name: yup.string().required("Nombre es requerido"),
  email: yup.string().email("Email inválido").required("Email es requerido"),
  age: yup.number().positive().integer().required("Edad es requerida"),
});

function UserForm() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      age: "",
    },
  });

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Grid2 container spacing={2}>
        <Grid2 size={{ xs: 12, sm: 6 }}>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Nombre"
                fullWidth
                error={!!errors.name}
                helperText={errors.name?.message}
              />
            )}
          />
        </Grid2>

        <Grid2 size={{ xs: 12, sm: 6 }}>
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Email"
                type="email"
                fullWidth
                error={!!errors.email}
                helperText={errors.email?.message}
              />
            )}
          />
        </Grid2>

        <Grid2 size={12}>
          <Button type="submit" variant="contained" fullWidth size="large">
            Guardar
          </Button>
        </Grid2>
      </Grid2>
    </Box>
  );
}
```

### Formulario con Stepper

```tsx
import { useState } from "react";
import { Stepper, Step, StepLabel, Box, Button } from "@mui/material";

const steps = ["Información Personal", "Contacto", "Confirmación"];

function MultiStepForm() {
  const [activeStep, setActiveStep] = useState(0);

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return <PersonalInfoForm />;
      case 1:
        return <ContactForm />;
      case 2:
        return <ConfirmationForm />;
      default:
        return null;
    }
  };

  return (
    <Box>
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ mb: 4 }}>{renderStepContent(activeStep)}</Box>

      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Button disabled={activeStep === 0} onClick={handleBack}>
          Atrás
        </Button>

        <Button
          variant="contained"
          onClick={handleNext}
          disabled={activeStep === steps.length - 1}
        >
          {activeStep === steps.length - 1 ? "Finalizar" : "Siguiente"}
        </Button>
      </Box>
    </Box>
  );
}
```

## 📊 Patrones de Tablas

### Tabla Básica Responsive

```tsx
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  useMediaQuery,
  useTheme,
} from "@mui/material";

function ResponsiveTable({ data, columns }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  if (isMobile) {
    // Vista de tarjetas en móvil
    return (
      <Stack spacing={2}>
        {data.map((row, index) => (
          <Card key={index}>
            <CardContent>
              {columns.map((column) => (
                <Typography key={column.key} variant="body2">
                  <strong>{column.label}:</strong> {row[column.key]}
                </Typography>
              ))}
            </CardContent>
          </Card>
        ))}
      </Stack>
    );
  }

  // Vista de tabla en desktop
  return (
    <TableContainer component={Paper}>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell key={column.key}>{column.label}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, index) => (
            <TableRow key={index} hover>
              {columns.map((column) => (
                <TableCell key={column.key}>{row[column.key]}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
```

## 🔔 Patrones de Notificaciones

### Toast Notifications

```tsx
import { Snackbar, Alert } from "@mui/material";

function NotificationProvider({ children }) {
  const [notification, setNotification] = useState(null);

  const showNotification = (message, severity = "info") => {
    setNotification({ message, severity });
  };

  const hideNotification = () => {
    setNotification(null);
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}

      <Snackbar
        open={!!notification}
        autoHideDuration={6000}
        onClose={hideNotification}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {notification && (
          <Alert
            onClose={hideNotification}
            severity={notification.severity}
            variant="filled"
          >
            {notification.message}
          </Alert>
        )}
      </Snackbar>
    </NotificationContext.Provider>
  );
}
```

## 🎯 Patrones de Navegación

### Breadcrumbs Dinámicos

```tsx
import { Breadcrumbs, Link, Typography } from "@mui/material";
import { Link as RouterLink, useLocation } from "react-router-dom";

function DynamicBreadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  return (
    <Breadcrumbs sx={{ mb: 2 }}>
      <Link component={RouterLink} to="/">
        Inicio
      </Link>

      {pathnames.map((value, index) => {
        const last = index === pathnames.length - 1;
        const to = `/${pathnames.slice(0, index + 1).join("/")}`;

        return last ? (
          <Typography color="text.primary" key={to}>
            {value}
          </Typography>
        ) : (
          <Link component={RouterLink} to={to} key={to}>
            {value}
          </Link>
        );
      })}
    </Breadcrumbs>
  );
}
```

### Tabs Responsive

```tsx
import { Tabs, Tab, Box, useMediaQuery, useTheme } from "@mui/material";

function ResponsiveTabs({ tabs, value, onChange }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
      <Tabs
        value={value}
        onChange={onChange}
        variant={isMobile ? "scrollable" : "standard"}
        scrollButtons={isMobile ? "auto" : false}
        allowScrollButtonsMobile
      >
        {tabs.map((tab, index) => (
          <Tab
            key={index}
            label={tab.label}
            icon={tab.icon}
            iconPosition={isMobile ? "top" : "start"}
          />
        ))}
      </Tabs>
    </Box>
  );
}
```

## 🎨 Patrones de Color y Estados

### Estados de Componentes

```tsx
// Colores por estado
const statusColors = {
  active: 'success',
  inactive: 'default',
  pending: 'warning',
  error: 'error',
  completed: 'info',
};

// Componente de estado
function StatusChip({ status, label }) {
  return (
    <Chip
      label={label || status}
      color={statusColors[status]}
      variant="outlined"
      size="small"
    />
  );
}

// Uso
<StatusChip status="active" label="Activo" />
<StatusChip status="pending" label="Pendiente" />
```

### Indicadores Visuales

```tsx
function LoadingButton({ loading, children, ...props }) {
  return (
    <Button
      {...props}
      disabled={loading}
      startIcon={loading ? <CircularProgress size={20} /> : props.startIcon}
    >
      {loading ? "Cargando..." : children}
    </Button>
  );
}
```

## 📐 Espaciado y Layout

### Sistema de Espaciado

```tsx
// Usando theme.spacing()
sx={{
  padding: theme.spacing(2),          // 16px
  margin: theme.spacing(1, 2),        // 8px 16px
  marginTop: theme.spacing(3),        // 24px
}}

// Usando números directos (múltiplos de 8px)
sx={{
  p: 2,      // padding: 16px
  m: 1,      // margin: 8px
  mt: 3,     // margin-top: 24px
  mx: 'auto', // margin-left: auto, margin-right: auto
}}
```

### Layout Containers

```tsx
function PageContainer({ children, maxWidth = "lg" }) {
  return (
    <Container maxWidth={maxWidth} sx={{ py: 3 }}>
      {children}
    </Container>
  );
}

function SectionContainer({ children, spacing = 3 }) {
  return <Box sx={{ mb: spacing }}>{children}</Box>;
}
```

## 🔧 Utilidades de Estilo

### SX Prop Patterns

```tsx
// Patrón común para cards
const cardSx = {
  p: 3,
  borderRadius: 2,
  boxShadow: 2,
  "&:hover": {
    boxShadow: 4,
  },
};

// Patrón para formularios
const formSx = {
  "& .MuiTextField-root": {
    mb: 2,
  },
  "& .MuiButton-root": {
    mt: 2,
  },
};

// Uso
<Card sx={cardSx}>
  <Box component="form" sx={formSx}>
    {/* contenido */}
  </Box>
</Card>;
```

### Styled Components

```tsx
import { styled } from "@mui/material/styles";

const StyledCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  boxShadow: theme.shadows[2],
  "&:hover": {
    boxShadow: theme.shadows[4],
  },
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
  border: 0,
  borderRadius: 3,
  boxShadow: "0 3px 5px 2px rgba(255, 105, 135, .3)",
  color: "white",
  height: 48,
  padding: "0 30px",
}));
```

---

**Siguiente:** [🔗 Gestión de Estado](./state-management.md)
