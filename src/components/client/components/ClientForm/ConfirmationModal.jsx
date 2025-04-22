import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material';
import PropTypes from 'prop-types';

const ConfirmationModal = ({ open, onClose, onConfirm, selectedServices }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Confirmar Solicitud</DialogTitle>
      <DialogContent>
        <Typography variant="body1" gutterBottom>
          ¿Está seguro de que desea enviar la siguiente solicitud?
        </Typography>
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
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" color="primary" onClick={onConfirm}>
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

ConfirmationModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  selectedServices: PropTypes.arrayOf(
    PropTypes.shape({
      item: PropTypes.shape({
        name: PropTypes.string.isRequired,
      }).isRequired,
      quantity: PropTypes.number.isRequired,
    })
  ).isRequired,
};

export default ConfirmationModal;