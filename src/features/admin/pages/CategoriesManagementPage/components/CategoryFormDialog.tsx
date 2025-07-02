import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Button,
  TextField,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import type { CategoryFormData, ServiceCategory } from "@/types/admin";
import { categorySchema } from "@/lib/validation/adminSchemas";

interface CategoryFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: CategoryFormData) => Promise<void>;
  editingCategory: ServiceCategory | null;
  isSaving: boolean;
}

const CategoryFormDialog: React.FC<CategoryFormDialogProps> = ({
  open,
  onClose,
  onSave,
  editingCategory,
  isSaving,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: yupResolver(categorySchema),
    defaultValues: editingCategory
      ? { code: editingCategory.code, name: editingCategory.name }
      : { code: "", name: "" },
  });

  React.useEffect(() => {
    if (editingCategory) {
      reset({ code: editingCategory.code, name: editingCategory.name });
    } else {
      reset({ code: "", name: "" });
    }
  }, [editingCategory, reset]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit(onSave)}>
        <DialogTitle>
          {editingCategory ? "Editar Categoría" : "Nueva Categoría"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: "flex", flexDirection: "column", gap: 3 }}>
            <TextField
              {...register("code")}
              label="Código"
              placeholder="ej: TEST"
              error={!!errors.code}
              helperText={errors.code?.message}
              fullWidth
              inputProps={{ style: { textTransform: "uppercase" } }}
            />
            <TextField
              {...register("name")}
              label="Nombre"
              placeholder="ej: CATEGORÍA DE PRUEBA"
              error={!!errors.name}
              helperText={errors.name?.message}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={isSaving}>
            {editingCategory ? "Actualizar" : "Crear"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CategoryFormDialog;
