import React from "react";
import { Box, Button } from "@mui/material";

const InvoiceActions = ({
  status,
  onViewPaymentHistory,
  onCompletePayment,
  onMakePayment,
  onMakePartialPayment,
}) => {
  const renderButtons = () => {
    switch (status) {
      case "paid":
        return (
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
        );
      case "partially_paid":
        return (
          <Box sx={{ display: "flex", gap: 2 }}>
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
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#4caf50",
                textTransform: "none",
                px: 3,
                py: 1,
                borderRadius: 1,
                "&:hover": { backgroundColor: "#388e3c" },
              }}
              onClick={onCompletePayment}
            >
              Complete Payment
            </Button>
          </Box>
        );
      case "unpaid":
        return (
          <Box
            sx={{
              display: "flex",
              gap: 2,
              width: "100%",
              justifyContent: "end",
            }}
          >
            <Button
              disableElevation
              variant="outlined"
              onClick={() => window.history.back()}
            >
              Cancel
            </Button>
            <Button
              disableElevation
              variant="contained"
              onClick={onMakePayment}
            >
              Make Payment
            </Button>
            <Button
              variant="contained"
              disableElevation
              onClick={onMakePartialPayment}
            >
              Make Partial Payment
            </Button>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 3,
        backgroundColor: "white",
      }}
    >
      {renderButtons()}
    </Box>
  );
};

export default InvoiceActions;
