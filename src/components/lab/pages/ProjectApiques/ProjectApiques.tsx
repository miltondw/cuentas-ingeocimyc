// components/ProjectApiques/ProjectApiques.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  IconButton,
  Paper,
  useMediaQuery,
  Skeleton,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import api from "@api";
import { Apique, Layer, Project } from "../types/apiqueTypes";
import MobileView from "./MobileView";
import DesktopView from "./DesktopView";

const ProjectApiques = () => {
  const [apiques, setApiques] = useState<Apique[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width:768px)");

  useEffect(() => {
    const fetchProjectAndApiques = async () => {
      try {
        setLoading(true);
        const [projectResponse, apiquesResponse] = await Promise.all([
          api.get(`/projects/${projectId}`),
          api.get(`/projects/${projectId}/apiques`),
        ]);

        setProject(projectResponse.data.project);
        setApiques(apiquesResponse.data.apiques || []);
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Error al cargar los apiques. Por favor, intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    };

    fetchProjectAndApiques();
  }, [projectId]);

  const handleCreateApique = () => {
    navigate(`/lab/proyectos/${projectId}/apique/nuevo`);
  };

  const handleEditApique = (apiqueId: string) => {
    navigate(`/lab/proyectos/${projectId}/apique/${apiqueId}`);
  };

  const handleDeleteApique = async (apiqueId: string) => {
    if (!window.confirm("¿Estás seguro de eliminar este apique?")) return;

    try {
      await api.delete(`/projects/${projectId}/apiques/${apiqueId}`);
      setApiques(apiques.filter((apique) => apique.apique_id !== apiqueId));
    } catch (err) {
      console.error("Error deleting apique:", err);
      alert("No se pudo eliminar el apique. Intenta de nuevo.");
    }
  };

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getLayersCount = (layers: Layer[] | undefined): number => {
    return layers?.length || 0;
  };

  const getSamplesCount = (layers: Layer[] | undefined): number => {
    if (!layers) return 0;
    return layers.filter((layer) => layer.sample_id).length;
  };

  const getMaxDepth = (layers: Layer[] | undefined): string => {
    if (!layers || !layers.length) return "0.00";
    return layers
      .reduce((sum, layer) => sum + parseFloat(layer.thickness || "0"), 0)
      .toFixed(2);
  };

  if (loading) {
    return (
      <Container sx={{ py: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <IconButton onClick={() => navigate(-1)}>
            <ArrowBack />
          </IconButton>
          <Skeleton variant="text" width={200} height={30} />
        </Box>
        <Skeleton variant="rectangular" height={100} sx={{ mb: 2 }} />
        {[1, 2, 3].map((_, index) => (
          <Skeleton
            key={index}
            variant="rectangular"
            height={100}
            sx={{ mb: 1 }}
          />
        ))}
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <IconButton onClick={() => navigate(-1)}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6">Error</Typography>
        </Box>
        <Paper sx={{ p: 3, backgroundColor: "#fff4f4" }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      </Container>
    );
  }

  if (isMobile) {
    return (
      <MobileView
        project={project}
        apiques={apiques}
        navigate={navigate}
        handleCreateApique={handleCreateApique}
        handleEditApique={handleEditApique}
        handleDeleteApique={handleDeleteApique}
        formatDate={formatDate}
        getLayersCount={getLayersCount}
        getSamplesCount={getSamplesCount}
        getMaxDepth={getMaxDepth}
      />
    );
  }

  return (
    <DesktopView
      project={project}
      apiques={apiques}
      navigate={navigate}
      handleCreateApique={handleCreateApique}
      handleEditApique={handleEditApique}
      handleDeleteApique={handleDeleteApique}
      formatDate={formatDate}
      getLayersCount={getLayersCount}
      getSamplesCount={getSamplesCount}
      getMaxDepth={getMaxDepth}
    />
  );
};

export default ProjectApiques;
