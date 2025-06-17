import React, { useState, useCallback } from "react";
import {
  Box,
  TextField,
  MenuItem,
  Chip,
  Stack,
  IconButton,
  Collapse,
  Paper,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  Button,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  FilterList as FilterIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";

export interface FilterOption {
  value: string | number;
  label: string;
  count?: number;
}

export interface FilterField {
  key: string;
  label: string;
  type: "select" | "multiselect" | "text" | "number" | "date" | "daterange";
  options?: FilterOption[];
  placeholder?: string;
  multiple?: boolean;
}

export interface SearchAndFilterProps {
  // Search
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;

  // Filters
  filters: FilterField[];
  filterValues: Record<string, unknown>;
  onFilterChange: (key: string, value: unknown) => void;

  // Advanced options
  showFilterCount?: boolean;
  collapsible?: boolean;
  initialExpanded?: boolean;

  // Styling
  variant?: "outlined" | "filled" | "standard";
  size?: "small" | "medium";

  // Actions
  onClear?: () => void;
  onApplyFilters?: () => void;

  // Debounce
  debounceMs?: number;
}

export const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Buscar...",
  filters = [],
  filterValues = {},
  onFilterChange,
  showFilterCount = true,
  collapsible = true,
  initialExpanded = false,
  variant = "outlined",
  size = "medium",
  onClear,
  onApplyFilters,
  debounceMs = 300,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [expanded, setExpanded] = useState(initialExpanded);
  const searchTimeoutRef = React.useRef<number>();

  // Debounced search
  const handleSearchChange = useCallback(
    (value: string) => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      searchTimeoutRef.current = window.setTimeout(() => {
        onSearchChange(value);
      }, debounceMs);
    },
    [onSearchChange, debounceMs]
  );

  // Get active filter count
  const getActiveFilterCount = () => {
    return Object.entries(filterValues).filter(([, value]) => {
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return value !== null && value !== undefined && value !== "";
    }).length;
  };

  // Clear all filters
  const handleClearAll = () => {
    // Clear search
    onSearchChange("");

    // Clear all filters
    filters.forEach((filter) => {
      if (filter.multiple || filter.type === "multiselect") {
        onFilterChange(filter.key, []);
      } else {
        onFilterChange(filter.key, "");
      }
    });

    onClear?.();
  };

  // Render filter field
  const renderFilterField = (filter: FilterField) => {
    const value = filterValues[filter.key] || (filter.multiple ? [] : "");

    switch (filter.type) {
      case "select":
      case "multiselect":
        return (
          <FormControl fullWidth size={size} variant={variant}>
            <InputLabel>{filter.label}</InputLabel>
            <Select
              value={value}
              label={filter.label}
              multiple={filter.multiple}
              onChange={(e) => onFilterChange(filter.key, e.target.value)}
              renderValue={
                filter.multiple
                  ? (selected: unknown) => (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {(selected as string[]).map((val) => {
                          const option = filter.options?.find(
                            (opt) => opt.value === val
                          );
                          return (
                            <Chip
                              key={val}
                              label={option?.label || val}
                              size="small"
                            />
                          );
                        })}
                      </Box>
                    )
                  : undefined
              }
            >
              {filter.options?.map((option) => (
                <MenuItem
                  key={`${filter.key}-${option.value}`}
                  value={option.value}
                >
                  {option.label}
                  {showFilterCount && option.count !== undefined && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ ml: 1 }}
                    >
                      ({option.count})
                    </Typography>
                  )}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case "text":
        return (
          <TextField
            fullWidth
            size={size}
            variant={variant}
            label={filter.label}
            placeholder={filter.placeholder}
            value={value}
            onChange={(e) => onFilterChange(filter.key, e.target.value)}
          />
        );

      case "number":
        return (
          <TextField
            fullWidth
            size={size}
            variant={variant}
            type="number"
            label={filter.label}
            placeholder={filter.placeholder}
            value={value}
            onChange={(e) => onFilterChange(filter.key, e.target.value)}
          />
        );

      case "date":
        return (
          <TextField
            fullWidth
            size={size}
            variant={variant}
            type="date"
            label={filter.label}
            value={value}
            onChange={(e) => onFilterChange(filter.key, e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        );

      default:
        return null;
    }
  };

  const activeFilterCount = getActiveFilterCount();
  const hasActiveFilters = activeFilterCount > 0 || searchValue.length > 0;

  return (
    <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
      {/* Search and Filter Toggle Row */}
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        sx={{ mb: expanded ? 2 : 0 }}
      >
        {/* Search Field */}
        <TextField
          fullWidth
          size={size}
          variant={variant}
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => handleSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <SearchIcon sx={{ color: "action.active", mr: 1 }} />
            ),
            endAdornment: searchValue && (
              <IconButton
                size="small"
                onClick={() => onSearchChange("")}
                edge="end"
              >
                <ClearIcon />
              </IconButton>
            ),
          }}
        />

        {/* Filter Toggle Button */}
        {collapsible && filters.length > 0 && (
          <Button
            variant="outlined"
            size={size}
            onClick={() => setExpanded(!expanded)}
            startIcon={<FilterIcon />}
            endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            sx={{ whiteSpace: "nowrap" }}
          >
            Filtros {activeFilterCount > 0 && `(${activeFilterCount})`}
          </Button>
        )}

        {/* Clear All Button */}
        {hasActiveFilters && (
          <Button
            variant="outlined"
            color="secondary"
            size={size}
            onClick={handleClearAll}
            sx={{ whiteSpace: "nowrap" }}
          >
            Limpiar
          </Button>
        )}
      </Stack>

      {/* Filters Panel */}
      {filters.length > 0 && (
        <Collapse in={!collapsible || expanded}>
          <Grid container spacing={2}>
            {filters.map((filter) => (
              <Grid item xs={12} sm={isMobile ? 12 : 6} md={4} key={filter.key}>
                {renderFilterField(filter)}
              </Grid>
            ))}
          </Grid>

          {/* Apply Filters Button */}
          {onApplyFilters && (
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={onApplyFilters}
                disabled={!hasActiveFilters}
              >
                Aplicar Filtros
              </Button>
            </Box>
          )}
        </Collapse>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <Box sx={{ mt: 2 }}>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {searchValue && (
              <Chip
                label={`Búsqueda: "${searchValue}"`}
                onDelete={() => onSearchChange("")}
                variant="outlined"
                size="small"
              />
            )}
            {filters.map((filter) => {
              const value = filterValues[filter.key];
              if (!value || (Array.isArray(value) && value.length === 0)) {
                return null;
              }

              if (Array.isArray(value)) {
                return value.map((val: unknown) => {
                  const option = filter.options?.find(
                    (opt) => opt.value === val
                  );
                  return (
                    <Chip
                      key={`${filter.key}-${val}`}
                      label={`${filter.label}: ${option?.label || val}`}
                      onDelete={() => {
                        const newValue = value.filter(
                          (v: unknown) => v !== val
                        );
                        onFilterChange(filter.key, newValue);
                      }}
                      variant="outlined"
                      size="small"
                    />
                  );
                });
              } else {
                const option = filter.options?.find(
                  (opt) => opt.value === value
                );
                return (
                  <Chip
                    key={filter.key}
                    label={`${filter.label}: ${option?.label || value}`}
                    onDelete={() => onFilterChange(filter.key, "")}
                    variant="outlined"
                    size="small"
                  />
                );
              }
            })}
          </Stack>
        </Box>
      )}
    </Paper>
  );
};

export default SearchAndFilter;
