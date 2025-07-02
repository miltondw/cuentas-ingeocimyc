import { useState } from "react";
import { useUrlFilters } from "@/hooks/useUrlFilters";
import { usePagination } from "@/hooks/usePagination";
import type { Service } from "../types/types";

export function useServiceFilters(services: Service[]) {
  const [searchValue, setSearchValue] = useState("");
  const { filters, updateFilter } = useUrlFilters({
    defaultFilters: {
      category: "all",
      hasAdditionalFields: "all",
      createdDateRange: "all",
    },
  });

  // Filtrado
  const filteredServices = services.filter((service: Service) => {
    const matchesCategory =
      filters.category === "all" ||
      service.categoryId.toString() === filters.category;
    const matchesSearch =
      !searchValue ||
      service.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      service.code.toLowerCase().includes(searchValue.toLowerCase());
    const matchesAdditionalFields =
      filters.hasAdditionalFields === "all" ||
      (filters.hasAdditionalFields === "with" &&
        service.additionalFields &&
        service.additionalFields.length > 0) ||
      (filters.hasAdditionalFields === "without" &&
        (!service.additionalFields || service.additionalFields.length === 0));
    const matchesDateRange = (() => {
      if (filters.createdDateRange === "all") return true;
      const serviceDate = new Date(service.created_at);
      const now = new Date();
      switch (filters.createdDateRange) {
        case "today":
          return serviceDate.toDateString() === now.toDateString();
        case "week": {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return serviceDate >= weekAgo;
        }
        case "month": {
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return serviceDate >= monthAgo;
        }
        case "year": {
          const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          return serviceDate >= yearAgo;
        }
        default:
          return true;
      }
    })();
    return (
      matchesCategory &&
      matchesSearch &&
      matchesAdditionalFields &&
      matchesDateRange
    );
  });

  // Paginación
  const {
    paginatedData,
    paginationData,
    setPage,
    setItemsPerPage,
    goToFirstPage,
  } = usePagination({
    data: filteredServices,
    initialPage: 1,
    initialItemsPerPage: 10,
  });

  return {
    searchValue,
    setSearchValue,
    filters,
    updateFilter,
    filteredServices,
    paginatedData,
    paginationData,
    setPage,
    setItemsPerPage,
    goToFirstPage,
  };
}
