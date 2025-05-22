import { LinearProgress, useMediaQuery } from "@mui/material";
import MobileProfileView from "./MobileProfileView";
import DesktopProfileView from "./DesktopProfileView";
import { UseProfileForm } from "./UseProfileForm";

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
  } = UseProfileForm();

  const isMobile = useMediaQuery("(max-width:768px)");

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
          expandedDepth={null}
          handleChange={handleChange}
          handleBlowChange={handleBlowChange}
          handleAccordionChange={() => () => {}}
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
