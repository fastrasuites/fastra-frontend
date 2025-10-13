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
import DraftIcon from "../../../image/icons/draft.png";
import React, { useState, useEffect } from "react";
import { Link, useHistory } from "react-router-dom";
import { useTenant } from "../../../context/TenantContext";
import { useInvoices } from "../../../context/Invoicing/InvoicesContext";
import { formatDate } from "../../../helper/helper";

const getStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case "paid":
      return "#2ba24d";
    case "patial":
      return "#BF8706";
    case "unpaid":
      return "#e43e2b";
    default:
      return "#9e9e9e";
  }
};
const paymentStatus = {
  paid: "Paid",
  partial: "Partially Paid",
  unpaid: "Unpaid",
};

const SummaryCard = ({
  title,
  count,
  color1,
  color2,
  viewAll,
  draftIcon,
  onClick,
}) => (
  <Card
    sx={{
      minHeight: 150,
      background: `linear-gradient(225deg, ${color1} 0%, ${color2} 100%)`,
      borderImageSource: `linear-gradient(225deg, ${color1} 0%, ${color2} 100%)`,
      boxShadow: "0px 4px 4px 0px #00000040;",
      borderRadius: "4px",
      color: "#FAFAFA",
      cursor: "pointer",
      transition: "transform 0.2s",
      "&:hover": { transform: "translateY(-4px)" },
    }}
    onClick={onClick}
  >
    <CardContent>
      <img src={draftIcon} alt="Draft Icon" />
      <Typography variant="h3" fontWeight="400" mt={1}>
        {count}
      </Typography>
      <Typography variant="body1" sx={{ mb: 1 }}>
        {title}
      </Typography>
      <Typography
        variant="body2"
        sx={{ textDecoration: "underline", textUnderlineOffset: "4px" }}
      >
        {viewAll}
      </Typography>
    </CardContent>
  </Card>
);

const InvoiceCard = ({ invoice, tenant_schema_name }) => {
  const history = useHistory();

  const handleCardClick = () => {
    history.push(`/${tenant_schema_name}/invoicing/invoices/${invoice.id}`);
  };

  return (
    <Card sx={{ mb: 2, cursor: "pointer" }} onClick={handleCardClick}>
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
          <Box display="flex" alignItems="center">
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: getStatusColor(invoice.status),
                mr: 1,
              }}
            />
            <Typography
              variant="caption"
              sx={{ textTransform: "capitalize" }}
              color={getStatusColor(invoice.status)}
              fontSize={12}
            >
              {paymentStatus[invoice.status]}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

const Invoices = () => {
  // const theme = useTheme();
  // const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  // const [selectedLocation, setSelectedLocation] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("list");
  const { tenantData } = useTenant();
  const { activeInvoiceList, getActiveInvoiceList, isLoading, error } =
    useInvoices();
  const tenant_schema_name = tenantData?.tenant_schema_name;
  const history = useHistory();

  // Fetch active invoices on mount
  useEffect(() => {
    getActiveInvoiceList().catch((err) => {
      console.error("Failed to fetch active invoices:", err);
    });
  }, [getActiveInvoiceList]);

  // Summary statistics
  const summaryStats = {
    paid: activeInvoiceList.filter((inv) => inv.status === "paid").length,
    partiallyPaid: activeInvoiceList.filter((inv) => inv.status === "partial")
      .length,
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
        .includes(searchTerm.toLowerCase()) ||
      invoice.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.date_created.includes(searchTerm) ||
      invoice.due_date.includes(searchTerm) ||
      invoice.total_amount.includes(searchTerm) ||
      invoice.balance.includes(searchTerm) ||
      invoice.amount_paid.includes(searchTerm)
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
  console.log("activeInvoiceList: ", activeInvoiceList);
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
          <Typography fontWeight="400">Invoices</Typography>
        </Box>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <SummaryCard
              draftIcon={DraftIcon}
              title="Paid Invoices"
              count={summaryStats.paid}
              color1="#0DBF6A"
              color2="#1E4226"
              viewAll="View all"
              onClick={() =>
                history.push(
                  `/${tenant_schema_name}/invoicing/paid?status=paid`
                )
              }
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <SummaryCard
              draftIcon={DraftIcon}
              title="Partially Paid Invoices"
              count={summaryStats.partiallyPaid}
              color1="#F0B501"
              color2="#8D590B"
              viewAll="View all"
              onClick={() =>
                history.push(
                  `/${tenant_schema_name}/invoicing/paid?status=partial`
                )
              }
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <SummaryCard
              draftIcon={DraftIcon}
              title="Unpaid Invoices"
              count={summaryStats.unpaid}
              color1="#E43E2B"
              color2="#7E2218"
              viewAll="View all"
              onClick={() =>
                history.push(
                  `/${tenant_schema_name}/invoicing/paid?status=unpaid`
                )
              }
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
                <InvoiceCard
                  invoice={invoice}
                  tenant_schema_name={tenant_schema_name}
                />
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
                  const handleRowClick = () => {
                    history.push(
                      `/${tenant_schema_name}/invoicing/invoices/${invoice.id}`
                    );
                  };

                  return (
                    <TableRow
                      key={invoice.id}
                      sx={{
                        backgroundColor: `${
                          index % 2 === 0 ? "rgba(242, 242, 242, 0.7)" : ""
                        }`,
                        cursor: "pointer",
                        "&:hover": {
                          backgroundColor: "rgba(0, 0, 0, 0.04)",
                        },
                      }}
                      onClick={handleRowClick}
                    >
                      <TableCell padding="checkbox">
                        <input type="checkbox" />
                      </TableCell>
                      <TableCell>{invoice.id}</TableCell>
                      <TableCell sx={{ color: "#7A8A98" }}>
                        {invoice.vendor_details?.company_name ||
                          "Unknown Vendor"}
                      </TableCell>
                      <TableCell sx={{ color: "#7A8A98" }}>
                        {formatDate(invoice.date_created)}
                      </TableCell>
                      <TableCell sx={{ color: "warning.main" }}>
                        {formatDate(invoice.due_date)}
                      </TableCell>
                      <TableCell sx={{ color: "#7A8A98" }}>
                        {formatCurrency(invoice.balance)}
                      </TableCell>
                      <TableCell sx={{ color: "#7A8A98" }}>
                        {formatCurrency(invoice.total_amount)}
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              backgroundColor: getStatusColor(invoice.status),
                              mr: 1,
                            }}
                          />
                          <Typography
                            variant="caption"
                            sx={{ textTransform: "capitalize" }}
                            color={getStatusColor(invoice.status)}
                            fontSize={12}
                          >
                            {paymentStatus[invoice.status]}
                          </Typography>
                        </Box>
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
