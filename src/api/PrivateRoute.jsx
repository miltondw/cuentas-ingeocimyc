// PrivateRoute.jsx (Versión mejorada)
import { useEffect, useState } from 'react';
import { Navigate } from "react-router-dom";
import PropTypes from "prop-types";
import api from "./index.js";

const PrivateRoute = ({ children }) => {
  const [isValid, setIsValid] = useState(null);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        await api.get("/auth/verify"); // Endpoint nuevo en backend
        setIsValid(true);
      } catch (error) {
        setIsValid(false);
      }
    };
    
    verifyAuth();
  }, []);

  if (isValid === null) return <div>Cargando...</div>;
  return isValid ? children : <Navigate to="/login" />;
};
export default PrivateRoute