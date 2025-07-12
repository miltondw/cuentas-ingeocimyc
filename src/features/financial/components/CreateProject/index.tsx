import React, { useState, useEffect, useCallback } from "react";

import { Paper, Typography, Box, Button, Grid2 } from "@mui/material";
import { useNotifications } from "@/hooks/useNotifications";
import { projectsService } from "../../services/projectsService";
import { PaymentMethod } from "@/types/typesProject/projectTypes";
import { ProjectStatus } from "@/types/projects"; // Importando desde el archivo correcto

// Importación de componentes
import { BasicInfoSection } from "./components/BasicInfoSection";
import { FinancialInfoSection } from "./components/FinancialInfoSection";
import { ExpensesSection } from "./components/ExpensesSection";
import { ExtraFieldsSection } from "./components/ExtraFieldsSection";
import { AssaysSelectionSection } from "./components/AssaysSelectionSection";
import { ServiceRequestDialog } from "./components/ServiceRequestDialog";

// Importación de hooks
import { useServiceRequests } from "./hooks/useServiceRequests";
import { useExtraFields } from "./hooks/useExtraFields";
import { useAssays } from "./hooks/useAssays";

// Importación de servicios
import { serviceRequestsService } from "@/api/services/serviceRequestsService";

// Importación de tipos
import type {
  ProjectFormData,
  AssayFormItem,
  ExtraField,
  AssayResponseItem,
} from "./types";
import type { CreateProjectDto } from "@/types/typesProject/projectTypes";
import { useNavigate, useParams } from "react-router-dom";

/**
 * Componente principal para crear o editar proyectos
 * Integra todos los componentes modulares
 */
