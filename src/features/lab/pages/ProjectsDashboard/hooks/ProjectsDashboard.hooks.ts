import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";

export function useProjectNavigation() {
  const navigate = useNavigate();
  const createNavigationHandler = useCallback(
    (basePath: string) => (projectId: number) => {
      navigate(`/lab/proyectos/${projectId}${basePath}`);
    },
    [navigate]
  );
  return {
    handleCreateApique: createNavigationHandler("/apique/nuevo"),
    handleViewApiques: createNavigationHandler("/apiques"),
    handleCreateProfile: createNavigationHandler("/perfil/nuevo"),
    handleViewProfiles: createNavigationHandler("/perfiles"),
  };
}

export function useFilterGetters(searchParams: URLSearchParams) {
  const getFilter = (key: string, defaultValue?: string) =>
    searchParams.get(key) || defaultValue;
  const getBooleanFilter = (key: string) => {
    const value = searchParams.get(key);
    return value === "true" ? true : value === "false" ? false : undefined;
  };
  const getNumberFilter = (key: string) => {
    const value = searchParams.get(key);
    return value ? parseInt(value) : undefined;
  };
  return { getFilter, getBooleanFilter, getNumberFilter };
}

export function useHasActiveFilters(searchParams: URLSearchParams) {
  return useMemo(() => {
    const params = Object.fromEntries(searchParams.entries());
    const activeParams = Object.keys(params).filter(
      (key) => !["page", "limit", "sortBy", "sortOrder"].includes(key)
    );
    return activeParams.length > 0;
  }, [searchParams]);
}
