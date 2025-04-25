import { useState } from "react";
import {
  Box,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import ServiceCategory from "./ServiceCategory";
import PropTypes from "prop-types";
import { useServiceRequest } from "../ServiceRequestContext";


const ServiceSelection = ({ services }) => {
  const { state } = useServiceRequest();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");


  const categories = [...new Set(services.map((service) => service.category))];


  const filteredServices = services.filter(
    (service) =>
      (!selectedCategory || service.category === selectedCategory) &&
      service.items.some((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );


  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };


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


      {filteredServices.map((service) => (
        <ServiceCategory
          key={service.id}
          category={service}
          selectedServices={state.selectedServices}
        />
      ))}
    </Box>
  );
};


ServiceSelection.propTypes = {
  services: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      category: PropTypes.string.isRequired,
      items: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.number.isRequired,
          name: PropTypes.string.isRequired,
        })
      ).isRequired,
    })
  ).isRequired,
};


export default ServiceSelection;