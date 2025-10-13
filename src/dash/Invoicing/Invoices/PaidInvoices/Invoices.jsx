// InvoiceListPagePixelPerfect.jsx
import React, { useState, useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { useTenant } from "../../../../context/TenantContext";
import { useInvoices } from "../../../../context/Invoicing/InvoicesContext";
import { formatDate } from "../../../../helper/helper";
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button,
  Avatar,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  TextField,
  InputAdornment,
  Stack,
  Chip,
  Pagination,
  CircularProgress,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  ViewModule as GridIcon,
  ViewList as ListIcon,
  ArrowBackIos as ArrowBack,
  ArrowForwardIos as ArrowForward,
  MoreVert as MoreVertIcon,
  ArrowDropDown as ArrowDropDownIcon,
} from "@mui/icons-material";

export default function InvoiceListPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState([]);

  const history = useHistory();
  const location = useLocation();
  const { tenantData } = useTenant();
  const { getInvoiceListFiltered, invoiceList, isLoading, error } =
    useInvoices();
  const tenant_schema_name = tenantData?.tenant_schema_name;

  // Get status from query params
  const queryParams = new URLSearchParams(location.search);
  const statusFilter = queryParams.get("status") || "";

  useEffect(() => {
    if (statusFilter) {
      getInvoiceListFiltered({ status: statusFilter }).catch((err) => {
        console.error("Failed to fetch filtered invoices:", err);
        // Error will be handled by the error state in the component
      });
    }
  }, [statusFilter, getInvoiceListFiltered]);

  // Use real data from context
  const invoices = invoiceList.map((invoice) => ({
    id: invoice.id,
    vendor: invoice.vendor_details?.company_name || "Unknown Vendor",
    amountDue: invoice.balance || "0.00",
    currency: "Naira",
    status:
      invoice.status === "paid"
        ? "Paid Invoice"
        : invoice.status === "partial"
        ? "Partially Paid Invoice"
        : invoice.status === "unpaid"
        ? "Unpaid Invoice"
        : invoice.status,
    date_created: invoice.date_created,
    due_date: invoice.due_date,
    total_amount: invoice.total_amount,
    amount_paid: invoice.amount_paid,
  }));

  const rowsPerPage = 6;
  const filtered = invoices.filter(
    (inv) =>
      inv.id.toLowerCase().includes(search.toLowerCase()) ||
      inv.vendor.toLowerCase().includes(search.toLowerCase())
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const displayed = filtered.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  // Show loading state
  if (isLoading) {
    return (
      <Box
        p={3}
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
        flexDirection="column"
      >
        <CircularProgress size={40} />
        <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
          Loading invoices...
        </Typography>
      </Box>
    );
  }

  // Show error state
  if (error) {
    return (
      <Box
        p={3}
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
        flexDirection="column"
      >
        <Typography color="error" variant="h6" gutterBottom>
          Failed to load invoices
        </Typography>
        <Typography color="textSecondary" variant="body2">
          {error}
        </Typography>
      </Box>
    );
  }

  // Show empty state
  if (!isLoading && !error && invoices.length === 0) {
    const statusText =
      statusFilter === "paid"
        ? "paid"
        : statusFilter === "partial"
        ? "partially paid"
        : statusFilter === "unpaid"
        ? "unpaid"
        : "";

    return (
      <Box
        p={3}
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
        flexDirection="column"
      >
        <Typography variant="h6" color="textSecondary" gutterBottom>
          No {statusText} invoices found
        </Typography>
        <Typography variant="body2" color="textSecondary">
          There are currently no {statusText} invoices to display.
        </Typography>
      </Box>
    );
  }

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelected(displayed.map((r) => r.id));
    } else {
      setSelected([]);
    }
  };

  const handleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

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
            {statusFilter === "paid"
              ? "Paid Invoices"
              : statusFilter === "partial"
              ? "Partially Paid Invoices"
              : statusFilter === "unpaid"
              ? "Unpaid Invoices"
              : "Invoices"}
          </Typography>
          <Button
            variant="contained"
            size="small"
            sx={{ textTransform: "none", px: 3 }}
          >
            New Invoice
          </Button>
        </Stack>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems="center"
          mb={2}
          spacing={2}
        >
          <TextField
            size="small"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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

          <Stack direction="row" spacing={1} alignItems="center">
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: 13 }}
            >
              {`${(page - 1) * rowsPerPage + 1}-${Math.min(
                page * rowsPerPage,
                filtered.length
              )} of ${filtered.length}`}
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
                <ArrowBack sx={{ fontSize: 14 }} />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => setPage(Math.min(pageCount, page + 1))}
              >
                <ArrowForward sx={{ fontSize: 14 }} />
              </IconButton>
            </Paper>
          </Stack>
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
                <TableCell padding="checkbox" sx={{ width: 56 }}>
                  <Checkbox
                    size="small"
                    onChange={handleSelectAll}
                    checked={
                      displayed.length > 0 &&
                      selected.length === displayed.length
                    }
                    indeterminate={
                      selected.length > 0 && selected.length < displayed.length
                    }
                    sx={{
                      "& .MuiSvgIcon-root": { fontSize: 18 },
                    }}
                  />
                </TableCell>

                {[
                  "ID",
                  "Vendor",
                  "Date Created",
                  "Due Date",
                  "Amount Due",
                  "Total Amount",
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
              {displayed.map((invoice, idx) => {
                const isSelected = selected.includes(invoice.id);
                const striped = idx % 2 === 0; // adjust starting stripe to match screenshot
                return (
                  <TableRow
                    key={invoice.id}
                    hover
                    selected={isSelected}
                    sx={{
                      height: 64,
                      backgroundColor: striped ? "#f3f4f5" : "transparent",
                      "&.Mui-selected": {
                        backgroundColor: "#eaf7ef !important",
                      },
                    }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        size="small"
                        checked={isSelected}
                        onChange={() => handleSelect(invoice.id)}
                        sx={{
                          "& .MuiSvgIcon-root": { fontSize: 18 },
                        }}
                      />
                    </TableCell>

                    <TableCell
                      sx={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: "text.primary",
                        cursor: "pointer",
                      }}
                      onClick={() =>
                        history.push(
                          `/${tenant_schema_name}/invoicing/invoices/${invoice.id}`
                        )
                      }
                    >
                      {invoice.id}
                    </TableCell>

                    <TableCell sx={{ fontSize: 13, color: "text.secondary" }}>
                      <Typography
                        component="span"
                        sx={{ color: "#6b7280", fontSize: 13 }}
                      >
                        {invoice.vendor}
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ fontSize: 13, color: "text.secondary" }}>
                      {formatDate(invoice.date_created)}
                    </TableCell>

                    <TableCell sx={{ fontSize: 13, color: "warning.main" }}>
                      {formatDate(invoice.due_date)}
                    </TableCell>

                    <TableCell sx={{ fontSize: 13, color: "text.secondary" }}>
                      ₦{Number(invoice.amountDue || 0).toLocaleString()}
                    </TableCell>

                    <TableCell sx={{ fontSize: 13, color: "text.secondary" }}>
                      ₦{Number(invoice.total_amount || 0).toLocaleString()}
                    </TableCell>

                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Box
                          component="span"
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            bgcolor:
                              invoice.status === "Paid Invoice"
                                ? "#2BA24D"
                                : invoice.status === "Partially Paid Invoice"
                                ? "#BF8706"
                                : "#e43e2b",
                            display: "inline-block",
                            boxShadow: `0 0 0 4px rgba(${
                              invoice.status === "Paid Invoice"
                                ? "43,162,77"
                                : invoice.status === "Partially Paid Invoice"
                                ? "191,135,6"
                                : "228,62,43"
                            },0.06)`,
                          }}
                        />
                        <Typography
                          sx={{
                            fontSize: 13,
                            color:
                              invoice.status === "Paid Invoice"
                                ? "#2BA24D"
                                : invoice.status === "Partially Paid Invoice"
                                ? "#BF8706"
                                : "#e43e2b",
                            fontWeight: 500,
                          }}
                        >
                          {invoice.status}
                        </Typography>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}

              {/* filler bottom-row to reproduce the light footer band in screenshot */}
              <TableRow sx={{ height: 40, backgroundColor: "#f1f2f3" }}>
                <TableCell colSpan={7} />
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <Box display="flex" justifyContent="flex-end" mt={2}>
          <Pagination
            count={pageCount}
            page={page}
            onChange={(_, v) => setPage(v)}
            size="small"
            sx={{ "& .MuiPaginationItem-root": { fontSize: 13 } }}
          />
        </Box>
      </Box>
    </Box>
  );
}
