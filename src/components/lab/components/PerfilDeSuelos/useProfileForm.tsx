import { useState, useEffect, useMemo, ChangeEvent, FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "@api";
import {
  ProfileFormData,
  Notification,
  ProfileStats,
  BlowData,
} from "./profileTypes";
import { debounce } from "lodash";

export const DEPTH_INCREMENT = 0.45;
export const DEPTH_LEVELS = 14;

export const UseProfileForm = () => {
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
    if (!formData.sounding_number.trim()) {
      newErrors.sounding_number = "El número de sondeo es obligatorio";
    }
    if (!formData.profile_date) {
      newErrors.profile_date = "La fecha es obligatoria";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = debounce((e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value || "",
    }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }, 300);

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
        const numValue = value === "" ? "" : parseInt(value as string) || 0;
        newBlowsData[index] = { ...newBlowsData[index], [field]: numValue };
        if (field === "blows12" || field === "blows18") {
          const blows12 =
            field === "blows12" ? numValue : newBlowsData[index].blows12;
          const blows18 =
            field === "blows18" ? numValue : newBlowsData[index].blows18;
          if (blows12 !== "" && blows18 !== "") {
            newBlowsData[index].n =
              (parseInt(blows12 as string) || 0) +
              (parseInt(blows18 as string) || 0);
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
      const payload = {
        sounding_number: formData.sounding_number,
        location: formData.location,
        water_level: formData.water_level || "",
        profile_date: formData.profile_date,
        samples_number: parseInt(formData.samples_number as string) || 0,
        blows_data: formData.blows_data.map((blow) => ({
          depth: parseFloat(blow.depth),
          blows6: parseInt(blow.blows6 as string) || 0,
          blows12: parseInt(blow.blows12 as string) || 0,
          blows18: parseInt(blow.blows18 as string) || 0,
          n: parseInt(blow.n as string) || 0,
          observation: blow.observation || "",
        })),
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
      setTimeout(() => navigate(`/lab/proyectos/${projectId}/perfiles`), 1000);
    } catch (error) {
      console.error("Error saving profile:", error);
      setNotification({
        open: true,
        message:
          (error as { response?: { data?: { message?: string } } }).response
            ?.data?.message || "Error al guardar el perfil",
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
