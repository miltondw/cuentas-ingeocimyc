import React, { useState } from "react";
import {
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  Checkbox,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Chip,
  Box,
  Typography,
  Tooltip,
  useTheme,
  useMediaQuery,
  alpha,
} from "@mui/material";
import { MoreVert as MoreVertIcon } from "@mui/icons-material";
import { LoadingOverlay } from "./LoadingOverlay";
import { SearchAndFilter, FilterField } from "./SearchAndFilter";
import DataTablePagination, {
  type PaginationData,
} from "./DataTablePagination";

export interface ColumnConfig<T = unknown> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  width?: string | number;
  align?: "left" | "center" | "right";
  render?: (value: unknown, row: T) => React.ReactNode;
}

export interface RowAction<T = unknown> {
  key: string;
  label: string;
  icon?: React.ReactNode;
  color?: "primary" | "secondary" | "error" | "warning";
  action: (row: T) => void;
}

export interface DataTableProps<T = unknown> {
  data: T[];
  columns: ColumnConfig<T>[];
  keyField?: keyof T | string;
  loading?: boolean;

  // Search and filters
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filters?: FilterField[];
  filterValues?: Record<string, unknown>;
  onFilterChange?: (key: string, value: unknown) => void;

  // Selection
  selectable?: boolean;
  selectedRows?: Set<string | number>;
  onSelectionChange?: (selectedIds: Set<string | number>) => void;

  // Actions
  rowActions?: RowAction<T>[];

  // Callbacks
  onRowClick?: (row: T) => void;

  // Pagination
  enablePagination?: boolean;
  paginationData?: PaginationData;
  onPageChange?: (page: number) => void;
  onRowsPerPageChange?: (rowsPerPage: number) => void;
  rowsPerPageOptions?: number[];

  // UI
  title?: string;
  emptyMessage?: string;
}

const TableCellRenderer: React.FC<{
  column: ColumnConfig;
  value: unknown;
  row: unknown;
}> = ({ column, value, row }) => {
  if (column.render) {
    return <>{column.render(value, row)}</>;
  }

  if (typeof value === "boolean") {
    return (
      <Chip
        label={value ? "Sí" : "No"}
        size="small"
        color={value ? "success" : "default"}
        variant="outlined"
      />
    );
  }
  if (typeof value === "number") {
    return (
      <Typography
        variant="body2"
        sx={{
          fontWeight: "medium",
          fontSize: "0.875rem",
          fontFamily: "monospace",
          textAlign: "right",
          color: "text.primary",
        }}
      >
        {value.toLocaleString("es-ES", {
          minimumFractionDigits: value % 1 === 0 ? 0 : 2,
          maximumFractionDigits: 2,
        })}
      </Typography>
    );
  }
  const stringValue = value?.toString() || "-";
  const isLongText = stringValue.length > 50;

  if (isLongText) {
    return (
      <Tooltip
        title={
          <Typography
            variant="body2"
            sx={{ whiteSpace: "pre-wrap", maxWidth: 300 }}
          >
            {stringValue}
          </Typography>
        }
        arrow
        placement="top"
        componentsProps={{
          tooltip: {
            sx: {
              backgroundColor: "rgba(97, 97, 97, 0.95)",
              fontSize: "0.75rem",
              maxWidth: 350,
            },
          },
        }}
      >
        <Box
          sx={{
            cursor: "help",
            maxWidth: column.width || "200px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            "&:hover": {
              color: "primary.main",
            },
          }}
        >
          <Typography
            variant="body2"
            component="span"
            sx={{
              fontSize: "0.875rem",
              lineHeight: 1.4,
            }}
          >
            {stringValue}
          </Typography>
        </Box>
      </Tooltip>
    );
  }

  return (
    <Typography
      variant="body2"
      sx={{
        maxWidth: column.width || "200px",
        wordBreak: "break-word",
        fontSize: "0.875rem",
        lineHeight: 1.4,
        hyphens: "auto",
      }}
    >
      {stringValue}
    </Typography>
  );
};

