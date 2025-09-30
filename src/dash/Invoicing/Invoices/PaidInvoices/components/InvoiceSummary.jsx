import React from "react";
import { Box, Typography } from "@mui/material";

const InvoiceSummary = ({ invoice, balance }) => {
  const formatCurrency = (value) => {
    if (value == null || isNaN(value)) return "₦0";
    return "₦" + value.toLocaleString();
  };

  return (
    <Box sx={{ backgroundColor: "#f8f9fa", p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Box sx={{ minWidth: 300 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mb: 4,
            }}
          >
            <Typography variant="body1" sx={{ fontWeight: 400, fontSize: 16 }}>
              Total
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 400 }}>
              {formatCurrency(invoice.totalAmount)}
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 4,
            }}
          >
            <Typography variant="body1" sx={{ fontWeight: 400 }}>
              Amount Paid
            </Typography>

            <Typography variant="body1" sx={{ fontWeight: 400 }}>
              {formatCurrency(invoice.totalAmount)}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography
              variant="body1"
              sx={{ color: "#E43D2B", fontWeight: 400 }}
            >
              To Balance
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: "#E43D2B", fontWeight: 400 }}
            >
              {formatCurrency(balance)}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default InvoiceSummary;
