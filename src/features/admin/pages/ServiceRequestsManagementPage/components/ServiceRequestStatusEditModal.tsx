import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import type { AdminServiceRequest, ServiceRequestStatus } from "../types";

interface ServiceRequestStatusEditModalProps {
  open: boolean;
  onClose: () => void;
  request: AdminServiceRequest | null;
  newStatus: ServiceRequestStatus;
  setNewStatus: (status: ServiceRequestStatus) => void;
  onSave: () => void;
  isLoading: boolean;
  statusOptions: Array<{ value: ServiceRequestStatus; label: string }>;
}

const ServiceRequestStatusEditModal: React.FC<
  ServiceRequestStatusEditModalProps
> = ({
  open,
  onClose,
  request,
  newStatus,
  setNewStatus,
  onSave,
  isLoading,
  statusOptions,
}) => {
  if (!request) return null;
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Cambiar Estado</DialogTitle>
      <DialogContent>
        <FormControl fullWidth margin="normal">
          <InputLabel id="status-label">Estado</InputLabel>
          <Select
            labelId="status-label"
            value={newStatus}
            label="Estado"
            onChange={(e) =>
              setNewStatus(e.target.value as ServiceRequestStatus)
            }
            disabled={isLoading}
          >
            {statusOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>
          Cancelar
        </Button>
        <Button onClick={onSave} variant="contained" disabled={isLoading}>
          {isLoading ? "Guardando..." : "Guardar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ServiceRequestStatusEditModal;
