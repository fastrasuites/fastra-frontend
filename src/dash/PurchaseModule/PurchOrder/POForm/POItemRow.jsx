import { Autocomplete, TableCell, TableRow, TextField } from "@mui/material";

const cellStyle = (index) => ({
  backgroundColor: index % 2 === 0 ? "#f2f2f2" : "#fff",
  color: "#7a8a98",
  fontSize: "12px",
});

const RfqItemRow = ({ row, index, handleRowChange, isConversion }) => {
  console.log(row);
  return (
    <TableRow
      key={row.id || index}
      sx={{
        cursor: "pointer",
        "&:last-child td, &:last-child th": { border: 0 },
      }}
    >
      <TableCell sx={cellStyle(index)}>
        <TextField
          value={row.product_details?.product_name || ""}
          variant="standard"
          onChange={(e) =>
            handleRowChange(index, "description", e.target.value)
          }
          sx={{
            width: "100%",
            "& .MuiInput-underline:before": { borderBottomColor: "#C6CCD2" },
            "& .MuiInputBase-input": { color: "#A9B3BC" },
          }}
          disabled={isConversion}
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
          disabled={isConversion}
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
          disabled={isConversion}
        />
      </TableCell>
      <TableCell sx={cellStyle(index)}>
        <TextField
          value={
            row?.product_details.unit_of_measure_details?.unit_category || ""
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
          disabled={isConversion}
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

export default RfqItemRow;
