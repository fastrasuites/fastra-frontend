import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

const InvoiceItemsTable = ({ invoice }) => {
  const formatCurrency = (value) => {
    if (value == null || isNaN(value)) return "₦0";
    return "₦" + value.toLocaleString();
  };

  return (
    <TableContainer sx={{ px: 4, mb: 10 }}>
      <Table>
        <TableHead>
          <TableRow
            sx={{
              px: 4,
              borderRight: "1px solid #E2E6E9",
              borderLeft: "1px solid #E2E6E9",
            }}
          >
            <TableCell sx={{ color: "#666", fontWeight: 500, py: 3 }}>
              Product Name
            </TableCell>
            <TableCell
              align="center"
              sx={{ color: "#666", fontWeight: 500, py: 2 }}
            >
              QTY
            </TableCell>
            <TableCell
              align="right"
              sx={{ color: "#666", fontWeight: 500, py: 2 }}
            >
              Unit Price
            </TableCell>
            <TableCell
              align="right"
              sx={{ color: "#666", fontWeight: 500, py: 2 }}
            >
              Total Price
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {invoice.items.map((it, idx) => (
            <TableRow
              key={idx}
              sx={{
                backgroundColor: "#f8f9fa",
                borderRight: "1px solid #E2E6E9",
                borderLeft: "1px solid #E2E6E9",
              }}
            >
              <TableCell sx={{ py: 2, color: "#333" }}>{it.name}</TableCell>
              <TableCell align="center" sx={{ py: 3, color: "#333" }}>
                {it.qty}
              </TableCell>
              <TableCell align="right" sx={{ py: 3, color: "#999" }}>
                {formatCurrency(it.unitPrice)}
              </TableCell>
              <TableCell align="right" sx={{ py: 3, color: "#333" }}>
                {formatCurrency(it.totalPrice)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default InvoiceItemsTable;
