import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Button,
  Snackbar,
  Alert,
  Typography,
  Grid2,
  IconButton,
  useMediaQuery,
  useTheme,
  LinearProgress,
  Box,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import api from "@api";
import { ApiqueFormData, Layer, Notification } from "./apiqueTypes";
import BasicInfoForm from "./BasicInfoForm";
import LayersTable from "./LayersTable";
import MobileLayersAccordion from "./MobileLayersAccordion";

const ApiquesDeSuelos = () => {
  const { projectId, apiqueId } = useParams<{
    projectId: string;
    apiqueId: string;
  }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

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
  const [notification, setNotification] = useState<Notification>({
    open: false,
    message: "",
    severity: "success",
  });

  // Load data from API
  useEffect(() => {
    if (!apiqueId || apiqueId === "nuevo") return;

    const fetchApique = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/projects/${projectId}/apiques/${apiqueId}`);
        const apiqueData = res.data.apique;

        setFormData({
          apique: apiqueData.apique,
          location: apiqueData.location,
          depth: apiqueData.depth,
          date: apiqueData.date.split("T")[0],
          cbr_unaltered: apiqueData.cbr_unaltered,
          depth_tomo: apiqueData.depth_tomo,
          molde: apiqueData.molde,
          layers: apiqueData.layers.map((layer: Layer) => ({
            layer_number: layer.layer_number,
            thickness: layer.thickness,
            sample_id: layer.sample_id,
            observation: layer.observation,
          })),
        });

        setNotification({
          open: true,
          message: "Apique cargado correctamente",
          severity: "success",
        });
      } catch (error) {
        console.error("Error cargando apique:", error);
        setNotification({
          open: true,
          message:
            (error as any).response?.data?.message ||
            "Error al cargar el apique",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchApique();
  }, [projectId, apiqueId]);

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
    setFormData((prev) => ({ ...prev, depth: parseFloat(totalDepth) }));
  }, [totalDepth]);

  // Validate form
  const validateForm = (): boolean => {
    if (
      formData.depth_tomo &&
      (isNaN(Number(formData.depth_tomo)) || Number(formData.depth_tomo) < 0)
    ) {
      setNotification({
        open: true,
        message: "Profundidad de toma debe ser un número positivo",
        severity: "error",
      });
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
      const payload = {
        ...formData,
        layers: formData.layers.map((layer) => ({
          ...layer,
          thickness: parseFloat(layer.thickness as string),
        })),
      };

      const endpoint =
        apiqueId && apiqueId !== "nuevo"
          ? `/projects/${projectId}/apiques/${apiqueId}`
          : `/projects/${projectId}/apiques`;
      const method = apiqueId && apiqueId !== "nuevo" ? "put" : "post";

      await api[method](endpoint, payload);
      setNotification({
        open: true,
        message: `Apique ${
          method === "put" ? "actualizado" : "creado"
        } correctamente`,
        severity: "success",
      });

      setTimeout(() => {
        navigate(`/lab/proyectos/${projectId}/apiques`);
      }, 1500);
    } catch (error) {
      console.error("Error guardando apique:", error);
      setNotification({
        open: true,
        message:
          (error as any).response?.data?.message ||
          "Error al guardar el apique",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseNotification = () => {
    setNotification((prev) => ({ ...prev, open: false }));
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

      <Snackbar
        open={notification.open}
        autoHideDuration={1000}
        onClose={handleCloseNotification}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ApiquesDeSuelos;
