import React, { useState, useMemo } from "react";
import {
  Stack,
  Chip,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Typography,
  Divider,
  Box,
} from "@mui/material";
import { Visibility as VisibilityIcon } from "@mui/icons-material";
import type {
  LabProject,
  AssayInfo,
  AssayCategory,
} from "../types/ProjectsDashboard.types";
// import { ENSAYOS_BY_CATEGORY } from "../ensayosByCategory"; // Si se quiere usar para iconos o labels custom

interface ProjectActionsCellProps {
  proyecto: LabProject;
  onCreateApique: (id: number) => void;
  onViewApiques: (id: number) => void;
  onCreateProfile: (id: number) => void;
  onViewProfiles: (id: number) => void;
}

export const ProjectActionsCell: React.FC<ProjectActionsCellProps> = ({
  proyecto,
  onCreateApique,
  onViewApiques,
  onCreateProfile,
  onViewProfiles,
}) => {
  const [open, setOpen] = useState(false);

  // Agrupa los ensayos asignados por categoría dinámica de la API
  const assaysByCategory = useMemo(() => {
    const map = new Map<
      string,
      { category: AssayCategory | null; ensayos: AssayInfo[] }
    >();
    for (const ensayo of proyecto.assigned_assays) {
      // Usar la categoría real de la API (primer elemento de categories)
      const category =
        ensayo.assay.category ||
        (ensayo.assay.categories && ensayo.assay.categories[0]) ||
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
  }, [proyecto.assigned_assays]);

  const handleCreateItem = (type: "apiques" | "perfiles") => {
    if (type === "apiques") onCreateApique(proyecto.proyecto_id);
    if (type === "perfiles") onCreateProfile(proyecto.proyecto_id);
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
      </Stack>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Ensayos asignados</DialogTitle>
        <DialogContent>
          {proyecto.assigned_assays.length === 0 && (
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
                const isApique = ensayo.assay.code === "apiques";
                const isPerfil = ensayo.assay.code === "perfiles";
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
                      {ensayo.assay.name}
                    </Typography>
                    <Chip
                      label={ensayo.status}
                      color={
                        ensayo.status !== "pendiente" ? "success" : "warning"
                      }
                      size="small"
                    />
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
                        Crear {ensayo.assay.name}
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
    </>
  );
};
