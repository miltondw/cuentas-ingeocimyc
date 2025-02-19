import React from "react";
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
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Link } from "react-router-dom";

const pages = {
  create: [
    { title: "Proyecto", link: "crear-proyecto" },
    { title: "Gasto del Mes", link: "crear-gasto-mes" },
  ],
  tables: [
    { title: "Proyectos", link: "proyectos" },
    { title: "Utilidades", link: "utilidades" },
    { title: "Gastos", link: "gastos" },
  ],
};

const settings = ["perfil", "cerrar sesión"];

function ResponsiveAppBar() {
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [currentSubMenu, setCurrentSubMenu] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const [desktopSubMenuAnchor, setDesktopSubMenuAnchor] = React.useState({ create: null, tables: null });

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

  return (
    <AppBar position="relative">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Logo */}
          <Link to="/" style={{ textDecoration: "none", display: 'flex', alignItems: 'center' }}>
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

          {/* Menú Usuario */}
          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Ajustes">
              <IconButton onClick={(e) => setAnchorElUser(e.currentTarget)} sx={{ p: 0 }}>
                <Avatar alt="Usuario" src="/static/images/avatar/2.jpg" />
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={anchorElUser}
              open={Boolean(anchorElUser)}
              onClose={() => setAnchorElUser(null)}
            >
              {settings.map((setting) => (
                <MenuItem key={setting} onClick={() => setAnchorElUser(null)}>
                  {setting}
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default ResponsiveAppBar;