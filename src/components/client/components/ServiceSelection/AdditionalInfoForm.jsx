// AdditionalInfoForm.jsx
import {
    Box,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    FormHelperText,
    FormControlLabel,
    Checkbox,
    RadioGroup,
    Radio,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import PropTypes from 'prop-types';

const AdditionalInfoForm = ({ item, itemAdditionalInfo, setItemAdditionalInfo }) => {
    const handleChange = (e, field) => {
        setItemAdditionalInfo({ ...itemAdditionalInfo, [field]: e.target.value });
    };

    const handleCheckboxChange = (e, field) => {
        const { checked } = e.target;
        setItemAdditionalInfo({ ...itemAdditionalInfo, [field]: checked });
    };

    const handleMultiSelectChange = (e, field) => {
        const { value } = e.target;
        setItemAdditionalInfo({ ...itemAdditionalInfo, [field]: value });
    };

    if (!item.additionalInfo) return null;

    return (
        <Box marginTop={2}>
            {item.additionalInfo.map((info) => {
                if (info.dependsOn && itemAdditionalInfo[info.dependsOn.field] !== info.dependsOn.value) {
                    return null; // Ocultar el campo si no se cumple la dependencia
                }

                return (
                    <FormControl fullWidth margin="normal" key={info.field} required={info.required}>
                        <InputLabel>{info.label}</InputLabel>
                        {info.type === 'select' ? (
                            <Select
                                value={itemAdditionalInfo[info.field] || ''}
                                label={info.label}
                                onChange={(e) => handleChange(e, info.field)}
                            >
                                {info.options.map((option) => (
                                    <MenuItem key={option} value={option}>
                                        {option}
                                    </MenuItem>
                                ))}
                            </Select>
                        ) : info.type === 'multi-select' ? (
                            <Select
                                multiple
                                value={itemAdditionalInfo[info.field] || []}
                                label={info.label}
                                onChange={(e) => handleMultiSelectChange(e, info.field)}
                                renderValue={(selected) => selected.join(', ')}
                            >
                                {info.options.map((option) => (
                                    <MenuItem key={option} value={option}>
                                        {option}
                                    </MenuItem>
                                ))}
                            </Select>
                        ) : info.type === 'textarea' ? (
                            <TextField
                                multiline
                                rows={4}
                                value={itemAdditionalInfo[info.field] || ''}
                                label={info.label}
                                onChange={(e) => handleChange(e, info.field)}
                            />
                        ) : info.type === 'date' ? (
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    label={info.label}
                                    value={itemAdditionalInfo[info.field]}
                                    onChange={(date) => setItemAdditionalInfo({ ...itemAdditionalInfo, [info.field]: date })}
                                    textField={(params) => <TextField {...params} fullWidth />} // Usando textField en lugar de renderInput
                                />
                            </LocalizationProvider>
                        ) : info.type === 'checkbox' ? (
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={itemAdditionalInfo[info.field] || false}
                                        onChange={(e) => handleCheckboxChange(e, info.field)}
                                    />
                                }
                                label={info.label}
                            />
                        ) : info.type === 'radio' ? (
                            <RadioGroup
                                value={itemAdditionalInfo[info.field] || ''}
                                onChange={(e) => handleChange(e, info.field)}
                            >
                                {info.options.map((option) => (
                                    <FormControlLabel key={option} value={option} control={<Radio />} label={option} />
                                ))}
                            </RadioGroup>
                        ) : (
                            <TextField
                                type={info.type}
                                value={itemAdditionalInfo[info.field] || ''}
                                label={info.label}
                                onChange={(e) => handleChange(e, info.field)}
                            />
                        )}
                        <FormHelperText>{info.question}</FormHelperText>
                    </FormControl>
                );
            })}
        </Box>
    );
};

AdditionalInfoForm.propTypes = {
    item: PropTypes.shape({
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
    itemAdditionalInfo: PropTypes.object.isRequired,
    setItemAdditionalInfo: PropTypes.func.isRequired,
};

export default AdditionalInfoForm;