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
  Button,
} from "@mui/material";
import {
  MoreVert as MoreVertIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from "@mui/icons-material";
import { LoadingOverlay } from "./LoadingOverlay";
import { SearchAndFilter, FilterField } from "./SearchAndFilter";
import DataTablePagination, {
  type PaginationData,
} from "./DataTablePagination";
import { Service } from "@/types/admin";

export interface ColumnConfig<T = unknown> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  width?: string | number;
  align?: "left" | "center" | "right";
  render?: (value: unknown, row: T) => React.ReactNode;
}

export interface RowAction<T = unknown | Service> {
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
  rowActions?: RowAction<unknown>[];

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
  mobileViewMode?: "table" | "cards" | "auto"; // Nueva opción para el modo móvil
}

// Componente para renderizar datos en formato card para móvil
const MobileCardRenderer: React.FC<{
  row: unknown;
  columns: ColumnConfig[];
  rowActions?: RowAction[];
  onRowClick?: (row: unknown) => void;
  onActionClick?: (row: unknown, e: React.MouseEvent) => void;
  isSelected?: boolean;
  onSelectionChange?: (checked: boolean) => void;
  selectable?: boolean;
}> = ({
  row,
  columns,
  rowActions = [],
  onRowClick,
  onActionClick,
  isSelected = false,
  onSelectionChange,
  selectable = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  // Campos prioritarios que siempre se muestran (en orden de prioridad)
  const priorityFields = [
    "fecha",
    "date",
    "created",
    "createdAt",
    "solicitante",
    "cliente",
    "client",
    "customer",
    "nombre",
    "proyecto",
    "project",
    "servicio",
    "service",
    "abonado",
    "pagado",
    "paid",
    "amount",
    "total",
    "precio",
    "costo",
  ];

  // Encontrar columnas prioritarias
  const mainColumns = columns
    .filter((col) =>
      priorityFields.some(
        (field) =>
          String(col.key).toLowerCase().includes(field.toLowerCase()) ||
          col.label.toLowerCase().includes(field.toLowerCase())
      )
    )
    .slice(0, 4); // Máximo 4 campos principales

  // Columnas restantes para "Ver más"
  const secondaryColumns = columns.filter((col) => !mainColumns.includes(col));
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        mb: 2,
        border: "1px solid",
        borderColor: isSelected ? "primary.main" : "grey.200",
        borderRadius: 3,
        cursor: onRowClick ? "pointer" : "default",
        transition: "all 0.2s ease",
        backgroundColor: isSelected ? "primary.50" : "background.paper",
        position: "relative",
        overflow: "hidden",
        "&:hover": {
          borderColor: "primary.main",
          backgroundColor: isSelected ? "primary.100" : "grey.50",
          transform: onRowClick ? "translateY(-2px)" : "none",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        },
        "&::before": isSelected
          ? {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              width: "4px",
              height: "100%",
              backgroundColor: "primary.main",
            }
          : {},
      }}
      onClick={onRowClick ? () => onRowClick(row) : undefined}
    >
      {/* Header con checkbox y acciones */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 1.5,
        }}
      >
        {selectable && (
          <Checkbox
            size="small"
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation();
              onSelectionChange?.(e.target.checked);
            }}
            sx={{ mt: -0.5, ml: -0.5 }}
          />
        )}

        {rowActions.length > 0 && (
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onActionClick?.(row, e);
            }}
            sx={{
              color: "text.secondary",
              mt: -0.5,
              mr: -0.5,
              "&:hover": {
                color: "primary.main",
                backgroundColor: "primary.50",
              },
            }}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        )}
      </Box>
      {/* Contenido principal - Campos prioritarios */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        {mainColumns.length > 0
          ? mainColumns.map((column, index) => {
              const value = (row as Record<string, unknown>)[
                column.key as string
              ];

              // Determinar icono según el tipo de campo
              const getFieldIcon = (columnKey: string, columnLabel: string) => {
                const key = columnKey.toLowerCase();
                const label = columnLabel.toLowerCase();

                if (
                  key.includes("fecha") ||
                  key.includes("date") ||
                  key.includes("created")
                )
                  return "📅";
                if (
                  key.includes("solicitante") ||
                  key.includes("cliente") ||
                  key.includes("client") ||
                  label.includes("nombre")
                )
                  return "👤";
                if (
                  key.includes("proyecto") ||
                  key.includes("project") ||
                  key.includes("servicio")
                )
                  return "📋";
                if (
                  key.includes("abonado") ||
                  key.includes("pagado") ||
                  key.includes("total") ||
                  key.includes("precio")
                )
                  return "💰";
                if (key.includes("estado") || key.includes("status"))
                  return "🔄";
                return "📄";
              };

              const icon = getFieldIcon(String(column.key), column.label);

              return (
                <Box
                  key={String(column.key)}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    backgroundColor: index === 0 ? "primary.25" : "transparent",
                    borderRadius: index === 0 ? 2 : 0,
                    padding: index === 0 ? 1.5 : 0,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      color: index === 0 ? "primary.dark" : "text.secondary",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      mb: 0.5,
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                    }}
                  >
                    <Box component="span" sx={{ fontSize: "0.8rem" }}>
                      {icon}
                    </Box>
                    {column.label}
                  </Typography>
                  <Box sx={{ pl: index === 0 ? 0 : 0.5 }}>
                    <TableCellRenderer
                      column={column}
                      value={value}
                      row={row}
                      isMobile={true}
                      isCard={true}
                    />
                  </Box>
                </Box>
              );
            })
          : // Fallback: mostrar las primeras 3 columnas si no hay campos prioritarios
            columns.slice(0, 3).map((column) => {
              const value = (row as Record<string, unknown>)[
                column.key as string
              ];
              return (
                <Box
                  key={String(column.key)}
                  sx={{ display: "flex", flexDirection: "column" }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      color: "text.secondary",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      mb: 0.25,
                    }}
                  >
                    {column.label}
                  </Typography>
                  <Box sx={{ pl: 0.5 }}>
                    <TableCellRenderer
                      column={column}
                      value={value}
                      row={row}
                      isMobile={true}
                      isCard={true}
                    />
                  </Box>
                </Box>
              );
            })}

        {/* Datos expandidos */}
        {isExpanded && secondaryColumns.length > 0 && (
          <Box
            sx={{
              mt: 2,
              pt: 2,
              borderTop: "1px solid",
              borderColor: "grey.200",
              display: "flex",
              flexDirection: "column",
              gap: 1.5,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontSize: "0.7rem",
                color: "text.secondary",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                mb: 0.5,
              }}
            >
              📋 Información completa
            </Typography>
            {secondaryColumns.map((column) => {
              const value = (row as Record<string, unknown>)[
                column.key as string
              ];
              return (
                <Box
                  key={String(column.key)}
                  sx={{ display: "flex", flexDirection: "column" }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: "0.65rem",
                      color: "text.disabled",
                      mb: 0.25,
                    }}
                  >
                    {column.label}
                  </Typography>
                  <Box sx={{ pl: 0.5 }}>
                    <TableCellRenderer
                      column={column}
                      value={value}
                      row={row}
                      isMobile={true}
                      isCard={true}
                    />
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}

        {/* Botón Ver más/Ver menos */}
        {secondaryColumns.length > 0 && (
          <Box sx={{ mt: 1.5, textAlign: "center" }}>
            <Button
              size="small"
              variant="text"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              sx={{
                fontSize: "0.7rem",
                fontWeight: 500,
                color: "primary.main",
                textTransform: "none",
                minHeight: 32,
                "&:hover": {
                  backgroundColor: "primary.50",
                },
              }}
              startIcon={
                isExpanded ? (
                  <ExpandLessIcon fontSize="small" />
                ) : (
                  <ExpandMoreIcon fontSize="small" />
                )
              }
            >
              {isExpanded
                ? "Ver menos"
                : `Ver más (${secondaryColumns.length})`}
            </Button>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

const TableCellRenderer: React.FC<{
  column: ColumnConfig;
  value: unknown;
  row: unknown;
  isMobile?: boolean;
  isCard?: boolean;
}> = ({ column, value, row, isMobile = false, isCard = false }) => {
  if (column.render) {
    return <>{column.render(value, row)}</>;
  }

  if (typeof value === "boolean") {
    return (
      <Chip
        label={value ? "Sí" : "No"}
        size="small"
        color={value ? "success" : "default"}
        variant={isCard ? "filled" : "outlined"}
        sx={{
          fontSize: isMobile ? "0.7rem" : "0.75rem",
          height: isMobile ? 22 : 24,
          fontWeight: 500,
          borderRadius: 1,
        }}
      />
    );
  }

  if (typeof value === "number") {
    return (
      <Typography
        variant="body2"
        sx={{
          fontWeight: isCard ? 600 : "medium",
          fontSize: isMobile ? (isCard ? "0.8rem" : "0.7rem") : "0.875rem",
          fontFamily: "monospace",
          textAlign: isCard ? "left" : "right",
          color: "text.primary",
          lineHeight: 1.3,
          backgroundColor: isCard ? "grey.50" : "transparent",
          padding: isCard ? "2px 6px" : 0,
          borderRadius: isCard ? 1 : 0,
          display: "inline-block",
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
  const maxLength = isMobile ? (isCard ? 25 : 15) : 50;
  const isLongText = stringValue.length > maxLength;

  if (isLongText && !isCard) {
    return (
      <Tooltip
        title={stringValue}
        arrow
        placement="top-start"
        componentsProps={{
          tooltip: {
            sx: {
              backgroundColor: "rgba(0, 0, 0, 0.9)",
              fontSize: "0.75rem",
              maxWidth: 300,
              padding: "8px 12px",
              borderRadius: 1,
            },
          },
        }}
      >
        <Box
          sx={{
            cursor: "help",
            maxWidth: isMobile ? "120px" : column.width || "180px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            display: "flex",
            alignItems: "center",
            "&:hover": {
              color: "primary.main",
              backgroundColor: "action.hover",
              borderRadius: 1,
            },
            transition: "all 0.2s ease",
            padding: "4px 6px",
            margin: "-4px -6px",
            borderRadius: 1,
          }}
        >
          <Typography
            variant="body2"
            component="span"
            sx={{
              fontSize: isMobile ? "0.7rem" : "0.875rem",
              lineHeight: 1.3,
              fontWeight: 400,
            }}
          >
            {stringValue.substring(0, maxLength)}...
          </Typography>
        </Box>
      </Tooltip>
    );
  }

  return (
    <Typography
      variant="body2"
      sx={{
        fontSize: isMobile ? (isCard ? "0.8rem" : "0.7rem") : "0.875rem",
        lineHeight: 1.4,
        fontWeight: isCard ? 500 : 400,
        color: "text.primary",
        wordBreak: "break-word",
        overflowWrap: "anywhere",
        WebkitLineClamp: isCard ? 2 : 1,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
        backgroundColor:
          isCard && stringValue !== "-" ? "grey.50" : "transparent",
        padding: isCard ? "4px 8px" : 0,
        borderRadius: isCard ? 1 : 0,
        minHeight: isCard ? "auto" : isMobile ? "20px" : "24px",
        display: "flex",
        alignItems: "center",
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
  mobileViewMode = "auto", // Nueva prop para controlar el modo móvil
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [actionAnchorEl, setActionAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const [selectedRowForAction, setSelectedRowForAction] =
    useState<unknown>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [forcedViewMode, setForcedViewMode] = useState<
    "table" | "cards" | null
  >(null);
  const [tableContainerRef, setTableContainerRef] =
    useState<HTMLDivElement | null>(null);
  const [tableScrollWidth, setTableScrollWidth] = useState(0);

  // Calcular el ancho real de scroll de la tabla
  React.useEffect(() => {
    if (tableContainerRef) {
      const updateScrollWidth = () => {
        setTableScrollWidth(tableContainerRef.scrollWidth);
      };

      updateScrollWidth();

      // Observar cambios en el tamaño
      const resizeObserver = new ResizeObserver(updateScrollWidth);
      resizeObserver.observe(tableContainerRef);

      return () => resizeObserver.disconnect();
    }
  }, [tableContainerRef, data, columns]);

  // Determinar si usar modo card - SOLO para móviles
  const useCardMode =
    isMobile &&
    (mobileViewMode === "cards" ||
      forcedViewMode === "cards" ||
      (mobileViewMode === "auto" &&
        forcedViewMode !== "table" &&
        (isSmallMobile || columns.length > 5)));
  // Detectar capacidad de scroll horizontal
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollLeft, scrollWidth, clientWidth } = e.currentTarget;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  };

  // Funciones para scroll horizontal programático
  const scrollToLeft = () => {
    if (tableContainerRef) {
      tableContainerRef.scrollBy({ left: -200, behavior: "smooth" });
    }
  };

  const scrollToRight = () => {
    if (tableContainerRef) {
      tableContainerRef.scrollBy({ left: 200, behavior: "smooth" });
    }
  };
  // Scroll horizontal desde la barra superior
  const handleTopScrollbarScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (tableContainerRef) {
      // Calcular la proporción de scroll para sincronización precisa
      const scrollRatio =
        e.currentTarget.scrollLeft /
        (e.currentTarget.scrollWidth - e.currentTarget.clientWidth);
      const tableMaxScroll =
        tableContainerRef.scrollWidth - tableContainerRef.clientWidth;
      tableContainerRef.scrollLeft = scrollRatio * tableMaxScroll;
    }
  };
  // Sincronizar scroll de la tabla con la barra superior
  const syncTopScrollbar = (e: React.UIEvent<HTMLDivElement>) => {
    const topScrollbar = document.getElementById("top-scrollbar");
    if (
      topScrollbar &&
      e.currentTarget.scrollWidth > e.currentTarget.clientWidth
    ) {
      // Calcular la proporción de scroll para sincronización precisa
      const scrollRatio =
        e.currentTarget.scrollLeft /
        (e.currentTarget.scrollWidth - e.currentTarget.clientWidth);
      const topScrollbarMaxScroll =
        topScrollbar.scrollWidth - topScrollbar.clientWidth;
      topScrollbar.scrollLeft = scrollRatio * topScrollbarMaxScroll;
    }
    handleScroll(e);
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
          backgroundColor: "grey.25",
          borderRadius: 3,
          border: "2px dashed",
          borderColor: "grey.200",
          margin: 2,
          transition: "all 0.3s ease",
          "&:hover": {
            borderColor: "primary.200",
            backgroundColor: "primary.25",
          },
        }}
      >
        <Typography
          variant="h6"
          color="text.secondary"
          gutterBottom
          sx={{
            fontSize: "1rem",
            fontWeight: 500,
            mb: 1,
          }}
        >
          {hasActiveFilters || searchValue
            ? "🔍 Sin resultados"
            : "📄 Sin datos"}
        </Typography>
        <Typography
          variant="body2"
          color="text.disabled"
          sx={{
            mb: 2,
            fontSize: "0.875rem",
            maxWidth: 400,
            mx: "auto",
            lineHeight: 1.5,
          }}
        >
          {hasActiveFilters || searchValue
            ? "No encontramos datos que coincidan con tu búsqueda o filtros."
            : emptyMessage}
        </Typography>
        {(hasActiveFilters || searchValue) && (
          <Typography
            variant="caption"
            color="text.disabled"
            sx={{
              fontStyle: "italic",
              display: "block",
              mt: 1,
              fontSize: "0.75rem",
            }}
          >
            Intenta ajustar los criterios de búsqueda
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
      {/* Info Bar con controles de navegación - Mostrar siempre que haya datos */}
      {data.length > 0 && !useCardMode && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: alpha(theme.palette.primary.main, 0.04),
            borderRadius: 2,
            padding: isMobile ? "12px 16px" : "16px 20px",
            marginBottom: 2,
            border: "1px solid",
            borderColor: alpha(theme.palette.primary.main, 0.12),
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Typography
              variant="caption"
              sx={{
                fontSize: isMobile ? "0.7rem" : "0.8rem",
                fontWeight: 600,
                color: "primary.dark",
              }}
            >
              📊 {data.length} registro{data.length !== 1 ? "s" : ""}
            </Typography>
            <Chip
              label={isMobile ? "Tabla" : "Vista de tabla"}
              size="small"
              sx={{
                fontSize: isMobile ? "0.6rem" : "0.7rem",
                height: isMobile ? 18 : 20,
                backgroundColor: "primary.100",
                color: "primary.dark",
              }}
            />
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              variant="caption"
              sx={{
                fontSize: isMobile ? "0.65rem" : "0.75rem",
                opacity: 0.8,
                fontStyle: "italic",
                color: "primary.dark",
              }}
            >
              {isMobile ? "Desliza ↔️" : "Scroll horizontal disponible ↔️"}
            </Typography>
          </Box>
        </Box>
      )}
      {/* Info Bar móvil para cards */}
      {isMobile && useCardMode && data.length > 0 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: alpha(theme.palette.primary.main, 0.04),
            borderRadius: 2,
            padding: "12px 16px",
            marginBottom: 2,
            border: "1px solid",
            borderColor: alpha(theme.palette.primary.main, 0.12),
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              variant="caption"
              sx={{
                fontSize: "0.7rem",
                fontWeight: 600,
                color: "primary.dark",
              }}
            >
              📊 {data.length} registro{data.length !== 1 ? "s" : ""}
            </Typography>
            <Chip
              label="Tarjetas"
              size="small"
              sx={{
                fontSize: "0.6rem",
                height: 18,
                backgroundColor: "primary.100",
                color: "primary.dark",
              }}
            />
          </Box>
        </Box>
      )}
      {/* Toggle de vista móvil */}
      {isMobile && mobileViewMode === "auto" && columns.length > 3 && (
        <Box sx={{ mb: 2, textAlign: "center" }}>
          <Chip
            label={useCardMode ? "📱 Vista: Tarjetas" : "📋 Vista: Tabla"}
            variant="outlined"
            size="small"
            onClick={() => setForcedViewMode(useCardMode ? "table" : "cards")}
            sx={{
              fontSize: "0.7rem",
              backgroundColor: "background.paper",
              cursor: "pointer",
              transition: "all 0.2s ease",
              "&:hover": {
                backgroundColor: "primary.50",
                borderColor: "primary.main",
              },
            }}
          />
          <Typography
            variant="caption"
            sx={{
              display: "block",
              mt: 0.5,
              fontSize: "0.65rem",
              color: "text.disabled",
              fontStyle: "italic",
            }}
          >
            Toca para cambiar vista
          </Typography>
        </Box>
      )}
      {/* Table o Cards */}
      <LoadingOverlay loading={loading} type="skeleton">
        {data.length === 0 ? (
          renderEmptyState()
        ) : useCardMode ? (
          // Renderizado en modo card para móvil
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {data.map((row, index) => {
              const rowId = (row as Record<string, unknown>)[
                keyField as string
              ];
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
                <MobileCardRenderer
                  key={uniqueKey}
                  row={row}
                  columns={columns}
                  rowActions={rowActions}
                  onRowClick={onRowClick}
                  onActionClick={(row, e) => {
                    setSelectedRowForAction(row);
                    setActionAnchorEl(e.currentTarget as HTMLElement);
                  }}
                  isSelected={isSelected}
                  onSelectionChange={(checked) =>
                    handleSelectRow(selectionId, checked)
                  }
                  selectable={selectable}
                />
              );
            })}
          </Box>
        ) : (
          <Box sx={{ position: "relative" }}>
            {/* Barra de scroll horizontal superior - Visible en TODAS las pantallas cuando hay overflow */}
            {(canScrollLeft || canScrollRight) && (
              <Box sx={{ position: "relative", mb: 1 }}>
                {/* Controles de navegación */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 1,
                    justifyContent: "center",
                  }}
                >
                  <IconButton
                    size={isMobile ? "small" : "medium"}
                    onClick={scrollToLeft}
                    disabled={!canScrollLeft}
                    sx={{
                      backgroundColor: canScrollLeft
                        ? "primary.50"
                        : "grey.100",
                      color: canScrollLeft ? "primary.main" : "grey.400",
                      "&:hover": {
                        backgroundColor: canScrollLeft
                          ? "primary.100"
                          : "grey.100",
                      },
                      width: isMobile ? 32 : 40,
                      height: isMobile ? 32 : 40,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    }}
                  >
                    <Box
                      component="span"
                      sx={{
                        fontSize: isMobile ? "1rem" : "1.2rem",
                        fontWeight: "bold",
                      }}
                    >
                      ‹
                    </Box>
                  </IconButton>

                  <IconButton
                    size={isMobile ? "small" : "medium"}
                    onClick={scrollToRight}
                    disabled={!canScrollRight}
                    sx={{
                      backgroundColor: canScrollRight
                        ? "primary.50"
                        : "grey.100",
                      color: canScrollRight ? "primary.main" : "grey.400",
                      "&:hover": {
                        backgroundColor: canScrollRight
                          ? "primary.100"
                          : "grey.100",
                      },
                      width: isMobile ? 32 : 40,
                      height: isMobile ? 32 : 40,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    }}
                  >
                    <Box
                      component="span"
                      sx={{
                        fontSize: isMobile ? "1rem" : "1.2rem",
                        fontWeight: "bold",
                      }}
                    >
                      ›
                    </Box>
                  </IconButton>
                </Box>
                {/* Barra de scroll horizontal visual con indicador de progreso */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    backgroundColor: isMobile ? "grey.100" : "grey.200", // Fondo más contrastante
                    borderRadius: 2,
                    padding: isMobile ? "6px 10px" : "8px 12px",
                    boxShadow: isMobile
                      ? "0 1px 3px rgba(0,0,0,0.1)"
                      : "0 2px 6px rgba(0,0,0,0.15)",
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: isMobile ? "0.8rem" : "1rem",
                      color: "text.primary", // Más oscuro para mejor visibilidad
                      fontWeight: "bold",
                      minWidth: 20,
                      textShadow: "0 1px 2px rgba(255,255,255,0.8)", // Sombra para contraste
                    }}
                  >
                    {canScrollLeft ? "◀" : ""}
                  </Typography>
                  <Box
                    id="top-scrollbar"
                    sx={{
                      flex: 1,
                      height: isMobile ? 8 : 16, // Aún más alto en desktop
                      overflowX: "auto",
                      overflowY: "hidden",
                      borderRadius: isMobile ? 1 : 2,
                      backgroundColor: isMobile ? "#f5f5f5" : "#e0e0e0", // Fondo más claro para mejor contraste
                      position: "relative",
                      border: isMobile ? "1px solid #ccc" : "3px solid #888", // Bordes más visibles
                      boxShadow: isMobile
                        ? "inset 0 1px 2px rgba(0,0,0,0.1)"
                        : "inset 0 3px 6px rgba(0,0,0,0.2), 0 2px 4px rgba(0,0,0,0.15)",
                      "&:hover": {
                        backgroundColor: isMobile ? "#eeeeee" : "#d5d5d5",
                        borderColor: isMobile ? "#999" : "#555",
                        boxShadow: isMobile
                          ? "inset 0 1px 3px rgba(0,0,0,0.15)"
                          : "inset 0 4px 8px rgba(0,0,0,0.25), 0 3px 6px rgba(0,0,0,0.2)",
                      },
                      "&::-webkit-scrollbar": {
                        height: isMobile ? 6 : 12, // Más visible en desktop
                      },
                      "&::-webkit-scrollbar-track": {
                        background: isMobile
                          ? "rgba(0,0,0,0.05)"
                          : "rgba(0,0,0,0.15)", // Track más oscuro para contraste
                        borderRadius: isMobile ? 3 : 6,
                      },
                      "&::-webkit-scrollbar-thumb": {
                        background: isMobile
                          ? "linear-gradient(45deg, #1976d2, #2196f3)"
                          : "linear-gradient(45deg, #0d47a1, #1976d2)", // Colores más contrastantes
                        borderRadius: isMobile ? 3 : 6,

                        boxShadow: isMobile
                          ? "0 1px 3px rgba(0,0,0,0.3)"
                          : "0 2px 6px rgba(0,0,0,0.4)",
                        "&:hover": {
                          background: isMobile
                            ? "linear-gradient(45deg, #1565c0, #1e88e5)"
                            : "linear-gradient(45deg, #0a2472, #1565c0)",
                          boxShadow: isMobile
                            ? "0 2px 4px rgba(0,0,0,0.4)"
                            : "0 3px 8px rgba(0,0,0,0.5)",
                          transform: "scaleY(1.1)",
                        },
                        "&:active": {
                          background: isMobile
                            ? "linear-gradient(45deg, #0d47a1, #1976d2)"
                            : "linear-gradient(45deg, #051e3e, #0d47a1)",
                        },
                      },
                    }}
                    onScroll={handleTopScrollbarScroll}
                  >
                    {/* Contenido invisible del mismo ancho que la tabla - dinámico según contenido real */}
                    <Box
                      sx={{
                        width: Math.max(
                          tableScrollWidth,
                          isMobile ? 600 : 1000
                        ),
                        height: 1,
                      }}
                    />
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: isMobile ? "0.8rem" : "1rem",
                      color: "text.primary", // Más oscuro para mejor visibilidad
                      fontWeight: "bold",
                      minWidth: 20,
                      textShadow: "0 1px 2px rgba(255,255,255,0.8)", // Sombra para contraste
                    }}
                  >
                    {canScrollRight ? "▶" : ""}
                  </Typography>
                </Box>
              </Box>
            )}
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
              ref={setTableContainerRef}
              sx={{
                maxHeight: isMobile ? 500 : 650,
                minHeight: 180,
                border: "1px solid",
                borderColor: "grey.200",
                borderRadius: 3,
                overflow: "auto",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                transition: "all 0.2s ease",
                "&:hover": {
                  boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                },
                // Mejora del scroll en móviles
                ...(isMobile && {
                  touchAction: "pan-x pan-y",
                  WebkitOverflowScrolling: "touch",
                  scrollBehavior: "smooth",
                }), // Scrollbar MUY visible y mejorada especialmente para laptops/desktop
                "&::-webkit-scrollbar": {
                  height: isMobile ? 6 : 14, // Aún más alto en desktop
                  width: isMobile ? 6 : 14,
                },
                "&::-webkit-scrollbar-track": {
                  background: isMobile
                    ? "rgba(0,0,0,0.06)"
                    : "rgba(0,0,0,0.15)", // Más oscuro para contraste
                  borderRadius: isMobile ? 3 : 7,
                  border: isMobile
                    ? "1px solid rgba(0,0,0,0.1)"
                    : "2px solid rgba(0,0,0,0.2)",
                },
                "&::-webkit-scrollbar-thumb": {
                  background: isMobile
                    ? "linear-gradient(45deg, #1976d2, #2196f3)"
                    : "linear-gradient(45deg, #0d47a1, #1976d2, #42a5f5)", // Gradiente más visible
                  borderRadius: isMobile ? 3 : 7,
                  border: isMobile
                    ? "1px solid rgba(255,255,255,0.5)"
                    : "3px solid rgba(255,255,255,0.7)",
                  boxShadow: isMobile
                    ? "0 1px 3px rgba(0,0,0,0.3)"
                    : "0 3px 8px rgba(0,0,0,0.4)",
                  "&:hover": {
                    background: isMobile
                      ? "linear-gradient(45deg, #1565c0, #1e88e5)"
                      : "linear-gradient(45deg, #0a2472, #1565c0, #2196f3)",
                    boxShadow: isMobile
                      ? "0 2px 4px rgba(0,0,0,0.4)"
                      : "0 4px 10px rgba(0,0,0,0.5)",
                    transform: "scale(1.05)",
                  },
                  "&:active": {
                    background: isMobile
                      ? "linear-gradient(45deg, #0d47a1, #1976d2)"
                      : "linear-gradient(45deg, #051e3e, #0d47a1, #1976d2)",
                    transform: "scale(0.95)",
                  },
                },
              }}
              onScroll={syncTopScrollbar}
            >
              <Table
                stickyHeader
                sx={{
                  minWidth: isMobile ? 600 : 1500, // Más ancho en desktop para forzar scroll
                  tableLayout: "auto",
                  "& .MuiTableCell-root": {
                    borderBottom: "1px solid",
                    borderColor: "grey.100",
                    ...(isMobile && {
                      padding: "12px 8px",
                      fontSize: "0.7rem",
                      lineHeight: 1.4,
                    }),
                    ...(!isMobile && {
                      padding: "16px 12px",
                      fontSize: "0.875rem",
                    }),
                  },
                  // Mejoras para filas
                  "& .MuiTableBody-root": {
                    "& .MuiTableRow-root": {
                      "&:hover": {
                        backgroundColor: "grey.25",
                        ...(isMobile && {
                          transform: "none", // Disable transform on mobile
                        }),
                      },
                      "&:nth-of-type(even)": {
                        backgroundColor: "rgba(0,0,0,0.02)",
                      },
                    },
                  },
                }}
              >
                <TableHead>
                  <TableRow>
                    {selectable && (
                      <TableCell
                        padding="checkbox"
                        sx={{
                          backgroundColor: "grey.25",
                          borderBottom: "2px solid",
                          borderColor: "grey.200",
                          position: "sticky",
                          top: 0,
                          zIndex: 10,
                          backdropFilter: "blur(10px)",
                          width: isMobile ? 40 : 48,
                        }}
                      >
                        <Checkbox
                          indeterminate={isIndeterminate}
                          checked={isAllSelected}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          color="primary"
                          size={isMobile ? "small" : "medium"}
                        />
                      </TableCell>
                    )}

                    {columns.map((column, colIndex) => (
                      <TableCell
                        key={`${String(column.key)}-${colIndex}`}
                        align={column.align}
                        sx={{
                          width: column.width,
                          minWidth: isMobile ? 80 : column.width ? "auto" : 140,
                          maxWidth: isMobile ? 180 : column.width || 300,
                          fontWeight: 600,
                          backgroundColor: "grey.25",
                          borderBottom: "2px solid",
                          borderColor: "grey.200",
                          position: "sticky",
                          top: 0,
                          zIndex: 10,
                          fontSize: isMobile ? "0.7rem" : "0.8rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          color: "text.primary",
                          backdropFilter: "blur(10px)",
                          lineHeight: 1.3,
                          py: isMobile ? 1.5 : 2,
                          px: isMobile ? 1 : 1.5,
                          height: isMobile ? 48 : 56,
                          "&:not(:last-child)": {
                            borderRight: "1px solid",
                            borderRightColor: "grey.100",
                          },
                        }}
                      >
                        {isMobile && column.label.length > 12 ? (
                          <Tooltip title={column.label} arrow placement="top">
                            <Box
                              sx={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                cursor: "help",
                                "&:hover": { color: "primary.main" },
                              }}
                            >
                              {column.label.substring(0, 10)}...
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
                          width: isMobile ? 60 : 80,
                          fontWeight: 600,
                          backgroundColor: "grey.25",
                          borderBottom: "2px solid",
                          borderColor: "grey.200",
                          position: "sticky",
                          top: 0,
                          zIndex: 10,
                          fontSize: isMobile ? "0.7rem" : "0.8rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          color: "text.primary",
                          backdropFilter: "blur(10px)",
                        }}
                      >
                        Acciones
                      </TableCell>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.map((row, index) => {
                    const rowId = (row as Record<string, unknown>)[
                      keyField as string
                    ];
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
                          "&:hover": {
                            backgroundColor: onRowClick
                              ? "primary.25"
                              : "grey.25",
                            transform:
                              onRowClick && !isMobile
                                ? "translateY(-1px)"
                                : "none",
                            transition: "all 0.15s ease-in-out",
                          },
                          "&.Mui-selected": {
                            backgroundColor: "primary.50",
                            "&:hover": {
                              backgroundColor: "primary.100",
                            },
                          },
                          borderBottom: "1px solid",
                          borderColor: "grey.100",
                        }}
                        onClick={onRowClick ? () => onRowClick(row) : undefined}
                      >
                        {selectable && (
                          <TableCell
                            padding="checkbox"
                            sx={{
                              borderBottom: "1px solid",
                              borderColor: "grey.100",
                              width: isMobile ? 40 : 48,
                            }}
                          >
                            <Checkbox
                              checked={isSelected}
                              onChange={(e) => {
                                e.stopPropagation();
                                handleSelectRow(selectionId, e.target.checked);
                              }}
                              color="primary"
                              size={isMobile ? "small" : "medium"}
                            />
                          </TableCell>
                        )}

                        {columns.map((column, colIndex) => (
                          <TableCell
                            key={
                              typeof column.key === "string"
                                ? `${String(column.key)}-${colIndex}`
                                : `col-${colIndex}`
                            }
                            align={column.align}
                            sx={{
                              borderBottom: "1px solid",
                              borderColor: "grey.100",
                              py: isMobile ? 1.5 : 2,
                              px: isMobile ? 1 : 1.5,
                              minWidth: isMobile
                                ? 80
                                : column.width
                                ? "auto"
                                : 140,
                              maxWidth: isMobile ? 180 : column.width || 300,
                              width: column.width,
                              verticalAlign: "middle",
                              position: "relative",
                              height: isMobile ? 52 : 64,
                              "&:not(:last-child)": {
                                borderRight: "1px solid",
                                borderRightColor: "grey.50",
                              },
                              transition: "background-color 0.1s ease",
                              "&:hover": {
                                backgroundColor: "rgba(0,0,0,0.02)",
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
                              borderColor: "grey.100",
                              width: isMobile ? 60 : 80,
                              py: isMobile ? 1 : 1.5,
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
                                color: "text.disabled",
                                transition: "all 0.2s ease",
                                "&:hover": {
                                  color: "primary.main",
                                  backgroundColor: "primary.50",
                                  transform: "scale(1.1)",
                                },
                              }}
                            >
                              <MoreVertIcon
                                fontSize={isMobile ? "small" : "medium"}
                              />
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
