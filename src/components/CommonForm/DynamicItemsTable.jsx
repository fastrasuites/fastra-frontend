// DynamicItemsTable.jsx
import React, { useMemo } from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import DynamicItemRow from "./DynamicItemRow";

const DynamicItemsTable = ({ items, handleRowChange, handleRemoveRow, rowConfig }) => {
  const headers = rowConfig.map((cfg) => cfg.label);

  const renderedRows = useMemo(() => {
    if (items.length > 0) {
      return items.map((row, index) => (
        <DynamicItemRow
          key={row.id || index}
          index={index}
          row={row}
          handleRowChange={handleRowChange}
          handleRemoveRow={handleRemoveRow}
          rowConfig={rowConfig}
        />
      ));
    }
    return (
      <TableRow>
        <TableCell
          colSpan={headers.length}
          align="center"
          sx={{ color: "#7a8a98", fontSize: "12px" }}
        >
          No items available
        </TableCell>
      </TableRow>
    );
  }, [items, handleRowChange, handleRemoveRow, rowConfig, headers.length]);

  return (
    <TableContainer component={Paper} sx={{ boxShadow: "none", borderRadius: "10px" }}>
      <Table sx={{ "& .MuiTableCell-root": { border: "none" } }}>
        <TableHead sx={{ backgroundColor: "#f2f2f2" }}>
          <TableRow>
            {headers.map((header, index) => (
              <TableCell
                key={index}
                sx={{ color: "#7a8a98", fontSize: "14px", fontWeight: 500, p: 1 }}
              >
                {header}
              </TableCell>
            ))}
            <TableCell sx={{ color: "#7a8a98", fontSize: "14px", fontWeight: 500, p: 1 }}>
              {/* Actions */}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>{renderedRows}</TableBody>
      </Table>
    </TableContainer>
  );
};

export default DynamicItemsTable;
