import React, { useState } from "react";
import { Autocomplete, TableCell, TableRow, TextField } from "@mui/material";
import { X } from "lucide-react";
import Swal from "sweetalert2";

// Utility function to style table cells uniformly
const cellStyle = (index) => ({
  backgroundColor: index % 2 === 0 ? "#f2f2f2" : "#fff",
  color: "#7a8a98",
  fontSize: "12px",
});

const DynamicItemRow = ({
  row,
  index,
  handleRowChange,
  handleRemoveRow,
  rowConfig,
  setMax,
}) => {
  const [focusedFields, setFocusedFields] = useState({});

  const handleFocus = (field) => {
    setFocusedFields((prev) => ({ ...prev, [field]: true }));
  };

  const handleBlur = (field, value, cfg) => {
    setFocusedFields((prev) => ({ ...prev, [field]: false }));
    const inputValue = value.replace(/,/g, "");
    const numericValue = parseFloat(inputValue);
    if (!isNaN(numericValue)) {
      if (setMax && field === setMax?.field) {
        const limit = row.product[setMax.limit];
        if (numericValue <= limit) {
          handleRowChange(index, field, numericValue);
        } else {
          Swal.fire({
            icon: "warning",
            title: "Limit Exceeded",
            text: `You cannot enter more than ${limit}.`,
            confirmButtonColor: "#3085d6",
          });
        }
      } else {
        handleRowChange(index, field, numericValue);
      }
    }
  };

  const renderCell = (cfg) => {
    const { field, type, options, getOptionLabel, disabled, transform } = cfg;
    const value = row[field];
    const isFocused = focusedFields[field] || false;

    switch (type) {
      case "autocomplete":
        return (
          <Autocomplete
            fullWidth
            options={options || []}
            getOptionLabel={getOptionLabel || ((option) => option || "")}
            value={value || null}
            onChange={(_, newValue) => handleRowChange(index, field, newValue)}
            disableClearable
            isOptionEqualToValue={(option, value) => {
              const optionName = option?.product_name?.toLowerCase() || "";
              const valueName =
                typeof value === "string"
                  ? value.toLowerCase()
                  : value?.product_name?.toLowerCase() || "";
              return optionName === valueName;
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="standard"
                sx={{
                  "& .MuiInput-underline:before": {
                    borderBottomColor: "#C6CCD2",
                  },
                  "& .MuiInputBase-input": { color: "#A9B3BC" },
                }}
                fullWidth
              />
            )}
          />
        );
      case "number":
        const displayValue = isFocused
          ? value?.toString() || ""
          : transform(value) || "";
        return (
          <TextField
            type="text"
            variant="standard"
            value={displayValue}
            onFocus={() => {
              handleFocus(field);
            }}
            onChange={(e) => {
              const inputValue = e.target.value.replace(/[^0-9.]/g, ""); // Allow digits and decimal
              if (isFocused) {
                handleRowChange(index, field, inputValue); // Temporarily store string during typing
              }
            }}
            onBlur={(e) => handleBlur(field, e.target.value, cfg)}
            disabled={disabled}
            sx={{
              "& .MuiInput-underline:before": { borderBottomColor: "#C6CCD2" },
              "& .MuiInputBase-input": { color: "#A9B3BC" },
            }}
            fullWidth
          />
        );
      case "text":
      default:
        return (
          <TextField
            type={type}
            variant="standard"
            value={transform ? transform(value) : value || ""}
            onChange={(e) => handleRowChange(index, field, e.target.value)}
            disabled={disabled}
            sx={{
              "& .MuiInput-underline:before": { borderBottomColor: "#C6CCD2" },
              "& .MuiInputBase-input": { color: "#A9B3BC" },
            }}
            fullWidth
          />
        );
    }
  };

  return (
    <TableRow
      sx={{
        cursor: "pointer",
        "&:last-child td, &:last-child th": { border: 0 },
      }}
    >
      {rowConfig.map((cfg, i) => (
        <TableCell key={i} sx={cellStyle(index)}>
          {renderCell(cfg)}
        </TableCell>
      ))}
      <TableCell sx={cellStyle(index)}>
        <X
          onClick={() => handleRemoveRow(index)}
          style={{ cursor: "pointer" }}
        />
      </TableCell>
    </TableRow>
  );
};

export default DynamicItemRow;
