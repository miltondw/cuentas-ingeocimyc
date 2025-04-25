import React from "react";
import { Box, Typography, Collapse } from "@mui/material";
import ServiceItem from "./ServiceItem";
import PropTypes from "prop-types";


const ServiceCategory = ({ category }) => {
    const [expanded, setExpanded] = React.useState(true);
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


ServiceCategory.propTypes = {
    category: PropTypes.shape({
        id: PropTypes.number.isRequired,
        category: PropTypes.string.isRequired,
        items: PropTypes.arrayOf(
            PropTypes.shape({
                id: PropTypes.number.isRequired,
                name: PropTypes.string.isRequired,
            })
        ).isRequired,
    }).isRequired,
};


export default ServiceCategory;