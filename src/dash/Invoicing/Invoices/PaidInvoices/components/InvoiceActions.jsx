import React from "react";
import { Box, Button } from "@mui/material";

const InvoiceActions = ({
  onViewPaymentHistory,
  onCancel,
  onSave,
  isSaving,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        p: 3,
        backgroundColor: "white",
      }}
    >
      <Button
        variant="contained"
        sx={{
          backgroundColor: "#4285f4",
          textTransform: "none",
          px: 3,
          py: 1,
          borderRadius: 1,
          "&:hover": { backgroundColor: "#3367d6" },
        }}
        onClick={onViewPaymentHistory}
      >
        View Payment History
      </Button>

      <Box sx={{ display: "flex", gap: 2 }}>
        <Button
          variant="outlined"
          sx={{
            color: "#1976d2",
            borderColor: "#1976d2",
            textTransform: "none",
            px: 3,
            py: 1,
            borderRadius: 1,
            "&:hover": { backgroundColor: "rgba(25, 118, 210, 0.04)" },
          }}
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          sx={{
            backgroundColor: "#4285f4",
            textTransform: "none",
            px: 3,
            py: 1,
            borderRadius: 1,
            "&:hover": { backgroundColor: "#3367d6" },
          }}
          onClick={onSave}
          disabled={isSaving}
        >
          Save
        </Button>
      </Box>
    </Box>
  );
};

export default InvoiceActions;
