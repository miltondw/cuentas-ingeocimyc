export const services = [
  {
    id: 1,
    code: "SR", // Puedes agregar un código para la categoría si lo deseas
    category: "SUELOS DE RELLENOS",
    items: [
      {
        id: 1,
        code: "SR-1",
        name: "Contenido de humedad en suelos roca y mezclas",
      },
      {
        id: 2,
        code: "SR-2",
        name: "Tamaños de las partículas de los suelos (tamizado)",
      },
      { id: 3, code: "SR-3", name: "Límite líquido de los suelos" },
      {
        id: 4,
        code: "SR-4",
        name: "Límite plástico e índice de plasticidad de los suelos",
      },
      {
        id: 5,
        code: "SR-5",
        name: "Gravedad específica de las partículas sólidas de los sólidos",
      },
      {
        id: 6,
        code: "SR-6",
        name: "Ensayo modificado de compactación-peso unitario seco",
      },
      {
        id: 7,
        code: "SR-7",
        name: "Cbr de los suelos compactador en laboratorio (sumergido)",
      },
    ],
  },
  {
    id: 2,
    code: "SG", // Puedes agregar un código para la categoría si lo deseas
    category: "SUBBASE GRANULAR",
    items: [
      { id: 1, code: "SG-1", name: "Desgaste en maquina de los ángeles" },
      { id: 2, code: "SG-2", name: "Perdidas en solidez en sulfatos" },
      { id: 3, code: "SG-3", name: "Límite líquido" },
      { id: 4, code: "SG-4", name: "Límite de plasticidad" },
      { id: 5, code: "SG-5", name: "Equivalente de arena" },
      {
        id: 6,
        code: "SG-6",
        name: "Contenido de terrones de arcillas y partículas deleznables",
      },
      { id: 7, code: "SG-7", name: "Cbr sumergido" },
      { id: 8, code: "SG-8", name: "Granulometría" },
    ],
  },
  {
    id: 3,
    code: "BG", // Puedes agregar un código para la categoría si lo deseas
    category: "BASE GRANULAR",
    items: [
      { id: 1, code: "BG-1", name: "Desgaste en maquina de los ángeles" },
      { id: 2, code: "BG-2", name: "Perdidas en solidez en sulfatos" },
      { id: 3, code: "BG-3", name: "Límite líquido" },
      { id: 4, code: "BG-4", name: "Límite de plasticidad" },
      { id: 5, code: "BG-5", name: "Equivalente de arena" },
      {
        id: 6,
        code: "BG-6",
        name: "Contenido de terrones de arcillas y partículas deleznables",
      },
      { id: 7, code: "BG-7", name: "Cbr sumergido" },
      { id: 8, code: "BG-8", name: "Granulometría" },
      { id: 9, code: "BG-9", name: "Índice de alargamiento y aplanamiento" },
      { id: 10, code: "BG-10", name: "Caras fracturadas" },
    ],
  },
  {
    id: 4,
    code: "AP", // Puedes agregar un código para la categoría si lo deseas
    category: "AGREGADOS PÉTREOS (ARENA Y TRITURADO)",
    items: [
      {
        id: 1,
        code: "AP-1",
        name: "Terrones de arcilla y partículas deleznables en los agregados",
      },
      {
        id: 2,
        code: "AP-2",
        name: "Análisis granulométrico de los agregados gruesos y finos",
      },
      {
        id: 3,
        code: "AP-3",
        name: "Peso unitarios y porcentaje de vacíos de los agregados sueltos y compactos",
      },
      {
        id: 4,
        code: "AP-4",
        name: "Resistencia a la degradación de los agregados maquinas de los ángeles",
      },
      { id: 5, code: "AP-5", name: "Perdidas en solidez en sulfatos" },
      {
        id: 6,
        code: "AP-6",
        name: "Densidad, densidad relativa (gravedad específica) absorción del agregado fino",
      },
      {
        id: 7,
        code: "AP-7",
        name: "Densidad, densidad relativa (gravedad específica) absorción del agregado grueso",
      },
      {
        id: 8,
        code: "AP-8",
        name: "Porcentaje de partículas fracturadas en un agregado grueso",
      },
      {
        id: 9,
        code: "AP-9",
        name: "Índices de aplanamiento y alargamiento de los agregados para carreteras",
      },
    ],
  },
  {
    id: 5, // Puedes continuar la secuencia de IDs
    code: "EC", // Puedes agregar un código para la categoría si lo deseas
    category: "ENSAYOS DE CAMPO",
    items: [
      {
        id: 1,
        code: "EC-1",
        name: "Densidad y peso unitario del suelo en el terreno método cono de arena",
      },
      { id: 2, code: "EC-2", name: "CBR inalterado" },
      { id: 3, code: "EC-3", name: "Toma de muestras de concreto fresco" },
      {
        id: 4,
        code: "EC-4",
        name: "Toma de núcleo de concreto( Preguntar le por tipo de elemento )",
      },
    ],
  },
  {
    id: 6,
    code: "EMC",
    category: "ENSAYOS DE MUESTRAS DE CONCRETO EN LABORATORIO",
    items: [
      {
        id: 1,
        code: "EMC-1",
        name: "Ensayo de muestras de concreto",
        additionalInfo: [
          {
            field: "tipoMuestra",
            label: "Tipo de Muestra",
            type: "select",
            options: ["Vigas", "Cilindro"],
            question: "Seleccione el tipo de muestra",
            required: true,
          },
          {
            field: "tamanoCilindro",
            label: "Tamaño (pulgadas)",
            type: "select",
            options: ["4 pulgadas", "6 pulgadas"],
            question: "Seleccione el tamaño del cilindro",
            required: true,
            dependsOn: { field: "tipoMuestra", value: "Cilindro" },
          },
          {
            field: "estructuraRealizada",
            label: "Estructura Realizada",
            type: "text",
            question: "Ingrese la estructura realizada",
            required: true,
          },
          {
            field: "resistenciaDiseno",
            label: "Resistencia de Diseño",
            type: "text",
            question: "Ingrese la resistencia de diseño",
            required: true,
          },
          {
            field: "dosificacionEmpleada",
            label: "Dosificación Empleada",
            type: "text",
            question: "Ingrese la dosificación empleada",
            required: true,
          },
          {
            field: "identificacionMuestra",
            label: "Identificación de la Muestra",
            type: "text",
            question: "Ingrese la identificación de la muestra",
            required: true,
          },
          {
            field: "fechaFundida",
            label: "Fecha de Fundida",
            type: "date",
            question: "Seleccione la fecha de fundida",
            required: true,
          },
          {
            field: "edadEnsayo",
            label: "Edad a Ensayar (días)",
            type: "select",
            options: ["3", "7", "14", "28"],
            question: "Seleccione la edad a ensayar",
            required: true,
          },
        ],
      },
    ],
  },

  {
    id: 7, // Continuamos la secuencia de IDs
    code: "DMC", // Puedes agregar un código para la categoría si lo deseas
    category: "DISEÑOS DE MEZCLAS DE CONCRETO",
    items: [
      { id: 1, code: "DMC-1", name: "Resistencia requerida" },
      { id: 2, code: "DMC-2", name: "Tipo de cemento a emplear" },
      { id: 3, code: "DMC-3", name: "Tamaño del triturado" },
      { id: 4, code: "DMC-4", name: "Planta" },
    ],
  },
  {
    id: 8, // Continuamos la secuencia de IDs
    code: "EMA", // Puedes agregar un código para la categoría si lo deseas
    category: "ENSAYOS A MEZCLAS ASFÁLTICAS",
    items: [
      {
        id: 1,
        code: "EMA-1",
        name: "Estabilidad y flujo utilizando equipo de marshall",
      },
      {
        id: 2,
        code: "EMA-2",
        name: "Gravedad específica de las briquetas usando parafina",
      },
      {
        id: 3,
        code: "EMA-3",
        name: "Extracción cuantitativa del asfalto en mezclas para pavimento ( contenido de asfalto )",
      },
      {
        id: 4,
        code: "EMA-4",
        name: "Análisis granulométrico de los agregados extraídos de mezclas asfálticas",
      },
      {
        id: 5,
        code: "EMA-5",
        name: "Contenido de humedad de mezclas asfálticas en caliente por el método de secado en horno",
      },
      {
        id: 6,
        code: "EMA-6",
        name: "Resistencia de mezclas asfálticas en caliente empleado equipo marshall",
      },
    ],
  },
];
