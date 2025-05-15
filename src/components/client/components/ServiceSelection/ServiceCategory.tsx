import React, { useState } from "react";
import { Typography, Collapse, Grid2 } from "@mui/material";
import ServiceItem from "./ServiceItem";
import { ServiceCategory as ServiceCategoryType } from "../types";
import { useLocation } from "react-router-dom";

interface ServiceCategoryProps {
  category: ServiceCategoryType;
}

const ServiceCategory: React.FC<ServiceCategoryProps> = ({ category }) => {
  const [expanded, setExpanded] = useState(true);
  const location = useLocation();
  const editServiceId = location.state?.editServiceId;

  return (
    <Grid2 container direction="column" sx={{ flexGrow: 1, mb: 2 }}>
      <Typography
        variant="h5"
        onClick={() => setExpanded(!expanded)}
        sx={{
          cursor: "pointer",
          mb: 1,
          "&:hover": { color: "primary.main" },
        }}
        aria-expanded={expanded}
        role="button"
      >
        {category.category}
      </Typography>
      <Collapse in={expanded}>
        <Grid2 container spacing={2}>
          {category.items.map((item) => (
            <Grid2
              key={item.id}
              size={{ xs: 12, md: 6 }}
              sx={{
                border:
                  editServiceId && location.state?.serviceItemId === item.id
                    ? "2px solid"
                    : "none",
                borderColor: "primary.main",
                borderRadius: 1,
                p: 1,
              }}
            >
              <ServiceItem item={item} category={category.category} />
            </Grid2>
          ))}
        </Grid2>
      </Collapse>
    </Grid2>
  );
};

export default ServiceCategory;
