// ServiceItem.jsx
import { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import AdditionalInfoForm from './AdditionalInfoForm';
import PropTypes from 'prop-types';

const ServiceItem = ({ category, item, selectedServices, setSelectedServices }) => {
    const [quantity, setQuantity] = useState(1);
    const [itemAdditionalInfo, setItemAdditionalInfo] = useState({});

    const handleAddToCart = () => {
        const existingServiceIndex = selectedServices.findIndex(
            (service) => service.item.id === item.id
        );

        if (existingServiceIndex !== -1) {
            const updatedServices = [...selectedServices];
            updatedServices[existingServiceIndex].quantity += quantity;
            setSelectedServices(updatedServices);
        } else {
            setSelectedServices([...selectedServices, { category, item, quantity, additionalInfo: itemAdditionalInfo }]);
        }
    };

    return (
        <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom={2}>
            <Box>
                <Typography variant="h6">{item.name}</Typography>
                {item.additionalInfo && (
                    <AdditionalInfoForm
                        item={item}
                        itemAdditionalInfo={itemAdditionalInfo}
                        setItemAdditionalInfo={setItemAdditionalInfo}
                    />
                )}
            </Box>
            <Box>
                <input
                    type="number"
                    value={quantity}
                    min="1"
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    style={{ width: '50px', marginRight: '8px' }}
                />
                <Button variant="contained" color="primary" onClick={handleAddToCart}>
                    Agregar
                </Button>
            </Box>
        </Box>
    );
};

ServiceItem.propTypes = {
    category: PropTypes.shape({
        id: PropTypes.number.isRequired,
        category: PropTypes.string.isRequired,
    }).isRequired,
    item: PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        additionalInfo: PropTypes.arrayOf(
            PropTypes.shape({
                field: PropTypes.string.isRequired,
                label: PropTypes.string.isRequired,
                type: PropTypes.string.isRequired,
                options: PropTypes.arrayOf(PropTypes.string),
                question: PropTypes.string,
                required: PropTypes.bool,
                dependsOn: PropTypes.shape({
                    field: PropTypes.string.isRequired,
                    value: PropTypes.string.isRequired,
                }),
            })
        ),
    }).isRequired,
    selectedServices: PropTypes.arrayOf(
        PropTypes.shape({
            item: PropTypes.shape({
                id: PropTypes.number.isRequired,
                name: PropTypes.string.isRequired,
            }).isRequired,
            quantity: PropTypes.number.isRequired,
        })
    ).isRequired,
    setSelectedServices: PropTypes.func.isRequired,
};

export default ServiceItem;