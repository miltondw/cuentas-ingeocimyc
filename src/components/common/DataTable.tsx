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
} from "@mui/material";
import { MoreVert as MoreVertIcon } from "@mui/icons-material";
import { LoadingOverlay } from "./LoadingOverlay";
import { SearchAndFilter, FilterField } from "./SearchAndFilter";

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
  keyField?: keyof T;
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
      <Typography variant="body2">{value.toLocaleString("es-ES")}</Typography>
    );
  }

  return (
    <Typography variant="body2" noWrap>
      {value?.toString() || "-"}
    </Typography>
  );
};

export const DataTable: React.FC<DataTableProps> = ({
  data,
  columns,
  keyField = "id" as keyof unknown,
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
  title,
  emptyMessage = "No hay datos disponibles",
}) => {
  const [actionAnchorEl, setActionAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const [selectedRowForAction, setSelectedRowForAction] =
    useState<unknown>(null);
  // Handle selection
  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return;

    if (checked) {
      const allIds = new Set(
        data
          .map((row) => (row as Record<string, unknown>)[keyField as string])
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

  const renderEmptyState = () => (
    <Box sx={{ textAlign: "center", py: 8 }}>
      <Typography variant="h6" color="text.secondary">
        {emptyMessage}
      </Typography>
    </Box>
  );

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
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  {selectable && (
                    <TableCell padding="checkbox">
                      <Checkbox
                        indeterminate={isIndeterminate}
                        checked={isAllSelected}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                      />
                    </TableCell>
                  )}

                  {columns.map((column) => (
                    <TableCell
                      key={String(column.key)}
                      align={column.align}
                      sx={{ width: column.width, fontWeight: "bold" }}
                    >
                      {column.label}
                    </TableCell>
                  ))}

                  {rowActions.length > 0 && (
                    <TableCell align="center" sx={{ width: 80 }}>
                      Acciones
                    </TableCell>
                  )}
                </TableRow>
              </TableHead>

              <TableBody>
                {data.map((row) => {
                  const rowId = (row as Record<string, unknown>)[
                    keyField as string
                  ];
                  return (
                    <TableRow
                      key={String(rowId)}
                      hover={!!onRowClick}
                      selected={selectedRows.has(rowId as string | number)}
                      sx={{ cursor: onRowClick ? "pointer" : "default" }}
                      onClick={onRowClick ? () => onRowClick(row) : undefined}
                    >
                      {selectable && (
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectedRows.has(rowId as string | number)}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleSelectRow(
                                rowId as string | number,
                                e.target.checked
                              );
                            }}
                          />
                        </TableCell>
                      )}

                      {columns.map((column) => (
                        <TableCell
                          key={String(column.key)}
                          align={column.align}
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
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedRowForAction(row);
                              setActionAnchorEl(e.currentTarget);
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
    </Box>
  );
};

export default DataTable;
