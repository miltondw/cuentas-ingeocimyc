import api from "@/api";
import { MonthFormData } from "./form-create-month.types";

export const fetchMonthData = async (id: string) => {
  const res = await api.get(`/gastos-mes/${id}`);
  const data = res.data;

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
    mes: data.mes ? new Date(data.mes).toISOString().split("T")[0] : "",
    extras,
  };

  return formattedData;
};

export const transformFormData = (data: MonthFormData) => {
  const otrosCampos = data.extras.reduce(
    (acc: Record<string, number>, item) => {
      if (item.field && item.value)
        acc[item.field.split(" ").join("_")] = Number(item.value);
      return acc;
    },
    {}
  );

  const payload: Omit<MonthFormData, "extras"> & {
    otrosCampos: Record<string, number> | null;
  } = {
    ...data,
    otrosCampos: Object.keys(otrosCampos).length > 0 ? otrosCampos : null,
  };

  if ("extras" in payload) {
    delete payload?.extras;
  }
  return payload;
};
