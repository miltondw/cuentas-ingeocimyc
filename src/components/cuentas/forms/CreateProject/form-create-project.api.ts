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
      gastoFromApi.otrosCampos &&
      Object.entries(gastoFromApi.otrosCampos).map(([key, value]) => ({
        id: key,
        field: key,
        value: Number(value), // Aseguramos que value sea un número
      }));

    const formattedData: ProjectFormData = {
      ...data,
      fecha: data.fecha ? new Date(data.fecha).toISOString().split("T")[0] : "",
      retencionIva: Boolean(data.valorRetencion),
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
    costoServicio: Number(data.costoServicio),
    abono: Number(data.abono),
    valorRetencion: data.retencionIva ? Number(data.valorRetencion) : 0,
  };

  // Crear el objeto final sin los campos innecesarios
  return {
    fecha: basePayload.fecha,
    solicitante: basePayload.solicitante,
    nombreProyecto: basePayload.nombreProyecto,
    obrero: basePayload.obrero,
    costoServicio: basePayload.costoServicio,
    abono: basePayload.abono,
    factura: basePayload.factura,
    metodoDePago: basePayload.metodoDePago,
    valorRetencion: basePayload.valorRetencion,
    gastos: {
      camioneta: data.gastos.camioneta,
      campo: data.gastos.campo,
      obreros: data.gastos.obreros,
      comidas: data.gastos.comidas,
      otros: data.gastos.otros,
      peajes: data.gastos.peajes,
      combustible: data.gastos.combustible,
      hospedaje: data.gastos.hospedaje,
      otrosCampos: Object.keys(otrosCampos).length > 0 ? otrosCampos : null,
    },
  };
};
