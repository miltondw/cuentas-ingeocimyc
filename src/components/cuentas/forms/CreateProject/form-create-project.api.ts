import api from "@/api";
import { ProjectFormData } from "./form-create-project.types";

export const fetchProjectData = async (id: string) => {
  const res = await api.get(`/projects/${id}`);
  if (res.data.success) {
    const data = res.data.proyecto;
    const gastoFromApi = data.gastos || {
      camioneta: 0,
      campo: 0,
      obreros: 0,
      comidas: 0,
      otros: 0,
      peajes: 0,
      combustible: 0,
      hospedaje: 0,
      extras: [],
    };
    const extras =
      gastoFromApi.otros_campos &&
      Object.entries(gastoFromApi.otros_campos).map(([key, value]) => ({
        id: key,
        field: key,
        value: Number(value), // Aseguramos que value sea un número
      }));

    const formattedData: ProjectFormData = {
      ...data,
      fecha: data.fecha ? new Date(data.fecha).toISOString().split("T")[0] : "",
      retencionIva: Boolean(data.valor_retencion),
      gastos: {
        ...gastoFromApi,
        extras: extras || [],
      },
    };
    return formattedData;
  } else {
    throw new Error(res.data.message || "Error al cargar el proyecto");
  }
};

export const transformProjectData = (data: ProjectFormData) => {
  const otrosCampos = (data.gastos.extras || []).reduce(
    (acc: Record<string, number>, item) => {
      if (item.field && item.value !== undefined) {
        acc[item.field.split(" ").join("_")] = Number(item.value);
      }
      return acc;
    },
    {}
  );
  const basePayload = {
    ...data,
    costo_servicio: Number(data.costo_servicio),
    abono: Number(data.abono),
    valor_retencion: data.retencionIva ? Number(data.valor_retencion) : 0,
  };

  // Crear el objeto final sin los campos innecesarios
  return {
    fecha: basePayload.fecha,
    solicitante: basePayload.solicitante,
    nombre_proyecto: basePayload.nombre_proyecto,
    obrero: basePayload.obrero,
    costo_servicio: basePayload.costo_servicio,
    abono: basePayload.abono,
    factura: basePayload.factura,
    metodo_de_pago: basePayload.metodo_de_pago,
    valor_retencion: basePayload.valor_retencion,
    gastos: {
      camioneta: data.gastos.camioneta,
      campo: data.gastos.campo,
      obreros: data.gastos.obreros,
      comidas: data.gastos.comidas,
      otros: data.gastos.otros,
      peajes: data.gastos.peajes,
      combustible: data.gastos.combustible,
      hospedaje: data.gastos.hospedaje,
      otros_campos: Object.keys(otrosCampos).length > 0 ? otrosCampos : null,
    },
  };
};
