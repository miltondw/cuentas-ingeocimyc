import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  Stack,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  Divider,
  Paper,
  useTheme,
} from "@mui/material";
import type { AdminServiceRequest } from "@/types/serviceRequests";
import type { AssayInfo } from "@/features/lab/pages/ProjectsDashboard/types/ProjectsDashboard.types";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import VisibilityIcon from "@mui/icons-material/Visibility";

interface AssayOption extends AssayInfo {
  checked: boolean;
}

interface Category {
  id: number;
  name: string;
}

interface ServiceRequestActionsModalProps {
  open: boolean;
  request: AdminServiceRequest | null;
  categories?: Category[]; // NUEVO: categorías asociadas a la solicitud
  assaysByCategory: Record<number, AssayOption[]>; // Ensayos por categoría
  loading: boolean;
  onClose: () => void;
  onCreateProject: (
    selectedAssays: AssayInfo[],
    request: AdminServiceRequest
  ) => void;
  onFetchAssays: (categoryId: number) => void;
  // Handlers opcionales para acciones adicionales
  onEditStatus?: (request: AdminServiceRequest) => void;
  onCreateClientUser?: (request: AdminServiceRequest) => void;
  onView?: (request: AdminServiceRequest) => void;
  onDelete?: (request: AdminServiceRequest) => void;
  onGeneratePDF?: (id: number) => void;
  onRegeneratePDF?: (id: number) => void;
  isGeneratingPDF?: (id: number) => boolean;
  isRegeneratingPDF?: (id: number) => boolean;
  isCreatingClientUser?: (id: number) => boolean;
}

