import api from "@/api";
import { MonthFormData } from "./form-create-month.types";

export const fetchMonthData = async (id: string) => {
  const res = await api.get(`/gastos-mes/expenses/${id}`);
  const data = res.data.data;
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
    ...data,
    mes: data.mes ? new Date(data.mes).toISOString().slice(0, 7) : "", // Formato YYYY-MM
    extras,
  };

  return formattedData;
};

export const transformFormData = (data: MonthFormData) => {
  const otros_campos = data.extras.reduce(
    (acc: Record<string, number>, item) => {
      if (item.field && item.value)
        acc[item.field.split(" ").join("_")] = Number(item.value);
      return acc;
    },
    {}
  );

  const payload: Omit<MonthFormData, "extras"> & {
    otros_campos: Record<string, number> | null;
  } = {
    ...data,
    // Asegurar que la fecha esté en formato YYYY-MM
    mes: data.mes ? data.mes.slice(0, 7) : "",
    otros_campos: Object.keys(otros_campos).length > 0 ? otros_campos : null,
  };

  if ("extras" in payload) {
    delete payload?.extras;
  }
  return payload;
};
