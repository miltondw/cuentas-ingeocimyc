import React, { useState, useEffect, useCallback } from "react";
import {
  TextField,
  Button,
  Typography,
  Paper,
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
import { useNotifications } from "@/hooks/useNotifications";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate, useParams } from "react-router-dom";
import { projectsService } from "../services/projectsService";
import { formatNumber, parseNumber } from "@/utils/formatNumber";
import type {
  ProjectFinanceForm,
  ProjectExpenseForm,
} from "@/features/financial/types/projectTypes";
import type {
  CreateProjectDto,
  CreateProjectExpensesDto,
  PaymentMethod,
} from "@/types/typesProject/projectTypes";

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
  const { showSuccess, showError } = useNotifications();
  const isEditing = Boolean(id);

  // Estado para el proyecto principal (estructura alineada a la nueva API)
  const [project, setProject] = useState<{
    fecha: string;
    solicitante: string;
    nombreProyecto: string;
    identificacion: string;
    // Si en el futuro la API agrega más campos directos, agrégalos aquí
  }>({
    fecha: new Date().toISOString().split("T")[0],
    solicitante: "",
    nombreProyecto: "",
    identificacion: "",
  });

  // Estado para finanzas (un solo objeto)
  const [finances, setFinances] = useState<ProjectFinanceForm>({
    obrero: "",
    costoServicio: 0,
    abono: 0,
    factura: "",
    valorRetencion: 0,
    metodoDePago: "efectivo",
    estado: "activo",
  });

  // Estado para gastos (un solo objeto)
  const [expenses, setExpenses] = useState<ProjectExpenseForm>({
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

  // Eliminar estado duplicado de gastos del proyecto (ya está arriba)

  // Estado para campos extras dinámicos
  const [extraFields, setExtraFields] = useState<ExtraField[]>([]); // Estados de la UI
  const [loading, setLoading] = useState<boolean>(false);

  const loadProject = useCallback(
    async (projectId: number) => {
      try {
        setLoading(true);
        const response = await projectsService.getProject(projectId);

        if (response) {
          setProject({
            fecha: response?.fecha,
            solicitante: response?.solicitante,
            nombreProyecto: response?.nombreProyecto,
            identificacion: response?.identificacion,
          });
          // Cargar finanzas si existen (un solo objeto)
          if (response?.finanzas?.[0]) {
            const fin = response.finanzas[0];
            setFinances({
              obrero: fin.obrero || "",
              costoServicio: Number(fin.costoServicio ?? 0),
              abono: Number(fin.abono ?? 0),
              factura: fin.factura || "",
              valorRetencion: Number(fin.valorRetencion ?? 0),
              metodoDePago: (fin.metodoDePago as PaymentMethod) || "efectivo",
              estado: fin.estado || "activo",
            });
          }
          // Cargar gastos si existen (un solo objeto)
          if (response?.expenses?.[0]) {
            const exp = response.expenses[0];
            setExpenses({
              camioneta: Number(exp.camioneta ?? 0),
              campo: Number(exp.campo ?? 0),
              obreros: Number(exp.obreros ?? 0),
              comidas: Number(exp.comidas ?? 0),
              otros: Number(exp.otros ?? 0),
              peajes: Number(exp.peajes ?? 0),
              combustible: Number(exp.combustible ?? 0),
              hospedaje: Number(exp.hospedaje ?? 0),
              otrosCampos: exp.otrosCampos || {},
            });
            // Cargar campos extras desde otrosCampos
            if (exp.otrosCampos && typeof exp.otrosCampos === "object") {
              const extraFieldsFromData = Object.entries(exp.otrosCampos).map(
                ([key, value], index) => ({
                  id: `existing_${index}`,
                  description: key.replace(/_/g, " "),
                  value: typeof value === "number" ? value : Number(value) || 0,
                })
              );
              setExtraFields(extraFieldsFromData);
            } else {
              setExtraFields([]);
            }
          } else {
            setExpenses({
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
            setExtraFields([]);
          }
        }
      } catch (err) {
        showError("Error al cargar el proyecto");
        console.error("Error loading project:", err);
      } finally {
        setLoading(false);
      }
    },
    [showError]
  );

  // Cargar proyecto si estamos editando
  useEffect(() => {
    if (isEditing && id) {
      loadProject(parseInt(id));
    }
  }, [id, isEditing, loadProject]);

  const handleProjectChange = useCallback(
    (field: keyof typeof project, value: string | number) => {
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
      // Construir otrosCampos desde extraFields para el primer expense (puedes adaptar para varios)
      const otrosCampos: Record<string, number> = {};
      extraFields.forEach((field) => {
        if (field.description.trim() && field.value > 0) {
          const key = field.description.replace(/\s+/g, "_");
          otrosCampos[key] = field.value;
        }
      });
      // Asignar otrosCampos al único expense
      const expensesWithExtras = [{ ...expenses, otrosCampos }];
      const payload: CreateProjectDto = {
        ...project,
        finances: [finances],
        expenses: expensesWithExtras,
      };
      if (isEditing && id) {
        await projectsService.updateProject(parseInt(id), payload);
        showSuccess("Proyecto actualizado exitosamente");
      } else {
        await projectsService.createProject(payload);
        showSuccess("Proyecto creado exitosamente");
      }
      setTimeout(() => {
        navigate("/proyectos");
      }, 2000);
    } catch (err) {
      showError(
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
  // (Función transformDataForAPI eliminada porque ya no es necesaria)

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
              value={project.nombreProyecto ?? ""}
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
              value={project.solicitante ?? ""}
              onChange={(e) =>
                handleProjectChange("solicitante", e.target.value)
              }
              required
            />
          </Grid2>
          <Grid2 size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Identificación"
              value={project.identificacion ?? ""}
              onChange={(e) =>
                handleProjectChange("identificacion", e.target.value)
              }
              required
            />
          </Grid2>
          <Grid2 size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Obrero Asignado"
              value={finances.obrero}
              onChange={(e) =>
                setFinances((prev) => ({ ...prev, obrero: e.target.value }))
              }
            />
          </Grid2>
          <Grid2 size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              type="date"
              label="Fecha del Proyecto"
              value={project.fecha ?? ""}
              onChange={(e) => handleProjectChange("fecha", e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
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
          {/* Información financiera: ahora se mapea directamente a finances */}
          <Grid2 size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Costo del Servicio"
              value={formatNumber(finances.costoServicio)}
              onChange={(e) => {
                const numericValue = parseNumber(e.target.value);
                setFinances((prev) => ({
                  ...prev,
                  costoServicio: Number(numericValue) || 0,
                }));
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
              value={formatNumber(finances.abono)}
              onChange={(e) => {
                const numericValue = parseNumber(e.target.value);
                setFinances((prev) => ({
                  ...prev,
                  abono: Number(numericValue) || 0,
                }));
              }}
              placeholder="0"
              helperText="Formato colombiano (ej: 500,000)"
            />
          </Grid2>
          <Grid2 size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Valor Retención (%)"
              value={formatNumber(finances.valorRetencion)}
              onChange={(e) => {
                const numericValue = parseNumber(e.target.value);
                setFinances((prev) => ({
                  ...prev,
                  valorRetencion: Number(numericValue) || 0,
                }));
              }}
              placeholder="0"
              helperText="Porcentaje de retención (ej: 4)"
            />
          </Grid2>
          <Grid2 size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Método de Pago</InputLabel>
              <Select
                value={finances.metodoDePago}
                label="Método de Pago"
                onChange={(e) =>
                  setFinances((prev) => ({
                    ...prev,
                    metodoDePago: e.target.value as PaymentMethod,
                  }))
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
              value={finances.factura}
              onChange={(e) =>
                setFinances((prev) => ({ ...prev, factura: e.target.value }))
              }
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
            <Grid2 size={{ xs: 12, md: 6, lg: 4 }} key={String(field)}>
              <TextField
                fullWidth
                label={
                  typeof field === "string"
                    ? field.charAt(0).toUpperCase() + field.slice(1)
                    : String(field)
                }
                value={formatNumber(
                  typeof expenses[field as keyof ProjectExpenseForm] ===
                    "number"
                    ? (expenses[field as keyof ProjectExpenseForm] as number)
                    : 0
                )}
                onChange={(e) => {
                  const numericValue = parseNumber(e.target.value);
                  setExpenses((prev) => ({
                    ...prev,
                    [field as keyof ProjectExpenseForm]:
                      Number(numericValue) || 0,
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
