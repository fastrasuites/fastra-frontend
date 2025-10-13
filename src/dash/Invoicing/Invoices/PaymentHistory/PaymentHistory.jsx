import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Pagination,
  Container,
  CircularProgress,
  Stack,
} from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  NavigateBefore,
  NavigateNext,
} from "@mui/icons-material";
import { Link } from "react-router-dom";
import { useTenant } from "../../../../context/TenantContext";
import { useInvoices } from "../../../../context/Invoicing/InvoicesContext";
import { formatDate } from "../../../../helper/helper";

const getStatusInfo = (status) => {
  switch (status.toLowerCase()) {
    case "paid":
      return { label: "Paid Invoice", text: "#2BA24D", background: "#D1FAE5" };
    case "unpaid":
      return {
        label: "Unpaid Invoice",
        text: "#E43D2B",
        background: "#FEE2E2",
      };
    case "partial":
      return {
        label: "Partially Paid Invoice",
        text: "#F0B501",
        background: "#FEF3C7",
      };
    default:
      return {
        label: status.charAt(0).toUpperCase() + status.slice(1),
        text: "#6B7280",
        background: "#F3F4F6",
      };
  }
};

const PaymentHistory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const { tenantData } = useTenant();
  const tenant_schema_name = tenantData?.tenant_schema_name;
  const { paymentHistory, getPaymentHistory, isLoading } = useInvoices();

  // Fetch payment history on mount
  useEffect(() => {
    getPaymentHistory().catch((err) => {
      console.error("Failed to fetch payment history:", err);
    });
  }, [getPaymentHistory]);

  // Filter payments based on search term
  const filteredPayments = paymentHistory.filter(
    (payment) =>
      payment.id?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.invoice?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.purchase_order
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      payment.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredPayments.length / rowsPerPage);
  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentPayments = filteredPayments.slice(startIndex, endIndex);

  const formatCurrency = (amount) => {
    return `₦${Number(amount || 0).toLocaleString()}`;
  };

  // Show loading state
  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
          backgroundColor: "#F9FAFB",
          padding: "24px 32px",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Show empty state if no payments
  if (!paymentHistory || paymentHistory.length === 0) {
    return (
      <Box
        sx={{
          backgroundColor: "#F9FAFB",
          minHeight: "100vh",
          padding: "24px 32px",
        }}
      >
        <Container maxWidth="xl" sx={{ maxWidth: "1200px" }}>
          <Box
            sx={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E5E7EB",
              borderRadius: "12px",
              padding: "48px",
              textAlign: "center",
            }}
          >
            <Typography variant="h6" sx={{ color: "#6B7280", marginBottom: 2 }}>
              No Payment History Found
            </Typography>
            <Typography variant="body2" sx={{ color: "#9CA3AF" }}>
              There are no payments recorded yet. Create an invoice and make a
              payment to see history here.
            </Typography>
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", py: 4 }}>
      <Box sx={{ px: { xs: 2, md: 6 }, mt: 2 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Payment History
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: 13 }}
            >
              {`${startIndex + 1}-${Math.min(
                endIndex,
                filteredPayments.length
              )} of ${filteredPayments.length}`}
            </Typography>

            <Paper
              elevation={0}
              sx={{
                border: "1px solid #e8eaec",
                display: "inline-flex",
                borderRadius: 1,
              }}
            >
              <IconButton
                size="small"
                onClick={() => setPage(Math.max(1, page - 1))}
              >
                <NavigateBefore sx={{ fontSize: 14 }} />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => setPage(Math.min(totalPages, page + 1))}
              >
                <NavigateNext sx={{ fontSize: 14 }} />
              </IconButton>
            </Paper>
          </Stack>
        </Stack>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems="center"
          mb={2}
          spacing={2}
        >
          <Link
            to={`/${tenant_schema_name}/invoicing/invoices/new`}
            style={{ textDecoration: "none" }}
          >
            <Button
              variant="contained"
              size="small"
              sx={{ textTransform: "none", px: 3 }}
            >
              New Invoice
            </Button>
          </Link>
          <TextField
            size="small"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{
              width: { xs: "100%", sm: 360 },
              "& .MuiInputBase-input": { fontSize: 13, py: "8px" },
            }}
          />
        </Stack>

        {/* Table container */}
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            borderRadius: 2,
            border: "1px solid #e6eaec",
            overflow: "hidden",
            bgcolor: "common.white",
          }}
        >
          <Table sx={{ minWidth: 700 }} size="small">
            <TableHead>
              <TableRow
                sx={{
                  height: 64,
                }}
              >
                {[
                  "Invoice ID",
                  "Purchase Order Reference",
                  "Payment Date",
                  "Amount Paid",
                  "Balance Remaining",
                  "Status",
                ].map((h) => (
                  <TableCell
                    key={h}
                    sx={{
                      color: "text.secondary",
                      fontWeight: 600,
                      fontSize: 13,
                      textTransform: "none",
                      borderBottom: "1px solid #f0f2f4",
                      pb: 0,
                      pt: 0,
                    }}
                  >
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {currentPayments.map((payment, idx) => {
                const statusInfo = getStatusInfo(payment.status);
                const striped = idx % 2 === 0; // adjust starting stripe to match screenshot
                return (
                  <TableRow
                    key={payment.id}
                    hover
                    sx={{
                      height: 64,
                      backgroundColor: striped ? "#f3f4f5" : "transparent",
                    }}
                  >
                    <TableCell
                      sx={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: "text.primary",
                      }}
                    >
                      {payment.invoice}
                    </TableCell>

                    <TableCell sx={{ fontSize: 13, color: "text.secondary" }}>
                      <Typography
                        component="span"
                        sx={{ color: "#6b7280", fontSize: 13 }}
                      >
                        {payment.purchase_order || "N/A"}
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ fontSize: 13, color: "text.secondary" }}>
                      {formatDate(payment.date_created)}
                    </TableCell>

                    <TableCell sx={{ fontSize: 13, color: "text.secondary" }}>
                      {formatCurrency(payment.amount_paid)}
                    </TableCell>

                    <TableCell sx={{ fontSize: 13, color: "text.secondary" }}>
                      {formatCurrency(payment.balance_remaining)}
                    </TableCell>

                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Box
                          component="span"
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            bgcolor: statusInfo.text,
                            display: "inline-block",
                            boxShadow: "0 0 0 4px rgba(43,162,77,0.06)",
                          }}
                        />
                        <Typography
                          sx={{
                            fontSize: 13,
                            color: statusInfo.text,
                            fontWeight: 500,
                          }}
                        >
                          {statusInfo.label}
                        </Typography>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}

              {/* filler bottom-row to reproduce the light footer band in screenshot */}
              <TableRow sx={{ height: 40, backgroundColor: "#f1f2f3" }}>
                <TableCell colSpan={6} />
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <Box display="flex" justifyContent="flex-end" mt={2}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, v) => setPage(v)}
            size="small"
            sx={{ "& .MuiPaginationItem-root": { fontSize: 13 } }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default PaymentHistory;
