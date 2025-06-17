import React from "react";
import {
  Box,
  Pagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Stack,
  IconButton,
  Tooltip,
  Chip,
  useTheme,
  useMediaQuery,
  SelectChangeEvent,
} from "@mui/material";
import {
  FirstPage as FirstPageIcon,
  LastPage as LastPageIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";

interface AdvancedPaginationProps {
  // Pagination data
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;

  // State
  loading?: boolean;

  // Actions
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (limit: number) => void;
  onRefresh?: () => void;

  // Configuration
  pageSizeOptions?: number[];
  showPageSizeSelector?: boolean;
  showItemsInfo?: boolean;
  showRefreshButton?: boolean;
  showFirstLastButtons?: boolean;
  // Styling
  size?: "small" | "medium" | "large";
  variant?: "text" | "outlined";
  shape?: "circular" | "rounded";
  color?: "primary" | "secondary";
}

/**
 * Advanced pagination component with modern features and responsive design
 * Integrates perfectly with our new useApiData hooks
 */
export const AdvancedPagination: React.FC<AdvancedPaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  hasNextPage,
  hasPreviousPage,
  loading = false,
  onPageChange,
  onItemsPerPageChange,
  onRefresh,
  pageSizeOptions = [10, 20, 50, 100],
  showPageSizeSelector = true,
  showItemsInfo = true,
  showRefreshButton = true,
  showFirstLastButtons = true,
  size = "medium",
  variant = "outlined",
  shape = "rounded",
  color = "primary",
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Calculate items range for current page
  const startItem = Math.min((currentPage - 1) * itemsPerPage + 1, totalItems);
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);
  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    if (!loading) {
      onPageChange(page);
    }
  };

  const handleItemsPerPageChange = (
    event: SelectChangeEvent<number>
  ) => {
    const newLimit = event.target.value as number;
    if (onItemsPerPageChange && !loading) {
      onItemsPerPageChange(newLimit);
    }
  };

  const handleFirstPage = () => {
    if (!loading && hasPreviousPage) {
      onPageChange(1);
    }
  };

  const handleLastPage = () => {
    if (!loading && hasNextPage) {
      onPageChange(totalPages);
    }
  };

  const handleRefresh = () => {
    if (onRefresh && !loading) {
      onRefresh();
    }
  };

  // Don't render if no data
  if (totalItems === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 2,
        py: 2,
      }}
    >
      {/* Items info and page size selector */}
      <Stack
        direction={isMobile ? "column" : "row"}
        spacing={2}
        alignItems={isMobile ? "flex-start" : "center"}
      >        {showItemsInfo && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Mostrando
            </Typography>
            <Chip
              label={`${startItem}-${endItem}`}
              size="small"
              variant="outlined"
              color={color === "secondary" ? "secondary" : "primary"}
            />
            <Typography variant="body2" color="text.secondary">
              de {totalItems.toLocaleString()} elementos
            </Typography>
          </Box>
        )}

        {showPageSizeSelector && onItemsPerPageChange && (
          <FormControl size="small" sx={{ minWidth: 100 }}>
            <InputLabel>Por página</InputLabel>
            <Select
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              label="Por página"
              disabled={loading}
            >
              {pageSizeOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Stack>

      {/* Pagination controls */}
      <Stack direction="row" spacing={1} alignItems="center">        {/* Refresh button */}
        {showRefreshButton && onRefresh && (
          <Tooltip title="Actualizar">
            <IconButton
              onClick={handleRefresh}
              disabled={loading}
              size={size}
              color={color === "secondary" ? "secondary" : "primary"}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        )}

        {/* First page button */}
        {showFirstLastButtons && !isMobile && (          <Tooltip title="Primera página">
            <span>
              <IconButton
                onClick={handleFirstPage}
                disabled={loading || !hasPreviousPage}
                size={size}
                color={color === "secondary" ? "secondary" : "primary"}
              >
                <FirstPageIcon />
              </IconButton>
            </span>
          </Tooltip>
        )}

        {/* Main pagination */}
        <Pagination
          count={totalPages}
          page={currentPage}
          onChange={handlePageChange}
          disabled={loading}
          size={size}
          variant={variant}
          shape={shape}
          color={color}
          showFirstButton={isMobile ? true : false}
          showLastButton={isMobile ? true : false}
          siblingCount={isMobile ? 0 : 1}
          boundaryCount={isMobile ? 1 : 2}
        />

        {/* Last page button */}
        {showFirstLastButtons && !isMobile && (          <Tooltip title="Última página">
            <span>
              <IconButton
                onClick={handleLastPage}
                disabled={loading || !hasNextPage}
                size={size}
                color={color === "secondary" ? "secondary" : "primary"}
              >
                <LastPageIcon />
              </IconButton>
            </span>
          </Tooltip>
        )}
      </Stack>
    </Box>
  );
};

/**
 * Simple pagination component for basic use cases
 */
export const SimplePagination: React.FC<
  Pick<
    AdvancedPaginationProps,
    "currentPage" | "totalPages" | "onPageChange" | "loading" | "size" | "color"
  >
> = ({
  currentPage,
  totalPages,
  onPageChange,
  loading = false,
  size = "medium",
  color = "primary",
}) => {  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    if (!loading) {
      onPageChange(page);
    }
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
      <Pagination
        count={totalPages}
        page={currentPage}
        onChange={handlePageChange}
        disabled={loading}
        size={size}
        color={color}
        showFirstButton
        showLastButton
      />
    </Box>
  );
};

export default AdvancedPagination;
