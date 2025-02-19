import "./App.css";
import Navigation from "./components/atoms/Navigation";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./api/Login";
import GastosProject from "./components/cuentas/tablas/gasto-project";
import TablaGastosEmpresa from "./components/cuentas/tablas/gasto-mes";
import FormCreateMonth from "./components/cuentas/forms/form-create-month";
import FormCreateProject from "./components/cuentas/forms/form-create-project";
import TablaUtilidades from "./components/cuentas/tablas/TablaUtilidades";
import PrivateRoute from "./api/PrivateRoute";

function App() {
  return (
    <Router>
      <Navigation />
      <Routes>
        <Route path="/login" element={<Login />} />
        {/* Rutas para creación y actualización de proyectos */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <FormCreateProject />
            </PrivateRoute>
          }
        />
        <Route
          path="/crear-proyecto"
          element={
            <PrivateRoute>
              <FormCreateProject />
            </PrivateRoute>
          }
        />
        <Route
          path="/crear-proyecto/:id"
          element={
            <PrivateRoute>
              <FormCreateProject />
            </PrivateRoute>
          }
        />
        {/* Rutas para creación y actualización de gastos mensuales */}
        <Route
          path="/crear-gasto-mes"
          element={
            <PrivateRoute>
              <FormCreateMonth />
            </PrivateRoute>
          }
        />
        <Route
          path="/crear-gasto-mes/:id"
          element={
            <PrivateRoute>
              <FormCreateMonth />
            </PrivateRoute>
          }
        />
        {/* Rutas para visualización de Tablas */}
        <Route
          path="/proyectos"
          element={
            <PrivateRoute>
              <GastosProject />
            </PrivateRoute>
          }
        />
        <Route
          path="/gastos"
          element={
            <PrivateRoute>
              <TablaGastosEmpresa />
            </PrivateRoute>
          }
        />
        <Route
          path="/utilidades"
          element={
            <PrivateRoute>
              <TablaUtilidades />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