const ServiceRequestActionsModal: React.FC<ServiceRequestActionsModalProps> = ({
  open,
  request,
  categories = [],
  assaysByCategory,
  loading,
  onClose,
  onCreateProject,
  onFetchAssays,
  onEditStatus,
  onCreateClientUser,
  onView,
  onDelete,
  onGeneratePDF,
  onRegeneratePDF,
  isGeneratingPDF,
  isRegeneratingPDF,
  isCreatingClientUser,
}) => {
  const theme = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedAssays, setSelectedAssays] = useState<
    Record<number, AssayOption[]>
  >({});

  // Asegura que el tab seleccionado siempre sea válido y nunca null cuando hay categorías
  useEffect(() => {
    if (categories.length > 0) {
      // Si el tab seleccionado no existe, selecciona el primero
      if (
        selectedCategory === null ||
        !categories.some((cat) => cat.id === selectedCategory)
      ) {
        setSelectedCategory(categories[0].id);
      }
    } else if (selectedCategory !== null) {
      setSelectedCategory(null);
    }
  }, [categories, selectedCategory]);

  // Cargar ensayos al cambiar de categoría
  useEffect(() => {
    if (categories.length > 0 && selectedCategory === null) {
      setSelectedCategory(categories[0].id);
    }
  }, [categories, selectedCategory]);

  useEffect(() => {
    if (selectedCategory && !assaysByCategory[selectedCategory]) {
      onFetchAssays(selectedCategory);
    }
  }, [selectedCategory, assaysByCategory, onFetchAssays]);

  useEffect(() => {
    setSelectedAssays(assaysByCategory);
  }, [assaysByCategory]);

  const handleCheck = (categoryId: number, id: number) => {
    setSelectedAssays((prev) => ({
      ...prev,
      [categoryId]: prev[categoryId].map((a) =>
        a.id === id ? { ...a, checked: !a.checked } : a
      ),
    }));
  };

  const handleCreate = () => {
    if (request) {
      const allSelected = Object.values(selectedAssays)
        .flat()
        .filter((a) => a.checked);
      onCreateProject(allSelected, request);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, fontSize: 22, pb: 1 }}>
        Acciones para la solicitud #{request?.id}
      </DialogTitle>
      <DialogContent>
        {request && (
          <Paper
            elevation={2}
            sx={{ p: 2, mb: 2, background: theme.palette.grey[50] }}
          >
            <Typography variant="subtitle2">Cliente:</Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              {request.name}
            </Typography>
            <Typography variant="subtitle2">Identificación:</Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              {request.identification}
            </Typography>
            <Typography variant="subtitle2">Categorías asociadas:</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {categories.map((cat) => (
                <Typography
                  key={cat.id}
                  variant="body2"
                  sx={{
                    fontWeight: selectedCategory === cat.id ? 700 : 400,
                    color:
                      selectedCategory === cat.id
                        ? theme.palette.primary.main
                        : undefined,
                  }}
                >
                  {cat.name}
                </Typography>
              ))}
            </Stack>
          </Paper>
        )}
        <Tabs
          value={selectedCategory ?? categories[0]?.id ?? false}
          onChange={(_, v) => setSelectedCategory(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ mb: 2 }}
        >
          {categories.map((cat) => (
            <Tab key={cat.id} label={cat.name} value={cat.id} />
          ))}
        </Tabs>
        <Divider sx={{ mb: 2 }} />
        <Stack direction="row" spacing={2} mb={2}>
          <Tooltip title="Ver detalles">
            <span>
              <IconButton
                size="small"
                color="primary"
                onClick={() => onView && request && onView(request)}
                disabled={Boolean(!onView)}
              >
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Cambiar estado">
            <span>
              <IconButton
                size="small"
                color="primary"
                onClick={() => onEditStatus && request && onEditStatus(request)}
                disabled={Boolean(!onEditStatus)}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Crear usuario cliente">
            <span>
              <IconButton
                size="small"
                color="primary"
                onClick={() =>
                  onCreateClientUser && request && onCreateClientUser(request)
                }
                disabled={
                  Boolean(!onCreateClientUser) ||
                  Boolean(
                    isCreatingClientUser &&
                      request &&
                      isCreatingClientUser(request.id)
                  )
                }
              >
                {isCreatingClientUser &&
                request &&
                isCreatingClientUser(request.id) ? (
                  <CircularProgress size={20} />
                ) : (
                  <PersonAddIcon fontSize="small" />
                )}
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Generar PDF">
            <span>
              <IconButton
                size="small"
                color="primary"
                onClick={() =>
                  onGeneratePDF && request && onGeneratePDF(request.id)
                }
                disabled={
                  Boolean(!onGeneratePDF) ||
                  Boolean(
                    isGeneratingPDF && request && isGeneratingPDF(request.id)
                  )
                }
              >
                <PictureAsPdfIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Regenerar PDF">
            <span>
              <IconButton
                size="small"
                color="primary"
                onClick={() =>
                  onRegeneratePDF && request && onRegeneratePDF(request.id)
                }
                disabled={
                  Boolean(!onRegeneratePDF) ||
                  Boolean(
                    isRegeneratingPDF &&
                      request &&
                      isRegeneratingPDF(request.id)
                  )
                }
              >
                <RefreshIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Eliminar">
            <span>
              <IconButton
                size="small"
                color="error"
                onClick={() => onDelete && request && onDelete(request)}
                disabled={Boolean(!onDelete)}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Selecciona los ensayos a asignar para la categoría:
        </Typography>
        {loading ? (
          <CircularProgress />
        ) : (
          <Stack>
            {selectedCategory &&
            selectedAssays[selectedCategory]?.length > 0 ? (
              selectedAssays[selectedCategory].map((assay) => (
                <FormControlLabel
                  key={assay.id}
                  control={
                    <Checkbox
                      checked={!!assay.checked}
                      onChange={() => handleCheck(selectedCategory, assay.id)}
                    />
                  }
                  label={assay?.name || assay?.code || "Sin nombre"}
                />
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                No hay ensayos disponibles para esta categoría.
              </Typography>
            )}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          onClick={handleCreate}
          variant="contained"
          color="primary"
          disabled={
            loading ||
            Object.values(selectedAssays)
              .flat()
              .every((a) => !a.checked)
          }
        >
          Crear proyecto
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ServiceRequestActionsModal;
