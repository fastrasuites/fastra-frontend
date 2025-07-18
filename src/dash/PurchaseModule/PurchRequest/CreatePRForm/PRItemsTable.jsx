import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { useMemo } from "react";
import PRItemRow from "./PRItemRow";
// import RfqItemRow from "./PRItemRow";

const PRItemsTable = ({ items, handleRowChange, products }) => {
  const renderedRows = useMemo(() => {
    if (Array.isArray(items) && items.length > 0) {
      return items.map((row, index) => (
        <PRItemRow
          key={row.id || index}
          row={row}
          index={index}
          handleRowChange={handleRowChange}
          products={products}
        />
      ));
    }
    return (
      <TableRow>
        <TableCell
          colSpan={6}
          align="center"
          sx={{ color: "#7a8a98", fontSize: "12px" }}
        >
          No items available
        </TableCell>
      </TableRow>
    );
  }, [items, handleRowChange, products]);

  return (
    <TableContainer
      component={Paper}
      sx={{ boxShadow: "none", borderRadius: "10px" }}
    >
      <Table
        sx={{
          "&.MuiTable-root": { border: "none" },
          "& .MuiTableCell-root": { border: "none" },
        }}
      >
        <TableHead sx={{ backgroundColor: "#f2f2f2" }}>
          <TableRow>
            <TableCell>Product Name</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Qty</TableCell>
            <TableCell>Unit of Measure</TableCell>
            <TableCell>Estimated Unit Price</TableCell>
            <TableCell>Total Price</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>{renderedRows}</TableBody>
      </Table>
    </TableContainer>
  );
};

export default PRItemsTable;
