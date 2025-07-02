import React, { useRef, useCallback } from "react";
import { TextField, Box } from "@mui/material";

const OtpInput = ({ length = 4, onChange }) => {
  const inputsRef = useRef([]);

  // Focus the first empty input or last filled input
  const focusInput = useCallback(
    (startIndex = 0) => {
      const index = inputsRef.current.findIndex(
        (input, i) =>
          (i >= startIndex && input.value === "") || i === length - 1
      );
      if (index !== -1) {
        inputsRef.current[index]?.focus();
      }
    },
    [length]
  );

  // Handle individual input changes
  const handleChange = useCallback(
    (index, value) => {
      if (!/^\d?$/.test(value)) return;

      inputsRef.current[index].value = value;

      if (value) {
        if (index < length - 1) {
          inputsRef.current[index + 1]?.focus();
        }
      } else {
        if (index > 0) {
          inputsRef.current[index - 1]?.focus();
        }
      }

      const otp = inputsRef.current.map((input) => input?.value || "").join("");
      onChange(otp);
    },
    [length, onChange]
  );

  // Handle paste event
  const handlePaste = useCallback(
    (e) => {
      e.preventDefault();
      const pasteData = e.clipboardData
        .getData("text/plain")
        .replace(/\D/g, "")
        .substring(0, length);

      // Distribute digits to inputs
      pasteData.split("").forEach((char, i) => {
        if (i < length) {
          inputsRef.current[i].value = char;
        }
      });

      // Update OTP value
      const otp = inputsRef.current.map((input) => input?.value || "").join("");
      onChange(otp);

      // Move focus to appropriate input
      focusInput(pasteData.length);
    },
    [length, onChange, focusInput]
  );

  // Handle backspace and arrow keys
  const handleKeyDown = useCallback(
    (index, e) => {
      if (e.key === "Backspace" && !e.target.value && index > 0) {
        inputsRef.current[index - 1]?.focus();
      }
      // Allow arrow navigation
      else if (e.key === "ArrowLeft" && index > 0) {
        e.preventDefault();
        inputsRef.current[index - 1]?.focus();
      } else if (e.key === "ArrowRight" && index < length - 1) {
        e.preventDefault();
        inputsRef.current[index + 1]?.focus();
      }
    },
    [length]
  );

  return (
    <Box display="flex" gap={"24px"} width={"100%"}>
      {Array.from({ length }).map((_, index) => (
        <TextField
          key={index}
          type="text"
          sx={{
            "& .MuiOutlinedInput-notchedOutline": {
              border: "1px solid #3B7CED",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              border: "1px solid #3B7CED",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              border: "1px solid #3B7CED",
            },
            "& .MuiOutlinedInput-root": {
              outline: "none",
            },
          }}
          inputProps={{
            maxLength: 1,
            inputMode: "numeric",
            pattern: "[0-9]*",
            style: {
              textAlign: "center",
              fontSize: "1.5rem",
              width: "84px",
              height: "76px",
              borderRadius: "8px",
              outline: "none",
            },
          }}
          inputRef={(el) => (inputsRef.current[index] = el)}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          variant="outlined"
          size="small"
        />
      ))}
    </Box>
  );
};

export default OtpInput;
