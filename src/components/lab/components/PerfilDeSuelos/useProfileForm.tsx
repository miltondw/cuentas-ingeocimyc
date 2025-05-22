import { useState, useEffect, useMemo, ChangeEvent, FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "@api";
import {
  ProfileFormData,
  Notification,
  ProfileStats,
  BlowData,
} from "./profileTypes";

export const DEPTH_INCREMENT = 0.45;
export const DEPTH_LEVELS = 14;

export const useProfileForm = () => {
  const [formData, setFormData] = useState<ProfileFormData>({
    sounding_number: "",
    location: "",
    water_level: "",
    profile_date: new Date().toISOString().split("T")[0],
    samples_number: 0,
    blows_data: Array.from({ length: DEPTH_LEVELS }, (_, i) => ({
      depth: ((i + 1) * DEPTH_INCREMENT).toFixed(2),
      blows6: "",
      blows12: "",
      blows18: "",
      n: 0,
      observation: "",
    })),
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof ProfileFormData, string>>
  >({});
  const [loading, setLoading] = useState<boolean>(false);
  const [notification, setNotification] = useState<Notification>({
    open: false,
    message: "",
    severity: "info",
  });

  const navigate = useNavigate();
  const { projectId, profileId } = useParams<{
    projectId: string;
    profileId: string;
  }>();

  useEffect(() => {
    if (!profileId || profileId === "nuevo") return;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await api.get(
          `/projects/${projectId}/profiles/${profileId}`
        );
        const profile = res.data.perfil;

        setFormData({
          sounding_number: profile.sounding_number || "",
          location: profile.location || "",
          water_level: profile.water_level || "",
          profile_date: profile.profile_date
            ? profile.profile_date.split("T")[0]
            : new Date().toISOString().split("T")[0],
          samples_number: profile.samples_number || 0,
          blows_data: profile.blows_data.map((blow: BlowData) => ({
            ...blow,
            blows6: blow.blows6 !== null ? blow.blows6.toString() : "",
            blows12: blow.blows12 !== null ? blow.blows12.toString() : "",
            blows18: blow.blows18 !== null ? blow.blows18.toString() : "",
            n: blow.n !== null ? blow.n.toString() : "0",
            observation: blow.observation || "",
          })),
        });
        setNotification({
          open: true,
          message: "Perfil cargado exitosamente",
          severity: "success",
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
        setNotification({
          open: true,
          message: "Error al cargar el perfil",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [projectId, profileId]);
  const validateForm = () => {
    const newErrors: Partial<Record<keyof ProfileFormData, string>> = {};

    // Validar número de sondeo
    if (!formData.sounding_number || !formData.sounding_number.trim()) {
      newErrors.sounding_number = "El número de sondeo es obligatorio";
    }

    // Validar fecha
    if (!formData.profile_date) {
      newErrors.profile_date = "La fecha es obligatoria";
    }

    // Mostrar los errores en el formulario
    setErrors(newErrors);

    // Notificar al usuario sobre los campos con error
    if (Object.keys(newErrors).length > 0) {
      setNotification({
        open: true,
        message: "Por favor, completa los campos obligatorios",
        severity: "warning",
      });
    }

    return Object.keys(newErrors).length === 0;
  };
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value || "",
    }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };
  const handleBlowChange = (
    index: number,
    field: keyof BlowData,
    value: string | number
  ) => {
    setFormData((prev) => {
      const newBlowsData = [...prev.blows_data];
      if (field === "observation") {
        newBlowsData[index] = {
          ...newBlowsData[index],
          [field]: String(value) || "",
        };
      } else {
        // Tratar correctamente las entradas vacías y numéricas
        const stringValue = String(value).trim();
        const numValue = stringValue === "" ? "" : parseInt(stringValue) || 0;

        newBlowsData[index] = { ...newBlowsData[index], [field]: numValue };

        // Calcular el valor de N si tenemos valores para blows12 y blows18
        if (field === "blows12" || field === "blows18") {
          const blows12 =
            field === "blows12" ? numValue : newBlowsData[index].blows12;

          const blows18 =
            field === "blows18" ? numValue : newBlowsData[index].blows18;

          // Solo calcular N si ambos valores son números válidos
          if (blows12 !== "" && blows18 !== "") {
            const b12 =
              typeof blows12 === "string"
                ? blows12 === ""
                  ? 0
                  : parseInt(blows12) || 0
                : blows12 || 0;

            const b18 =
              typeof blows18 === "string"
                ? blows18 === ""
                  ? 0
                  : parseInt(blows18) || 0
                : blows18 || 0;

            newBlowsData[index].n = b12 + b18;
          } else {
            // Si alguno está vacío, N debería ser 0
            newBlowsData[index].n = 0;
          }
        }
      }
      return { ...prev, blows_data: newBlowsData };
    });
  };

  const profileStats: ProfileStats = useMemo(() => {
    const completedRows = formData.blows_data.filter(
      (row) => Number(row.n) > 0
    ).length;
    const totalRows = formData.blows_data.length;
    const percentComplete = Math.round((completedRows / totalRows) * 100);
    const maxN = Math.max(
      ...formData.blows_data.map((row) => parseInt(row.n as string) || 0)
    );
    const depthsWithData = formData.blows_data.filter(
      (blow) => Number(blow.n) > 0
    );
    const maxDepth = depthsWithData.length
      ? Math.max(...depthsWithData.map((blow) => parseFloat(blow.depth) || 0))
      : 0;
    return { completedRows, totalRows, percentComplete, maxN, maxDepth };
  }, [formData.blows_data]);
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      setNotification({
        open: true,
        message: "Por favor, corrige los errores en el formulario",
        severity: "error",
      });
      return;
    }

    try {
      setLoading(true);

      // Convertir de manera segura los datos para enviar al backend
      const payload = {
        sounding_number: formData.sounding_number.trim(),
        location: formData.location.trim(),
        water_level: formData.water_level.trim() || "",
        profile_date: formData.profile_date,
        samples_number:
          typeof formData.samples_number === "string"
            ? parseInt(formData.samples_number) || 0
            : formData.samples_number,
        blows_data: formData.blows_data.map((blow) => {
          const safeParseInt = (value: string | number) => {
            if (value === "" || value === null || value === undefined) return 0;
            const parsed = typeof value === "string" ? parseInt(value) : value;
            return isNaN(parsed) ? 0 : parsed;
          };

          return {
            depth: parseFloat(blow.depth),
            blows6: safeParseInt(blow.blows6),
            blows12: safeParseInt(blow.blows12),
            blows18: safeParseInt(blow.blows18),
            n: safeParseInt(blow.n),
            observation: (blow.observation || "").trim(),
          };
        }),
      };

      const endpoint =
        profileId && profileId !== "nuevo"
          ? `/projects/${projectId}/profiles/${profileId}`
          : `/projects/${projectId}/profiles`;

      const method = profileId && profileId !== "nuevo" ? "put" : "post";

      await api[method](endpoint, payload);
      setNotification({
        open: true,
        message: `Perfil ${
          method === "put" ? "actualizado" : "creado"
        } exitosamente`,
        severity: "success",
      });

      // Esperar a que el usuario vea la notificación antes de redirigir
      setTimeout(() => navigate(`/lab/proyectos/${projectId}/perfiles`), 1500);
    } catch (error) {
      console.error("Error saving profile:", error);

      // Mejorar el manejo de errores
      let errorMessage = "Error al guardar el perfil";

      try {
        const errorResponse = error as {
          response?: {
            data?: {
              message?: string;
              error?: string;
            };
          };
        };

        errorMessage =
          errorResponse.response?.data?.message ||
          errorResponse.response?.data?.error ||
          errorMessage;
      } catch (parseError) {
        console.error("Error parsing error response:", parseError);
      }

      setNotification({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseNotification = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  return {
    formData,
    errors,
    loading,
    notification,
    profileStats,
    handleChange,
    handleBlowChange,
    handleSubmit,
    handleCloseNotification,
    navigate,
    profileId,
    projectId,
    soundingNumberError: errors?.sounding_number,
  };
};
