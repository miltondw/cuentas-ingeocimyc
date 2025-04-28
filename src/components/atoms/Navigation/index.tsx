import React, { ReactNode } from "react";
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
  ListItemText,
  Collapse,
  Paper,
  Popper,
  Grow,
  ClickAwayListener,
  MenuList,
} from "@mui/material";
import {
  Menu as MenuIcon,
  AccountCircle as AccountCircleIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  ExpandMore,
  ExpandLess,
} from "@mui/icons-material";
import { Link } from "react-router-dom";
import { useResponsiveAppBar } from "./navigationHook";

const ResponsiveAppBar: React.FC = () => {
  const {
    anchorElNav,
    openSubMenuMobile,
    anchorElUser,
    openSubMenuDesktop,
    anchorSubMenuDesktop,
    pages,
    user,
    isAuthenticated,
    setAnchorElUser,
    handleOpenMobileMenu,
    handleToggleSubMenuMobile,
    handleToggleSubMenuDesktop,
    handleCloseSubMenuDesktop,
    handleCloseAll,
    handleLogout,
    getInitials,
    menuConfig,
  } = useResponsiveAppBar();

  const renderMobileMenu = (): ReactNode => (
    <Menu
      anchorEl={anchorElNav}
      open={Boolean(anchorElNav)}
      onClose={handleCloseAll}
      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      transformOrigin={{ vertical: "top", horizontal: "left" }}
      sx={{ "& .MuiPaper-root": { width: "80%", maxWidth: "300px" } }}
    >
      {Object.keys(pages).map((menuKey) => {
        const menuItem = menuConfig.menuItems.find(
          (item) => item.key === menuKey
        );
        return (
          <React.Fragment key={menuKey}>
            <MenuItem onClick={() => handleToggleSubMenuMobile(menuKey)}>
              <ListItemText primary={menuItem?.label} />
              {openSubMenuMobile[menuKey] ? <ExpandLess /> : <ExpandMore />}
            </MenuItem>
            <Collapse
              in={openSubMenuMobile[menuKey]}
              timeout="auto"
              unmountOnExit
            >
              <Box sx={{ pl: 2 }}>
                {pages[menuKey]?.map((page) => (
                  <MenuItem
                    key={page.link}
                    component={Link}
                    to={`/${page.link}`}
                    onClick={handleCloseAll}
                  >
                    {page.title}
                  </MenuItem>
                ))}
              </Box>
            </Collapse>
          </React.Fragment>
        );
      })}
    </Menu>
  );

  const renderDesktopMenu = (): ReactNode => (
    <Box
      sx={{
        flexGrow: 1,
        display: { xs: "none", md: "flex" },
        justifyContent: "flex-end",
        gap: 2,
      }}
    >
      {Object.keys(pages).map((menuKey) => {
        const menuItem = menuConfig.menuItems.find(
          (item) => item.key === menuKey
        );
        return (
          <Box key={menuKey} sx={{ position: "relative" }}>
            <Button
              onClick={handleToggleSubMenuDesktop(menuKey)}
              sx={{
                color: "white",
                "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.08)" },
              }}
              endIcon={
                openSubMenuDesktop[menuKey] ? <ExpandLess /> : <ExpandMore />
              }
            >
              {menuItem?.label}
            </Button>

            <Popper
              open={openSubMenuDesktop[menuKey]}
              anchorEl={anchorSubMenuDesktop[menuKey]}
              role={undefined}
              transition
              disablePortal
              sx={{ zIndex: 1200, width: "100%", minWidth: "200px" }}
            >
              {({ TransitionProps, placement }) => (
                <Grow
                  {...TransitionProps}
                  style={{
                    transformOrigin:
                      placement === "bottom" ? "center top" : "center bottom",
                  }}
                >
                  <Paper elevation={3} sx={{ mt: 1 }}>
                    <ClickAwayListener
                      onClickAway={() => handleCloseSubMenuDesktop(menuKey)}
                    >
                      <MenuList autoFocusItem={openSubMenuDesktop[menuKey]}>
                        {pages[menuKey]?.map((page) => (
                          <MenuItem
                            key={page.link}
                            component={Link}
                            to={`/${page.link}`}
                            onClick={() => handleCloseSubMenuDesktop(menuKey)}
                            sx={{
                              "&:hover": { backgroundColor: "action.hover" },
                            }}
                          >
                            {page.title}
                          </MenuItem>
                        ))}
                      </MenuList>
                    </ClickAwayListener>
                  </Paper>
                </Grow>
              )}
            </Popper>
          </Box>
        );
      })}
    </Box>
  );

  const renderUserMenu = (): ReactNode => {
    if (!user) {
      return null; // or return some default/loading state
    }

    return (
      <Menu
        anchorEl={anchorElUser}
        open={Boolean(anchorElUser)}
        onClose={() => setAnchorElUser(null)}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1.5,
            minWidth: 180,
            overflow: "visible",
            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
            "&:before": {
              content: '""',
              display: "block",
              position: "absolute",
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: "background.paper",
              transform: "translateY(-50%) rotate(45deg)",
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
          {user.rol === "admin" && (
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
          <AccountCircleIcon fontSize="small" /> Mi Perfil
        </MenuItem>

        {user.rol === "admin" && (
          <MenuItem
            component={Link}
            to="/configuracion"
            onClick={() => setAnchorElUser(null)}
            sx={{ gap: 1.5 }}
          >
            <SettingsIcon fontSize="small" /> Configuración
          </MenuItem>
        )}

        <Divider />

        <MenuItem onClick={handleLogout} sx={{ gap: 1.5, color: "error.main" }}>
          <LogoutIcon fontSize="small" /> Cerrar Sesión
        </MenuItem>
      </Menu>
    );
  };

  return (
    <AppBar position="relative">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Logo */}
          <Link
            to={isAuthenticated ? "/proyectos" : "/login"}
            style={{
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Typography
              variant="h5"
              noWrap
              sx={{
                mr: 2,
                display: { xs: "none", md: "flex" },
                fontWeight: 700,
                color: "inherit",
              }}
            >
              <img
                src="/logo-ingeocimyc.svg"
                alt="logo ingeocimyc"
                width="90px"
              />
              <Box sx={{ display: "flex", flexDirection: "column", ml: 1 }}>
                <span style={{ fontSize: "1.8rem" }}>INGEOCIMYC</span>
                <span style={{ fontSize: "0.55rem" }}>
                  LABORATORIO DE GEOTECNIA Y CONCRETOS
                </span>
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
              display: { xs: "flex", md: "none" },
              flexGrow: 1,
              fontWeight: 700,
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <img
              src="/logo-ingeocimyc.svg"
              alt="logo ingeocimyc"
              width="50px"
            />
          </Typography>

          {/* Menús */}
          {isAuthenticated && (
            <>
              <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
                <IconButton
                  size="large"
                  onClick={handleOpenMobileMenu}
                  color="inherit"
                >
                  <MenuIcon />
                </IconButton>
                {renderMobileMenu()}
              </Box>

              {renderDesktopMenu()}
            </>
          )}

          {/* Menú Usuario */}
          {isAuthenticated && user ? (
            <Box sx={{ flexGrow: 0, ml: 2 }}>
              <Tooltip title="Ajustes de usuario">
                <IconButton
                  onClick={(e) => setAnchorElUser(e.currentTarget)}
                  sx={{ p: 0 }}
                >
                  <Avatar
                    sx={{
                      bgcolor:
                        user.rol === "admin"
                          ? "secondary.main"
                          : "primary.main",
                    }}
                  >
                    {getInitials()}
                  </Avatar>
                </IconButton>
              </Tooltip>
              {renderUserMenu()}
            </Box>
          ) : (
            <Button color="inherit" component={Link} to="/login" sx={{ ml: 2 }}>
              Iniciar Sesión
            </Button>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default ResponsiveAppBar;
