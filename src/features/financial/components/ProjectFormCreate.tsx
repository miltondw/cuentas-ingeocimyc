import React, { useState, useEffect, useCallback } from "react";
import {
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Box,
  Grid2,
  IconButton,
  Card,
  CardContent,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate, useParams } from "react-router-dom";
import { projectsService } from "../services/projectsServiceNew";
import { formatNumber, parseNumber } from "@/utils/formatNumber";
import type {
  CreateProjectDto,
  PaymentMethod,
  CreateProjectExpensesDto,
} from "../types/projectTypes";

// Interface para campos extras
interface ExtraField {
  id: string;
  description: string;
  value: number;
}

// Opciones para métodos de pago según la documentación del backend
const paymentMethods: { value: PaymentMethod; label: string }[] = [
  { value: "efectivo", label: "Efectivo" },
  { value: "transferencia", label: "Transferencia" },
  { value: "cheque", label: "Cheque" },
  { value: "credito", label: "Crédito" },
];

/**
 * Formulario para crear o editar proyectos
 * Basado en la estructura real del backend (tabla proyectos + gastos_proyectos)
 */
export const ProjectFormCreate: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);

  // Estados para el proyecto principal
  const [project, setProject] = useState<CreateProjectDto>({
    fecha: new Date().toISOString().split("T")[0],
    solicitante: "",
    nombreProyecto: "",
    obrero: "",
    costoServicio: 0,
    abono: 0,
    factura: "",
    valorRetencion: 0,
    metodoDePago: "efectivo",
    expenses: [],
  });

  type ExpenseFieldsType = keyof Omit<
    CreateProjectExpensesDto,
    "id" | "project_id" | "otrosCampos"
  >;
  const fieldsGastos: ExpenseFieldsType[] = [
    "camioneta",
    "campo",
    "obreros",
    "comidas",
    "otros",
    "peajes",
    "combustible",
    "hospedaje",
  ];

  // Estados para gastos del proyecto
  const [expenses, setExpenses] = useState<
    Omit<CreateProjectExpensesDto, "id" | "project_id">
  >({
    camioneta: 0,
    campo: 0,
    obreros: 0,
    comidas: 0,
    otros: 0,
    peajes: 0,
    combustible: 0,
    hospedaje: 0,
    otrosCampos: {},
  });

  // Estado para campos extras dinámicos
  const [extraFields, setExtraFields] = useState<ExtraField[]>([]);

  // Estados de la UI
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  // Cargar proyecto si estamos editando
  useEffect(() => {
    if (isEditing && id) {
      loadProject(parseInt(id));
    }
  }, [id, isEditing]);

  const loadProject = async (projectId: number) => {
    try {
      setLoading(true);
      const response = await projectsService.getProject(projectId);

      if (response) {
        // Cargar datos del proyecto
        setProject({
          fecha: response?.fecha,
          solicitante: response?.solicitante,
          nombreProyecto: response?.nombreProyecto,
          obrero: response?.obrero,
          costoServicio: response?.costoServicio,
          abono: response?.abono || 0,
          factura: response?.factura || "",
          valorRetencion: response?.valorRetencion || 0,
          metodoDePago: response?.metodoDePago || "efectivo",
          expenses: [],
        });

        // Cargar gastos si existen
        if (response?.expenses?.[0]) {
          setExpenses({
            camioneta: response?.expenses[0].camioneta || 0,
            campo: response?.expenses[0].campo || 0,
            obreros: response?.expenses[0].obreros || 0,
            comidas: response?.expenses[0].comidas || 0,
            otros: response?.expenses[0].otros || 0,
            peajes: response?.expenses[0].peajes || 0,
            combustible: response?.expenses[0].combustible || 0,
            hospedaje: response?.expenses[0].hospedaje || 0,
            otrosCampos: response?.expenses[0].otrosCampos || {},
          });

          // Cargar campos extras desde otrosCampos
          if (response?.expenses[0].otrosCampos) {
            const extraFieldsFromData = Object.entries(
              response?.expenses[0].otrosCampos
            ).map(([key, value], index) => ({
              id: `existing_${index}`,
              description: key.replace(/_/g, " "),
              value: typeof value === "number" ? value : 0,
            }));
            setExtraFields(extraFieldsFromData);
          }
        }
      }
    } catch (err) {
      setError("Error al cargar el proyecto");
      console.error("Error loading project:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectChange = useCallback(
    (field: keyof CreateProjectDto, value: string | number) => {
      setProject((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      // Construir otrosCampos desde extraFields
      const otrosCampos: Record<string, number> = {};
      extraFields.forEach((field) => {
        if (field.description.trim() && field.value > 0) {
          const key = field.description.replace(/\s+/g, "_");
          otrosCampos[key] = field.value;
        }
      });      const expensesData = {
        ...expenses,
        otrosCampos,
      };

      if (isEditing && id) {
        // Actualizar proyecto existente - usar función de transformación
        const transformedData = transformDataForAPI(project, expensesData);
        await projectsService.updateProject(parseInt(id), transformedData);
      } else {
        // Crear nuevo proyecto - usar función de transformación
        const transformedData = transformDataForAPI(project, expensesData);
        await projectsService.createProject(transformedData);
      }

      setSuccess(true);

      // Redirigir después de 2 segundos
      setTimeout(() => {
        navigate("/proyectos");
      }, 2000);
    } catch (err) {
      setError(
        isEditing
          ? "Error al actualizar el proyecto"
          : "Error al crear el proyecto"
      );
      console.error("Error saving project:", err);
    } finally {
      setLoading(false);
    }
  };

  // Funciones para manejar campos extras
  const addExtraField = () => {
    const newField: ExtraField = {
      id: Date.now().toString(),
      description: "",
      value: 0,
    };
    setExtraFields((prev) => [...prev, newField]);
  };

  const removeExtraField = (id: string) => {
    setExtraFields((prev) => prev.filter((field) => field.id !== id));
  };

  const updateExtraField = (id: string, updates: Partial<ExtraField>) => {
    setExtraFields((prev) =>
      prev.map((field) => {
        if (field.id === id) {
          if ("value" in updates) {
            const valueStr = String(updates.value);
            const numericValue = parseNumber(valueStr);
            return {
              ...field,
              ...updates,
              value: Number(numericValue) || 0,
            };
          }
          return { ...field, ...updates };
        }
        return field;
      })
    );
  };
  // Función para transformar data para envío a la API
  const transformDataForAPI = (
    projectData: CreateProjectDto,
    expensesData: Omit<CreateProjectExpensesDto, "id" | "project_id">
  ) => {
    // Transformar proyecto principal - convertir strings a números
    const transformedProject = {
      fecha: projectData.fecha,
      solicitante: projectData.solicitante,
      nombreProyecto: projectData.nombreProyecto,
      obrero: projectData.obrero,
      costoServicio: Number(projectData.costoServicio) || 0,
      abono: Number(projectData.abono) || 0,
      factura: projectData.factura,
      valorRetencion: Number(projectData.valorRetencion) || 0,
      metodoDePago: projectData.metodoDePago,
      expenses: [
        {
          camioneta: Number(expensesData.camioneta) || 0,
          campo: Number(expensesData.campo) || 0,
          obreros: Number(expensesData.obreros) || 0,
          comidas: Number(expensesData.comidas) || 0,
          otros: Number(expensesData.otros) || 0,
          peajes: Number(expensesData.peajes) || 0,
          combustible: Number(expensesData.combustible) || 0,
          hospedaje: Number(expensesData.hospedaje) || 0,
          otrosCampos: expensesData.otrosCampos,
        },
      ],
    };    // Para updates, NO incluir el ID en el body
    console.info("Datos transformados para la API:", transformedProject);
    return transformedProject;
  };

  if (loading && isEditing) {
    return (
      <Paper sx={{ p: 3, textAlign: "center" }}>
        <Typography>Cargando proyecto...</Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
      <Typography variant="h4" gutterBottom>
        {isEditing ? "Editar Proyecto" : "Crear Nuevo Proyecto"}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {isEditing
            ? "Proyecto actualizado exitosamente"
            : "Proyecto creado exitosamente"}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Grid2 container spacing={3}>
          {/* Información básica del proyecto */}
          <Grid2 size={{ xs: 12 }}>
            <Typography variant="h6" gutterBottom>
              Información del Proyecto
            </Typography>
          </Grid2>
          <Grid2 size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Nombre del Proyecto"
              value={project.nombreProyecto}
              onChange={(e) =>
                handleProjectChange("nombreProyecto", e.target.value)
              }
              required
            />
          </Grid2>
          <Grid2 size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Solicitante/Cliente"
              value={project.solicitante}
              onChange={(e) =>
                handleProjectChange("solicitante", e.target.value)
              }
              required
            />
          </Grid2>
          <Grid2 size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Obrero Asignado"
              value={project.obrero}
              onChange={(e) => handleProjectChange("obrero", e.target.value)}
              required
            />
          </Grid2>
          <Grid2 size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              type="date"
              label="Fecha del Proyecto"
              value={project.fecha}
              onChange={(e) => handleProjectChange("fecha", e.target.value)}
              InputLabelProps={{ shrink: true }}
              required
            />
          </Grid2>

          {/* Información financiera */}
          <Grid2 size={{ xs: 12 }}>
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Información Financiera
            </Typography>
          </Grid2>

          {/* Campos financieros con formateo en tiempo real */}
          <Grid2 size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Costo del Servicio"
              value={formatNumber(project.costoServicio)}
              onChange={(e) => {
                const numericValue = parseNumber(e.target.value);
                handleProjectChange("costoServicio", Number(numericValue) || 0);
              }}
              required
              placeholder="0"
              helperText="Formato colombiano (ej: 1,000,000)"
            />
          </Grid2>
          <Grid2 size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Abono"
              value={formatNumber(project.abono)}
              onChange={(e) => {
                const numericValue = parseNumber(e.target.value);
                handleProjectChange("abono", Number(numericValue) || 0);
              }}
              placeholder="0"
              helperText="Formato colombiano (ej: 500,000)"
            />
          </Grid2>
          <Grid2 size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Valor Retención (%)"
              value={formatNumber(project.valorRetencion)}
              onChange={(e) => {
                const numericValue = parseNumber(e.target.value);
                handleProjectChange(
                  "valorRetencion",
                  Number(numericValue) || 0
                );
              }}
              placeholder="0"
              helperText="Porcentaje de retención (ej: 4)"
            />
          </Grid2>
          <Grid2 size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Método de Pago</InputLabel>
              <Select
                value={project.metodoDePago}
                label="Método de Pago"
                onChange={(e) =>
                  handleProjectChange(
                    "metodoDePago",
                    e.target.value as PaymentMethod
                  )
                }
              >
                {paymentMethods.map((method) => (
                  <MenuItem key={method.value} value={method.value}>
                    {method.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid2>
          <Grid2 size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Número de Factura"
              value={project.factura}
              onChange={(e) => handleProjectChange("factura", e.target.value)}
            />
          </Grid2>

          {/* Gastos del proyecto */}
          <Grid2 size={{ xs: 12 }}>
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Gastos del Proyecto
            </Typography>
          </Grid2>

          {/* Campos de gastos con formateo en tiempo real */}
          {fieldsGastos.map((field) => (
            <Grid2 size={{ xs: 12, md: 6, lg: 4 }} key={field}>
              <TextField
                fullWidth
                label={field.charAt(0).toUpperCase() + field.slice(1)}
                value={formatNumber(expenses[field])}
                onChange={(e) => {
                  const numericValue = parseNumber(e.target.value);
                  setExpenses((prev) => ({
                    ...prev,
                    [field]: Number(numericValue) || 0,
                  }));
                }}
                placeholder="0"
                helperText="Formato colombiano (ej: 100,000)"
              />
            </Grid2>
          ))}

          {/* Campos extras dinámicos */}
          <Grid2 size={{ xs: 12 }}>
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Campos Extras
            </Typography>

            {extraFields.map((field) => (
              <Card key={field.id} sx={{ mb: 2 }}>
                <CardContent>
                  <Grid2 container spacing={2}>
                    <Grid2 size={{ xs: 8 }}>
                      <TextField
                        fullWidth
                        label="Descripción"
                        value={field.description}
                        onChange={(e) =>
                          updateExtraField(field.id, {
                            description: e.target.value,
                          })
                        }
                      />
                    </Grid2>
                    <Grid2 size={{ xs: 4 }}>
                      <TextField
                        fullWidth
                        label="Valor"
                        value={formatNumber(field.value)}
                        onChange={(e) => {
                          const numericValue = parseNumber(e.target.value);
                          updateExtraField(field.id, {
                            value: Number(numericValue) || 0,
                          });
                        }}
                        placeholder="0"
                        helperText="Formato colombiano"
                      />
                    </Grid2>
                    <Grid2 size={{ xs: 12 }}>
                      <IconButton
                        color="error"
                        onClick={() => removeExtraField(field.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Grid2>
                  </Grid2>
                </CardContent>
              </Card>
            ))}

            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={addExtraField}
              sx={{ mt: 1 }}
            >
              Agregar Campo Extra
            </Button>
          </Grid2>

          {/* Botones */}
          <Grid2 size={{ xs: 12 }}>
            <Box
              sx={{
                display: "flex",
                gap: 2,
                justifyContent: "flex-end",
                mt: 3,
              }}
            >
              <Button
                variant="outlined"
                onClick={() => navigate("/proyectos")}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" variant="contained" disabled={loading}>
                {loading
                  ? "Guardando..."
                  : isEditing
                  ? "Actualizar Proyecto"
                  : "Crear Proyecto"}
              </Button>
            </Box>
          </Grid2>
        </Grid2>
      </form>
    </Paper>
  );
};

export default ProjectFormCreate;
