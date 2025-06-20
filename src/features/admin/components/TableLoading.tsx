import React from "react";
import {
  TableRow,
  TableCell,
  CircularProgress,
  Box,
  Typography,
} from "@mui/material";

interface TableLoadingProps {
  colSpan: number;
  message?: string;
}

const TableLoading: React.FC<TableLoadingProps> = ({
  colSpan,
  message = "Cargando datos...",
}) => {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} align="center" sx={{ py: 4 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          <CircularProgress size={40} />
          <Typography variant="body2" color="text.secondary">
            {message}
          </Typography>
        </Box>
      </TableCell>
    </TableRow>
  );
};

export default TableLoading;
