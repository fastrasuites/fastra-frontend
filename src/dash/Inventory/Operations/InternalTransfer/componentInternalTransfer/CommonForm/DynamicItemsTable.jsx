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

const DynamicItemsTable = ({
  items,
  handleRowChange,
  handleRemoveRow,
  rowConfig,
  setMax,
}) => {
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
          setMax={setMax}
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
    <TableContainer
      component={Paper}
      sx={{
        boxShadow: "none",
        borderRadius: "4px",
        border: "solid 1.2px #E2E6E9",
      }}
    >
      <Table
        sx={{
          "& .MuiTableCell-root": { border: "1px" },
          tableLayout: "fixed",
        }}
      >
        <TableHead sx={{ backgroundColor: "#ffffff" }}>
          <TableRow>
            {headers.map((header, index) => (
              <TableCell
                key={index}
                sx={{
                  color: "#7a8a98",
                  fontSize: "14px",
                  fontWeight: 500,
                  p: 1,
                  width: index === 0 ? "40%" : "20%", // Wider product name
                }}
              >
                {header}
              </TableCell>
            ))}
            <TableCell
              sx={{
                color: "#7a8a98",
                fontSize: "14px",
                fontWeight: 500,
                p: 1,
                width: "10%",
              }}
            >
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