export const DataTable: React.FC<DataTableProps> = ({
  data,
  columns,
  keyField = "id" as keyof unknown | string,
  loading = false,
  searchValue = "",
  onSearchChange,
  filters = [],
  filterValues = {},
  onFilterChange,
  selectable = false,
  selectedRows = new Set(),
  onSelectionChange,
  rowActions = [],
  onRowClick,
  enablePagination = false,
  paginationData,
  onPageChange,
  onRowsPerPageChange,
  rowsPerPageOptions = [5, 10, 25, 50],
  title,
  emptyMessage = "No hay datos disponibles",
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [actionAnchorEl, setActionAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const [selectedRowForAction, setSelectedRowForAction] =
    useState<unknown>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Detectar capacidad de scroll horizontal
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollLeft, scrollWidth, clientWidth } = e.currentTarget;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  };
  // Handle selection
  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return;

    if (checked) {
      const allIds = new Set(
        data
          .map((row, index) => {
            const id = (row as Record<string, unknown>)[keyField as string];
            return id !== undefined && id !== null ? id : `row-${index}`;
          })
          .filter(
            (id): id is string | number =>
              typeof id === "string" || typeof id === "number"
          )
      );
      onSelectionChange(allIds);
    } else {
      onSelectionChange(new Set());
    }
  };

  const handleSelectRow = (rowId: string | number, checked: boolean) => {
    if (!onSelectionChange) return;

    const newSelection = new Set(selectedRows);
    if (checked) {
      newSelection.add(rowId);
    } else {
      newSelection.delete(rowId);
    }
    onSelectionChange(newSelection);
  };

  const isAllSelected = data.length > 0 && selectedRows.size === data.length;
  const isIndeterminate =
    selectedRows.size > 0 && selectedRows.size < data.length;
  const renderEmptyState = () => {
    const hasActiveFilters = Object.values(filterValues).some((value) =>
      Array.isArray(value) ? value.length > 0 : Boolean(value)
    );

    return (
      <Box
        sx={{
          textAlign: "center",
          py: 8,
          px: 4,
          backgroundColor: "grey.50",
          borderRadius: 2,
          border: "2px dashed",
          borderColor: "grey.300",
          margin: 2,
          transition: "all 0.3s ease",
          "&:hover": {
            borderColor: "primary.300",
            backgroundColor: "primary.25",
          },
        }}
      >
        <Typography
          variant="h6"
          color="text.secondary"
          gutterBottom
          sx={{ fontSize: "1.125rem", fontWeight: 600 }}
        >
          📋 {emptyMessage}
        </Typography>
        <Typography
          variant="body2"
          color="text.disabled"
          sx={{ mb: 2, fontSize: "0.875rem" }}
        >
          {hasActiveFilters || searchValue
            ? "No se encontraron resultados que coincidan con los criterios de búsqueda"
            : "Aún no hay datos disponibles para mostrar"}
        </Typography>
        {(hasActiveFilters || searchValue) && (
          <Typography
            variant="caption"
            color="text.disabled"
            sx={{
              fontStyle: "italic",
              display: "block",
              mt: 1,
            }}
          >
            Intenta ajustar los filtros o la búsqueda para ver más resultados
          </Typography>
        )}
      </Box>
    );
  };

  return (
    <Box>
      {/* Title */}
      {title && (
        <Typography variant="h5" component="h2" gutterBottom>
          {title}
        </Typography>
      )}
      {/* Search and Filter */}
      {(onSearchChange || filters.length > 0) && (
        <SearchAndFilter
          searchValue={searchValue}
          onSearchChange={onSearchChange || (() => {})}
          filters={filters}
          filterValues={filterValues}
          onFilterChange={onFilterChange || (() => {})}
        />
      )}

      {/* Table */}
      <LoadingOverlay loading={loading} type="skeleton">
        {data.length === 0 ? (
          renderEmptyState()
        ) : (
          <Box sx={{ position: "relative" }}>
            {/* Indicadores de scroll horizontal */}
            {isMobile && canScrollLeft && (
              <Box
                sx={{
                  position: "absolute",
                  left: 0,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 20,
                  height: "80%",
                  background:
                    "linear-gradient(to right, rgba(0,0,0,0.1), transparent)",
                  pointerEvents: "none",
                  zIndex: 5,
                  borderRadius: "0 10px 10px 0",
                }}
              />
            )}
            {isMobile && canScrollRight && (
              <Box
                sx={{
                  position: "absolute",
                  right: 0,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 20,
                  height: "80%",
                  background:
                    "linear-gradient(to left, rgba(0,0,0,0.1), transparent)",
                  pointerEvents: "none",
                  zIndex: 5,
                  borderRadius: "10px 0 0 10px",
                }}
              />
            )}

            <TableContainer
              component={Paper}
              sx={{
                maxHeight: isMobile ? 400 : 600,
                minHeight: 200,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                overflow: "auto",
                boxShadow: theme.shadows[2],
                transition: "box-shadow 0.3s ease",
                "&:hover": {
                  boxShadow: theme.shadows[4],
                },
                // Mejora del scroll en móviles
                ...(isMobile && {
                  touchAction: "pan-x pan-y",
                  WebkitOverflowScrolling: "touch",
                }),
              }}
              onScroll={handleScroll}
            >
              <Table
                stickyHeader
                sx={{
                  minWidth: isMobile ? 600 : 1000,
                  tableLayout: "fixed",
                }}
              >
                <TableHead>
                  <TableRow>
                    {selectable && (
                      <TableCell
                        padding="checkbox"
                        sx={{
                          backgroundColor: alpha(theme.palette.grey[100], 0.8),
                          borderBottom: "2px solid",
                          borderColor: "divider",
                          position: "sticky",
                          top: 0,
                          zIndex: 10,
                          backdropFilter: "blur(8px)",
                          borderRight: "1px solid",
                          borderRightColor: "grey.300",
                        }}
                      >
                        <Checkbox
                          indeterminate={isIndeterminate}
                          checked={isAllSelected}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          color="primary"
                        />
                      </TableCell>
                    )}

                    {columns.map((column) => (
                      <TableCell
                        key={String(column.key)}
                        align={column.align}
                        sx={{
                          width: column.width,
                          minWidth: column.width ? "auto" : 120,
                          maxWidth: column.width || 250,
                          fontWeight: "bold",
                          backgroundColor: alpha(theme.palette.grey[100], 0.8),
                          borderBottom: "2px solid",
                          borderColor: "divider",
                          position: "sticky",
                          top: 0,
                          zIndex: 10,
                          fontSize: "0.8rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          color: "text.primary",
                          backdropFilter: "blur(8px)",
                          "&:not(:last-child)": {
                            borderRight: "1px solid",
                            borderRightColor: "grey.300",
                          },
                        }}
                      >
                        {column.label}
                      </TableCell>
                    ))}
                    {rowActions.length > 0 && (
                      <TableCell
                        align="center"
                        sx={{
                          width: 80,
                          fontWeight: "bold",
                          backgroundColor: alpha(theme.palette.grey[100], 0.8),
                          borderBottom: "2px solid",
                          borderColor: "divider",
                          position: "sticky",
                          top: 0,
                          zIndex: 10,
                          fontSize: "0.8rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          color: "text.primary",
                          backdropFilter: "blur(8px)",
                        }}
                      >
                        Acciones
                      </TableCell>
                    )}
                  </TableRow>
                </TableHead>{" "}
                <TableBody>
                  {data.map((row, index) => {
                    const rowId = (row as Record<string, unknown>)[
                      keyField as string
                    ]; // Generar un key único incluso si rowId es undefined
                    const uniqueKey =
                      rowId !== undefined && rowId !== null
                        ? String(rowId)
                        : `row-${index}`;
                    const selectionId =
                      rowId !== undefined && rowId !== null
                        ? (rowId as string | number)
                        : uniqueKey;
                    const isSelected = selectedRows.has(selectionId);

                    return (
                      <TableRow
                        key={uniqueKey}
                        hover={!!onRowClick}
                        selected={isSelected}
                        sx={{
                          cursor: onRowClick ? "pointer" : "default",
                          "&:nth-of-type(odd)": {
                            backgroundColor: "grey.50",
                          },
                          "&:hover": {
                            backgroundColor: onRowClick
                              ? "action.hover"
                              : "grey.100",
                            transform: onRowClick ? "translateY(-1px)" : "none",
                            transition: "all 0.2s ease-in-out",
                          },
                          "&.Mui-selected": {
                            backgroundColor: "primary.50",
                            "&:hover": {
                              backgroundColor: "primary.100",
                            },
                          },
                          borderBottom: "1px solid",
                          borderColor: "divider",
                        }}
                        onClick={onRowClick ? () => onRowClick(row) : undefined}
                      >
                        {selectable && (
                          <TableCell
                            padding="checkbox"
                            sx={{
                              borderBottom: "1px solid",
                              borderColor: "divider",
                            }}
                          >
                            {" "}
                            <Checkbox
                              checked={isSelected}
                              onChange={(e) => {
                                e.stopPropagation();
                                handleSelectRow(selectionId, e.target.checked);
                              }}
                              color="primary"
                            />
                          </TableCell>
                        )}

                        {columns.map((column) => (
                          <TableCell
                            key={String(column.key)}
                            align={column.align}
                            sx={{
                              borderBottom: "1px solid",
                              borderColor: "divider",
                              py: 2,
                              px: 2,
                              minWidth: column.width ? "auto" : 120,
                              maxWidth: column.width || 250,
                              width: column.width,
                              verticalAlign: "top",
                              position: "relative",
                              "&:not(:last-child)": {
                                borderRight: "1px solid",
                                borderRightColor: "grey.200",
                              },
                            }}
                          >
                            <TableCellRenderer
                              column={column}
                              value={
                                (row as Record<string, unknown>)[
                                  column.key as string
                                ]
                              }
                              row={row}
                            />
                          </TableCell>
                        ))}
                        {rowActions.length > 0 && (
                          <TableCell
                            align="center"
                            sx={{
                              borderBottom: "1px solid",
                              borderColor: "divider",
                            }}
                          >
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedRowForAction(row);
                                setActionAnchorEl(e.currentTarget);
                              }}
                              sx={{
                                color: "text.secondary",
                                "&:hover": {
                                  color: "primary.main",
                                  backgroundColor: "primary.50",
                                },
                              }}
                            >
                              <MoreVertIcon />
                            </IconButton>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </LoadingOverlay>
      {/* Actions Menu */}
      <Menu
        anchorEl={actionAnchorEl}
        open={Boolean(actionAnchorEl)}
        onClose={() => {
          setActionAnchorEl(null);
          setSelectedRowForAction(null);
        }}
      >
        {rowActions.map((action) => (
          <MenuItem
            key={action.key}
            onClick={() => {
              action.action(selectedRowForAction);
              setActionAnchorEl(null);
              setSelectedRowForAction(null);
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              {action.icon}
              <span>{action.label}</span>
            </Stack>
          </MenuItem>
        ))}
      </Menu>

      {/* Pagination */}
      {enablePagination &&
        paginationData &&
        onPageChange &&
        onRowsPerPageChange && (
          <DataTablePagination
            paginationData={paginationData}
            onPageChange={onPageChange}
            onRowsPerPageChange={onRowsPerPageChange}
            rowsPerPageOptions={rowsPerPageOptions}
          />
        )}
    </Box>
  );
};

export default DataTable;
