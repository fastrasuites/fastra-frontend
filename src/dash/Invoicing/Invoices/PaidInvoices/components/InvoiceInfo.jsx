import React from "react";
import { Box, Typography, Grid } from "@mui/material";

const InvoiceInfo = ({ invoice }) => {
  return (
    <Box
      sx={{
        mx: 4,
        pb: 3,
        mb: 3,
        backgroundColor: "white",
        borderBottom: "1px solid #E2E6E9",
      }}
    >
      <Grid container spacing={4} sx={{ maxWidth: "80%" }}>
        <Grid item xs={12} sm={2}>
          <Typography
            variant="body2"
            sx={{ color: "#1A1A1A", fontWeight: 500, mb: 0.5 }}
          >
            ID
          </Typography>
          <Typography variant="body1" sx={{ color: "#7A8A98" }}>
            {invoice.id}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={2}>
          <Typography
            variant="body2"
            sx={{ color: "#666", fontWeight: 500, mb: 0.5 }}
          >
            Vendor
          </Typography>
          <Typography variant="body1" sx={{ color: "#333" }}>
            {invoice.vendor}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Typography
            variant="body2"
            sx={{ color: "#666", fontWeight: 500, mb: 0.5 }}
          >
            Date Created
          </Typography>
          <Typography variant="body1" sx={{ color: "#333" }}>
            {invoice.dateCreated}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={2}>
          <Typography
            variant="body2"
            sx={{ color: "#666", fontWeight: 500, mb: 0.5 }}
          >
            Due Date
          </Typography>
          <Typography variant="body1" sx={{ color: "#ff9800" }}>
            {invoice.dueDate}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={2}>
          <Typography
            variant="body2"
            sx={{ color: "#666", fontWeight: 500, mb: 0.5 }}
          >
            Total Amount
          </Typography>
          <Typography variant="body1" sx={{ color: "#333" }}>
            {formatCurrency(invoice.totalAmount)}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={1}>
          <Typography
            variant="body2"
            sx={{ color: "#666", fontWeight: 500, mb: 0.5 }}
          >
            Status
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              width: "fit-content",
            }}
          >
            <Box
              sx={{
                width: 10,
                height: 10,
                bgcolor: invoice.status.color,
                borderRadius: "50%",
                mb: 1,
              }}
            />
            <Typography
              variant="body2"
              sx={{
                color: invoice.status.color,
                height: 24,
                "& .MuiChip-label": { px: 1 },
                whiteSpace: "nowrap",
              }}
            >
              {invoice.status.text}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

const formatCurrency = (value) => {
  if (value == null || isNaN(value)) return "₦0";
  return "₦" + value.toLocaleString();
};

export default InvoiceInfo;
