import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { Info as InfoIcon } from "@mui/icons-material";

const InvoiceHeader = ({ onNewInvoice }) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-start",
        gap: 26,
        alignItems: "center",
        mb: 3,
      }}
    >
      <Button
        variant="contained"
        disableElevation
        sx={{
          backgroundColor: "#3B7CED",
          textTransform: "none",
          px: 3,
          py: 1,
          borderRadius: 1,
          "&:hover": { backgroundColor: "#3367d6" },
        }}
        onClick={onNewInvoice}
      >
        New Invoice
      </Button>
      <Box sx={{ display: "flex", alignItems: "center", color: "#999" }}>
        <Typography variant="body2" sx={{ mr: 1 }}>
          Autosaved
        </Typography>
        <InfoIcon sx={{ fontSize: 16 }} />
      </Box>
    </Box>
  );
};

export default InvoiceHeader;
