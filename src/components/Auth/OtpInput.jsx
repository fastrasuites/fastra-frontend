import React, { useRef } from "react";
import { TextField, Box } from "@mui/material";

const OtpInput = ({ onChange }) => {
  const inputsRef = useRef([]);

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;

    inputsRef.current[index].value = value;

    if (value && index < 3) {
      inputsRef.current[index + 1]?.focus();
    }

    const otp = inputsRef.current.map((input) => input?.value || "").join("");
    onChange(otp);
  };

  const handleKeyDown = (index, e) => {
    if (
      e.key === "Backspace" &&
      !inputsRef.current[index]?.value &&
      index > 0
    ) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  return (
    <Box display="flex" gap={2}>
      {[0, 1, 2, 3].map((_, index) => (
        <TextField
          type="number"
          key={index}
          inputProps={{
            maxLength: 1,
            style: {
              textAlign: "center",
              fontSize: "1.5rem",
              width: "84px",
              height: "76px",
              borderRadius: "8px",
              border: "1px solid #3B7CED",
            },
          }}
          inputRef={(el) => (inputsRef.current[index] = el)}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          variant="outlined"
          size="small"
        />
      ))}
    </Box>
  );
};

export default OtpInput;
