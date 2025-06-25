import { useState } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery,
  Avatar,
  Fab,
  Toolbar,
  IconButton,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import GroupIcon from "@mui/icons-material/Group";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ScienceIcon from "@mui/icons-material/Science";
import BarChartIcon from "@mui/icons-material/BarChart";
import LogoutIcon from "@mui/icons-material/Logout";
import SettingsIcon from "@mui/icons-material/Settings";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import { useAuth } from "@/features/auth/hooks/useAuth";
import React from "react"; // Necesario para React.FC y React.ReactNode

// --- TIPADO ---
// 1. Define la estructura para los elementos de navegación
interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode; // El tipo correcto para íconos de React
}

// 2. Define una interfaz para el usuario (ajústala según tu hook useAuth)
interface IUser {
  name?: string;
  email?: string;
  role?: "admin" | "lab" | "client";
}

// --- DATOS TIPADOS ---
const adminPages: NavItem[] = [
  {
    name: "Panel de Administración",
    path: "/admin",
    icon: <AdminPanelSettingsIcon />,
  },
  { name: "Proyectos", path: "/proyectos", icon: <GroupIcon /> },
  { name: "Gastos", path: "/gastos", icon: <BarChartIcon /> },
  { name: "Utilidades", path: "/utilidades", icon: <BarChartIcon /> },
  { name: "Laboratorio", path: "/lab/proyectos", icon: <ScienceIcon /> },
];
const labPages: NavItem[] = [
  { name: "Proyectos", path: "/lab/proyectos", icon: <ScienceIcon /> },
];
const clientPages: NavItem[] = [
  { name: "Mis Solicitudes", path: "/client/requests", icon: <GroupIcon /> },
];

const settings: NavItem[] = [
  { name: "Perfil", path: "/profile", icon: <AccountCircleIcon /> },
  { name: "Configuración", path: "/settings", icon: <SettingsIcon /> },
  { name: "Cerrar Sesión", path: "/logout", icon: <LogoutIcon /> },
];

const drawerWidth = 260;

// 3. Tipamos el componente como un Functional Component de React
const Navigation: React.FC = () => {
  const { user }: { user: IUser | null } = useAuth(); // Tipamos la salida del hook
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  const pages: NavItem[] =
    user?.role === "admin"
      ? adminPages
      : user?.role === "lab"
      ? labPages
      : clientPages;

  // 4. Tipamos los eventos del handler
  const toggleDrawer =
    (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
      if (
        event &&
        event.type === "keydown" &&
        ((event as React.KeyboardEvent).key === "Tab" ||
          (event as React.KeyboardEvent).key === "Shift")
      ) {
        return;
      }
      setDrawerOpen(open);
    };

  const isActive = (path: string): boolean => {
    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
  };

  const drawerContent = (
    <Box
      sx={{ display: "flex", flexDirection: "column", height: "100%" }}
      onClick={(event: React.MouseEvent<HTMLDivElement>) => {
        // 5. Usamos aserción de tipo para usar .closest() de forma segura
        if ((event.target as HTMLElement).closest("a")) {
          setDrawerOpen(false);
        }
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexDirection: "column",
            p: 2,
          }}
        >
          <img
            src="/logo-ingeocimyc.svg"
            alt="Logo Ingeocimyc"
            width={80}
            height={80}
          />
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ fontWeight: 700 }}
          >
            INGEOCIMYC
          </Typography>
        </Box>
        <IconButton onClick={toggleDrawer(false)}>
          <ChevronLeftIcon />
        </IconButton>
      </Toolbar>
      <Divider />

      <List sx={{ flexGrow: 1, overflowY: "auto" }}>
        {pages.map((page) => (
          <ListItem key={page.name} disablePadding>
            <ListItemButton
              component={RouterLink}
              to={page.path}
              selected={isActive(page.path)}
            >
              <ListItemIcon>{page.icon}</ListItemIcon>
              <ListItemText primary={page.name} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider />

      <Box sx={{ p: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Avatar
            alt={user?.name || user?.email}
            src="/static/images/avatar/2.jpg"
          />
          <Typography fontWeight="bold" noWrap>
            {user?.name || user?.email}
          </Typography>
        </Box>
        <List sx={{ p: 0 }}>
          {settings.map((setting) => (
            <ListItem key={setting.name} disablePadding>
              <ListItemButton component={RouterLink} to={setting.path}>
                <ListItemIcon>{setting.icon}</ListItemIcon>
                <ListItemText primary={setting.name} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );

  return (
    <>
      {/* FAB mejorado: esquina inferior izquierda, animación y oculto en desktop cuando el Drawer está abierto */}
      {(!isDesktop || !drawerOpen) && (
        <Fab
          color="primary"
          aria-label="open menu"
          onClick={toggleDrawer(!drawerOpen)}
          sx={{
            position: "fixed",
            top: { xs: "auto", md: 16 },
            left: { xs: 24, md: 22 },
            zIndex: theme.zIndex.drawer + 2,
            boxShadow: 4,
            transition: "all 0.4s cubic-bezier(.4,2,.6,1)",
            "&:hover": {
              boxShadow: 8,
              transform: "scale(1.08)",
              backgroundColor: "primary.dark",
            },
          }}
        >
          {drawerOpen ? <ChevronLeftIcon /> : <MenuIcon />}
        </Fab>
      )}

      <Drawer
        anchor="left"
        variant={isDesktop ? "persistent" : "temporary"}
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default Navigation;
