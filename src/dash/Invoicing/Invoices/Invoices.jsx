import {
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Container,
  // useTheme,
  // useMediaQuery,
  CircularProgress,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Notifications as NotificationsIcon,
  MoreVert as MoreVertIcon,
  GridView as GridViewIcon,
  ViewList as ViewListIcon,
  NavigateBefore,
  NavigateNext,
  Close as CloseIcon,
  CalendarToday as CalendarIcon,
} from "@mui/icons-material";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTenant } from "../../../context/TenantContext";
import { useInvoices } from "../../../context/Invoicing/InvoicesContext";
import { formatDate } from "../../../helper/helper";

const SummaryCard = ({ title, count, color, viewAll }) => (
  <Card
    sx={{
      minHeight: 150,
      background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
      color: "white",
      cursor: "pointer",
      transition: "transform 0.2s",
      "&:hover": { transform: "translateY(-4px)" },
    }}
  >
    <CardContent>
      <Typography variant="h3" fontWeight="bold">
        {count}
      </Typography>
      <Typography variant="body1" sx={{ mb: 1 }}>
        {title}
      </Typography>
      <Typography variant="body2" sx={{ textDecoration: "underline" }}>
        {viewAll}
      </Typography>
    </CardContent>
  </Card>
);

const InvoiceCard = ({ invoice }) => {
  const statusColorMap = {
    paid: "#2BA24D",
    partially_paid: "#F0B501",
    unpaid: "#E43D2B",
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="start"
          mb={2}
        >
          <Typography variant="h6" fontWeight="bold">
            {invoice.id}
          </Typography>
          <IconButton size="small">
            <MoreVertIcon />
          </IconButton>
        </Box>
        <Typography color="textSecondary" gutterBottom>
          {invoice.vendor_details?.company_name || "Unknown Vendor"}
        </Typography>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          {formatDate(invoice.date_created)}
        </Typography>
        <Typography variant="body2" color="warning.main" gutterBottom>
          Due: {formatDate(invoice.due_date)}
        </Typography>
        <Box mt={2}>
          <Chip
            label={invoice.status.replace("_", " ").toUpperCase()}
            size="small"
            sx={{
              fontWeight: 500,
              backgroundColor: statusColorMap[invoice.status] || "#FFA500",
              color: "white",
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

const Invoices = () => {
  // const theme = useTheme();
  // const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [selectedLocation, setSelectedLocation] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("list");
  const { tenantData } = useTenant();
  const { activeInvoiceList, getActiveInvoiceList, isLoading, error } =
    useInvoices();
  const tenant_schema_name = tenantData?.tenant_schema_name;

  // Fetch active invoices on mount
  useEffect(() => {
    getActiveInvoiceList().catch((err) => {
      console.error("Failed to fetch active invoices:", err);
    });
  }, [getActiveInvoiceList]);

  // Summary statistics
  const summaryStats = {
    paid: activeInvoiceList.filter((inv) => inv.status === "paid").length,
    partiallyPaid: activeInvoiceList.filter(
      (inv) => inv.status === "partially_paid"
    ).length,
    unpaid: activeInvoiceList.filter((inv) => inv.status === "unpaid").length,
  };

  const formatCurrency = (amount) => {
    return `₦${Number(amount || 0).toLocaleString()}`;
  };

  // Filter invoices based on search term
  const filteredInvoices = activeInvoiceList.filter(
    (invoice) =>
      invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.vendor_details?.company_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
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
      >
        <CircularProgress />
      </Box>
    );
  }

  // Show error state
  if (error) {
    return (
      <Box p={3}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box p={3} sx={{ maxWidth: "1530px", marginInline: "auto" }}>
      <Box>
        {/* Summary Cards */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography variant="h5" fontWeight="bold">
            Invoices
          </Typography>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Select Location</InputLabel>
            <Select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              label="Select Location"
            >
              <MenuItem value="location1">Location 1</MenuItem>
              <MenuItem value="location2">Location 2</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <SummaryCard
              title="Paid Invoices"
              count={summaryStats.paid}
              color="#4caf50"
              viewAll="View all"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <SummaryCard
              title="Partially Paid Invoices"
              count={summaryStats.partiallyPaid}
              color="#ff9800"
              viewAll="View all"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <SummaryCard
              title="Unpaid Invoices"
              count={summaryStats.unpaid}
              color="#f44336"
              viewAll="View all"
            />
          </Grid>
        </Grid>

        {/* Controls */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 3 }}
        >
          <Box display="flex" gap={2}>
            <Link to={`/${tenant_schema_name}/invoicing/invoices/new`}>
              <Button variant="contained">New Invoice</Button>
            </Link>
            <TextField
              size="small"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ width: 200 }}
            />
          </Box>

          <Box display="flex" gap={2} alignItems="center">
            <Typography variant="body2" color="textSecondary">
              {filteredInvoices.length > 0
                ? `1-${filteredInvoices.length} of ${filteredInvoices.length}`
                : "0 of 0"}
            </Typography>
            <IconButton size="small">
              <NavigateBefore />
            </IconButton>
            <IconButton size="small">
              <NavigateNext />
            </IconButton>
            <IconButton
              color={viewMode === "grid" ? "primary" : "default"}
              onClick={() => setViewMode("grid")}
            >
              <GridViewIcon />
            </IconButton>
            <IconButton
              color={viewMode === "list" ? "primary" : "default"}
              onClick={() => setViewMode("list")}
            >
              <ViewListIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Content */}
        {viewMode === "grid" ? (
          <Grid container spacing={3}>
            {filteredInvoices.map((invoice) => (
              <Grid item xs={12} sm={6} md={4} key={invoice.id}>
                <InvoiceCard invoice={invoice} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <TableContainer
            component={Paper}
            elevation={"none"}
            sx={{ border: "1px solid #f1ececff" }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox"></TableCell>
                  <TableCell>Invoice ID</TableCell>
                  <TableCell>Vendor</TableCell>
                  <TableCell>Date Created</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell>Amount Due</TableCell>
                  <TableCell>Total Amount</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredInvoices.map((invoice, index) => {
                  const statusColorMap = {
                    paid: "#2BA24D",
                    partially_paid: "#F0B501",
                    unpaid: "#E43D2B",
                  };
                  return (
                    <TableRow
                      key={invoice.id}
                      sx={{
                        backgroundColor: `${
                          index % 2 === 0 ? "#f1ececff" : ""
                        }`,
                      }}
                    >
                      <TableCell padding="checkbox">
                        <input type="checkbox" />
                      </TableCell>
                      <TableCell>{invoice.id}</TableCell>
                      <TableCell>
                        {invoice.vendor_details?.company_name ||
                          "Unknown Vendor"}
                      </TableCell>
                      <TableCell>{formatDate(invoice.date_created)}</TableCell>
                      <TableCell sx={{ color: "warning.main" }}>
                        {formatDate(invoice.due_date)}
                      </TableCell>
                      <TableCell>{formatCurrency(invoice.balance)}</TableCell>
                      <TableCell>
                        {formatCurrency(invoice.total_amount)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={invoice.status.replace("_", " ").toUpperCase()}
                          size="small"
                          sx={{
                            backgroundColor:
                              statusColorMap[invoice.status] || "#FFA500",
                            color: "white",
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Box>
  );
};

export default Invoices;
