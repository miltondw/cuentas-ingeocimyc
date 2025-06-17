import { useState, MouseEvent } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import GroupIcon from "@mui/icons-material/Group";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ScienceIcon from "@mui/icons-material/Science";
import BarChartIcon from "@mui/icons-material/BarChart";
import LogoutIcon from "@mui/icons-material/Logout";
import SettingsIcon from "@mui/icons-material/Settings";
import { useAuth } from "@/features/auth/hooks/useAuth";

// Define navigations items by role
const adminPages = [
  { name: "Proyectos", path: "/proyectos", icon: <GroupIcon /> },
  { name: "Gastos", path: "/gastos", icon: <BarChartIcon /> },
  { name: "Utilidades", path: "/utilidades", icon: <BarChartIcon /> },
  { name: "Laboratorio", path: "/lab/proyectos", icon: <ScienceIcon /> },
];

const labPages = [
  { name: "Proyectos", path: "/lab/proyectos", icon: <ScienceIcon /> },
];

const clientPages = [
  { name: "Mis Solicitudes", path: "/client/requests", icon: <GroupIcon /> },
];

const settings = [
  { name: "Perfil", path: "/profile", icon: <AccountCircleIcon /> },
  { name: "Configuración", path: "/settings", icon: <SettingsIcon /> },
  { name: "Cerrar Sesión", path: "/logout", icon: <LogoutIcon /> },
];

/**
 * Componente de navegación principal
 * Muestra diferentes opciones según el rol del usuario
 */
const Navigation = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Determinar qué menú mostrar según el rol
  const pages =
    user?.role === "admin"
      ? adminPages
      : user?.role === "lab"
      ? labPages
      : clientPages;

  // Manejadores para el menú de usuario
  const handleOpenUserMenu = (event: MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  // Manejadores para el drawer responsive
  const toggleDrawer = (open: boolean) => {
    setDrawerOpen(open);
  };

  // Comprobar si la ruta actual coincide con alguna opción del menú
  const isActive = (path: string) => {
    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
  };

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Logo y título - Desktop */}
          <Typography
            variant="h6"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              mr: 2,
              display: { xs: "none", md: "flex" },
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: ".3rem",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            INGEOCIMYC
          </Typography>

          {/* Mobile navigation */}
          <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              aria-label="menu"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={() => toggleDrawer(true)}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Drawer
              anchor="left"
              open={drawerOpen}
              onClose={() => toggleDrawer(false)}
            >
              <Box
                sx={{ width: 250 }}
                role="presentation"
                onClick={() => toggleDrawer(false)}
                onKeyDown={() => toggleDrawer(false)}
              >
                <List>
                  <ListItem disablePadding>
                    <ListItemButton component={RouterLink} to="/">
                      <ListItemText primary="INGEOCIMYC" />
                    </ListItemButton>
                  </ListItem>
                  <Divider />
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
              </Box>
            </Drawer>
          </Box>

          {/* Logo y título - Mobile */}
          <Typography
            variant="h6"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              flexGrow: 1,
              display: { xs: "flex", md: "none" },
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: ".2rem",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            INGEOCIMYC
          </Typography>

          {/* Desktop navigation */}
          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
            {pages.map((page) => (
              <Button
                key={page.name}
                component={RouterLink}
                to={page.path}
                sx={{
                  my: 2,
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  backgroundColor: isActive(page.path)
                    ? "rgba(255, 255, 255, 0.2)"
                    : "transparent",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                  },
                }}
              >
                {page.icon}
                {page.name}
              </Button>
            ))}
          </Box>

          {/* User menu */}
          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Abrir configuración">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar
                  alt={user?.name || user?.email || "Usuario"}
                  src="/static/images/avatar/2.jpg"
                />
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: "45px" }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              <MenuItem disabled sx={{ opacity: 0.7 }}>
                <Typography textAlign="center">
                  {user?.name || user?.email || "Usuario"}
                </Typography>
              </MenuItem>
              <Divider />
              {settings.map((setting) => (
                <MenuItem
                  key={setting.name}
                  component={RouterLink}
                  to={setting.path}
                  onClick={handleCloseUserMenu}
                  sx={{
                    display: "flex",
                    gap: 1,
                  }}
                >
                  {setting.icon}
                  <Typography textAlign="center">{setting.name}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navigation;
