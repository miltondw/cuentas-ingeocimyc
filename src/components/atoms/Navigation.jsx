import React, { useEffect, useState } from "react";
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
  Divider,
  Chip,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import SettingsIcon from "@mui/icons-material/Settings";
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from '../../api/AuthContext';

function ResponsiveAppBar() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  // Estados para manejar menús
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [currentSubMenu, setCurrentSubMenu] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [desktopSubMenuAnchor, setDesktopSubMenuAnchor] = useState({ create: null, tables: null });

  // Menús dinámicos basados en roles de usuario
  const [pages, setPages] = useState({
    create: [
      { title: "Proyecto", link: "crear-proyecto" },
      { title: "Gasto del Mes", link: "crear-gasto-mes" },
    ],
    tables: [
      { title: "Proyectos", link: "proyectos" },
      { title: "Gastos", link: "gastos" },
    ],
  });

  // Actualizar menús basados en el rol del usuario
  useEffect(() => {
    if (isAuthenticated && user) {
      const updatedPages = { ...pages };

      // Solo los administradores pueden ver utilidades
      if (user.rol === 'admin') {
        if (!updatedPages.tables.some(item => item.link === 'utilidades')) {
          updatedPages.tables = [
            ...updatedPages.tables,
            { title: "Utilidades", link: "utilidades" }
          ];
        }
      } else {
        // Remover menús de administración para usuarios no admin
        updatedPages.tables = updatedPages.tables.filter(item => item.link !== 'utilidades');
      }

      setPages(updatedPages);
    }
  }, [isAuthenticated, user]);

  // Móvil: Manejo de menús
  const handleOpenMobileSubMenu = (menu) => (event) => {
    setCurrentSubMenu(menu);
    setAnchorElNav(event.currentTarget);
  };

  // Escritorio: Manejo de submenús
  const handleOpenDesktopSubMenu = (menu) => (event) => {
    setDesktopSubMenuAnchor((prev) => ({ ...prev, [menu]: event.currentTarget }));
  };

  // Cierre general
  const handleCloseAll = () => {
    setAnchorElNav(null);
    setCurrentSubMenu(null);
    setDesktopSubMenuAnchor({ create: null, tables: null });
  };

  // Manejo de cierre de sesión
  const handleLogout = async () => {
    setAnchorElUser(null);
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  // Generar iniciales para avatar
  const getInitials = () => {
    if (!user || !user.name) return "?";
    return user.name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <AppBar position="relative">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Logo */}
          <Link to={isAuthenticated ? "/proyectos" : "/login"} style={{ textDecoration: "none", display: 'flex', alignItems: 'center' }}>
            <Typography
              variant="h5"
              noWrap
              sx={{
                mr: 2,
                display: { xs: 'none', md: 'flex' },
                fontWeight: 700,
                color: 'inherit',
              }}
            >
              <img src="/logo-ingeocimyc.svg" alt="logo ingeocimyc" width="90px" />
              <Box sx={{ display: 'flex', flexDirection: 'column', ml: 1 }}>
                <span style={{ fontSize: '1.8rem' }}>INGEOCIMYC</span>
                <span style={{ fontSize: '0.55rem' }}>LABORATORIO DE GEOTECNIA Y CONCRETOS</span>
              </Box>
            </Typography>
          </Link>

          {/* Versión móvil del logo */}
          <Typography
            variant="h6"
            noWrap
            component={Link}
            to={isAuthenticated ? "/proyectos" : "/login"}
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontWeight: 700,
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <img src="/logo-ingeocimyc.svg" alt="logo ingeocimyc" width="50px" />
          </Typography>

          {/* Solo mostrar menús si está autenticado */}
          {isAuthenticated && (
            <>
              {/* Menú Mobile */}
              <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
                <IconButton
                  size="large"
                  onClick={handleOpenMobileSubMenu(null)}
                  color="inherit"
                >
                  <MenuIcon />
                </IconButton>

                {/* Menú principal móvil */}
                <Menu
                  anchorEl={anchorElNav}
                  open={Boolean(anchorElNav) && !currentSubMenu}
                  onClose={handleCloseAll}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                >
                  {['Crear', 'Tablas'].map((label, index) => (
                    <MenuItem
                      key={label}
                      onClick={handleOpenMobileSubMenu(index === 0 ? 'create' : 'tables')}
                    >
                      {label}
                    </MenuItem>
                  ))}
                </Menu>

                {/* Submenús móviles */}
                {['create', 'tables'].map((key) => (
                  <Menu
                    key={key}
                    anchorEl={anchorElNav}
                    open={currentSubMenu === key}
                    onClose={handleCloseAll}
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                    sx={{
                      '& .MuiPaper-root': {
                        maxHeight: '80vh',
                        ml: 1,
                      }
                    }}
                  >
                    {pages[key].map((page) => (
                      <MenuItem
                        key={page.link}
                        component={Link}
                        to={`/${page.link}`}
                        onClick={handleCloseAll}
                      >
                        {page.title}
                      </MenuItem>
                    ))}
                  </Menu>
                ))}
              </Box>

              {/* Menú Desktop */}
              <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'flex-end', gap: 2 }}>
                {['Crear', 'Tablas'].map((label, index) => {
                  const menuKey = index === 0 ? 'create' : 'tables';
                  return (
                    <Box key={label}>
                      <Button
                        onClick={handleOpenDesktopSubMenu(menuKey)}
                        sx={{ color: 'white' }}
                      >
                        {label}
                      </Button>
                      <Menu
                        anchorEl={desktopSubMenuAnchor[menuKey]}
                        open={Boolean(desktopSubMenuAnchor[menuKey])}
                        onClose={() => setDesktopSubMenuAnchor(prev => ({ ...prev, [menuKey]: null }))}
                        PaperProps={{
                          sx: {
                            maxWidth: '300px',
                          }
                        }}
                      >
                        {pages[menuKey].map((page) => (
                          <MenuItem
                            key={page.link}
                            component={Link}
                            to={`/${page.link}`}
                            onClick={() => setDesktopSubMenuAnchor({ create: null, tables: null })}
                          >
                            {page.title}
                          </MenuItem>
                        ))}
                      </Menu>
                    </Box>
                  );
                })}
              </Box>
            </>
          )}

          {/* Menú Usuario - Solo visible si está autenticado */}
          {isAuthenticated && user ? (
            <Box sx={{ flexGrow: 0, ml: 2 }}>
              <Tooltip title="Ajustes de usuario">
                <IconButton onClick={(e) => setAnchorElUser(e.currentTarget)} sx={{ p: 0 }}>
                  <Avatar sx={{ bgcolor: user.rol === 'admin' ? 'secondary.main' : 'primary.main' }}>
                    {getInitials()}
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={anchorElUser}
                open={Boolean(anchorElUser)}
                onClose={() => setAnchorElUser(null)}
                PaperProps={{
                  elevation: 3,
                  sx: {
                    mt: 1.5,
                    minWidth: 180,
                    overflow: 'visible',
                    filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                    '&:before': {
                      content: '""',
                      display: 'block',
                      position: 'absolute',
                      top: 0,
                      right: 14,
                      width: 10,
                      height: 10,
                      bgcolor: 'background.paper',
                      transform: 'translateY(-50%) rotate(45deg)',
                      zIndex: 0,
                    },
                  },
                }}
              >
                <Box sx={{ px: 2, py: 1.5 }}>
                  <Typography variant="subtitle1" noWrap sx={{ fontWeight: 600 }}>
                    {user.name || user.email}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {user.email}
                  </Typography>
                  {user.rol === 'admin' && (
                    <Chip
                      size="small"
                      color="secondary"
                      label="Administrador"
                      icon={<AdminPanelSettingsIcon fontSize="small" />}
                      sx={{ mt: 1, fontWeight: 600 }}
                    />
                  )}
                </Box>

                <Divider />

                <MenuItem
                  component={Link}
                  to="/perfil"
                  onClick={() => setAnchorElUser(null)}
                  sx={{ gap: 1.5 }}
                >
                  <AccountCircleIcon fontSize="small" />
                  Mi Perfil
                </MenuItem>

                {user.rol === 'admin' && (
                  <MenuItem
                    component={Link}
                    to="/configuracion"
                    onClick={() => setAnchorElUser(null)}
                    sx={{ gap: 1.5 }}
                  >
                    <SettingsIcon fontSize="small" />
                    Configuración
                  </MenuItem>
                )}

                <Divider />

                <MenuItem onClick={handleLogout} sx={{ gap: 1.5, color: 'error.main' }}>
                  <LogoutIcon fontSize="small" />
                  Cerrar Sesión
                </MenuItem>
              </Menu>
            </Box>
          ) : (
            // Botón de inicio de sesión si no está autenticado
            <Button
              color="inherit"
              component={Link}
              to="/login"
              sx={{ ml: 2 }}
            >
              Iniciar Sesión
            </Button>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default ResponsiveAppBar;