import * as yup from "yup";

export interface ExtraField {
  id: string; // Añadido por react-hook-form
  field: string;
  value: string;
}

export interface FormData {
  mes: string;
  salarios: number;
  luz: number;
  agua: number;
  arriendo: number;
  internet: number;
  salud: number;
  extras: ExtraField[];
}

export const validationSchema: yup.ObjectSchema<FormData> = yup.object({
  mes: yup.string().required("El mes es requerido"),
  salarios: yup.number().required("Salarios es requerido"),
  luz: yup.number().required("Luz es requerida"),
  agua: yup.number().required("Agua es requerida"),
  arriendo: yup.number().required("Arriendo es requerido"),
  internet: yup.number().required("Internet es requerido"),
  salud: yup.number().required("Salud es requerida"),
  extras: yup
    .array()
    .of(
      yup.object({
        id: yup.string().required(), // Añadido por react-hook-form
        field: yup.string().required("Nombre del gasto es requerido"),
        value: yup.string().required("Monto es requerido"),
      })
    )
    .default([]),
});

export const defaultValues: FormData = {
  mes: "",
  salarios: 1680000,
  luz: 29000,
  agua: 29000,
  arriendo: 540000,
  internet: 85000,
  salud: 480000,
  extras: [{ id: "0", field: "", value: "" }], // Inicializa con un campo vacío
};
