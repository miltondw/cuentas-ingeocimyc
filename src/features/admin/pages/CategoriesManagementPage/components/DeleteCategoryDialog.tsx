import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert,
} from "@mui/material";
import type { ServiceCategory } from "@/types/admin";

interface DeleteCategoryDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  deletingCategory: ServiceCategory | null;
  isDeleting: boolean;
}

const DeleteCategoryDialog: React.FC<DeleteCategoryDialogProps> = ({
  open,
  onClose,
  onConfirm,
  deletingCategory,
  isDeleting,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Confirmar Eliminación</DialogTitle>
      <DialogContent>
        {deletingCategory?.services?.length ? (
          <Alert severity="warning" sx={{ mb: 2 }}>
            No se puede eliminar esta categoría porque tiene
            {deletingCategory.services.length} servicio(s) asociado(s). Primero
            debe eliminar o reasignar los servicios.
          </Alert>
        ) : (
          <Typography>
            ¿Estás seguro de que deseas eliminar la categoría &quot;
            {deletingCategory?.name}&quot;? Esta acción no se puede deshacer.
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        {!deletingCategory?.services?.length && (
          <Button
            onClick={onConfirm}
            color="error"
            variant="contained"
            disabled={isDeleting}
          >
            Eliminar
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default DeleteCategoryDialog;
