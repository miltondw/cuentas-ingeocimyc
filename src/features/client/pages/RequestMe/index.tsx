import { useServices } from "@/features/client/hooks/useServiceRequests";
import { useMemo, useState } from "react";
import { Box, Container, Typography, Dialog } from "@mui/material";
import { DataTable } from "@/components/common/DataTable";
import type { ColumnConfig } from "@/components/common/DataTable";
import { useNotifications } from "@/hooks/useNotifications";
import { getServiceRequestColumns } from "@/features/admin/pages/ServiceRequestsManagementPage/columns";
import { ServiceRequestDetailsModal } from "@/features/admin/pages/ServiceRequestsManagementPage/components";
import { ClientServiceRequestForm } from "@/features/client/components";
import type {
  AdminServiceRequest,
  ServiceRequestStatus,
} from "@/types/serviceRequests";
import { useMyServiceRequests } from "@/api/hooks/useAdminServiceRequests";

const RequestMe = () => {
  const { showError } = useNotifications();
  const { data, isLoading, error } = useMyServiceRequests();

  // Estado para modal de detalles y edición
  const [selectedRequest, setSelectedRequest] =
    useState<AdminServiceRequest | null>(null);
  const [editRequest, setEditRequest] = useState<AdminServiceRequest | null>(
    null
  );
  // Catálogo de servicios públicos (con additionalFields)
  const { data: allServices } = useServices();

  // Handlers para acciones permitidas
  const handlers = useMemo(
    () => ({
      onView: (request: AdminServiceRequest) => {
        // Enriquecer los servicios seleccionados con additionalFields del catálogo
        if (!allServices) {
          setSelectedRequest(request);
          return;
        }
        const enriched = {
          ...request,
          selectedServices: request.selectedServices.map((ss) => {
            const fullService = allServices.find((s) => s.id === ss.serviceId);
            if (!fullService) return ss;
            // Mapear additionalFields al tipo esperado
            const mappedAdditionalFields =
              fullService.additionalFields?.map((f) => ({
                ...f,
                fieldName: f?.fieldName ?? f.name, // Ajusta según tu modelo
              })) || [];
            return {
              ...ss,
              service: {
                ...fullService,
                additionalFields: mappedAdditionalFields,
              },
            };
          }),
        };
        setSelectedRequest(enriched as AdminServiceRequest);
      },
      onEditStatus: () => {}, // No permitido para cliente
      onDelete: () => {}, // No permitido para cliente
      onGeneratePDF: (id: number) => {
        window.open(`/api/service-requests/${id}/pdf`, "_blank");
      },
      onRegeneratePDF: () => {}, // No permitido para cliente
      isGeneratingPDF: () => false,
      isRegeneratingPDF: () => false,
      onCreateClientUser: () => {},
      isCreatingClientUser: () => false,
    }),
    [allServices]
  );

  // Columnas: solo dejar acción de ver (no editar estado ni eliminar)
  const columns = useMemo(() => {
    return getServiceRequestColumns(
      handlers,
      (status: ServiceRequestStatus) => {
        const map: Record<
          ServiceRequestStatus,
          {
            value: ServiceRequestStatus;
            label: string;
            color: "warning" | "info" | "success" | "error" | "default";
          }
        > = {
          pendiente: {
            value: "pendiente",
            label: "Pendiente",
            color: "warning",
          },
          "en proceso": {
            value: "en proceso",
            label: "En Proceso",
            color: "info",
          },
          completado: {
            value: "completado",
            label: "Completado",
            color: "success",
          },
          cancelado: { value: "cancelado", label: "Cancelado", color: "error" },
        };
        return (
          map[status] || { value: status, label: status, color: "default" }
        );
      }
    ).map((col) => {
      if (col.key === "actions") {
        return {
          ...col,
          render: (value: unknown, row: unknown) => {
            // Forzar el tipo de row a AdminServiceRequest para el render personalizado
            const base = col.render?.(value, row as AdminServiceRequest);
            if (
              base &&
              typeof base === "object" &&
              "props" in base &&
              base.props.children
            ) {
              const children = Array.isArray(base.props.children)
                ? base.props.children
                : [base.props.children];
              // Solo mostrar el botón de ver detalles
              const filtered = children.filter(
                (child: unknown): child is { props: { title: string } } => {
                  if (
                    !child ||
                    typeof child !== "object" ||
                    !("props" in child) ||
                    typeof (child as { props?: { title?: string } }).props
                      ?.title !== "string"
                  ) {
                    return false;
                  }
                  return (
                    (child as { props: { title: string } }).props.title ===
                    "Ver detalles"
                  );
                }
              );
              return {
                ...base,
                props: { ...base.props, children: filtered },
              };
            }
            return base;
          },
        };
      }
      return col;
    }) as ColumnConfig<unknown>[];
  }, [handlers]);

  if (error) {
    showError("No se pudieron cargar tus solicitudes");
  }

  // Handlers para modal
  const handleCloseDetails = () => setSelectedRequest(null);

  const handleCloseEdit = () => setEditRequest(null);
  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Mis Solicitudes de Servicio
        </Typography>
        <DataTable
          data={data?.data || []}
          columns={columns}
          loading={isLoading}
          paginationData={{
            currentPage: (data?.page || 1) - 1,
            totalPages: Math.ceil((data?.total || 0) / (data?.limit || 10)),
            totalItems: data?.total || 0,
            itemsPerPage: data?.limit || 10,
            startItem: ((data?.page || 1) - 1) * (data?.limit || 10) + 1,
            endItem: Math.min(
              (data?.page || 1) * (data?.limit || 10),
              data?.total || 0
            ),
          }}
          onPageChange={() => {}}
          onRowsPerPageChange={() => {}}
          selectable={false}
          selectedRows={new Set()}
          onSelectionChange={() => {}}
        />
        {/* Modal de detalles */}
        <ServiceRequestDetailsModal
          open={!!selectedRequest}
          onClose={handleCloseDetails}
          request={selectedRequest}
        />
        {/* Modal de edición */}
        <Dialog
          open={!!editRequest}
          onClose={handleCloseEdit}
          maxWidth="md"
          fullWidth
        >
          <Box p={2}>
            <Typography variant="h6" mb={2}>
              Editar Solicitud
            </Typography>
            {editRequest && (
              <ClientServiceRequestForm
                // Aquí puedes pasar los datos iniciales y un onSuccess para cerrar el modal
                onCancel={handleCloseEdit}
                // onSuccess={() => { handleCloseEdit(); ...refetch? }}
                // initialData={editRequest} // Si tu formulario lo soporta
              />
            )}
          </Box>
        </Dialog>
      </Box>
    </Container>
  );
};

export default RequestMe;
