import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Box,
  TextField,
  Button,
  CircularProgress,
  Typography,
} from "@mui/material";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(6, "La contraseña actual es obligatoria"),
    newPassword: z
      .string()
      .min(6, "La nueva contraseña debe tener al menos 6 caracteres"),
    confirmNewPassword: z.string().min(6, "Confirma la nueva contraseña"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmNewPassword"],
  });

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

const ChangePasswordPage = () => {
  const { showError, showSuccess } = useNotifications();
  const { user, changePassword } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    setIsSubmitting(true);
    try {
      const result = await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmNewPassword: data.confirmNewPassword,
      });
      if (result.success) {
        showSuccess("Contraseña cambiada correctamente");
        reset();
      } else {
        showError(result.error || "Error al cambiar la contraseña");
      }
    } catch (_error) {
      showError("Error inesperado. Inténtalo de nuevo más tarde.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <Typography>Debes iniciar sesión para cambiar tu contraseña.</Typography>
    );
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ maxWidth: 400, mx: "auto", mt: 4 }}
    >
      <Typography variant="h5" mb={2}>
        Cambiar contraseña
      </Typography>
      <TextField
        label="Contraseña actual"
        type="password"
        fullWidth
        margin="normal"
        {...register("currentPassword")}
        error={!!errors.currentPassword}
        helperText={errors.currentPassword?.message}
        disabled={isSubmitting}
      />
      <TextField
        label="Nueva contraseña"
        type="password"
        fullWidth
        margin="normal"
        {...register("newPassword")}
        error={!!errors.newPassword}
        helperText={errors.newPassword?.message}
        disabled={isSubmitting}
      />
      <TextField
        label="Confirmar nueva contraseña"
        type="password"
        fullWidth
        margin="normal"
        {...register("confirmNewPassword")}
        error={!!errors.confirmNewPassword}
        helperText={errors.confirmNewPassword?.message}
        disabled={isSubmitting}
      />
      <Button
        type="submit"
        variant="contained"
        fullWidth
        sx={{ mt: 2 }}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          "Cambiar contraseña"
        )}
      </Button>
    </Box>
  );
};

export default ChangePasswordPage;
