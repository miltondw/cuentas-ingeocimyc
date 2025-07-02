import { FC, useState } from "react";
import {
  Container,
  Typography,
  Box,
  Button,
  Chip,
  IconButton,
} from "@mui/material";
import {
  Add as AddIcon,
  Category as CategoryIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import {
  useAdminCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/api/hooks/useAdminServices";
import { DataTable } from "@/components/common/DataTable";
import DataTablePagination from "@/components/common/DataTablePagination";
import { usePagination } from "@/hooks/usePagination";
import { getCategoryColumns } from "./components/columns";
import { getCategoryRowActions } from "./components/rowActions";
import CategoryFormDialog from "./components/CategoryFormDialog";
import DeleteCategoryDialog from "./components/DeleteCategoryDialog";
import { useCategoryForm } from "./hooks/useCategoryForm";
import type { ServiceCategory, CategoryFormData } from "./types";

const CategoriesManagementPage: FC = () => {
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
  const form = useCategoryForm(editingCategory);
  const { reset } = form;

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

  // Columnas y acciones modularizadas
  const columns = getCategoryColumns(formatDate);
  const rowActions = getCategoryRowActions(
    handleOpenEditDialog,
    setDeletingCategory
  );

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
      <CategoryFormDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSave={handleSaveCategory}
        editingCategory={editingCategory}
        isSaving={createMutation.isPending || updateMutation.isPending}
      />
      {/* Delete Confirmation Dialog */}
      <DeleteCategoryDialog
        open={!!deletingCategory}
        onClose={() => setDeletingCategory(null)}
        onConfirm={handleDeleteCategory}
        deletingCategory={deletingCategory}
        isDeleting={deleteMutation.isPending}
      />
    </Container>
  );
};

export default CategoriesManagementPage;
