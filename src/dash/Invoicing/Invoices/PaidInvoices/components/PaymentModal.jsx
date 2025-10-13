import React from "react";
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  TextField,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
  Button,
  IconButton,
  CssBaseline,
  createTheme,
  ThemeProvider,
} from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import Swal from "sweetalert2";

const theme = createTheme({
  palette: {
    primary: {
      main: "#3b82f6",
    },
  },
  typography: {
    fontFamily: "Inter, Roboto, Helvetica, Arial, sans-serif",
  },
});

export default function PaymentModal({
  open,
  onClose,
  invoiceId,
  makePayment,
  onSuccess,
  paymentType,
  totalAmount,
  balance,
}) {
  const [amount, setAmount] = React.useState("");
  const [date, setDate] = React.useState("");
  const [method, setMethod] = React.useState("");
  const [reference, setReference] = React.useState(invoiceId || "");
  const [notes, setNotes] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Prefill amount based on payment type
  React.useEffect(() => {
    if (paymentType === "full") {
      setAmount(totalAmount?.toString() || "");
    } else if (paymentType === "partial") {
      setAmount(""); // Leave empty for partial payments
    } else if (paymentType === "complete") {
      setAmount(balance?.toString() || "");
    }
  }, [paymentType, totalAmount, balance]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || !method) {
      Swal.fire({
        title: "Error",
        text: "Please fill in all required fields",
        icon: "error",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      await makePayment({
        amount_paid: parseFloat(amount),
        reference_id: reference,
        payment_method: method,
        notes: notes,
      });
      Swal.fire({
        title: "Success",
        text: "Payment processed successfully",
        icon: "success",
      });
      onSuccess();
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: error.response?.data?.message || "Failed to process payment",
        icon: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth={false}
        BackdropProps={{
          sx: {
            background: "rgba(0,0,0,0.45)",
            backdropFilter: "blur(6px)",
          },
        }}
        PaperProps={{
          sx: {
            borderRadius: "16px",
            width: 520,
            boxShadow:
              "0 20px 40px rgba(2,6,23,0.4), 0 2px 8px rgba(2,6,23,0.08)",
            overflow: "visible",
          },
        }}
      >
        <DialogContent sx={{ p: 6 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
            Payment
          </Typography>
          <Typography variant="body2" sx={{ color: "#6b7280", mb: 3 }}>
            Fill appropriately
          </Typography>

          <Box
            component="form"
            noValidate
            autoComplete="off"
            onSubmit={handleSubmit}
          >
            <TextField
              fullWidth
              placeholder="Enter payment amount"
              label="Payment Amount"
              variant="outlined"
              size="medium"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              sx={{
                mb: 3,
                "& .MuiInputLabel-root": { color: "#374151" },
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  bgcolor: "transparent",
                  "& fieldset": { borderColor: "#7A8A98" },
                  "&:hover fieldset": { borderColor: "#cfd6dd" },
                },
              }}
            />

            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
              <TextField
                placeholder="Select Date"
                label="Payment Date"
                variant="outlined"
                size="medium"
                fullWidth
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    "& fieldset": { borderColor: "#7A8A98" },
                  },
                }}
              />
            </Box>

            <FormControl fullWidth variant="outlined" sx={{ mb: 3 }}>
              <Typography sx={{ fontSize: 14, color: "#374151", mb: 1 }}>
                Payment Method
              </Typography>

              <Select
                displayEmpty
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                renderValue={(selected) => {
                  if (!selected) return "Select Payment Method";
                  return selected;
                }}
                IconComponent={ArrowDropDownIcon}
                sx={{
                  "& .MuiSelect-select": {
                    padding: "14px 12px",
                    borderRadius: 2,
                  },
                  "& fieldset": { borderColor: "#7A8A98" },
                }}
              >
                <MenuItem value="">Select Payment Method</MenuItem>
                <MenuItem value="bank">Bank Transfer</MenuItem>
                <MenuItem value="card">Card</MenuItem>
                <MenuItem value="cash">Cash</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              placeholder="Input Reference No"
              label="Reference ID"
              variant="outlined"
              size="medium"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              sx={{
                mb: 3,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  "& fieldset": { borderColor: "#7A8A98" },
                },
              }}
            />

            <TextField
              fullWidth
              placeholder="Type here... (Optional)"
              label="Additional Note"
              variant="outlined"
              size="medium"
              multiline
              minRows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              sx={{
                mb: 4,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  "& fieldset": { borderColor: "#7A8A98" },
                },
              }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isSubmitting}
              sx={{
                height: 54,
                textTransform: "none",
                fontSize: 16,
                fontWeight: 600,
                boxShadow:
                  "0 10px 20px rgba(59,130,246,0.12), inset 0 -6px 12px rgba(255,255,255,0.04)",
              }}
            >
              {isSubmitting ? "Processing..." : "Confirm"}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </ThemeProvider>
  );
}
