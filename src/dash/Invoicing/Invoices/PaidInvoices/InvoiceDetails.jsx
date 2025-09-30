import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Container,
  CircularProgress,
} from "@mui/material";
import Swal from "sweetalert2";
import { useInvoice } from "../../../../context/Invoice/InvoiceContext";
import InvoiceHeader from "./components/InvoiceHeader";
import InvoiceInfo from "./components/InvoiceInfo";
import InvoiceItemsTable from "./components/InvoiceItemsTable";
import InvoiceSummary from "./components/InvoiceSummary";
import InvoiceActions from "./components/InvoiceActions";

const InvoiceDetailsPage = () => {
  const { id } = useParams();
  const { singleInvoice, getSingleInvoice, isLoading, error } = useInvoice();

  useEffect(() => {
    if (id) {
      getSingleInvoice(id);
    }
  }, [id, getSingleInvoice]);

  const invoice = singleInvoice;

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <Typography color="error">Error loading invoice: {error}</Typography>
      </Box>
    );
  }

  if (!invoice) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <Typography>No invoice found.</Typography>
      </Box>
    );
  }

  // Transform API data to component expected format
  const transformedInvoice = {
    id: invoice.id,
    vendor: invoice.vendor_details?.company_name || "Unknown Vendor",
    dateCreated: new Date(invoice.date_created).toLocaleString(),
    dueDate: invoice.due_date,
    totalAmount: parseFloat(invoice.total_amount || 0),
    status: {
      text:
        invoice.status === "paid"
          ? "Paid Invoice"
          : invoice.status.charAt(0).toUpperCase() +
            invoice.status.slice(1) +
            " Invoice",
      color: invoice.status === "paid" ? "#2BA24D" : "#FFA500", // green for paid, orange for others
    },
    items: (invoice.invoice_items || []).map((item) => ({
      name: item.product_details?.product_name || "Unknown Product",
      qty: item.quantity,
      unitPrice: parseFloat(item.unit_price || 0),
      totalPrice: item.quantity * parseFloat(item.unit_price || 0),
    })),
    amountPaid: parseFloat(invoice.amount_paid || 0),
  };

  const balance = parseFloat(invoice.balance || 0);

  const handleSave = async () => {
    // For details page, save might not be applicable, but keeping placeholder
    Swal.fire({
      title: "Info",
      text: "Save functionality not implemented for details view.",
      icon: "info",
    });
  };

  const handleCancel = () => {
    Swal.fire({
      title: "Info",
      text: "Cancel functionality not applicable for details view.",
      icon: "info",
    });
  };

  const handleViewPaymentHistory = () => {
    // Example mock payment history — adapt to your actual data.
    const payments = [
      { date: "2024-04-10", amount: 100000, method: "Bank Transfer" },
      { date: "2024-04-20", amount: 100000, method: "POS" },
    ];
    const html = payments
      .map(
        (p) =>
          `<div style="margin-bottom:8px;"><strong>${p.date}</strong> — ${
            "₦" + p.amount.toLocaleString()
          } <em>(${p.method})</em></div>`
      )
      .join("");

    Swal.fire({
      title: "Payment history",
      html: html || "<div>No payments found.</div>",
      confirmButtonText: "Close",
    });
  };

  const handleClose = () => {
    Swal.fire({
      title: "Close",
      text: "Close invoice details?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Close",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        // Navigate back or close modal - adapt to your routing
        Swal.fire({
          title: "Closed",
          text: "Invoice details closed.",
          icon: "success",
        });
      }
    });
  };

  return (
    <Box sx={{ minHeight: "100vh" }}>
      {/* Header */}

      <Container maxWidth="xl" sx={{ py: 3 }}>
        <InvoiceHeader
          onNewInvoice={() =>
            Swal.fire({
              title: "Action",
              text: "Create new invoice action.",
              icon: "info",
            })
          }
        />

        {/* Invoice Details Card */}
        <Box
          sx={{
            border: "1px solid #E2E6E9",
            overflow: "hidden",
            bgcolor: "white",
            marginRight: 2,
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              p: 4,
            }}
          >
            <Typography
              variant="h6"
              sx={{ color: "#3B7CED", fontWeight: 400, fontSize: 20 }}
            >
              Invoice Details Page
            </Typography>
            <Button
              sx={{
                color: "#3B7CED",
                textTransform: "none",
                "&:hover": { backgroundColor: "transparent" },
              }}
              onClick={handleClose}
            >
              Close
            </Button>
          </Box>

          <InvoiceInfo invoice={transformedInvoice} />

          <InvoiceItemsTable invoice={transformedInvoice} />

          <InvoiceSummary invoice={transformedInvoice} balance={balance} />

          <InvoiceActions
            onViewPaymentHistory={handleViewPaymentHistory}
            onCancel={handleCancel}
            onSave={handleSave}
            isSaving={false}
          />
        </Box>

        {/* Bottom Right Link */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
          <Button
            sx={{
              color: "#666",
              textTransform: "none",
              "&:hover": { backgroundColor: "transparent" },
            }}
            onClick={handleViewPaymentHistory}
            endIcon={<Box sx={{ ml: 1 }}>📋</Box>}
          >
            View Payment History
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default InvoiceDetailsPage;
