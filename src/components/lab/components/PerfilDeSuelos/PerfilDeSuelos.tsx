import { LinearProgress, useMediaQuery } from "@mui/material";
import MobileProfileView from "./MobileProfileView";
import DesktopProfileView from "./DesktopProfileView";
import { useProfileForm } from "./useProfileForm";
import React, { useState } from "react";

const PerfilDeSuelos = () => {
  const {
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
          handleAccordionChange={handleAccordionChange}
          handleSubmit={handleSubmit}
          handleCloseNotification={handleCloseNotification}
          notification={notification}
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
          handleCloseNotification={handleCloseNotification}
          notification={notification}
          navigate={navigate}
        />
      )}
    </>
  );
};

export default PerfilDeSuelos;
