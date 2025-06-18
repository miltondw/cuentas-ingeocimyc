import DesktopProfileView from "@/components/lab/components/PerfilDeSuelos/DesktopProfileView";
import MobileProfileView from "@/components/lab/components/PerfilDeSuelos/MobileProfileView";
import { useProfileForm } from "@/components/lab/components/PerfilDeSuelos/useProfileForm";
import { LinearProgress, useMediaQuery } from "@mui/material";

import React, { useState } from "react";

/**
 * Componente principal para gestión de perfiles de suelos
 * Migrado desde components/lab/components/PerfilDeSuelos/PerfilDeSuelos.tsx
 */
export const ProfileSoilForm = () => {
  const {
    formData,
    errors,
    loading,
    profileStats,
    handleChange,
    handleBlowChange,
    handleSubmit,
    navigate,
    profileId,
    projectId,
  } = useProfileForm();

  const [expandedDepth, setExpandedDepth] = useState<string | null>(null);
  const isMobile = useMediaQuery("(max-width:768px)");

  // Implementando la función handleAccordionChange correctamente
  const handleAccordionChange =
    (depth: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpandedDepth(isExpanded ? depth : null);
    };

  if (loading) {
    return (
      <LinearProgress
        sx={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1100 }}
      />
    );
  }

  return (
    <>
      {isMobile ? (
        <MobileProfileView
          formData={formData}
          profileId={profileId}
          projectId={projectId}
          profileStats={profileStats}
          errors={errors}
          expandedDepth={expandedDepth}
          handleChange={handleChange}
          handleBlowChange={handleBlowChange}
          handleSubmit={handleSubmit}
          handleAccordionChange={handleAccordionChange}
          navigate={navigate}
        />
      ) : (
        <DesktopProfileView
          formData={formData}
          profileId={profileId}
          projectId={projectId}
          profileStats={profileStats}
          errors={errors}
          handleChange={handleChange}
          handleBlowChange={handleBlowChange}
          handleSubmit={handleSubmit}
          handleAccordionChange={handleAccordionChange}
          navigate={navigate}
        />
      )}
    </>
  );
};

export default ProfileSoilForm;
