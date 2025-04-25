import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { useServiceRequest } from "../ServiceRequestContext";

interface FieldLabels {
  [key: string]: string;
}

interface AdditionalFieldLabels {
  [key: string]: string;
}

const ServiceReview: React.FC = () => {
  const { state } = useServiceRequest();
  const navigate = useNavigate();

  const { formData, selectedServices } = state;

  const fieldLabels: FieldLabels = {
    name: "Solicitante",
    nameProject: "Nombre del proyecto",
    location: "Ubicación",
    identification: "Identificación",
    phone: "Teléfono",
    email: "Correo electrónico",
    description: "Descripción del servicio",
  };

  const additionalFieldLabels: AdditionalFieldLabels = {
    tipoMuestra: "Tipo de muestra",
    tamanoCilindro: "Tamaño del cilindro",
    estructuraRealizada: "Estructura realizada",
    resistenciaDiseno: "Resistencia de diseño",
    dosificacionEmpleada: "Dosificación empleada",
    identificacionMuestra: "Identificación de la muestra",
    fechaFundida: "Fecha de fundición",
    edadEnsayo: "Edad del ensayo",
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Revisar Solicitud de Servicio
      </Typography>

      <Typography variant="h6" gutterBottom>
        Información del Cliente
      </Typography>
      <TableContainer component={Paper}>
        <Table aria-label="Información del cliente">
          <TableHead>
            <TableRow>
              <TableCell>Campo</TableCell>
              <TableCell>Valor</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.entries(formData).map(([field, value]) => (
              <TableRow key={field}>
                <TableCell>{fieldLabels[field] || field}</TableCell>
                <TableCell>{value}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Servicios Seleccionados
      </Typography>
      <TableContainer component={Paper}>
        <Table aria-label="Servicios seleccionados">
          <TableHead>
            <TableRow>
              <TableCell>Código</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Cantidad</TableCell>
              <TableCell>Información Adicional</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {selectedServices.map((service, index) => (
              <TableRow key={index}>
                <TableCell>{service.item.code}</TableCell>
                <TableCell>{service.item.name}</TableCell>
                <TableCell>{service.quantity}</TableCell>
                <TableCell>
                  {service.additionalInfo ? (
                    <List dense>
                      {Object.entries(service.additionalInfo).map(
                        ([field, value]) => (
                          <ListItem key={field} sx={{ pl: 4 }}>
                            <ListItemText
                              primary={additionalFieldLabels[field] || field}
                              secondary={String(value || "No especificado")}
                            />
                          </ListItem>
                        )
                      )}
                    </List>
                  ) : (
                    "-"
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Button
        variant="outlined"
        onClick={() => navigate("/cliente", { state: { step: 1 } })}
        sx={{ mt: 4 }}
      >
        Modificar Servicios
      </Button>
    </Box>
  );
};

export default ServiceReview;
