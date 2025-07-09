import {
  EstadoOption,
  BooleanFilterOption,
  NumericFilterField,
} from "./ProjectsDashboard.types";

export const ESTADO_OPTIONS: EstadoOption[] = [
  { value: "todos", label: "Todos" },
  { value: "activo", label: "Activo" },
  { value: "completado", label: "Completado" },
  { value: "pausado", label: "Pausado" },
  { value: "cancelado", label: "Cancelado" },
];

export const BOOLEAN_FILTER_OPTIONS: BooleanFilterOption[] = [
  { value: "", label: "Todos" },
  { value: "true", label: "Con" },
  { value: "false", label: "Sin" },
];

export const NUMERIC_FILTER_FIELDS: NumericFilterField[] = [
  { key: "minApiques", label: "Mín. Apiques" },
  { key: "maxApiques", label: "Máx. Apiques" },
  { key: "minProfiles", label: "Mín. Perfiles" },
  { key: "maxProfiles", label: "Máx. Perfiles" },
];
