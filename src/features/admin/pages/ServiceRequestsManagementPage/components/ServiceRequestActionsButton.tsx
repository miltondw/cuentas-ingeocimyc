import React from "react";
import { Tooltip, IconButton } from "@mui/material";
import AssignmentIcon from "@mui/icons-material/Assignment";
import type { AdminServiceRequest } from "@/types/serviceRequests";

interface ServiceRequestActionsButtonProps {
  request: AdminServiceRequest;
  onClick: (request: AdminServiceRequest) => void;
}

const ServiceRequestActionsButton: React.FC<
  ServiceRequestActionsButtonProps
> = ({ request, onClick }) => (
  <Tooltip title="Ver acciones">
    <IconButton size="small" color="primary" onClick={() => onClick(request)}>
      <AssignmentIcon fontSize="small" />
    </IconButton>
  </Tooltip>
);

export default ServiceRequestActionsButton;
