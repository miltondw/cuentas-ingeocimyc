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
  CircularProgress,
} from '@mui/material';
import PropTypes from 'prop-types';
import { useServiceRequest } from '../ServiceRequestContext';


const ConfirmationModal = ({ open, onClose, onConfirm, loading = false }) => {
  const { state } = useServiceRequest();
  const { formData, selectedServices } = state;


  // Etiquetas para los campos de formData
  const fieldLabels = {
    name: 'Nombre',
    nameProject: 'Nombre del proyecto',
    location: 'Ubicación',
    identification: 'Identificación',
    phone: 'Teléfono',
    email: 'Correo electrónico',
    description: 'Descripción',
  };


  // Etiquetas para los campos de additionalInfo
  const additionalFieldLabels = {
    tipoMuestra: 'Tipo de muestra',
    tamanoCilindro: 'Tamaño del cilindro',
    estructuraRealizada: 'Estructura realizada',
    resistenciaDiseno: 'Resistencia de diseño',
    dosificacionEmpleada: 'Dosificación empleada',
    identificacionMuestra: 'Identificación de la muestra',
    fechaFundida: 'Fecha de fundición',
    edadEnsayo: 'Edad del ensayo',
  };


  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="confirmation-dialog-title">
      <DialogTitle id="confirmation-dialog-title">Confirmar Solicitud</DialogTitle>
      <DialogContent>
        <Typography variant="h6" gutterBottom>Información del Cliente</Typography>
        <List dense>
          {Object.entries(formData).map(([field, value]) => (
            <ListItem key={field}>
              <ListItemText primary={fieldLabels[field] || field} secondary={value} />
            </ListItem>
          ))}
        </List>


        <Typography variant="h6" gutterBottom>Servicios Seleccionados</Typography>
        <List dense>
          {selectedServices.length > 0 ? (
            selectedServices.map((service) => (
              <ListItem key={service.item.id}>
                <ListItemText
                  primary={`${service.item.name} (Cantidad: ${service.quantity})`}
                  secondary={
                    <>
                      {service.additionalInfo && (
                        <List dense>
                          {Object.entries(service.additionalInfo).map(([field, value]) => (
                            <ListItem key={field} sx={{ pl: 4 }}>
                              <ListItemText
                                primary={additionalFieldLabels[field] || field}
                                secondary={value || 'No especificado'}
                              />
                            </ListItem>
                          ))}
                        </List>
                      )}
                    </>
                  }
                />
              </ListItem>
            ))
          ) : (
            <ListItem>
              <ListItemText primary="No hay servicios seleccionados" />
            </ListItem>
          )}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={onConfirm}
          disabled={loading}
          startIcon={loading && <CircularProgress size={20} />}
        >
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
  loading: PropTypes.bool,
};



export default ConfirmationModal;