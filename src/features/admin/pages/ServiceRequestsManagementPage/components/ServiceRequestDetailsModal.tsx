import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";
import type { AdminServiceRequest } from "../types";

interface ServiceRequestDetailsModalProps {
  open: boolean;
  onClose: () => void;
  request: AdminServiceRequest | null;
}

const ServiceRequestDetailsModal: React.FC<ServiceRequestDetailsModalProps> = ({
  open,
  onClose,
  request,
}) => {
  if (!request) return null;
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Detalles de la Solicitud</DialogTitle>
      <DialogContent>
        {/* Aquí puedes renderizar los detalles relevantes de la solicitud */}
        <Typography variant="subtitle1">ID: {request.id}</Typography>
        <Typography variant="subtitle1">Cliente: {request.name}</Typography>
        <Typography variant="subtitle1">Estado: {request.status}</Typography>
        {/* Agrega más campos según sea necesario */}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ServiceRequestDetailsModal;
