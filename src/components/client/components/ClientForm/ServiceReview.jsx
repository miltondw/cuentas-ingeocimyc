// ServiceReview.jsx
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
} from "@mui/material";
import PropTypes from "prop-types";

const ServiceReview = ({ selectedServices, onBack, onConfirm }) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Revisar Servicios Seleccionados
      </Typography>
      {selectedServices.length === 0 ? (
        <Typography>No se han seleccionado servicios.</Typography>
      ) : (
        <List>
          {selectedServices.map((service, index) => (
            <ListItem key={index}>
              <ListItemText
                primary={service.item.name}
                secondary={`Cantidad: ${service.quantity}`}
              />
            </ListItem>
          ))}
        </List>
      )}
      <Box display="flex" justifyContent="space-between" marginTop={3}>
        <Button onClick={onBack}>Volver a Seleccionar Servicios</Button>
        <Button variant="contained" color="primary" onClick={onConfirm}>
          Confirmar Solicitud
        </Button>
      </Box>
    </Box>
  );
};

ServiceReview.propTypes = {
  selectedServices: PropTypes.arrayOf(
    PropTypes.shape({
      item: PropTypes.shape({
        name: PropTypes.string.isRequired,
      }).isRequired,
      quantity: PropTypes.number.isRequired,
    })
  ).isRequired,
  onBack: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
};

export default ServiceReview;