import React, { useState, useMemo, useCallback } from "react";
import type { SelectChangeEvent } from "@mui/material/Select";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Paper,
  Grid2,
  Button,
  CircularProgress,
} from "@mui/material";
import ServiceCategory from "./ServiceCategory";
import { Service, ServiceSelectionProps } from "../types";
import { useNavigate } from "react-router-dom";

const ServiceSelection: React.FC<ServiceSelectionProps> = ({
  services = [],
  loading = false,
  editCategory,
}) => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>(
    editCategory || ""
  );
  const [searchTerm, setSearchTerm] = useState<string>("");

  const categories = useMemo(
    () => Array.from(new Set(services.map((service) => service.category))),
    [services]
  );

  const filteredServices = useMemo(() => {
    let filtered = services;
    if (selectedCategory) {
      filtered = filtered.filter(
        (service) => service.category === selectedCategory
      );
    }
    if (searchTerm) {
      filtered = filtered.filter((service) =>
        service.items.some((item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    if (editCategory) {
      filtered = filtered.filter(
        (service) => service.category === editCategory
      );
    }
    return filtered;
  }, [services, selectedCategory, searchTerm, editCategory]);

  const handleCategoryChange = useCallback(
    (event: SelectChangeEvent<string>) => {
      setSelectedCategory(event.target.value as string);
    },
    []
  );

  const handleClearFilters = useCallback(() => {
    setSelectedCategory("");
    setSearchTerm("");
  }, []);

  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(event.target.value);
    },
    []
  );

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress aria-label="Cargando servicios" />
      </Box>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h5" gutterBottom fontWeight="bold">
        Selección de Servicios
      </Typography>
      <Grid2 container spacing={2} alignItems="center" mb={3}>
        <Grid2 size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth>
            <InputLabel id="category-select-label">Categoría</InputLabel>
            <Select
              labelId="category-select-label"
              value={selectedCategory}
              label="Categoría"
              onChange={handleCategoryChange}
              disabled={!!editCategory}
              aria-label="Seleccionar categoría de servicios"
            >
              <MenuItem value="">
                <em>Todas las categorías</em>
              </MenuItem>
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Buscar servicios"
            value={searchTerm}
            onChange={handleSearchChange}
            disabled={!selectedCategory}
            aria-label="Buscar servicios por nombre"
            helperText={
              !selectedCategory ? "Selecciona una categoría primero" : undefined
            }
          />
        </Grid2>
      </Grid2>
      {!selectedCategory && (
        <Box textAlign="center" p={4} bgcolor="action.hover" borderRadius={2}>
          <Typography variant="body1" color="text.secondary">
            Selecciona una categoría para ver los servicios disponibles
          </Typography>
        </Box>
      )}
      {selectedCategory && filteredServices.length === 0 && (
        <Box textAlign="center" p={4}>
          <Typography variant="body1" gutterBottom>
            No se encontraron servicios con los filtros aplicados
          </Typography>
          <Button
            variant="outlined"
            onClick={handleClearFilters}
            aria-label="Limpiar filtros de búsqueda"
          >
            Limpiar filtros
          </Button>
        </Box>
      )}
      {selectedCategory &&
        filteredServices.map((service) => (
          <ServiceCategory key={service.id} category={service} />
        ))}
    </Paper>
  );
};

export default ServiceSelection;
