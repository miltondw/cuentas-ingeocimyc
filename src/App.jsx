import "./App.css";
import Forms from "./components/cuentas/forms/forms";
import ViewGastos from "./components/cuentas/viewGastos/tablas/view-gastos";
import Navigation from "./components/atoms/Navigation";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
function App() {
  return (
    <>
      <Router>
        <Navigation />
        <Routes>
          <Route path="/" index element={<Forms />} />
          <Route path="/:id" element={<Forms />} />
          <Route path="/view" element={<ViewGastos />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
