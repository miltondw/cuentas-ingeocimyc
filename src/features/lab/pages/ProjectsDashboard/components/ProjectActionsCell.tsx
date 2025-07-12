import {
  updateProjectAssayStatus,
  updateProjectStatus,
} from "@/services/api/labService";
import React, { useState, useMemo, useEffect } from "react";
import {
  Stack,
  Chip,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Divider,
  Box,
  FormControl,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import type {
  LabProject,
  AssayInfo,
  AssayCategory,
} from "../types/ProjectsDashboard.types";
import { ProjectStatus, ProjectAssayStatus } from "@/types/system";
import { useAuth } from "@/features/auth/hooks/useAuth";
// import { ENSAYOS_BY_CATEGORY } from "../ensayosByCategory"; // Si se quiere usar para iconos o labels custom

interface ProjectActionsCellProps {
  proyecto: LabProject;
  onCreateApique: (id: number) => void;
  onViewApiques: (id: number) => void;
  onCreateProfile: (id: number) => void;
  onViewProfiles: (id: number) => void;
  onStatusChanged?: () => void; // Nuevo callback opcional
}

// Utilidad para mostrar el label amigable del estado
const STATUS_LABELS: Record<string, string> = {
  pendiente: "Pendiente",
  en_proceso: "En Proceso",
  completado: "Completado",
};

// Utilidad para color del Chip según estado
const STATUS_COLORS: Record<string, "warning" | "info" | "success"> = {
  pendiente: "warning",
  en_proceso: "info",
  completado: "success",
};

export const ProjectActionsCell: React.FC<ProjectActionsCellProps> = ({
  proyecto,
  onCreateApique,
  onViewApiques,
  onCreateProfile,
  onViewProfiles,
  onStatusChanged,
}) => {
  const { hasRole } = useAuth();
  const isAdmin = hasRole("admin");

  const [open, setOpen] = useState(false);
  const [openProjectStatus, setOpenProjectStatus] = useState(false);
  const [statusLoading, setStatusLoading] = useState<number | null>(null);
  const [projectStatusLoading, setProjectStatusLoading] = useState(false);
  // Estado local para los ensayos asignados (para reflejar el cambio sin recargar)
  const [localAssays, setLocalAssays] = useState(proyecto.assigned_assays);
  const [localProjectStatus, setLocalProjectStatus] = useState(proyecto.estado);

  // Actualiza localAssays y localProjectStatus si cambia el prop
  useEffect(() => {
    setLocalAssays(proyecto.assigned_assays);
    setLocalProjectStatus(proyecto.estado);
  }, [proyecto.assigned_assays, proyecto.estado]);

  // Agrupa los ensayos asignados por categoría dinámica de la API
  const assaysByCategory = useMemo(() => {
    const map = new Map<
      string,
      { category: AssayCategory | null; ensayos: AssayInfo[] }
    >();
    for (const ensayo of localAssays) {
      const category =
        ensayo?.assay?.category ||
        (ensayo?.assay?.categories && ensayo?.assay?.categories[0]) ||
        null;
      const catKey = category?.id?.toString() || "sin-categoria";
      if (!map.has(catKey)) {
        map.set(catKey, {
          category,
          ensayos: [],
        });
      }
      const entry = map.get(catKey);
      if (entry) {
        entry.ensayos.push(ensayo);
      }
    }
    return Array.from(map.values());
  }, [localAssays]);

  const handleCreateItem = (type: "apiques" | "perfiles") => {
    if (type === "apiques") onCreateApique(proyecto.proyecto_id);
    if (type === "perfiles") onCreateProfile(proyecto.proyecto_id);
  };

  const handleStatusChange = async (
    assayAssignmentId: number,
    newStatus: "pendiente" | "en_proceso" | "completado"
  ) => {
    setStatusLoading(assayAssignmentId);
    try {
      await updateProjectAssayStatus(
        proyecto.proyecto_id,
        assayAssignmentId,
        newStatus
      );
      // Actualiza el estado localmente para reflejar el cambio sin recargar
      setLocalAssays((prev) =>
        prev.map((a) =>
          a.id === assayAssignmentId
            ? { ...a, status: newStatus as ProjectAssayStatus }
            : a
        )
      );
      // Notifica al padre para que recargue los datos del proyecto
      if (onStatusChanged) onStatusChanged();
    } catch (e) {
      // Manejo de error (puedes mostrar notificación)
      console.error(e);
    } finally {
      setStatusLoading(null);
    }
  };

  // Maneja el cambio de estado global del proyecto
  const handleProjectStatusChange = async (newStatus: ProjectStatus) => {
    setProjectStatusLoading(true);
    try {
      await updateProjectStatus(proyecto.proyecto_id, newStatus);
      // Actualiza el estado localmente
      setLocalProjectStatus(newStatus);
      // Notifica al padre para que recargue los datos del proyecto
      if (onStatusChanged) onStatusChanged();
      setOpenProjectStatus(false);
    } catch (e) {
      console.error(e);
    } finally {
      setProjectStatusLoading(false);
    }
  };

  return (
    <>
      <Stack
        direction="row"
        spacing={1}
        justifyContent="center"
        alignItems="center"
      >
        <Tooltip title="Ver Ensayos">
          <IconButton
            size="small"
            color="primary"
            onClick={() => setOpen(true)}
          >
            <VisibilityIcon />
          </IconButton>
        </Tooltip>
        {isAdmin && (
          <Tooltip title="Cambiar Estado del Proyecto">
            <IconButton
              size="small"
              color="info"
              onClick={() => setOpenProjectStatus(true)}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
        )}
      </Stack>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Ensayos asignados</DialogTitle>
        <DialogContent>
          {localAssays.length === 0 && (
            <Typography variant="body2">No hay ensayos asignados.</Typography>
          )}
          {assaysByCategory.map(({ category, ensayos }, idx) => (
            <Box key={category?.id || idx} sx={{ mb: 2 }}>
              {assaysByCategory.length > 1 && (
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  {category?.name || "Sin categoría"}
                </Typography>
              )}
              {ensayos.map((ensayo) => {
                const isApique = ensayo?.assay?.code === "apiques";
                const isPerfil = ensayo?.assay?.code === "perfiles";
                const hasItems = isApique
                  ? proyecto.apique_ids.length > 0
                  : isPerfil
                  ? proyecto.profile_ids.length > 0
                  : false;
                return (
                  <Stack
                    key={ensayo.id}
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    sx={{ mb: 1 }}
                  >
                    <Typography variant="body2" sx={{ minWidth: 100 }}>
                      {ensayo?.assay?.name}
                    </Typography>
                    <Chip
                      label={
                        STATUS_LABELS[ensayo.status ?? "pendiente"] ||
                        ensayo.status ||
                        "pendiente"
                      }
                      color={
                        STATUS_COLORS[ensayo.status ?? "pendiente"] || "warning"
                      }
                      size="small"
                    />
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <Select
                        value={ensayo.status || "pendiente"}
                        onChange={(e) =>
                          handleStatusChange(
                            ensayo.id,
                            e.target.value as
                              | "pendiente"
                              | "en_proceso"
                              | "completado"
                          )
                        }
                        disabled={statusLoading === ensayo.id}
                        renderValue={(value) =>
                          STATUS_LABELS[value as string] || value
                        }
                      >
                        <MenuItem value="pendiente">Pendiente</MenuItem>
                        <MenuItem value="en_proceso">En Proceso</MenuItem>
                        <MenuItem value="completado">Completado</MenuItem>
                      </Select>
                    </FormControl>
                    {hasItems ? (
                      <Button
                        size="small"
                        color="info"
                        onClick={() => {
                          if (isApique) onViewApiques(proyecto.proyecto_id);
                          if (isPerfil) onViewProfiles(proyecto.proyecto_id);
                          setOpen(false);
                        }}
                      >
                        Ver {isApique ? "Apiques" : "Perfiles"}
                      </Button>
                    ) : (
                      <Button
                        size="small"
                        color="primary"
                        onClick={() => {
                          handleCreateItem(isApique ? "apiques" : "perfiles");
                          setOpen(false);
                        }}
                      >
                        Crear {ensayo?.assay?.name}
                      </Button>
                    )}
                  </Stack>
                );
              })}
              {idx < assaysByCategory.length - 1 && <Divider sx={{ my: 1 }} />}
            </Box>
          ))}
        </DialogContent>
      </Dialog>

      {/* Diálogo para cambiar el estado del proyecto */}
      <Dialog
        open={openProjectStatus}
        onClose={() => setOpenProjectStatus(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Cambiar estado del proyecto</DialogTitle>
        <DialogContent>
          <Box sx={{ py: 2 }}>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Estado actual:{" "}
              <Chip
                label={proyecto.estado}
                color={
                  proyecto.estado === ProjectStatus.ACTIVO
                    ? "success"
                    : proyecto.estado === ProjectStatus.PAUSADO
                    ? "warning"
                    : "default"
                }
                size="small"
              />
            </Typography>

            <FormControl fullWidth>
              <Select
                value={localProjectStatus}
                onChange={(e) =>
                  setLocalProjectStatus(e.target.value as ProjectStatus)
                }
                disabled={projectStatusLoading}
              >
                <MenuItem value={ProjectStatus.ACTIVO}>Activo</MenuItem>
                <MenuItem value={ProjectStatus.PAUSADO}>Pausado</MenuItem>
                <MenuItem value={ProjectStatus.COMPLETADO}>Completado</MenuItem>
                <MenuItem value={ProjectStatus.CANCELADO}>Cancelado</MenuItem>
              </Select>
            </FormControl>

            {projectStatusLoading && (
              <Box display="flex" justifyContent="center" sx={{ mt: 2 }}>
                <CircularProgress size={24} />
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenProjectStatus(false)}>Cancelar</Button>
          <Button
            onClick={() => handleProjectStatusChange(localProjectStatus)}
            variant="contained"
            color="primary"
            disabled={
              projectStatusLoading || localProjectStatus === proyecto.estado
            }
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
