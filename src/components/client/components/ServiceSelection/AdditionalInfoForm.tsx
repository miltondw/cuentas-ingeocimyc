import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  SelectChangeEvent,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
  FormLabel,
  InputLabel,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { AdditionalInfo, AdditionalInfoFormProps } from "../types"; // Adjust path to your types file

const AdditionalInfoForm: React.FC<AdditionalInfoFormProps> = ({
  service,
  itemAdditionalInfo,
  setItemAdditionalInfo,
}) => {
  const handleChange = (field: string, value: any) => {
    setItemAdditionalInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleCheckboxChange = (field: string, checked: boolean) => {
    setItemAdditionalInfo((prev) => ({ ...prev, [field]: checked }));
  };

  const handleMultiSelectChange = (field: string, value: string[]) => {
    setItemAdditionalInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (field: string, date: Dayjs | null) => {
    setItemAdditionalInfo((prev) => ({
      ...prev,
      [field]: date ? dayjs(date).format("YYYY-MM-DD") : null,
    }));
  };

  return (
    <Box>
      {service.additionalInfo?.map((info: AdditionalInfo, i: number) => {
        if (
          info.dependsOn &&
          itemAdditionalInfo[info.dependsOn.field] !== info.dependsOn.value
        ) {
          return null;
        }
        switch (info.type) {
          case "text":
          case "number":
            return (
              <TextField
                key={i}
                fullWidth
                label={info.label}
                value={itemAdditionalInfo[info.field] || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange(info.field, e.target.value)
                }
                margin="normal"
                type={info.type}
                required={info.required}
              />
            );
          case "select":
            return (
              <FormControl
                fullWidth
                margin="normal"
                required={info.required}
                key={i}
              >
                <InputLabel id={`${info.field}-label`}>{info.label}</InputLabel>
                <Select
                  labelId={`${info.field}-label`}
                  id={info.field}
                  value={itemAdditionalInfo[info.field] || ""}
                  label={info.label}
                  onChange={(e: SelectChangeEvent) =>
                    handleChange(info.field, e.target.value as string)
                  }
                >
                  {info.options?.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            );
          case "select-multiple":
            return (
              <FormControl
                fullWidth
                margin="normal"
                required={info.required}
                key={i}
              >
                <InputLabel id={`${info.field}-label`}>{info.label}</InputLabel>
                <Select
                  labelId={`${info.field}-label`}
                  id={info.field}
                  multiple
                  value={itemAdditionalInfo[info.field] || []}
                  label={info.label}
                  onChange={(e: SelectChangeEvent<string[]>) =>
                    handleMultiSelectChange(
                      info.field,
                      e.target.value as string[]
                    )
                  }
                  renderValue={(selected: string[]) => selected.join(", ")}
                >
                  {info.options?.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            );
          case "checkbox":
            return (
              <FormControlLabel
                key={i}
                control={
                  <Checkbox
                    checked={!!itemAdditionalInfo[info.field]}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleCheckboxChange(info.field, e.target.checked)
                    }
                  />
                }
                label={info.label}
              />
            );
          case "radio":
            return (
              <FormControl
                component="fieldset"
                fullWidth
                margin="normal"
                required={info.required}
                key={i}
              >
                <FormLabel component="legend">{info.label}</FormLabel>
                <RadioGroup
                  aria-label={info.label}
                  name={info.field}
                  value={itemAdditionalInfo[info.field] || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleChange(info.field, e.target.value)
                  }
                >
                  {info.options?.map((option) => (
                    <FormControlLabel
                      key={option}
                      value={option}
                      control={<Radio />}
                      label={option}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            );
          case "date":
            return (
              <FormControl fullWidth margin="normal" key={info.field}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label={info.label}
                    value={
                      itemAdditionalInfo[info.field]
                        ? dayjs(itemAdditionalInfo[info.field])
                        : null
                    }
                    onChange={(date: Dayjs | null) =>
                      handleDateChange(info.field, date)
                    }
                  />
                </LocalizationProvider>
              </FormControl>
            );
          default:
            return null;
        }
      })}
    </Box>
  );
};

export default AdditionalInfoForm;
