import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../api/AuthContext";
import { menuConfig } from "./menuConfig";

export const useResponsiveAppBar = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  // Estados para manejar menús
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);

  // Crear estados dinámicos basados en la configuración
  const initialMenuState = menuConfig.menuItems.reduce((acc, item) => {
    acc[item.key] = false;
    return acc;
  }, {});

  const [openSubMenuMobile, setOpenSubMenuMobile] = useState(initialMenuState);
  const [openSubMenuDesktop, setOpenSubMenuDesktop] =
    useState(initialMenuState);
  const [anchorSubMenuDesktop, setAnchorSubMenuDesktop] = useState(
    menuConfig.menuItems.reduce((acc, item) => {
      acc[item.key] = null;
      return acc;
    }, {})
  );

  const generatePages = useCallback(() => {
    const result = {};
    menuConfig.menuItems.forEach((item) => {
      const normalizedUserRole = user?.rol?.toLowerCase();
      const normalizedItemRoles = item.roles?.map((role) => role.toLowerCase());

      if (!item.roles || normalizedItemRoles.includes(normalizedUserRole)) {
        result[item.key] = [...item.items];
        if (item.adminItems && normalizedUserRole === "admin") {
          result[item.key].push(...item.adminItems);
        }
      }
    });
    return result;
  }, [user]);

  const [pages, setPages] = useState(generatePages());
  useEffect(() => {
    setPages(generatePages());
  }, [user, generatePages]);

  // Móvil: Manejo de menús
  const handleOpenMobileMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleToggleSubMenuMobile = useCallback((menu) => {
    setOpenSubMenuMobile((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }));
  }, []);

  // Escritorio: Manejo de submenús
  const handleToggleSubMenuDesktop = useCallback(
    (menu) => (event) => {
      setAnchorSubMenuDesktop((prev) => ({
        ...prev,
        [menu]: event.currentTarget,
      }));
      setOpenSubMenuDesktop((prev) => ({
        ...prev,
        [menu]: !prev[menu],
      }));
    },
    []
  );

  const handleCloseSubMenuDesktop = useCallback((menu) => {
    setOpenSubMenuDesktop((prev) => ({
      ...prev,
      [menu]: false,
    }));
  }, []);

  // Cierre general
  const handleCloseAll = useCallback(() => {
    setAnchorElNav(null);
    setOpenSubMenuMobile(initialMenuState);
    setOpenSubMenuDesktop(initialMenuState);
  }, [initialMenuState]);

  // Manejo de cierre de sesión
  const handleLogout = useCallback(async () => {
    setAnchorElUser(null);
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  }, [logout, navigate]);

  // Generar iniciales para avatar
  const getInitials = useCallback(() => {
    if (!user || !user.name) return "?";
    return user.name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  }, [user]);

  return {
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
  };
};
