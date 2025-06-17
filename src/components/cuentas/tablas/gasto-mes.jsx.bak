import { useEffect, useState, useMemo, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  TextField,
  Pagination,
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import { Link } from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";
import api from "@api";

const formatNumber = (value) => new Intl.NumberFormat("es-ES").format(value);

const transformData = (data) => {
  return data.map((item) => {
    const date = new Date(item.mes);
    const formattedMonth = date.toLocaleString("es-ES", {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    });

    const gastos = Object.entries(item)
      .filter(
        ([key, value]) =>
          !["gasto_empresa_id", "mes", "otros_campos"].includes(key) &&
          value !== null
      )
      .map(([key, value]) => ({
        name: key.replace(/_/g, " ").toUpperCase(),
        value: parseFloat(value),
      }));

    if (item.otros_campos && typeof item.otros_campos === "object") {
      Object.entries(item.otros_campos).forEach(([nombre, monto]) => {
        gastos.push({
          name: nombre.replace(/_/g, " ").toUpperCase(),
          value: parseFloat(monto),
        });
      });
    }

    return {
      id: item.gasto_empresa_id,
      mesDeGasto: `Gasto de ${formattedMonth}`,
      gastos,
      originalDate: item.mes,
    };
  });
};

const TablaGastosEmpresa = () => {
  const [gastos, setGastos] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDate, setSelectedDate] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState(null);
  const rowsPerPage = 10;
  const fetchGastos = useCallback(async () => {
    try {
      const response = await api.get("/gastos-mes", {
        params: { page: currentPage, limit: rowsPerPage },
      });
      const { data } = response;
      setGastos(data.data.gastos);
      setTotalPages(Math.ceil(data.data.total / rowsPerPage));
    } catch (error) {
      console.error("Error al obtener los gastos:", error);
    }
  }, [currentPage, rowsPerPage]);

  useEffect(() => {
    fetchGastos();
  }, [fetchGastos]);



  const handleDelete = async () => {
    try {
      await api.delete(`/gastos-mes/${selectedDeleteId}`);
      await fetchGastos(); // Recargar los datos
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error al eliminar el gasto:", error);
      alert("Error al eliminar el gasto");
    }
  };

  const openDeleteDialog = (id) => {
    setSelectedDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const gastosPorMes = useMemo(() => transformData(gastos), [gastos]);

  const filteredData = useMemo(() => {
    if (!selectedDate) return gastosPorMes;
    const selected = new Date(selectedDate);
    return gastosPorMes.filter(({ originalDate }) => {
      const date = new Date(originalDate);
      return (
        date.getUTCFullYear() === selected.getUTCFullYear() &&
        date.getUTCMonth() === selected.getUTCMonth()
      );
    });
  }, [selectedDate, gastosPorMes]);

  return (
    <TableContainer
      component={Paper}
      sx={{ maxWidth: "90vw", mx: "auto", my: 3, p: 2 }}
    >
      {/* Diálogo de confirmación */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar este registro de gastos?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleDelete} color="error" autoFocus>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      <Typography variant="h2" gutterBottom>
        Gastos de la Empresa por Mes
      </Typography>

      {/* Filtros */}
      <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
        <TextField
          type="month"
          label="Filtrar por Mes"
          value={selectedDate}
          onChange={(e) => {
            setSelectedDate(e.target.value);
            setCurrentPage(1);
          }}
          slotProps={{ inputLabel: { shrink: true } }}
          margin="normal"
          sx={{ width: 300 }}
        />
        <Typography variant="body2" color="textSecondary">
          {filteredData.length} resultados encontrados
        </Typography>
      </Box>

      {/* Tabla de gastos */}
      {filteredData.map((mesData) => (
        <Box
          key={mesData.id}
          sx={{ mb: 4, boxShadow: 3, p: 2, borderRadius: 2 }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Typography variant="h5" component="div">
              {mesData.mesDeGasto}
            </Typography>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <Link
                to={`/crear-gasto-mes/${mesData.id}`}
                style={{ textDecoration: "none" }}
              >
                <Typography color="primary">Ver Detalles</Typography>
              </Link>
              <IconButton
                onClick={() => openDeleteDialog(mesData.id)}
                color="error"
                aria-label="eliminar"
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          </Box>

          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold", width: "70%" }}>
                  Concepto
                </TableCell>
                <TableCell
                  sx={{ fontWeight: "bold", width: "30%" }}
                  align="right"
                >
                  Valor Mensual
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mesData.gastos.map((gasto, idx) => (
                <TableRow key={idx} hover>
                  <TableCell>{gasto.name}</TableCell>
                  <TableCell align="right">{`$ ${formatNumber(
                    gasto.value
                  )}`}</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Total Gastos</TableCell>
                <TableCell sx={{ fontWeight: "bold" }} align="right">
                  {`$ ${formatNumber(
                    mesData.gastos.reduce(
                      (total, gasto) => total + gasto.value,
                      0
                    )
                  )}`}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Box>
      ))}

      <Pagination
        count={totalPages}
        page={currentPage}
        onChange={(_, page) => setCurrentPage(page)}
        color="primary"
        sx={{ mt: 2, display: "flex", justifyContent: "center" }}
      />
    </TableContainer>
  );
};

export default TablaGastosEmpresa;
