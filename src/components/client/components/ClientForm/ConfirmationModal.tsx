import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";

interface ConfirmationModalProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  instances?: Array<{
    id: string;
    additionalInfo: Record<string, string | number | boolean | string[]>;
  }>;
  title?: string;
  message?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  open,
  onConfirm,
  onCancel,
  instances = [],
  title = "Confirmar Guardado",
  message = "¿Estás seguro de guardar los datos?",
}) => {
  // Verificar que instances no sea undefined o null y que additionalInfo sea válido
  const hasValidInstances = instances.every((instance) => {
    return (
      instance &&
      instance.additionalInfo &&
      typeof instance.additionalInfo === "object" &&
      Object.keys(instance.additionalInfo).length > 0
    );
  });

  // Ejemplo de uso de Object.keys (ajusta según tu lógica real en la línea 70)
  const additionalInfoKeys =
    instances.length > 0 ? Object.keys(instances[0].additionalInfo || {}) : [];

  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Typography>{message}</Typography>
        {instances.length > 0 && (
          <Typography>
            Se guardarán {instances.length} instancia(s) con los siguientes
            campos: {additionalInfoKeys.join(", ")}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} color="secondary">
          Cancelar
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="primary"
          disabled={!hasValidInstances}
        >
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationModal;
