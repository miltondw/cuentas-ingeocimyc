import React, { useState } from "react";
import {
  Container,
  Typography,
  Box,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  IconButton,
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
import {
  DataTable,
  ColumnConfig,
  RowAction,
} from "@/components/common/DataTable";
import DataTablePagination from "@/components/common/DataTablePagination";
import { usePagination } from "@/hooks/usePagination";

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

  const categories = Array.isArray(categoriesResponse)
    ? categoriesResponse
    : Array.isArray(categoriesResponse?.data)
    ? categoriesResponse.data
    : [];

  // Paginación
  const { paginatedData, paginationData, setPage, setItemsPerPage } =
    usePagination({
      data: categories,
      initialPage: 1,
      initialItemsPerPage: 10,
    });

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

  // Configuración de columnas para DataTable
  const columns: ColumnConfig[] = [
    {
      key: "code",
      label: "Código",
      sortable: true,
      render: (value) => (
        <Typography variant="body2" fontWeight="medium">
          {String(value)}
        </Typography>
      ),
    },
    {
      key: "name",
      label: "Nombre",
      sortable: true,
    },
    {
      key: "services",
      label: "Servicios",
      render: (value) => {
        const services = value as ServiceCategory["services"];
        return (
          <Chip
            label={`${services?.length || 0} servicios`}
            size="small"
            color={services?.length ? "success" : "default"}
          />
        );
      },
    },
    {
      key: "created_at",
      label: "Fecha de Creación",
      sortable: true,
      render: (value) => formatDate(value as string),
    },
  ];
  // Configuración de acciones por fila
  const rowActions: RowAction[] = [
    {
      key: "edit",
      label: "Editar",
      icon: <EditIcon />,
      action: (category) => handleOpenEditDialog(category as ServiceCategory),
    },
    {
      key: "delete",
      label: "Eliminar",
      icon: <DeleteIcon />,
      color: "error",
      action: (category) => {
        const cat = category as ServiceCategory;
        if (!cat.services?.length) {
          setDeletingCategory(cat);
        }
      },
    },
  ];

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
      </Box>{" "}
      {/* Data Table */}
      <DataTable
        data={paginatedData as ServiceCategory[]}
        columns={columns}
        keyField="id"
        rowActions={rowActions}
        loading={isLoading}
        title="Lista de Categorías"
        emptyMessage="No hay categorías registradas"
      />
      {/* Paginación */}
      {paginationData.totalItems > 0 && (
        <DataTablePagination
          paginationData={paginationData}
          onPageChange={setPage}
          onRowsPerPageChange={setItemsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
          labelRowsPerPage="Categorías por página:"
          showFirstLastButtons={true}
          showRowsPerPage={true}
        />
      )}
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
              No se puede eliminar esta categoría porque tiene
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
