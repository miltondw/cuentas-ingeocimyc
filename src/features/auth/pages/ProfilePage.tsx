import { useState, useEffect } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  Box,
  Typography,
  Paper,
  Avatar,
  TextField,
  Button,
  Grid2,
  Divider,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Chip,
} from "@mui/material";
import { useNotifications } from "@/hooks/useNotifications";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import DevicesIcon from "@mui/icons-material/Devices";
import DeleteIcon from "@mui/icons-material/Delete";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { authService } from "@/features/auth/services/authService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { UserSession } from "@/types/auth";

/**
 * Página de perfil de usuario
 * Muestra datos del usuario y permite actualizar información básica
 */
const ProfilePage = () => {
  const { user, updateUserProfile } = useAuth();
  const { showSuccess, showError } = useNotifications();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<{
    name: string;
    email: string;
  }>({
    name: user?.name || "",
    email: user?.email || "",
  });
  const queryClient = useQueryClient();

  // Cargar sesiones activas
  const { data: sessionsData, isLoading: isLoadingSessions } = useQuery({
    queryKey: ["user-sessions"],
    queryFn: async () => {
      const response = await authService.getSessions();
      return response.data.data;
    },
    enabled: !!user, // Solo ejecutar si hay un usuario autenticado
  });
  // Mutación para revocar sesión
  const revokeSessionMutation = useMutation({
    mutationFn: (sessionId: string) => authService.revokeSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-sessions"] });
      showSuccess("Sesión revocada correctamente");
    },
    onError: () => {
      showError("Error al revocar la sesión");
    },
  });

  // Actualizar datos iniciales cuando cambia el usuario
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        email: user.email,
      });
    }
  }, [user]);
  // Manejar actualización de perfil
  const handleUpdateProfile = async () => {
    if (!user) return;

    try {
      const result = await updateUserProfile({
        name: profileData.name,
      });

      if (result.success) {
        showSuccess("Perfil actualizado correctamente");
        setIsEditing(false);
      } else {
        showError(result.error || "Error al actualizar el perfil");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      showError("Error inesperado al actualizar el perfil");
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
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <Avatar
            sx={{ width: 80, height: 80, bgcolor: "primary.main", mr: 2 }}
          >
            {user.name?.[0] || user.email[0].toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h5">{user.name}</Typography>
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
          <Grid2 container spacing={2}>
            <Grid2 size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Nombre completo"
                value={profileData.name}
                onChange={(e) => handleChange("name", e.target.value)}
              />
            </Grid2>
            <Grid2 size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Email"
                value={profileData.email}
                disabled
              />
            </Grid2>
            <Grid2 size={{ xs: 12 }}>
              <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                <Button variant="outlined" onClick={() => setIsEditing(false)}>
                  Cancelar
                </Button>
                <Button variant="contained" onClick={handleUpdateProfile}>
                  Guardar cambios
                </Button>
              </Box>
            </Grid2>
          </Grid2>
        ) : (
          <Box>
            <Grid2 container spacing={2}>
              <Grid2 size={{ xs: 12 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <PersonIcon sx={{ mr: 1, color: "text.secondary" }} />
                  <Typography variant="body2" color="text.secondary">
                    Nombre completo
                  </Typography>
                </Box>
                <Typography variant="body1">{user.name}</Typography>
              </Grid2>
              <Grid2 size={{ xs: 12 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <EmailIcon sx={{ mr: 1, color: "text.secondary" }} />
                  <Typography variant="body2" color="text.secondary">
                    Email
                  </Typography>
                </Box>
                <Typography variant="body1">{user.email}</Typography>
              </Grid2>
              <Grid2 size={{ xs: 12 }}>
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
              </Grid2>
            </Grid2>
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
            {sessionsData?.map((session: UserSession) => (
              <ListItem
                // key sólo una vez
                key={session.id}
                sx={{
                  bgcolor: session.isCurrent ? "action.hover" : "inherit",
                  borderRadius: 1,
                  mb: 1,
                }}
                secondaryAction={
                  session.isCurrent ? (
                    <Chip label="Sesión actual" color="primary" size="small" />
                  ) : (
                    <IconButton
                      edge="end"
                      onClick={() => handleRevokeSession(session.id.toString())}
                      disabled={revokeSessionMutation.isPending}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )
                }
              >
                <ListItemIcon>
                  <DevicesIcon />
                </ListItemIcon>
                <ListItemText
                  primary={`${
                    session.deviceInfo.deviceName || "Dispositivo"
                  } (${session.deviceInfo.browser || "Navegador"} en ${
                    session.deviceInfo.os || "SO"
                  })`}
                  secondary={`Última actividad: ${new Date(
                    session.lastActivity
                  ).toLocaleString()}`}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
};

export default ProfilePage;
