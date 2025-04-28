import api from "@api";
import { FormData } from "./form-create-month.types";

export const fetchMonthData = async (id: string) => {
  const res = await api.get(`/gastos-mes/${id}`);
  const data = res.data;

  const extras = data.otros_campos
    ? Object.entries(data.otros_campos).map(([field, value]) => ({
        id: field,
        field,
        value:
          typeof value === "string" || typeof value === "number"
            ? value.toString()
            : "",
      }))
    : [];

  const formattedData: FormData = {
    ...data,
    mes: data.mes ? new Date(data.mes).toISOString().split("T")[0] : "",
    extras,
  };

  return formattedData;
};

export const transformFormData = (data: FormData) => {
  const otrosCampos = data.extras.reduce((acc: any, item) => {
    if (item.field && item.value)
      acc[item.field.split(" ").join("_")] = Number(item.value);
    return acc;
  }, {});

  const payload: Partial<FormData> = {
    ...data,
    otros_campos: Object.keys(otrosCampos).length > 0 ? otrosCampos : null,
  };

  if ("extras" in payload) {
    delete payload?.extras;
  }
  return payload;
};
