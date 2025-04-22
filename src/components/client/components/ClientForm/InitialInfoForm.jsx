// InitialInfoForm.jsx
import { Box, TextField, Grid2, Typography } from "@mui/material";
import PropTypes from "prop-types";

const InitialInfoForm = ({ formData, setFormData }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Información del Solicitante
      </Typography>
      <Grid2 container spacing={2}>
        <Grid2 size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
            label="Nombre"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
            label="Nombre del Proyecto"
            name="nameProject"
            value={formData.nameProject}
            onChange={handleChange}
          />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
            label="Localización del Proyecto"
            name="location"
            value={formData.location}
            onChange={handleChange}
          />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
            label="Identificación CC O NIT"
            name="identification"
            value={formData.identification}
            onChange={handleChange}
          />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
            label="Teléfono"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
            label="Correo Electrónico"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
            label="Descripción del Proyecto"
            name="description"
            value={formData.description}
            onChange={handleChange}
          />
        </Grid2>
      </Grid2>
    </Box>
  );
};

InitialInfoForm.propTypes = {
  formData: PropTypes.shape({
    name: PropTypes.string.isRequired,
    nameProject: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
    identification: PropTypes.string.isRequired,
    phone: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
  }).isRequired,
  setFormData: PropTypes.func.isRequired,
};

export default InitialInfoForm;