import React, { useState } from "react";
import { Box, Typography, Collapse } from "@mui/material";
import ServiceItem from "./ServiceItem";
import { ServiceCategory as ServiceCategoryType } from "../types"; // Adjust path to your types file

interface ServiceCategoryProps {
  category: ServiceCategoryType;
}

const ServiceCategory: React.FC<ServiceCategoryProps> = ({ category }) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <Box>
      <Typography
        variant="h5"
        onClick={() => setExpanded(!expanded)}
        style={{ cursor: "pointer" }}
      >
        {category.category}
      </Typography>
      <Collapse in={expanded}>
        {category.items.map((item) => (
          <ServiceItem key={item.id} item={item} />
        ))}
      </Collapse>
    </Box>
  );
};

export default ServiceCategory;
