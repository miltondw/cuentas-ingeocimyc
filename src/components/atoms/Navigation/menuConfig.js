export const menuConfig = {
  menuItems: [
    {
      key: "create",
      label: "Crear",
      items: [
        { title: "Proyecto", link: "crear-proyecto" },
        { title: "Gasto del Mes", link: "crear-gasto-mes" },
      ],
      roles: ["admin"], // Solo visible para admin
    },
    {
      key: "tables",
      label: "Tablas",
      items: [
        { title: "Proyectos", link: "proyectos" },
        { title: "Gastos", link: "gastos" },
      ],
      adminItems: [{ title: "Utilidades", link: "utilidades" }],
      roles: ["admin"], // Solo visible para admin
    },
    {
      key: "profiles",
      label: "Laboratorio",
      items: [{ title: "Proyectos", link: "lab/proyectos" }],
      roles: ["admin", "usuario"], // Visible para admin y usuario
    },
  ],
};
