import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  CircularProgress,
} from "@mui/material";
import ServiceCategory from "./ServiceCategory";
import { Service, ServiceSelectionProps } from "../types";

const ServiceSelection: React.FC<ServiceSelectionProps> = ({
  services = [],
  loading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);

  const categories = [...new Set(services.map((service) => service.category))];

  useEffect(() => {
    const newFilteredServices = services.filter(
      (service) =>
        (!selectedCategory || service.category === selectedCategory) &&
        service.items.some((item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );
    setFilteredServices(newFilteredServices);
  }, [services, selectedCategory, searchTerm]);

  const handleCategoryChange = (event: SelectChangeEvent<string>) => {
    setSelectedCategory(event.target.value);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!services.length) {
    return (
      <Typography variant="body1" sx={{ mt: 2 }}>
        No hay servicios disponibles
      </Typography>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Seleccionar Servicios
      </Typography>

      <FormControl fullWidth margin="normal">
        <InputLabel id="category-select-label">Categoría</InputLabel>
        <Select
          labelId="category-select-label"
          id="category-select"
          value={selectedCategory}
          label="Categoría"
          onChange={handleCategoryChange}
        >
          <MenuItem value="">Todas las Categorías</MenuItem>
          {categories.map((category) => (
            <MenuItem key={category} value={category}>
              {category}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        fullWidth
        label="Buscar servicio"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        margin="normal"
      />

      {filteredServices.length > 0 ? (
        filteredServices.map((service) => (
          <ServiceCategory key={service.id} category={service} />
        ))
      ) : (
        <Typography variant="body1" sx={{ mt: 2 }}>
          No se encontraron servicios que coincidan con los criterios de
          búsqueda
        </Typography>
      )}
    </Box>
  );
};

export default ServiceSelection;
