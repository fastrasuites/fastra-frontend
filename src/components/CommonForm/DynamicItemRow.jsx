// DynamicItemRow.jsx
import React from "react";
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
  // Render a table cell based on field type defined in rowConfig

  const renderCell = (cfg) => {
    const { field, type, options, getOptionLabel, disabled, transform } = cfg;
    const value = row[field];

    switch (type) {
      case "autocomplete":
        return (
          <Autocomplete
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
                  width: "100%",
                  "& .MuiInput-underline:before": {
                    borderBottomColor: "#C6CCD2",
                  },
                  "& .MuiInputBase-input": { color: "#A9B3BC" },
                }}
              />
            )}
          />
        );
      case "number":
      case "text":
      default:
        return (
          <TextField
            type={type}
            variant="standard"
            value={transform ? transform(value) : value || ""}
            onChange={(e) => {
              const inputValue = e.target.value;

              if (type === "number") {
                if (inputValue === "") {
                  handleRowChange(index, field, null); // empty input = null
                  return;
                }

                const numericValue = parseInt(inputValue, 10);

                if (!isNaN(numericValue)) {
                  if (setMax && field === setMax.field) {
                    const limit = row.product[setMax.limit];

                    if (numericValue <= limit) {
                      handleRowChange(index, field, numericValue); // send number
                    } else {
                      Swal.fire({
                        icon: "warning",
                        title: "Limit Exceeded",
                        text: `You cannot enter more than ${limit}.`,
                        confirmButtonColor: "#3085d6",
                      });
                    }
                  } else {
                    handleRowChange(index, field, numericValue); // send number
                  }
                }
              } else {
                handleRowChange(index, field, inputValue); // send string for text types
              }
            }}
            disabled={disabled}
            sx={{
              width: "100%",
              "& .MuiInput-underline:before": { borderBottomColor: "#C6CCD2" },
              "& .MuiInputBase-input": { color: "#A9B3BC" },
            }}
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
      {rowConfig.map((cfg, i) => {
        return (
          <TableCell key={i} sx={cellStyle(index)}>
            {renderCell(cfg)}
          </TableCell>
        );
      })}
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
