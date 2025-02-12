import "./App.css";
import Forms from "./components/cuentas/forms/forms";
import Navigation from "./components/atoms/Navigation";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./api/Login";
import GastosProject from "./components/cuentas/viewGastos/tablas/gasto-project";
function App() {
  return (
    <>
      <Router>
        <Navigation />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/crear-proyecto" index element={<Forms />} />
          <Route path="/crear-proyecto/:id" element={<Forms />} />
          <Route path="/proyectos" element={<GastosProject />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
