// InvoiceListPagePixelPerfect.jsx
import React, { useState } from "react";
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
  const [view] = useState("table");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState([]);

  // sample data (replace with your data)
  const invoices = [
    {
      id: "INV0001",
      vendor: "xyz Vendor",
      amountDue: "00.00",
      currency: "Naira",
      status: "Paid Invoice",
    },
    {
      id: "INV0002",
      vendor: "xyz Vendor",
      amountDue: "00.00",
      currency: "Naira",
      status: "Paid Invoice",
    },
    {
      id: "INV0003",
      vendor: "xyz Vendor",
      amountDue: "00.00",
      currency: "Naira",
      status: "Paid Invoice",
    },
    {
      id: "INV0004",
      vendor: "xyz Vendor",
      amountDue: "00.00",
      currency: "Naira",
      status: "Paid Invoice",
    },
    {
      id: "INV0005",
      vendor: "xyz Vendor",
      amountDue: "00.00",
      currency: "Naira",
      status: "Paid Invoice",
    },
    {
      id: "INV0006",
      vendor: "xyz Vendor",
      amountDue: "00.00",
      currency: "Naira",
      status: "Paid Invoice",
    },
  ];

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
            Paid Invoice
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

                {["ID", "Vendor", "Amount Due", "Currency", "Status"].map(
                  (h) => (
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
                  )
                )}
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
                      }}
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
                      {invoice.amountDue}
                    </TableCell>

                    <TableCell sx={{ fontSize: 13, color: "text.secondary" }}>
                      {invoice.currency}
                    </TableCell>

                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Box
                          component="span"
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            bgcolor: "#2BA24D",
                            display: "inline-block",
                            boxShadow: "0 0 0 4px rgba(43,162,77,0.06)",
                          }}
                        />
                        <Typography
                          sx={{
                            fontSize: 13,
                            color: "#2BA24D",
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
                <TableCell colSpan={6} />
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
