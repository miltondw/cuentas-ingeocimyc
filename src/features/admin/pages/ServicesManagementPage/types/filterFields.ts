import type { FilterField, Service } from "../types/types";

export const getFilterFields = (
  categories: { id: number; name: string }[],
  services: Service[]
): FilterField[] => [
  {
    key: "category",
    label: "Categoría",
    type: "select",
    options: [
      { value: "all", label: "Todas las categorías" },
      ...categories.map((cat) => ({
        value: cat.id.toString(),
        label: cat.name,
        count: services.filter((s) => s.categoryId === cat.id).length,
      })),
    ],
  },
  {
    key: "hasAdditionalFields",
    label: "Campos Adicionales",
    type: "select",
    options: [
      { value: "all", label: "Todos" },
      { value: "with", label: "Con campos adicionales" },
      { value: "without", label: "Sin campos adicionales" },
    ],
  },
  {
    key: "createdDateRange",
    label: "Fecha de Creación",
    type: "select",
    options: [
      { value: "all", label: "Todas las fechas" },
      { value: "today", label: "Hoy" },
      { value: "week", label: "Última semana" },
      { value: "month", label: "Último mes" },
      { value: "year", label: "Último año" },
    ],
  },
];
