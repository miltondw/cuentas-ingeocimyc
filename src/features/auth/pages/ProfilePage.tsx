import { useState, useEffect } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  Box,
  Typography,
  Paper,
  Avatar,
  TextField,
  Button,
  Grid,
  Divider,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Chip,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import DevicesIcon from "@mui/icons-material/Devices";
import DeleteIcon from "@mui/icons-material/Delete";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { authService } from "@/features/auth/services/authService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { SessionInfo } from "@/types/api";

/**
 * Página de perfil de usuario
 * Muestra datos del usuario y permite actualizar información básica
 */
const ProfilePage = () => {
  const { user, updateUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<{
    firstName: string;
    lastName: string;
    email: string;
  }>({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
  });
  const queryClient = useQueryClient();

  // Cargar sesiones activas
  const { data: sessionsData, isLoading: isLoadingSessions } = useQuery({
    queryKey: ["user-sessions"],
    queryFn: async () => {
      const response = await authService.getSessions();
      return response.data.sessions;
    },
    enabled: !!user, // Solo ejecutar si hay un usuario autenticado
  });

  // Mutación para revocar sesión
  const revokeSessionMutation = useMutation({
    mutationFn: (sessionId: string) => authService.revokeSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-sessions"] });
      setSuccessMessage("Sesión revocada correctamente");
    },
    onError: () => {
      setErrorMessage("Error al revocar la sesión");
    },
  });

  // Actualizar datos iniciales cuando cambia el usuario
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email,
      });
    }
  }, [user]);

  // Manejar actualización de perfil
  const handleUpdateProfile = async () => {
    if (!user) return;

    try {
      const result = await updateUserProfile({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
      });

      if (result.success) {
        setSuccessMessage("Perfil actualizado correctamente");
        setIsEditing(false);
      } else {
        setErrorMessage(result.error || "Error al actualizar el perfil");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setErrorMessage("Error inesperado al actualizar el perfil");
    }
  };

  // Manejar cambios en el formulario
  const handleChange = (field: keyof typeof profileData, value: string) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Manejar revocación de sesión
  const handleRevokeSession = (sessionId: string) => {
    revokeSessionMutation.mutate(sessionId);
  };

  if (!user) {
    return (
      <Box sx={{ textAlign: "center", mt: 4 }}>
        <Typography variant="body1">
          Debe iniciar sesión para ver esta página.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Perfil de Usuario
      </Typography>

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <Avatar
            sx={{ width: 80, height: 80, bgcolor: "primary.main", mr: 2 }}
          >
            {user.firstName?.[0] || user.email[0].toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h5">
              {user.firstName} {user.lastName}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {user.email}
            </Typography>
            <Chip
              label={
                user.role === "admin"
                  ? "Administrador"
                  : user.role === "lab"
                  ? "Laboratorio"
                  : "Cliente"
              }
              color={
                user.role === "admin"
                  ? "error"
                  : user.role === "lab"
                  ? "primary"
                  : "success"
              }
              size="small"
              sx={{ mt: 1 }}
            />
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {isEditing ? (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nombre"
                value={profileData.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Apellido"
                value={profileData.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                value={profileData.email}
                disabled
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                <Button variant="outlined" onClick={() => setIsEditing(false)}>
                  Cancelar
                </Button>
                <Button variant="contained" onClick={handleUpdateProfile}>
                  Guardar cambios
                </Button>
              </Box>
            </Grid>
          </Grid>
        ) : (
          <Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <PersonIcon sx={{ mr: 1, color: "text.secondary" }} />
                  <Typography variant="body2" color="text.secondary">
                    Nombre completo
                  </Typography>
                </Box>
                <Typography variant="body1">
                  {user.firstName} {user.lastName || ""}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <EmailIcon sx={{ mr: 1, color: "text.secondary" }} />
                  <Typography variant="body2" color="text.secondary">
                    Email
                  </Typography>
                </Box>
                <Typography variant="body1">{user.email}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <CalendarTodayIcon sx={{ mr: 1, color: "text.secondary" }} />
                  <Typography variant="body2" color="text.secondary">
                    Último acceso
                  </Typography>
                </Box>
                <Typography variant="body1">
                  {user.lastLogin
                    ? new Date(user.lastLogin).toLocaleString()
                    : "No disponible"}
                </Typography>
              </Grid>
            </Grid>
            <Box sx={{ mt: 3, textAlign: "right" }}>
              <Button variant="outlined" onClick={() => setIsEditing(true)}>
                Editar perfil
              </Button>
            </Box>
          </Box>
        )}
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Sesiones activas
        </Typography>

        {isLoadingSessions ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <List>
            {sessionsData?.map((session: SessionInfo) => (
              <ListItem
                key={session.id}
                sx={{
                  bgcolor: session.isCurrentSession
                    ? "action.hover"
                    : "inherit",
                  borderRadius: 1,
                  mb: 1,
                }}
              >
                <ListItemIcon>
                  <DevicesIcon />
                </ListItemIcon>
                <ListItemText
                  primary={`${session.deviceInfo.deviceName} (${session.deviceInfo.browser} en ${session.deviceInfo.os})`}
                  secondary={`Última actividad: ${new Date(
                    session.lastUsedAt
                  ).toLocaleString()}`}
                />
                <ListItemSecondaryAction>
                  {session.isCurrentSession ? (
                    <Chip label="Sesión actual" color="primary" size="small" />
                  ) : (
                    <IconButton
                      edge="end"
                      onClick={() => handleRevokeSession(session.id)}
                      disabled={revokeSessionMutation.isPending}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
};

export default ProfilePage;
