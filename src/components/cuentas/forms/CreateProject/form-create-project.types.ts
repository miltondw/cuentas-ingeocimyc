import * as yup from "yup";

export interface ExtraGasto {
  id: string;
  field: string;
  value: string;
}

export interface GastoFields {
  camioneta: number;
  campo: number;
  obreros: number;
  comidas: number;
  otros: number;
  peajes: number;
  combustible: number;
  hospedaje: number;
  extras: ExtraGasto[];
}

export interface ProjectFormData {
  fecha: string;
  solicitante: string;
  nombre_proyecto: string;
  obrero: string;
  costo_servicio: number;
  abono: number;
  factura: string;
  metodo_de_pago: string;
  valor_retencion: number;
  retencionIva: boolean;
  gastos: GastoFields;
}

export const validationSchema: yup.ObjectSchema<ProjectFormData> = yup.object({
  fecha: yup.string().required("La fecha es requerida"),
  solicitante: yup.string().required("El solicitante es requerido"),
  nombre_proyecto: yup.string().required("El nombre del proyecto es requerido"),
  obrero: yup.string().required("El obrero es requerido"),
  costo_servicio: yup
    .number()
    .required("El costo del servicio es requerido")
    .typeError("El costo del servicio debe ser un número"),
  abono: yup
    .number()
    .required("El abono es requerido")
    .typeError("El abono debe ser un número"),
  factura: yup.string().when("retencionIva", {
    is: true,
    then: () => yup.string().required("La factura es requerida"),
    otherwise: () => yup.string().notRequired(),
  }),
  metodo_de_pago: yup.string().required("El método de pago es requerido"),
  valor_retencion: yup.number().when("retencionIva", {
    is: true,
    then: () =>
      yup
        .number()
        .required("El valor de retención es requerido")
        .typeError("El valor de retención debe ser un número"),
    otherwise: () => yup.number().notRequired(),
  }),
  retencionIva: yup.boolean().required("La retención de IVA es requerida"),
  gastos: yup.object({
    camioneta: yup
      .number()
      .required("El gasto de camioneta es requerido")
      .typeError("Camioneta debe ser un número"),
    campo: yup
      .number()
      .required("El gasto de campo es requerido")
      .typeError("Campo debe ser un número"),
    obreros: yup
      .number()
      .required("El gasto de obreros es requerido")
      .typeError("Obreros debe ser un número"),
    comidas: yup
      .number()
      .required("El gasto de comidas es requerido")
      .typeError("Comidas debe ser un número"),
    otros: yup
      .number()
      .required("Otros gastos es requerido")
      .typeError("Otros debe ser un número"),
    peajes: yup
      .number()
      .required("El gasto de peajes es requerido")
      .typeError("Peajes debe ser un número"),
    combustible: yup
      .number()
      .required("El gasto de combustible es requerido")
      .typeError("Combustible debe ser un número"),
    hospedaje: yup
      .number()
      .required("El gasto de hospedaje es requerido")
      .typeError("Hospedaje debe ser un número"),
    extras: yup.array().of(
      yup.object({
        id: yup.string().required(),
        field: yup.string().required("El nombre del gasto es requerido"),
        value: yup
          .string()
          .required("El valor del gasto es requerido")
          .typeError("El valor debe ser un número"),
      })
    ),
  }),
});

export const defaultValues: ProjectFormData = {
  fecha: "",
  solicitante: "",
  nombre_proyecto: "",
  obrero: "",
  costo_servicio: 0,
  abono: 0,
  factura: "",
  metodo_de_pago: "",
  valor_retencion: 0,
  retencionIva: false,
  gastos: {
    camioneta: 0,
    campo: 0,
    obreros: 0,
    comidas: 0,
    otros: 0,
    peajes: 0,
    combustible: 0,
    hospedaje: 0,
    extras: [{ id: "0", field: "", value: "" }],
  },
};
