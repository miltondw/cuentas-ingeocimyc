import { TextField, TextFieldProps } from "@mui/material";

interface ProfileFormFieldProps extends Omit<TextFieldProps, "error"> {
  error?: boolean;
  "aria-label"?: string;
}

const ProfileFormField = ({
  label,
  name,
  value,
  onChange,
  error,
  helperText,
  placeholder,
  type,
  required,
  InputProps,
  slotProps,
  "aria-label": ariaLabel,
  ...rest
}: ProfileFormFieldProps) => {
  return (
    <TextField
      label={label}
      name={name}
      value={value}
      onChange={onChange}
      fullWidth
      margin="normal"
      size="small"
      required={required}
      error={error}
      helperText={helperText}
      placeholder={placeholder}
      type={type}
      InputProps={{
        ...InputProps,
        sx: {
          borderWidth: error ? 2 : 1,
          backgroundColor: error ? "rgba(211, 47, 47, 0.05)" : undefined,
        },
      }}
      slotProps={{
        inputLabel: { shrink: true },
        ...slotProps,
      }}
      inputProps={{ "aria-label": ariaLabel }}
      {...rest}
    />
  );
};

export default ProfileFormField;
