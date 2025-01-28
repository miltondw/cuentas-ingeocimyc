const initialProjects = [
  {
    id: 1,
    fecha: "2023-05-15",
    solicitante: "Empresa ABC",
    nombreProyecto: "Proyecto de Construcción",
    obrero: "Juan Pérez",
    costoServicio: 100,
    abono: 10,
    gastoCamioneta: 1,
    gastosCampo: 2,
    pagoObreros: 5,
    comidas: 7,
    transporte: 3,
    gastosVarios: 5,
    peajes: 1.5,
    combustible: 4,
    hospedaje: 6,
  },
  {
    id: 2,
    fecha: "2023-05-15",
    solicitante: "Empresa jkl",
    nombreProyecto: "Proyecto de Construcción",
    obrero: "milton Pérez",
    costoServicio: 100,
    abono: 100,
    gastoCamioneta: 15,
    gastosCampo: 2,
    pagoObreros: 5,
    comidas: 8,
    transporte: 3,
    gastosVarios: 5,
    peajes: 1.5,
    combustible: 4,
    hospedaje: 6,
  },
  {
    id: 3,
    fecha: "2023-01-10",
    solicitante: "Empresa zxc",
    nombreProyecto: "Proyecto de Construcción",
    obrero: "eiders Pérez",
    costoServicio: 100,
    abono: 0,
    gastoCamioneta: 15,
    gastosCampo: 2,
    pagoObreros: 5,
    comidas: 8,
    transporte: 3,
    gastosVarios: 5,
    peajes: 1.5,
    combustible: 4,
    hospedaje: 6,
  },
];

const calculateTotalGastos = (project) => {
  return (
    (project.gastoCamioneta || 0) +
    (project.gastosCampo || 0) +
    (project.pagoObreros || 0) +
    (project.comidas || 0) +
    (project.transporte || 0) +
    (project.gastosVarios || 0) +
    (project.peajes || 0) +
    (project.combustible || 0) +
    (project.hospedaje || 0)
  );
};

const calculateSaldo = (project) => {
  return (project.costoServicio || 0) - (project.abono || 0);
};

const calculateUtilidadNeta = (project) => {
  return (project.costoServicio || 0) - calculateTotalGastos(project);
};

const getEstadoCuenta = (project) => {
  const saldo = calculateSaldo(project);
  if (saldo < 0 || saldo === project.costoServicio)
    return "Pendiente por Pagar";
  if (saldo > 0) return "Abonado";
  return "Pagado";
};

const formatNumber = (value) => {
  if (!value) return "";
  const stringValue = value.toString();
  const reversedString = stringValue.split("").reverse().join("");
  const formattedReversed = reversedString.replace(
    /\d{3}(?=\d)/g,
    (match) => match + "."
  );
  const formattedString = formattedReversed.split("").reverse().join("");
  return formattedString;
};

const isNumeric = (value) => {
  return !isNaN(parseFloat(value)) && isFinite(value);
};
const colorEstadoCuenta = (estadoCuenta) => {
  switch (estadoCuenta) {
    case "Pendiente por Pagar":
      return "#FF0000";
    case "Abonado":
      return "#FFA500";
    case "Pagado":
      return "#008000";
    default:
      return "#000000";
  }
};
const filteredProjects = (projects, search) =>
  projects.filter((project) => {
    const { solicitante, proyecto, fechaInicio, fechaFin } = search;
    const matchesSolicitante = solicitante
      ? project.solicitante.toLowerCase().includes(solicitante.toLowerCase())
      : true;
    const matchesProyecto = proyecto
      ? project.nombreProyecto.toLowerCase().includes(proyecto.toLowerCase())
      : true;
    const matchesFechaInicio = fechaInicio
      ? new Date(project.fecha) >= new Date(fechaInicio)
      : true;
    const matchesFechaFin = fechaFin
      ? new Date(project.fecha) <= new Date(fechaFin)
      : true;
    return (
      matchesSolicitante &&
      matchesProyecto &&
      matchesFechaInicio &&
      matchesFechaFin
    );
  });

const tableRowInputs = [
  "Total Gastos",
  "Saldo",
  "Estado Cuenta",
  "Utilidad Neta",
  "Fecha",
  "Solicitante",
  "Nombre Proyecto",
  "Obrero De Campo",
  "Costo Del Proyecto",
  "Abono",
  "Gasto De Camioneta",
  "Gastos En Campo",
  "Pago De Obreros",
  "Gasto En Comidas",
  "Gasto En Transporte",
  "Gastos Varios",
  "Gasto En Peajes",
  "Gasto de Combustible",
  "Gasto en Hospedaje",
];

const tableTextField = [
  "fecha",
  "solicitante",
  "nombreProyecto",
  "obrero",
  "costoServicio",
  "abono",
  "gastoCamioneta",
  "gastosCampo",
  "pagoObreros",
  "comidas",
  "transporte",
  "gastosVarios",
  "peajes",
  "combustible",
  "hospedaje",
];

export {
  initialProjects,
  calculateTotalGastos,
  calculateSaldo,
  calculateUtilidadNeta,
  getEstadoCuenta,
  formatNumber,
  isNumeric,
  colorEstadoCuenta,
  filteredProjects,
  tableRowInputs,
  tableTextField,
};
