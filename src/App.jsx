import "./App.css";
import Navigation from "./components/atoms/Navigation";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./api/Login";
import GastosProject from "./components/cuentas/tablas/gasto-project";
import TablaGastosEmpresa from "./components/cuentas/tablas/gasto-mes";
import FormCreateMonth from "./components/cuentas/forms/form-create-month";
import FormCreateProject from "./components/cuentas/forms/form-create-project";
import TablaUtilidades from "./components/cuentas/tablas/TablaUtilidades";

function App() {
  return (
    <Router>
      <Navigation />
      <Routes>
        <Route path="/login" element={<Login />} />
        {/* Rutas para creación y actualización de proyectos */}
        <Route path="/crear-proyecto" element={<FormCreateProject />} />
        <Route path="/crear-proyecto/:id" element={<FormCreateProject />} />
        {/* Rutas para creación y actualización de gastos mensuales */}
        <Route path="/crear-gasto-mes" element={<FormCreateMonth />} />
        <Route path="/crear-gasto-mes/:id" element={<FormCreateMonth />} />
        {/* Rutas para visualización de Tablas */}
        <Route path="/proyectos" element={<GastosProject />} />
        <Route path="/gastos" element={<TablaGastosEmpresa />} />
        <Route path="/utilidades" element={<TablaUtilidades />} />
      </Routes>
    </Router>
  );
}

export default App;
