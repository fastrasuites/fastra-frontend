import { Autocomplete, TableCell, TableRow, TextField } from "@mui/material";

const cellStyle = (index) => ({
  backgroundColor: index % 2 === 0 ? "#f2f2f2" : "#fff",
  color: "#7a8a98",
  fontSize: "12px",
});

const PRItemRow = ({ row, index, handleRowChange, products}) => {
  // console.log(row)
  return (
    <TableRow
      key={row.id || index}
      sx={{
        cursor: "pointer",
        "&:last-child td, &:last-child th": { border: 0 },
      }}
    >
      <TableCell sx={cellStyle(index)}>
        <Autocomplete
          options={products}
          getOptionLabel={(option) =>
            typeof option === "string" ? option : option.product_name || ""
          }
          value={row?.product || null}
          onChange={(_, newValue) => {
            handleRowChange(index, "product", newValue);
          }}
          disableClearable
          isOptionEqualToValue={(option, value) => {
            const optionName = option.product_name ? option.product_name.toLowerCase() : "";
            let valueName = "";
            if (typeof value === "string") {
              valueName = value.toLowerCase();
            } else if (value && value.product_name) {
              valueName = value.product_name.toLowerCase();
            }
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
      </TableCell>
      <TableCell sx={cellStyle(index)}>
        <TextField
          value={row.description || ""}
          variant="standard"
          onChange={(e) =>
            handleRowChange(index, "description", e.target.value)
          }
          sx={{
            width: "100%",
            "& .MuiInput-underline:before": { borderBottomColor: "#C6CCD2" },
            "& .MuiInputBase-input": { color: "#A9B3BC" },
          }}
        />
      </TableCell>
      <TableCell sx={cellStyle(index)}>
        <TextField
          type="number"
          value={row.qty || ""}
          variant="standard"
          onChange={(e) => handleRowChange(index, "qty", e.target.value)}
          sx={{
            width: "100%",
            "& .MuiInput-underline:before": { borderBottomColor: "#C6CCD2" },
            "& .MuiInputBase-input": { color: "#A9B3BC" },
          }}
        />
      </TableCell>
      <TableCell sx={cellStyle(index)}>
        <TextField
          value={
            Array.isArray(row.unit_of_measure)
              ? row.unit_of_measure[1]
              : row.unit_of_measure.
              unit_category || ""
          }
          
          variant="standard"
          sx={{
            width: "100%",
            "& .MuiInput-underline:before": { borderBottomColor: "#C6CCD2" },
            "& .MuiInputBase-input": { color: "#A9B3BC" },
          }}
          disabled
        />
      </TableCell>
      <TableCell sx={cellStyle(index)}>
        <TextField
          type="number"
          value={row.estimated_unit_price || ""}
          variant="standard"
          onChange={(e) =>
            handleRowChange(index, "estimated_unit_price", e.target.value)
          }
          sx={{
            width: "100%",
            "& .MuiInput-underline:before": { borderBottomColor: "#C6CCD2" },
            "& .MuiInputBase-input": { color: "#A9B3BC" },
          }}
        />
      </TableCell>
      <TableCell sx={cellStyle(index)}>
        {row.qty && row.estimated_unit_price
          ? (row.qty * row.estimated_unit_price).toFixed(2)
          : "N/A"}
      </TableCell>
    </TableRow>
  );
};

export default PRItemRow;
