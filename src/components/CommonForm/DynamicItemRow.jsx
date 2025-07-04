// DynamicItemRow.jsx
import React from "react";
import { Autocomplete, TableCell, TableRow, TextField } from "@mui/material";
import { X } from "lucide-react";

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
}) => {

  // console.log("Row Config", rowConfig)
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
                  "& .MuiInput-underline:before": { borderBottomColor: "#C6CCD2" },
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
            onChange={(e) => handleRowChange(index, field, e.target.value)}
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
        )
      })}
      <TableCell sx={cellStyle(index)}>
        <X onClick={() => handleRemoveRow(index)} style={{ cursor: "pointer" }} />
      </TableCell>
    </TableRow>
  );
};

export default DynamicItemRow;
