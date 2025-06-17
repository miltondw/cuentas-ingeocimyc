import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Button,
  Typography,
  Grid2,
  IconButton,
  useMediaQuery,
  useTheme,
  LinearProgress,
  Box,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { apiquesService } from "@/api/services";
import { ApiqueFormData, Layer } from "./apiqueTypes";
import type { CreateApiqueDto } from "@/types/api";
import BasicInfoForm from "./BasicInfoForm";
import LayersTable from "./LayersTable";
import MobileLayersAccordion from "./MobileLayersAccordion";
import { useNotifications } from "@/api/hooks/useNotifications";

const ApiquesDeSuelos = () => {
  const { projectId, apiqueId } = useParams<{
    projectId: string;
    apiqueId: string;
  }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { showNotification, showSuccess, showError } = useNotifications();

  const [formData, setFormData] = useState<ApiqueFormData>({
    apique: null,
    location: "",
    depth: null,
    date: new Date().toISOString().split("T")[0],
    cbr_unaltered: false,
    depth_tomo: "",
    molde: "",
    layers: [],
  });

  const [loading, setLoading] = useState<boolean>(false);

  // Load data from API
  useEffect(() => {
    if (!apiqueId || apiqueId === "nuevo") return;

    const fetchApique = async () => {
      try {
        setLoading(true);
        const apiqueIdNum = parseInt(apiqueId);
        const apiqueData = await apiquesService.getApique(apiqueIdNum);

        setFormData({
          apique: apiqueData.sampleNumber,
          location: apiqueData.location,
          depth: apiqueData.depth,
          date: apiqueData.collectionDate.split("T")[0],
          cbr_unaltered: apiqueData.cbrUnaltered,
          depth_tomo: "", // No disponible en la nueva API, mantener vacío
          molde: "", // No disponible en la nueva API, mantener vacío
          layers:
            apiqueData.layers?.map((layer) => ({
              layer_number: layer.layerNumber,
              thickness: layer.thickness,
              sample_id: layer.sampleId || "",
              observation: layer.observation || "",
            })) || [],
        });

        showSuccess("Apique cargado correctamente");
      } catch (error) {
        console.error("Error cargando apique:", error);

        showError((error as Error).message || "Error al cargar el apique");
      } finally {
        setLoading(false);
      }
    };
    fetchApique();
  }, [projectId, apiqueId, showSuccess, showError]);

  // Handle basic field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Add a new layer
  const addLayer = () => {
    setFormData((prev) => ({
      ...prev,
      layers: [
        ...prev.layers,
        {
          layer_number: prev.layers.length + 1,
          thickness: 0,
          sample_id: "",
          observation: "",
        },
      ],
    }));
  };

  // Remove a layer
  const removeLayer = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      layers: prev.layers
        .filter((_, i) => i !== index)
        .map((layer, i) => ({ ...layer, layer_number: i + 1 })),
    }));
  };

  // Handle layer data changes
  const handleLayerChange = (
    index: number,
    field: keyof Layer,
    value: string | number
  ) => {
    setFormData((prev) => {
      const newLayers = [...prev.layers];
      newLayers[index] = { ...newLayers[index], [field]: value };
      return { ...prev, layers: newLayers };
    });
  };

  // Calculate total depth
  const totalDepth = useMemo(() => {
    return formData.layers
      .reduce((sum, layer) => sum + Number(layer.thickness || 0), 0)
      .toFixed(2);
  }, [formData.layers]);

  // Update depth in formData
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      depth: parseFloat(totalDepth) || 0,
    }));
  }, [totalDepth]);
  // Validate form
  const validateForm = (): boolean => {
    if (!formData.apique || formData.apique.trim() === "") {
      showError("El número de apique es requerido");
      return false;
    }

    if (!formData.location.trim()) {
      showError("La ubicación es requerida");
      return false;
    }

    if (formData.layers.length === 0) {
      showError("Debe agregar al menos una capa");
      return false;
    }

    // Validar depth_tomo si está presente
    if (
      formData.depth_tomo &&
      (isNaN(Number(formData.depth_tomo)) || Number(formData.depth_tomo) < 0)
    ) {
      showError("Profundidad de toma debe ser un número positivo");
      return false;
    }

    // Validar molde si CBR está activo
    if (
      formData.cbr_unaltered &&
      formData.molde &&
      (isNaN(Number(formData.molde)) || Number(formData.molde) < 0)
    ) {
      showError("El número de molde debe ser un número positivo");
      return false;
    }

    return true;
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      const projectIdNum = parseInt(projectId!);

      const payload: CreateApiqueDto = {
        projectId: projectIdNum,
        sampleNumber: formData.apique || "",
        location: formData.location,
        depth: formData.depth || 0,
        collectionDate: formData.date,
        status: "collected" as const,
        cbrUnaltered: formData.cbr_unaltered,
        layers: formData.layers.map((layer) => ({
          layerNumber: layer.layer_number,
          thickness: parseFloat(layer.thickness as string),
          sampleId: layer.sample_id || undefined,
          observation: layer.observation || undefined,
        })),
      };
      if (apiqueId && apiqueId !== "nuevo") {
        const apiqueIdNum = parseInt(apiqueId);
        await apiquesService.updateApique(apiqueIdNum, payload);
      } else {
        await apiquesService.createApique(payload);
      }

      showNotification({
        type: "success",
        title: "Apique Guardado",
        message: `El apique ha sido ${
          apiqueId && apiqueId !== "nuevo" ? "actualizado" : "creado"
        } correctamente`,
        duration: 3000,
        actions: [
          {
            label: "Ver Apiques",
            action: () => navigate(`/lab/proyectos/${projectId}/apiques`),
            variant: "outlined",
            color: "primary",
          },
        ],
      });

      setTimeout(() => {
        navigate(`/lab/proyectos/${projectId}/apiques`);
      }, 1500);
    } catch (error) {
      console.error("Error guardando apique:", error);

      showNotification({
        type: "error",
        title: "Error al Guardar",
        message: (error as Error).message || "Error al guardar el apique",
        persistent: true,
        actions: [
          {
            label: "Reintentar",
            action: () => handleSubmit(e),
            variant: "contained",
            color: "error",
          },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <LinearProgress sx={{ position: "fixed", top: 0, left: 0, right: 0 }} />
    );
  }

  return (
    <Box sx={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <IconButton
          onClick={() => navigate(`/lab/proyectos/${projectId}/apiques`)}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" gutterBottom>
          {apiqueId && apiqueId !== "nuevo" ? "Editar Apique" : "Crear Apique"}
        </Typography>
      </Box>

      <form onSubmit={handleSubmit}>
        <BasicInfoForm
          formData={formData}
          handleChange={handleChange}
          isMobile={isMobile}
        />

        {formData.layers.length > 0 && (
          <>
            {!isMobile ? (
              <LayersTable
                layers={formData.layers}
                handleLayerChange={handleLayerChange}
                removeLayer={removeLayer}
              />
            ) : (
              <MobileLayersAccordion
                layers={formData.layers}
                handleLayerChange={handleLayerChange}
                removeLayer={removeLayer}
              />
            )}
          </>
        )}

        <Grid2
          container
          spacing={2}
          justifyContent="space-between"
          sx={{ mt: 3 }}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={addLayer}
            sx={{ mt: 3 }}
          >
            Agregar Capa
          </Button>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ mt: 3 }}
            disabled={loading}
          >
            {loading ? "Guardando..." : "Guardar"}
          </Button>
        </Grid2>
      </form>
    </Box>
  );
};

export default ApiquesDeSuelos;
