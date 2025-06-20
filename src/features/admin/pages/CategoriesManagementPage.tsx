import React, { useState } from "react";
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Category as CategoryIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { categorySchema } from "@/lib/validation/adminSchemas";
import {
  useAdminCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/api/hooks/useAdminServices";
import type { ServiceCategory, CategoryFormData } from "@/types/admin";

const CategoriesManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [editingCategory, setEditingCategory] =
    useState<ServiceCategory | null>(null);
  const [deletingCategory, setDeletingCategory] =
    useState<ServiceCategory | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Hooks de datos
  const { data: categoriesResponse, isLoading } = useAdminCategories();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const categories = categoriesResponse?.data || [];

  // Form handling
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: yupResolver(categorySchema),
  });

  const handleOpenCreateDialog = () => {
    setEditingCategory(null);
    reset({ code: "", name: "" });
    setDialogOpen(true);
  };

  const handleOpenEditDialog = (category: ServiceCategory) => {
    setEditingCategory(category);
    reset({
      code: category.code,
      name: category.name,
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCategory(null);
    reset();
  };

  const handleSaveCategory = async (data: CategoryFormData) => {
    try {
      if (editingCategory) {
        await updateMutation.mutateAsync({
          id: editingCategory.id,
          data,
        });
      } else {
        await createMutation.mutateAsync(data);
      }
      handleCloseDialog();
    } catch (_error) {
      // El error ya se maneja en el hook
    }
  };

  const handleDeleteCategory = async () => {
    if (!deletingCategory) return;

    try {
      await deleteMutation.mutateAsync(deletingCategory.id);
      setDeletingCategory(null);
    } catch (_error) {
      // El error ya se maneja en el hook
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <IconButton onClick={() => navigate("/admin")} size="large">
            <ArrowBackIcon />
          </IconButton>
          <CategoryIcon sx={{ fontSize: 32, color: "primary.main" }} />
          <Typography variant="h4" component="h1" fontWeight="bold">
            Gestión de Categorías
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Administra las categorías de servicios disponibles en el sistema
        </Typography>
      </Box>

      {/* Actions */}
      <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between" }}>
        <Box>
          <Chip
            label={`${categories.length} categorías`}
            color="primary"
            variant="outlined"
          />
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateDialog}
        >
          Nueva Categoría
        </Button>
      </Box>

      {/* Table */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Código</TableCell>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Servicios</TableCell>
                  <TableCell>Fecha de Creación</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      Cargando categorías...
                    </TableCell>
                  </TableRow>
                ) : categories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No hay categorías registradas
                    </TableCell>
                  </TableRow>
                ) : (
                  categories.map((category) => (
                    <TableRow key={category.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {category.code}
                        </Typography>
                      </TableCell>
                      <TableCell>{category.name}</TableCell>
                      <TableCell>
                        <Chip
                          label={`${category.services?.length || 0} servicios`}
                          size="small"
                          color={
                            category.services?.length ? "success" : "default"
                          }
                        />
                      </TableCell>
                      <TableCell>{formatDate(category.created_at)}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenEditDialog(category)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => setDeletingCategory(category)}
                          disabled={!!category.services?.length}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={handleSubmit(handleSaveCategory)}>
          <DialogTitle>
            {editingCategory ? "Editar Categoría" : "Nueva Categoría"}
          </DialogTitle>
          <DialogContent>
            <Box
              sx={{ pt: 1, display: "flex", flexDirection: "column", gap: 3 }}
            >
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
            <Button onClick={handleCloseDialog}>Cancelar</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {editingCategory ? "Actualizar" : "Crear"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deletingCategory}
        onClose={() => setDeletingCategory(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          {deletingCategory?.services?.length ? (
            <Alert severity="warning" sx={{ mb: 2 }}>
              No se puede eliminar esta categoría porque tiene{" "}
              {deletingCategory.services.length} servicio(s) asociado(s).
              Primero debe eliminar o reasignar los servicios.
            </Alert>
          ) : (
            <Typography>
              ¿Estás seguro de que deseas eliminar la categoría &quot;
              {deletingCategory?.name}&quot;? Esta acción no se puede deshacer.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeletingCategory(null)}>Cancelar</Button>
          {!deletingCategory?.services?.length && (
            <Button
              onClick={handleDeleteCategory}
              color="error"
              variant="contained"
              disabled={deleteMutation.isPending}
            >
              Eliminar
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CategoriesManagementPage;