export const CreateProject: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showSuccess, showError, showWarning } = useNotifications();
  const isEditing = Boolean(id);

  // Estado principal del formulario con estructura modular
  const [formData, setFormData] = useState<ProjectFormData>({
    basicInfo: {
      nombreProyecto: "",
      solicitante: "",
      identificacion: "",
      fecha: new Date().toISOString().split("T")[0],
      estado: ProjectStatus.ACTIVO,
    },
    finances: {
      obrero: "",
      costoServicio: 0,
      abono: 0,
      factura: "",
      valorRetencion: 0,
      metodoDePago: "efectivo" as PaymentMethod,
    },
    expenses: {
      camioneta: 0,
      campo: 0,
      obreros: 0,
      comidas: 0,
      otros: 0,
      peajes: 0,
      combustible: 0,
      hospedaje: 0,
      otrosCampos: {},
    },
    assays: [],
  });

  // Estado de carga
  const [loading, setLoading] = useState<boolean>(false);

  // Diálogo de solicitudes de servicio
  const [serviceRequestDialogOpen, setServiceRequestDialogOpen] =
    useState(false);

  // Hooks personalizados
  const {
    serviceRequests,
    fetchServiceRequests,
    loading: loadingServiceRequests,
  } = useServiceRequests();

  const {
    extraFields,
    addExtraField,
    removeExtraField,
    updateExtraField,
    setExtraFieldsFromSource,
  } = useExtraFields();

  const {
    assaysByCategory,
    selectedAssays,
    loading: loadingAssays,
    addAssay,
    removedAssaysRef,
    removeAssay,
    setAssaysFromSource,
  } = useAssays();

  // Cargar datos de proyecto para edición
  const loadProject = useCallback(
    async (projectId: number) => {
      try {
        setLoading(true);
        const response = await projectsService.getProject(projectId);

        if (!response) {
          showError("No se encontró el proyecto");
          return;
        }

        // Extraer los datos de finanzas para mayor legibilidad
        const finanzas = response?.finanzas?.[0] || {};

        // Actualizar información básica y financiera
        setFormData((prev) => ({
          ...prev,
          basicInfo: {
            nombreProyecto: response.nombreProyecto || "",
            solicitante: response.solicitante || "",
            identificacion: response.identificacion || "",
            fecha: response.fecha || new Date().toISOString().split("T")[0],
            estado: (response.estado as ProjectStatus) || ProjectStatus.ACTIVO,
          },
          finances: {
            obrero: finanzas.obrero || "",
            costoServicio: Number(finanzas.costoServicio ?? 0),
            abono: Number(finanzas.abono ?? 0),
            factura: finanzas.factura || "",
            valorRetencion: Number(finanzas.valorRetencion ?? 0),
            metodoDePago:
              (finanzas.metodoDePago as PaymentMethod) || "efectivo",
          },
        }));

        // Cargar gastos si existen
        if (response?.expenses?.[0]) {
          const exp = response.expenses[0];
          setFormData((prev) => ({
            ...prev,
            expenses: {
              camioneta: Number(exp.camioneta ?? 0),
              campo: Number(exp.campo ?? 0),
              obreros: Number(exp.obreros ?? 0),
              comidas: Number(exp.comidas ?? 0),
              otros: Number(exp.otros ?? 0),
              peajes: Number(exp.peajes ?? 0),
              combustible: Number(exp.combustible ?? 0),
              hospedaje: Number(exp.hospedaje ?? 0),
              otrosCampos: exp.otrosCampos || {},
            },
          })); // Cargar campos extras desde otrosCampos
          if (exp.otrosCampos && typeof exp.otrosCampos === "object") {
            setExtraFieldsFromSource(exp.otrosCampos);
          }
        }

        // Cargar ensayos asignados (si los hubiera)
        if (
          response?.assignedAssays &&
          Array.isArray(response.assignedAssays)
        ) {
          // Adaptar a la estructura de datos del frontend
          const mappedItems = response.assignedAssays.map(
            (item: AssayResponseItem) => {
              // Determinar si el ítem tiene la estructura anidada o plana
              if (item.assay) {
                // Estructura anidada (según el tipo definido)
                return {
                  id: item.assay.id,
                  code: item.assay.code || "",
                  name: item.assay.name || "",
                  categoryId: item.assay.categories?.[0]?.id,
                  categoryName: item.assay.categories?.[0]?.name,
                };
              } else {
                // Estructura plana (según la respuesta actual de la API)
                // Asegurarse de que el ID sea un número válido
                if (!item.assayId) {
                  console.warn(`Ensayo sin ID válido encontrado:`, item);
                  return null;
                }
                return {
                  id: item.assayId,
                  code: item.code || "",
                  name: item.name || "",
                  categoryId: undefined,
                  categoryName: undefined,
                };
              }
            }
          );

          // Filtrar nulls y convertir al tipo correcto
          const assayItems: AssayFormItem[] = mappedItems.filter(
            (item) => item !== null
          ) as AssayFormItem[];
          console.info(
            `Cargando ${assayItems.length} ensayos del proyecto existente`
          );
          setFormData((prev) => ({
            ...prev,
            assays: assayItems,
          }));
          setAssaysFromSource(assayItems);
        }
      } catch (err: unknown) {
        showError("Error al cargar el proyecto");
        console.error("Error loading project:", err);
      } finally {
        setLoading(false);
      }
    },
    [showError, setExtraFieldsFromSource, setAssaysFromSource]
  );

  // Cargar proyecto si estamos editando
  useEffect(() => {
    // Cargar proyecto solo si estamos editando
    if (isEditing && id) {
      loadProject(parseInt(id));
    }
  }, [id, isEditing, loadProject]);

  // Cargar solicitudes cuando se abre el diálogo
  useEffect(() => {
    if (serviceRequestDialogOpen) {
      fetchServiceRequests();
    }
  }, [serviceRequestDialogOpen, fetchServiceRequests]);

  // Usamos una variable ref para controlar el ciclo de actualizaciones
  const isUpdatingRef = React.useRef(false);
  const assaysSourceRef = React.useRef<"formData" | "selection" | null>(null);

  // Este efecto sincroniza formData.assays -> selectedAssays SOLO CUANDO SE EDITA UN PROYECTO EXISTENTE
  useEffect(() => {
    // Solo procedemos en casos especiales y si no estamos ya actualizando
    if (assaysSourceRef.current === "selection" || isUpdatingRef.current) {
      assaysSourceRef.current = null;
      return;
    }

    // Solo sincronizamos automáticamente si estamos editando un proyecto existente
    // No lo hacemos cuando se selecciona una solicitud de servicio
    if (isEditing && id) {
      const isInitialLoadOnEdit =
        formData.assays.length > 0 && selectedAssays.length === 0;

      if (isInitialLoadOnEdit) {
        console.info(
          `Sincronizando ${formData.assays.length} ensayos desde formData -> selectedAssays ` +
            `(carga inicial en modo edición)`
        );
        isUpdatingRef.current = true;
        assaysSourceRef.current = "formData";

        // La función setAssaysFromSource ahora respeta los ensayos eliminados manualmente
        setAssaysFromSource(formData.assays);

        setTimeout(() => {
          isUpdatingRef.current = false;
        }, 100);
      }
    } else {
      // Si no estamos editando, no sincronizamos automáticamente
      console.info(
        "No se sincronizan automáticamente los ensayos de formData a selectedAssays"
      );
    }
  }, [formData.assays, selectedAssays, setAssaysFromSource, isEditing, id]);

  // Este efecto sincroniza selectedAssays -> formData.assays (cuando se seleccionan o deseleccionan checkboxes)
  useEffect(() => {
    // Solo procedemos si la fuente actual NO es formData (lo que significa que se actualizó desde selección de checkbox)
    if (assaysSourceRef.current === "formData" || isUpdatingRef.current) {
      assaysSourceRef.current = null;
      return;
    }

    // Detectamos cambios entre selectedAssays y formData.assays
    const assaysAdded = selectedAssays.filter(
      (selected) =>
        !formData.assays.some((formAssay) => formAssay.id === selected.id)
    );

    const assaysRemoved = formData.assays.filter(
      (formAssay) =>
        !selectedAssays.some((selected) => selected.id === formAssay.id)
    );

    const hasChanges = assaysAdded.length > 0 || assaysRemoved.length > 0;

    if (hasChanges) {
      if (assaysAdded.length > 0) {
        console.info(`Se añadieron ${assaysAdded.length} ensayos nuevos`);
      }
      if (assaysRemoved.length > 0) {
        console.info(
          `Se removieron ${assaysRemoved.length} ensayos: [${assaysRemoved
            .map((a) => a.id)
            .join(", ")}]`
        );
      }

      console.info(
        `Sincronizando ${selectedAssays.length} ensayos desde selectedAssays -> formData (selección manual)`
      );
      isUpdatingRef.current = true;
      assaysSourceRef.current = "selection";

      // Actualizamos formData con los datos de selectedAssays (siempre se respetan las eliminaciones)
      setFormData((prev) => ({
        ...prev,
        assays: [...selectedAssays],
      }));

      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 100);
    }
  }, [selectedAssays, formData.assays, setFormData]);

  // Funciones para actualizar cada sección del formulario
  const updateBasicInfo = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      basicInfo: {
        ...prev.basicInfo,
        [field]: value,
      },
    }));
  };

  const updateFinancialInfo = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      finances: {
        ...prev.finances,
        [field]: value,
      },
    }));
  };

  const updateExpenseField = (field: string, value: number) => {
    setFormData((prev) => ({
      ...prev,
      expenses: {
        ...prev.expenses,
        [field]: value,
      },
    }));
  };

  // Función para cargar datos desde una solicitud de servicio
  const handleSelectServiceRequest = async (requestId: number) => {
    try {
      setLoading(true);
      console.info(`Cargando solicitud de servicio #${requestId}...`);

      // Siempre obtener detalles completos directamente de la API
      // para asegurar que tenemos la información más actualizada
      const detailedRequest = await serviceRequestsService.getServiceRequest(
        requestId
      );

      if (!detailedRequest) {
        throw new Error(`No se pudo obtener la solicitud #${requestId}`);
      }

      console.info(`Solicitud #${requestId} cargada correctamente`);

      // Actualizar información básica
      setFormData((prev) => ({
        ...prev,
        basicInfo: {
          ...prev.basicInfo,
          nombreProyecto:
            detailedRequest.nameProject ||
            `Proyecto de ${detailedRequest.name}`,
          solicitante: detailedRequest.name,
          identificacion: detailedRequest.identification || "",
        },
      }));

      // Verificar si la solicitud tiene servicios seleccionados
      if (
        detailedRequest.selectedServices &&
        detailedRequest.selectedServices.length > 0
      ) {
        console.info(
          `La solicitud #${requestId} tiene ${detailedRequest.selectedServices.length} servicios`
        );

        // Extraer las categorías únicas de los servicios
        const categories = detailedRequest.selectedServices
          .map((service) => {
            if (!service.service || !service.service.categoryId) {
              return null;
            }

            return {
              id: service.service.categoryId,
              code: service.service.code || "",
              name:
                service.service.category?.name || service.service.name || "",
            };
          })
          .filter((category) => category !== null);

        // Eliminar duplicados usando un Map para mantener categorías únicas por ID
        const uniqueCategoriesMap = new Map();
        categories.forEach((category) => {
          if (category) {
            uniqueCategoriesMap.set(category.id, category);
          }
        });

        // Convertir el Map de vuelta a un array
        const uniqueCategories = Array.from(uniqueCategoriesMap.values());

        // Limpiar la lista de ensayos eliminados
        removedAssaysRef.current.clear();

        // Si estamos editando un proyecto, cargar los ensayos directamente
        if (isEditing) {
          // Mapear los servicios a ensayos para el proyecto
          const assayItems = detailedRequest.selectedServices
            .map((service) => {
              // Verificar si el servicio tiene toda la información necesaria
              if (!service.service || !service.service.id) {
                console.warn(
                  `Servicio incompleto en solicitud: ${JSON.stringify(service)}`
                );
                return null;
              }

              return {
                id: service.service.id,
                code: service.service.code || "",
                name: service.service.name || "",
                categoryId: service.service.categoryId,
                categoryName: service.service.category?.name || "",
              };
            })
            .filter((item) => item !== null) as AssayFormItem[];

          console.info(
            `Modo edición: Se procesaron ${assayItems.length} ensayos de la solicitud #${requestId} para selección automática`
          );

          if (assayItems.length > 0) {
            // En modo edición, guardar los ensayos en formData y también seleccionarlos
            setFormData((prev) => ({
              ...prev,
              assays: assayItems,
            }));

            // Seleccionar automáticamente los ensayos en modo edición
            setAssaysFromSource(assayItems);

            showSuccess(
              `Solicitud #${requestId} cargada correctamente. Se han seleccionado automáticamente ${assayItems.length} ensayos de la solicitud.`
            );
          } else {
            showWarning(
              `No se encontraron ensayos válidos en la solicitud #${requestId}.`
            );
          }
        } else {
          // En modo creación, solo mostrar las categorías identificadas
          if (uniqueCategories.length > 0) {
            console.info(
              `Categorías identificadas en la solicitud #${requestId}:`,
              uniqueCategories
                .map(
                  (cat) =>
                    `${cat.code ? cat.code + " - " : ""}${cat.name} (ID: ${
                      cat.id
                    })`
                )
                .join(", ")
            );

            // Construir un mensaje de ayuda más descriptivo para el usuario
            const categoriesMessage = uniqueCategories
              .map((cat) => `${cat.code ? cat.code + " - " : ""}${cat.name}`)
              .join(", ");

            showSuccess(
              `Solicitud #${requestId} cargada correctamente. Se identificaron las siguientes categorías: ${categoriesMessage}. Seleccione los ensayos correspondientes manualmente desde las categorías indicadas.`
            );
          } else {
            console.warn(
              `No se pudieron identificar categorías en la solicitud #${requestId}`
            );
            showWarning(
              `La solicitud #${requestId} no tiene categorías de ensayos identificables. Seleccione los ensayos manualmente.`
            );
          }
        }
      } else {
        console.warn(
          `La solicitud #${requestId} no tiene servicios seleccionados`
        );
        showWarning(
          `La solicitud #${requestId} no contiene servicios seleccionados. Por favor, verifique la solicitud.`
        );
      }

      // Cerramos el diálogo después de procesar todo
      setServiceRequestDialogOpen(false);

      setServiceRequestDialogOpen(false);
    } catch (err: unknown) {
      showError("Error al cargar la solicitud");
      console.error("Error loading service request:", err);
    } finally {
      setLoading(false);
    }
  };

  // Función para construir el objeto a enviar al API
  const buildPayload = (): CreateProjectDto => {
    // Construir otrosCampos desde extraFields
    const otrosCampos: Record<string, number> = {};
    extraFields.forEach((field: ExtraField) => {
      if (field.description && field.description.trim() && field.value > 0) {
        const key = field.description.replace(/\s+/g, "_");
        otrosCampos[key] = field.value;
      }
    });

    return {
      ...formData.basicInfo,
      estado: formData.basicInfo.estado, // El estado es ahora un campo global
      finances: [
        {
          ...formData.finances,
          // Ya no incluimos estado en finances
        },
      ],
      expenses: [
        {
          ...formData.expenses,
          otrosCampos,
        },
      ],
      assignedAssays: formData.assays.map((assay) => ({
        assayId: assay.id,
      })),
    };
  };

  // Envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);

      const payload = buildPayload();

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
    } catch (err: unknown) {
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

  // Renderizado del formulario
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

      {!isEditing && (
        <Box sx={{ mb: 3 }}>
          <Button
            variant="outlined"
            onClick={() => setServiceRequestDialogOpen(true)}
          >
            Cargar desde Solicitud de Servicio
          </Button>
        </Box>
      )}

      <form onSubmit={handleSubmit}>
        <Grid2 container spacing={3}>
          {/* Sección de Información Básica */}
          <BasicInfoSection
            nombreProyecto={formData.basicInfo.nombreProyecto}
            solicitante={formData.basicInfo.solicitante}
            identificacion={formData.basicInfo.identificacion}
            fecha={formData.basicInfo.fecha}
            estado={formData.basicInfo.estado}
            onFieldChange={updateBasicInfo}
            disabled={loading}
          />

          {/* Sección de Información Financiera */}
          <FinancialInfoSection
            obrero={formData.finances.obrero}
            costoServicio={formData.finances.costoServicio}
            abono={formData.finances.abono}
            factura={formData.finances.factura}
            valorRetencion={formData.finances.valorRetencion}
            metodoDePago={formData.finances.metodoDePago}
            onFieldChange={updateFinancialInfo}
            disabled={loading}
          />

          {/* Sección de Gastos */}
          <ExpensesSection
            expenses={formData.expenses}
            onFieldChange={updateExpenseField}
            disabled={loading}
          />

          {/* Sección de Campos Extras */}
          <ExtraFieldsSection
            extraFields={extraFields}
            onAddField={addExtraField}
            onRemoveField={removeExtraField}
            onUpdateField={updateExtraField}
            disabled={loading}
          />

          {/* Sección de Selección de Ensayos */}
          <AssaysSelectionSection
            assaysByCategory={assaysByCategory}
            selectedAssays={selectedAssays}
            onAddAssay={addAssay}
            onRemoveAssay={removeAssay}
            loading={loadingAssays}
            disabled={loading}
          />

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

      {/* Diálogo para seleccionar solicitud de servicio */}
      <ServiceRequestDialog
        open={serviceRequestDialogOpen}
        onClose={() => setServiceRequestDialogOpen(false)}
        loading={loadingServiceRequests}
        serviceRequests={serviceRequests}
        onSelectRequest={handleSelectServiceRequest}
      />
    </Paper>
  );
};

export default CreateProject;
