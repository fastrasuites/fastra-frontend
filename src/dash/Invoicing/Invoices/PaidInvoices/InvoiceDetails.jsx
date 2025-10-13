import React, { useEffect, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Container,
  CircularProgress,
} from "@mui/material";
import Swal from "sweetalert2";
import { useTenant } from "../../../../context/TenantContext";
import { useInvoices } from "../../../../context/Invoicing/InvoicesContext";
import InvoiceHeader from "./components/InvoiceHeader";
import InvoiceInfo from "./components/InvoiceInfo";
import InvoiceItemsTable from "./components/InvoiceItemsTable";
import InvoiceSummary from "./components/InvoiceSummary";
import InvoiceActions from "./components/InvoiceActions";
import PaymentModal from "./components/PaymentModal";

const InvoiceDetailsPage = () => {
  const { invoiceId: id } = useParams();
  const history = useHistory();
  const { tenantData } = useTenant();
  const { singleInvoice, getSingleInvoice, isLoading, error, makePayment } =
    useInvoices();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState({
    open: false,
    type: null,
  });

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

  // Helper function to get status info
  const getStatusInfo = (status) => {
    switch (status) {
      case "unpaid":
        return { text: "Unpaid Invoice", color: "#E43D2B" };
      case "partial":
      case "partially_paid":
        return { text: "Partially Paid Invoice", color: "#F0B501" };
      case "paid":
        return { text: "Paid Invoice", color: "#2BA24D" };
      default:
        return {
          text:
            status.charAt(0).toUpperCase() +
            status.slice(1).replace(/_/g, " ") +
            " Invoice",
          color: "#FFA500",
        };
    }
  };

  // Transform API data to component expected format
  const transformedInvoice = {
    id: invoice.id,
    vendor: invoice.vendor_details?.company_name || "Unknown Vendor",
    dateCreated: new Date(invoice.date_created).toLocaleString(),
    dueDate: invoice.due_date,
    totalAmount: parseFloat(invoice.total_amount || 0),
    status: getStatusInfo(invoice.status),
    items: (invoice.invoice_items || []).map((item) => ({
      name: item.product_details?.product_name || "Unknown Product",
      qty: item.quantity,
      unitPrice: parseFloat(item.unit_price || 0),
      totalPrice: item.quantity * parseFloat(item.unit_price || 0),
    })),
    amountPaid: parseFloat(invoice.amount_paid || 0),
  };

  const balance = parseFloat(invoice.balance || 0);

  const handleViewPaymentHistory = () => {
    // Navigate to payment history page with invoice filter
    history.push(
      `/${
        tenantData?.tenant_schema_name || "default"
      }/invoicing/payment-history?invoice=${id}`
    );
  };

  const handleClose = () => {
    window.history.back();
  };

  const handleCompletePayment = () => {
    setIsPaymentModalOpen({ open: true, type: "complete" });
  };

  const handleMakePayment = () => {
    setIsPaymentModalOpen({ open: true, type: "full" });
  };

  const handleMakePartialPayment = () => {
    setIsPaymentModalOpen({ open: true, type: "partial" });
  };

  return (
    <Box sx={{ minHeight: "100vh" }}>
      {/* Header */}
      <PaymentModal
        open={isPaymentModalOpen.open}
        onClose={() => setIsPaymentModalOpen({ open: false, type: null })}
        invoiceId={invoice.id}
        makePayment={makePayment}
        paymentType={isPaymentModalOpen.type}
        totalAmount={transformedInvoice.totalAmount}
        balance={balance}
        onSuccess={() => {
          setIsPaymentModalOpen({ open: false, type: null });
          getSingleInvoice(id); // Refetch invoice
        }}
      />
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
            status={invoice.status}
            onViewPaymentHistory={handleViewPaymentHistory}
            onCompletePayment={handleCompletePayment}
            onMakePayment={handleMakePayment}
            onMakePartialPayment={handleMakePartialPayment}
          />
        </Box>
      </Container>
    </Box>
  );
};

export default InvoiceDetailsPage;
