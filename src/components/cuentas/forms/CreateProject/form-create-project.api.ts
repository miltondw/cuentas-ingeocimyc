import api from "@api";
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
  const otrosCampos = data.gastos.extras.reduce((acc: any, item) => {
    if (item.field && item.value !== undefined) {
      acc[item.field.split(" ").join("_")] = Number(item.value);
    }
    return acc;
  }, {});

  const payload = {
    ...data,
    costo_servicio: Number(data.costo_servicio),
    abono: Number(data.abono),
    valor_retencion: data.retencionIva ? Number(data.valor_retencion) : 0,
    gastos: {
      ...data.gastos,
      otros_campos: Object.keys(otrosCampos).length > 0 ? otrosCampos : null,
    },
  };

  delete payload.gastos.extras;
  delete payload.retencionIva;

  return payload;
};
