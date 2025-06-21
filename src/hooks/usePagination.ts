import { useState, useMemo } from "react";
import type { PaginationData } from "@/components/common/DataTablePagination";

export interface UsePaginationProps {
  data: unknown[];
  initialPage?: number;
  initialItemsPerPage?: number;
  serverSide?: boolean;
  totalItems?: number;
  totalPages?: number;
}

export interface UsePaginationReturn {
  paginatedData: unknown[];
  paginationData: PaginationData;
  currentPage: number;
  itemsPerPage: number;
  setPage: (page: number) => void;
  setItemsPerPage: (itemsPerPage: number) => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
}

/**
 * Hook personalizado para manejar paginación
 * Soporta tanto paginación del lado del cliente como del servidor
 */
export const usePagination = ({
  data,
  initialPage = 1,
  initialItemsPerPage = 10,
  serverSide = false,
  totalItems,
  totalPages,
}: UsePaginationProps): UsePaginationReturn => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);

  // Calcular datos de paginación
  const paginationData = useMemo((): PaginationData => {
    if (serverSide) {
      // Paginación del lado del servidor
      const total = totalItems ?? 0;
      const pages = totalPages ?? Math.ceil(total / itemsPerPage);
      const startItem = total === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
      const endItem = Math.min(currentPage * itemsPerPage, total);

      return {
        currentPage,
        totalPages: pages,
        totalItems: total,
        itemsPerPage,
        startItem,
        endItem,
      };
    } else {
      // Paginación del lado del cliente
      const total = data.length;
      const pages = Math.ceil(total / itemsPerPage);
      const startItem = total === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
      const endItem = Math.min(currentPage * itemsPerPage, total);

      return {
        currentPage,
        totalPages: pages,
        totalItems: total,
        itemsPerPage,
        startItem,
        endItem,
      };
    }
  }, [
    currentPage,
    itemsPerPage,
    data.length,
    serverSide,
    totalItems,
    totalPages,
  ]);

  // Calcular datos paginados (solo para paginación del lado del cliente)
  const paginatedData = useMemo(() => {
    if (serverSide) {
      return data; // En modo servidor, los datos ya vienen paginados
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  }, [data, currentPage, itemsPerPage, serverSide]);

  // Funciones de navegación
  const setPage = (page: number) => {
    const validPage = Math.max(1, Math.min(page, paginationData.totalPages));
    setCurrentPage(validPage);
  };

  const setItemsPerPageHandler = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    // Recalcular página actual para mantener aproximadamente los mismos elementos visibles
    const currentStartItem = (currentPage - 1) * itemsPerPage + 1;
    const newPage = Math.ceil(currentStartItem / newItemsPerPage);
    setCurrentPage(Math.max(1, newPage));
  };

  const goToFirstPage = () => setPage(1);
  const goToLastPage = () => setPage(paginationData.totalPages);
  const goToNextPage = () => setPage(currentPage + 1);
  const goToPreviousPage = () => setPage(currentPage - 1);

  return {
    paginatedData,
    paginationData,
    currentPage,
    itemsPerPage,
    setPage,
    setItemsPerPage: setItemsPerPageHandler,
    goToFirstPage,
    goToLastPage,
    goToNextPage,
    goToPreviousPage,
  };
};

export default usePagination;
