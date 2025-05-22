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
      variant="outlined"
      InputProps={{
        ...InputProps,
        sx: {
          borderRadius: 1,
          borderWidth: error ? 2 : 1,
          backgroundColor: error ? "rgba(211, 47, 47, 0.05)" : undefined,
          '&:hover': {
            borderColor: error ? 'error.main' : 'primary.main',
          },
          '&:focus-within': {
            borderColor: error ? 'error.main' : 'primary.main',
            boxShadow: (theme) => 
              `0 0 0 2px ${error 
                ? theme.palette.error.main + '20' 
                : theme.palette.primary.main + '20'
              }`,
          },
          transition: 'all 0.2s',
        },
      }}
      slotProps={{
        inputLabel: { shrink: true },
        ...slotProps,
      }}
      inputProps={{ 
        "aria-label": ariaLabel,
        autoComplete: name,
      }}
      {...rest}
    />
  );
};

export default ProfileFormField;
