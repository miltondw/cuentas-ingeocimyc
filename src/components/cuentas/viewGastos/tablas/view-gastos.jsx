import { initialProjects } from "../../utils";
import Tabla2 from "./gastos-mes";
import GastosProject from "./gasto-project";
import { useEffect, useState } from "react";

const ViewGastos = () => {
  const [projects, setProyectos] = useState([]);

  useEffect(() => {
    const listProjects = () => {
      const formData = JSON.parse(localStorage.getItem("formData"));
      const data = formData && formData.length > 0 ? formData : initialProjects;
      return data.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    };
    setProyectos(listProjects());
  }, []);

  return (
    <>
      <GastosProject listProjects={projects} />
      <Tabla2 listProjects={projects} />
    </>
  );
};

export default ViewGastos;
