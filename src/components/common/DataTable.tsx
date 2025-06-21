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
  isMobile?: boolean;
}> = ({ column, value, row, isMobile = false }) => {
  if (column.render) {
    return <>{column.render(value, row)}</>;
  }

  if (typeof value === "boolean") {
    return (
      <Chip
        label={value ? "Sí" : "No"}
        size={isMobile ? "small" : "medium"}
        color={value ? "success" : "default"}
        variant="outlined"
        sx={{
          fontSize: isMobile ? "0.6rem" : "0.75rem",
          height: isMobile ? 20 : 24,
        }}
      />
    );
  }
  if (typeof value === "number") {
    return (
      <Typography
        variant="body2"
        sx={{
          fontWeight: "medium",
          fontSize: isMobile ? "0.65rem" : "0.875rem",
          fontFamily: "monospace",
          textAlign: "right",
          color: "text.primary",
          lineHeight: 1.2,
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
  const maxLength = isMobile ? 12 : 50;
  const isLongText = stringValue.length > maxLength;

  if (isLongText) {
    return (
      <Tooltip
        title={
          <Typography
            variant="body2"
            sx={{
              whiteSpace: "pre-wrap",
              maxWidth: isMobile ? 280 : 320,
              fontSize: isMobile ? "0.7rem" : "0.75rem",
              lineHeight: 1.4,
              padding: "4px 0",
            }}
          >
            {stringValue}
          </Typography>
        }
        arrow
        placement="top-start"
        componentsProps={{
          tooltip: {
            sx: {
              backgroundColor: "rgba(0, 0, 0, 0.9)",
              fontSize: isMobile ? "0.65rem" : "0.75rem",
              maxWidth: isMobile ? 300 : 350,
              padding: "8px 12px",
              borderRadius: "8px",
            },
          },
        }}
      >
        <Box
          sx={{
            cursor: "help",
            maxWidth: isMobile ? "80px" : column.width || "180px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            display: "flex",
            alignItems: "center",
            "&:hover": {
              color: "primary.main",
              backgroundColor: "action.hover",
              borderRadius: "4px",
            },
            transition: "all 0.2s ease",
            padding: "2px 4px",
            margin: "-2px -4px",
          }}
        >
          <Typography
            variant="body2"
            component="span"
            sx={{
              fontSize: isMobile ? "0.65rem" : "0.875rem",
              lineHeight: 1.2,
              fontWeight: 400,
            }}
          >
            {isMobile ? `${stringValue.substring(0, 10)}...` : stringValue}
          </Typography>
        </Box>
      </Tooltip>
    );
  }

  return (
    <Box
      sx={{
        maxWidth: isMobile ? "100px" : column.width || "180px",
        minHeight: isMobile ? "20px" : "24px",
        display: "flex",
        alignItems: "center",
        py: isMobile ? 0.25 : 0.5,
      }}
    >
      <Typography
        variant="body2"
        sx={{
          wordBreak: "break-word",
          fontSize: isMobile ? "0.65rem" : "0.875rem",
          lineHeight: isMobile ? 1.3 : 1.4,
          hyphens: "auto",
          overflowWrap: "anywhere",
          fontWeight: 400,
          color: "text.primary",
        }}
      >
        {stringValue}
      </Typography>
    </Box>
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

      {/* Mobile Info Bar */}
      {isMobile && data.length > 0 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "primary.50",
            borderRadius: 1,
            padding: "8px 12px",
            marginBottom: 1,
            fontSize: "0.7rem",
            color: "primary.dark",
            border: "1px solid",
            borderColor: "primary.200",
          }}
        >
          <Typography
            variant="caption"
            sx={{ fontSize: "0.65rem", fontWeight: 500 }}
          >
            📊 {data.length} registro{data.length !== 1 ? "s" : ""}
          </Typography>
          <Typography
            variant="caption"
            sx={{ fontSize: "0.65rem", opacity: 0.8 }}
          >
            ← Desliza para ver más →
          </Typography>
        </Box>
      )}

      {/* Table */}
      <LoadingOverlay loading={loading} type="skeleton">
        {data.length === 0 ? (
          renderEmptyState()
        ) : (
          <Box sx={{ position: "relative" }}>
            {/* Indicadores de scroll horizontal mejorados */}
            {isMobile && canScrollLeft && (
              <Box
                sx={{
                  position: "absolute",
                  left: 0,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 30,
                  height: "80%",
                  background:
                    "linear-gradient(to right, rgba(25,118,210,0.15), transparent)",
                  pointerEvents: "none",
                  zIndex: 5,
                  borderRadius: "0 15px 15px 0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  paddingLeft: "8px",
                  "&::before": {
                    content: '"‹"',
                    color: "primary.main",
                    fontSize: "1.2rem",
                    fontWeight: "bold",
                    animation: "pulse 2s infinite",
                  },
                  "@keyframes pulse": {
                    "0%, 100%": { opacity: 0.6 },
                    "50%": { opacity: 1 },
                  },
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
                  width: 30,
                  height: "80%",
                  background:
                    "linear-gradient(to left, rgba(25,118,210,0.15), transparent)",
                  pointerEvents: "none",
                  zIndex: 5,
                  borderRadius: "15px 0 0 15px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  paddingRight: "8px",
                  "&::before": {
                    content: '"›"',
                    color: "primary.main",
                    fontSize: "1.2rem",
                    fontWeight: "bold",
                    animation: "pulse 2s infinite",
                  },
                  "@keyframes pulse": {
                    "0%, 100%": { opacity: 0.6 },
                    "50%": { opacity: 1 },
                  },
                }}
              />
            )}

            <TableContainer
              component={Paper}
              sx={{
                maxHeight: isMobile ? 500 : 600,
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
                  scrollBehavior: "smooth",
                }),
                // Mejor scrollbar para móviles
                "&::-webkit-scrollbar": {
                  height: isMobile ? 6 : 8,
                  width: isMobile ? 6 : 8,
                },
                "&::-webkit-scrollbar-track": {
                  background: "rgba(0,0,0,0.1)",
                  borderRadius: 10,
                },
                "&::-webkit-scrollbar-thumb": {
                  background: "rgba(0,0,0,0.3)",
                  borderRadius: 10,
                  "&:hover": {
                    background: "rgba(0,0,0,0.5)",
                  },
                },
              }}
              onScroll={handleScroll}
            >
              <Table
                stickyHeader
                sx={{
                  minWidth: isMobile ? 600 : 1000,
                  tableLayout: "auto", // Cambio a auto para mejor manejo de contenido
                  "& .MuiTableCell-root": {
                    // Mejoras generales para celdas
                    wordBreak: "break-word",
                    overflowWrap: "anywhere",
                    hyphens: "auto",
                    // Mejor spacing para móviles
                    ...(isMobile && {
                      padding: "8px 6px",
                      fontSize: "0.65rem",
                      lineHeight: 1.3,
                    }),
                  },
                  // Mejoras para el scroll horizontal en móviles
                  ...(isMobile && {
                    "& .MuiTableHead-root": {
                      "& .MuiTableCell-root": {
                        fontSize: "0.6rem",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        padding: "12px 6px",
                      },
                    },
                    "& .MuiTableBody-root": {
                      "& .MuiTableRow-root": {
                        "&:hover": {
                          transform: "none", // Disable transform on mobile for better performance
                        },
                      },
                    },
                  }),
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
                          minWidth: isMobile ? 80 : column.width ? "auto" : 120,
                          maxWidth: isMobile ? 150 : column.width || 250,
                          fontWeight: "bold",
                          backgroundColor: alpha(theme.palette.grey[100], 0.9),
                          borderBottom: "2px solid",
                          borderColor: "divider",
                          position: "sticky",
                          top: 0,
                          zIndex: 10,
                          fontSize: isMobile ? "0.65rem" : "0.8rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          color: "text.primary",
                          backdropFilter: "blur(10px)",
                          "&:not(:last-child)": {
                            borderRight: "1px solid",
                            borderRightColor: "grey.300",
                          },
                          // Mejoras para títulos largos
                          textOverflow: "ellipsis",
                          overflow: "hidden",
                          whiteSpace: "nowrap",
                          lineHeight: isMobile ? 1.3 : 1.4,
                          py: isMobile ? 1 : 1.5,
                          px: isMobile ? 0.75 : 1.5,
                          height: isMobile ? 48 : 56,
                          transition: "background-color 0.2s ease",
                          "&:hover": {
                            backgroundColor: alpha(
                              theme.palette.grey[200],
                              0.8
                            ),
                          },
                        }}
                      >
                        {isMobile && column.label.length > 10 ? (
                          <Tooltip
                            title={
                              <Typography
                                variant="body2"
                                sx={{
                                  fontSize: "0.75rem",
                                  lineHeight: 1.3,
                                  whiteSpace: "pre-wrap",
                                }}
                              >
                                {column.label}
                              </Typography>
                            }
                            arrow
                            placement="top"
                            componentsProps={{
                              tooltip: {
                                sx: {
                                  backgroundColor: "rgba(0, 0, 0, 0.9)",
                                  fontSize: "0.7rem",
                                  maxWidth: 250,
                                  padding: "8px 12px",
                                },
                              },
                            }}
                          >
                            <Box
                              sx={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                cursor: "help",
                                display: "flex",
                                alignItems: "center",
                                "&:hover": {
                                  color: "primary.main",
                                },
                              }}
                            >
                              {column.label.substring(0, 8)}...
                            </Box>
                          </Tooltip>
                        ) : (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent:
                                column.align === "center"
                                  ? "center"
                                  : column.align === "right"
                                  ? "flex-end"
                                  : "flex-start",
                              lineHeight: 1.2,
                            }}
                          >
                            {column.label}
                          </Box>
                        )}
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
                              py: isMobile ? 0.75 : 1.5,
                              px: isMobile ? 0.75 : 1.5,
                              minWidth: isMobile
                                ? 80
                                : column.width
                                ? "auto"
                                : 120,
                              maxWidth: isMobile ? 120 : column.width || 250,
                              width: column.width,
                              verticalAlign: "middle",
                              position: "relative",
                              height: isMobile ? "auto" : 60,
                              "&:not(:last-child)": {
                                borderRight: "1px solid",
                                borderRightColor: "grey.200",
                              },
                              // Mejoras para móviles
                              ...(isMobile && {
                                fontSize: "0.65rem",
                                lineHeight: 1.3,
                                overflow: "hidden",
                                minHeight: 40,
                              }),
                              // Hover effect
                              transition: "background-color 0.15s ease",
                              "&:hover": {
                                backgroundColor: "action.hover",
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
                              isMobile={isMobile}
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
