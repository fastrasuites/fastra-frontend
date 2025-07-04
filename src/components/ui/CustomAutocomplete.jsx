import React, { useState } from "react";
import { Autocomplete, TextField } from "@mui/material";

const CustomAutocomplete = ({
  options = [],
  label = "",
  value: controlledValue,
  onChange: controlledOnChange,
  inputValue: controlledInputValue,
  onInputChange: controlledOnInputChange,
  ...props
}) => {
  // Internal state for uncontrolled behavior
  const [internalValue, setInternalValue] = useState(null);
  const [internalInputValue, setInternalInputValue] = useState("");

  // Decide whether to use controlled or internal state
  const value = controlledValue !== undefined ? controlledValue : internalValue;
  const inputValue =
    controlledInputValue !== undefined ? controlledInputValue : internalInputValue;

  const handleChange = (event, newValue) => {
    if (controlledOnChange) {
      controlledOnChange(event, newValue);
    } else {
      setInternalValue(newValue);
    }
  };

  const handleInputChange = (event, newInputValue) => {
    if (controlledOnInputChange) {
      controlledOnInputChange(event, newInputValue);
    } else {
      setInternalInputValue(newInputValue);
    }
  };

  return (
    <Autocomplete
      options={options}
      value={value}
      onChange={handleChange}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      disablePortal
      {...props}
      renderInput={(params) => (
        <TextField {...params} label={label} InputLabelProps={{ shrink: true }} />
      )}
    />
  );
};

export default CustomAutocomplete;
