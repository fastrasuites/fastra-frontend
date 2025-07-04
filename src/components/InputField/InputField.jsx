import {
  TextField as MuiTextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
} from "@mui/material";

const InputField = ({ config, value, onChange, onClick }) => {
  const {
    name,
    label,
    inputType = "text",
    placeholder = "",
    required = false,
    disabled = false,
    fullWidth = true,
    options = [], // for select dropdown
    multiline = false, // for textarea behaviour
    rows = 4, // number of rows when multiline
    variant = "outlined",
  } = config;

  const handleChange = (event) => {
    onChange && onChange(event);
  };

  const handleClick = (event) => {
    onClick && onClick(event);
  };

  return (
    <Box my={2} width={"100%"}>
      {/* Static label above input */}
      <Typography variant="subtitle2" gutterBottom>
        {label}
        {required && " *"}
      </Typography>

      {inputType === "select" ? (
        <FormControl
          fullWidth={fullWidth}
          required={required}
          disabled={disabled}
          variant={variant}
          sx={{ width: "100%" }}
        >
          <Select
            id={name}
            name={name}
            value={value}
            displayEmpty
            onChange={handleChange}
            onClick={handleClick}
            renderValue={(selected) => {
              if (!selected) return placeholder;
              const found = options.find((opt) => opt.value === selected);
              return found ? found.label : placeholder;
            }}
            style={{ width: "100%" }}
          >
            <MenuItem disabled value="">
              {placeholder || `Select ${label}`}
            </MenuItem>
            {options.map(({ label: optLabel, value: optValue }) => (
              <MenuItem key={optValue} value={optValue}>
                {optLabel}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      ) : (
        <MuiTextField
          id={name}
          name={name}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          onClick={handleClick}
          required={required}
          disabled={disabled}
          fullWidth={fullWidth}
          multiline={multiline}
          rows={multiline ? rows : 1}
          variant={variant}
        />
      )}
    </Box>
  );
};

export default InputField;
