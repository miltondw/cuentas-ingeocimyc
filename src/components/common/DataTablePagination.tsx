import React from "react";
import {
  TablePagination,
  Box,
  Typography,
  useTheme,
  useMediaQuery,
  IconButton,
  Stack,
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";
import {
  FirstPage as FirstPageIcon,
  LastPage as LastPageIcon,
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon,
} from "@mui/icons-material";

export interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  startItem: number;
  endItem: number;
}

export interface DataTablePaginationProps {
  paginationData: PaginationData;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  rowsPerPageOptions?: number[];
  labelRowsPerPage?: string;
  labelDisplayedRows?: (info: {
    from: number;
    to: number;
    count: number;
  }) => string;
  showFirstLastButtons?: boolean;
  showRowsPerPage?: boolean;
  compact?: boolean;
}

const DataTablePagination: React.FC<DataTablePaginationProps> = ({
  paginationData,
  onPageChange,
  onRowsPerPageChange,
  rowsPerPageOptions = [5, 10, 25, 50],
  labelRowsPerPage = "Filas por página:",
  labelDisplayedRows = ({ from, to, count }) =>
    `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`,
  showFirstLastButtons = true,
  showRowsPerPage = true,
  compact = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const {
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    startItem,
    endItem,
  } = paginationData;

  // Handlers para MUI TablePagination (usa 0-indexed)
  const handleChangePage = (_: unknown, newPage: number) => {
    onPageChange(newPage + 1); // Convertir a 1-indexed
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    onRowsPerPageChange(parseInt(event.target.value, 10));
  };

  // Handlers para botones personalizados
  const handleFirstPage = () => onPageChange(1);
  const handleLastPage = () => onPageChange(totalPages);
  const handlePreviousPage = () => onPageChange(Math.max(1, currentPage - 1));
  const handleNextPage = () =>
    onPageChange(Math.min(totalPages, currentPage + 1));

  // Renderizar paginación compacta para móviles
  if (compact || isMobile) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          p: 2,
          borderTop: "1px solid",
          borderColor: "divider",
          backgroundColor: "grey.50",
        }}
      >
        {/* Información de elementos */}
        <Typography variant="body2" color="text.secondary">
          {labelDisplayedRows({
            from: startItem,
            to: endItem,
            count: totalItems,
          })}
        </Typography>
        {/* Controles de navegación */}
        <Stack direction="row" spacing={1} alignItems="center">
          {showFirstLastButtons && (
            <IconButton
              onClick={handleFirstPage}
              disabled={currentPage === 1}
              size="small"
              title="Primera página"
            >
              <FirstPageIcon />
            </IconButton>
          )}

          <IconButton
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            size="small"
            title="Página anterior"
          >
            <NavigateBeforeIcon />
          </IconButton>

          <Typography
            variant="body2"
            sx={{ minWidth: 80, textAlign: "center" }}
          >
            Página {currentPage} de {totalPages}
          </Typography>

          <IconButton
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            size="small"
            title="Página siguiente"
          >
            <NavigateNextIcon />
          </IconButton>

          {showFirstLastButtons && (
            <IconButton
              onClick={handleLastPage}
              disabled={currentPage === totalPages}
              size="small"
              title="Última página"
            >
              <LastPageIcon />
            </IconButton>
          )}
        </Stack>{" "}
        {/* Selector de filas por página (solo en modo no móvil) */}
        {showRowsPerPage && !isMobile && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {labelRowsPerPage}
            </Typography>
            <FormControl size="small">
              <Select
                value={itemsPerPage}
                onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
                sx={{
                  minWidth: 80,
                  "& .MuiSelect-select": {
                    py: 0.5,
                    px: 1,
                    fontSize: "0.875rem",
                  },
                }}
              >
                {rowsPerPageOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        )}
      </Box>
    );
  }

  // Renderizar paginación completa para escritorio
  const safePage = Math.max(0, Math.min(Math.max(0, totalPages - 1), currentPage - 1));
  return (
    <TablePagination
      rowsPerPageOptions={showRowsPerPage ? rowsPerPageOptions : []}
      component="div"
      count={totalItems}
      rowsPerPage={itemsPerPage}
      page={safePage} // Clamp para evitar valores fuera de rango
      onPageChange={handleChangePage}
      onRowsPerPageChange={handleChangeRowsPerPage}
      labelRowsPerPage={showRowsPerPage ? labelRowsPerPage : ""}
      labelDisplayedRows={labelDisplayedRows}
      showFirstButton={showFirstLastButtons}
      showLastButton={showFirstLastButtons}
      sx={{
        borderTop: "1px solid",
        borderColor: "divider",
        backgroundColor: "grey.50",
        "& .MuiTablePagination-toolbar": {
          paddingLeft: 2,
          paddingRight: 2,
        },
        "& .MuiTablePagination-selectLabel": {
          marginBottom: 0,
        },
        "& .MuiTablePagination-displayedRows": {
          marginBottom: 0,
        },
      }}
    />
  );
};

export default DataTablePagination;
