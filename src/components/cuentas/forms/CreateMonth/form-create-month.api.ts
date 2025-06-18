import api from "@/api";
import { MonthFormData } from "./form-create-month.types";

export const fetchMonthData = async (id: string) => {
  const res = await api.get(`/gastos-mes/expenses/${id}`);
  const data = res.data;

  // La API retorna otrosCampos como objeto
  const extras = data.otrosCampos
    ? Object.entries(data.otrosCampos).map(([field, value]) => ({
        id: field,
        field,
        value:
          typeof value === "string" || typeof value === "number"
            ? value.toString()
            : "",
      }))
    : [];
  const formattedData: MonthFormData = {
    mes: data.mes ? new Date(data.mes).toISOString().slice(0, 7) : "", // Formato YYYY-MM
    salarios: data.salarios,
    luz: data.luz,
    agua: data.agua,
    arriendo: data.arriendo,
    internet: data.internet,
    salud: data.salud,
    extras, // Solo incluir lo que necesitamos
  };

  return formattedData;
};

export const transformFormData = (data: MonthFormData) => {
  // Convertir array de extras a objeto otros_campos para envío
  const otros_campos = data.extras.reduce(
    (acc: Record<string, number>, item: { field: string; value: string }) => {
      if (item.field && item.value)
        acc[item.field.split(" ").join("_")] = Number(item.value);
      return acc;
    },
    {}
  );

  // Crear payload SOLO con los campos requeridos por la API
  const payload = {
    mes: data.mes ? data.mes.slice(0, 7) : "", // Asegurar formato YYYY-MM
    salarios: data.salarios,
    luz: data.luz,
    agua: data.agua,
    arriendo: data.arriendo,
    internet: data.internet,
    salud: data.salud,
    // IMPORTANTE: usar otros_campos (con guión bajo), NO otrosCampos
    ...(Object.keys(otros_campos).length > 0 && { otros_campos }),
  };

  console.info("Payload final siendo enviado:", payload); // Debug temporal
  return payload;
};
