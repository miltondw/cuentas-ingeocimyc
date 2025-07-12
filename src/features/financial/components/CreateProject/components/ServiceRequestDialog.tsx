import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  TextField,
  InputAdornment,
  CircularProgress,
  Divider,
  Box,
} from "@mui/material";
import {
  Search as SearchIcon,
  Launch as LaunchIcon,
} from "@mui/icons-material";
import type { ServiceRequest } from "@/types/serviceRequests";

interface ServiceRequestDialogProps {
  open: boolean;
  onClose: () => void;
  loading: boolean;
  serviceRequests: Array<ServiceRequest>;
  onSelectRequest: (id: number) => void;
}

/**
 * Componente modal para seleccionar una solicitud de servicio
 */
export const ServiceRequestDialog: React.FC<ServiceRequestDialogProps> = ({
  open,
  onClose,
  loading,
  serviceRequests,
  onSelectRequest,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Filtrar las solicitudes basado en el término de búsqueda
  const filteredRequests = serviceRequests.filter(
    (req) =>
      (req.nameProject || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (req.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (req.identification || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Seleccionar Solicitud de Servicio</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          placeholder="Buscar por nombre del proyecto, cliente o identificación"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          margin="normal"
          variant="outlined"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              padding: 2.5,
            }}
          >
            <CircularProgress />
          </Box>
        ) : serviceRequests.length === 0 ? (
          <Typography variant="body2" align="center" sx={{ py: 2 }}>
            No hay solicitudes de servicio disponibles
          </Typography>
        ) : filteredRequests.length === 0 ? (
          <Typography variant="body2" align="center" sx={{ py: 2 }}>
            No se encontraron resultados para la búsqueda
          </Typography>
        ) : (
          <List>
            {filteredRequests.map((request) => (
              <React.Fragment key={request.id}>
                <ListItem>
                  <ListItemText
                    primary={request.nameProject}
                    secondary={
                      <>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.primary"
                        >
                          {request.name}
                        </Typography>
                        {" — "}
                        {request.identification}
                        <br />
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.secondary"
                        >
                          {`${
                            request.selectedServices?.length || 0
                          } servicios • ${new Date(
                            request.created_at
                          ).toLocaleDateString()}`}
                        </Typography>
                      </>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => onSelectRequest(request.id)}
                    >
                      <LaunchIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
      </DialogActions>
    </Dialog>
  );
};
