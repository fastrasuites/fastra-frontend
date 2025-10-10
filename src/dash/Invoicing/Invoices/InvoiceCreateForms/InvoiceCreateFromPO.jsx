import {
  Typography,
  Box,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TextField,
  InputAdornment,
  Divider,
  Alert,
  CircularProgress,
  Snackbar,
} from "@mui/material";
import {
  NavigateBefore,
  NavigateNext,
  Add as AddIcon,
} from "@mui/icons-material";
import React, { useState, useEffect } from "react";
import { Link, useHistory, useParams } from "react-router-dom";
import { usePurchaseOrder } from "../../../../context/PurchaseOrderContext.";
import { useTenant } from "../../../../context/TenantContext";
import { useInvoices } from "../../../../context/Invoicing/InvoicesContext";
import { formatDate } from "../../../../helper/helper";

const InvoiceCreateFromPO = () => {
  const { id } = useParams();
  const poId = id;
  const { getPurchaseOrderById, singlePurchaseOrder } = usePurchaseOrder();
  const { tenantData } = useTenant();
  const {
    createInvoice,
    isLoading: isSubmitting,
    error: submitError,
  } = useInvoices();
  const tenant_schema_name = tenantData?.tenant_schema_name;
  const history = useHistory();

  // Calculate default due date (30 days from now)
  const getDefaultDueDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString().split("T")[0];
  };

  // Form state
  const [newInvoiceData, setNewInvoiceData] = useState({
    poId: "",
    vendor: "",
    vendorDetails: null,
    dueDate: getDefaultDueDate(),
    products: [],
    total: 0,
    amountPaid: "",
    balance: 0,
  });

  // UI state
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Load purchase order data on mount
  useEffect(() => {
    const fetchData = async () => {
      if (poId) {
        try {
          await getPurchaseOrderById(poId);
        } catch (error) {
          console.error("Error loading purchase order", error);
          setSnackbar({
            open: true,
            message: "Failed to load purchase order",
            severity: "error",
          });
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchData();
  }, [poId, getPurchaseOrderById]);

  // Prefill form when purchase order data is loaded
  useEffect(() => {
    if (singlePurchaseOrder && singlePurchaseOrder.id) {
      const products = singlePurchaseOrder.items.map((item) => ({
        id: item.product,
        name: item.product_details.product_name,
        description: item.product_details.product_description,
        qty: item.qty,
        unitPrice: item.estimated_unit_price,
        totalPrice: item.total_price,
        unit_of_measure:
          item.product_details.unit_of_measure_details?.unit_symbol || "",
      }));

      const total = singlePurchaseOrder.po_total_price;

      setNewInvoiceData({
        poId: singlePurchaseOrder.id,
        vendor: singlePurchaseOrder.vendor,
        vendorDetails: singlePurchaseOrder.vendor_details,
        dueDate: getDefaultDueDate(),
        products: products,
        total: total,
        amountPaid: "",
        balance: total,
      });
    }
  }, [singlePurchaseOrder]);

  // Format currency for display (₦1,000.00)
  const formatCurrency = (amount) => {
    return `₦${Number(amount || 0).toLocaleString()}`;
  };

  // Format currency input - remove non-numeric characters except decimal
  const formatCurrencyInput = (value) => {
    const numericValue = value.replace(/[^\d.]/g, "");
    const parts = numericValue.split(".");
    if (parts.length > 2) {
      return parts[0] + "." + parts.slice(1).join("");
    }
    return numericValue;
  };

  // // Add a new product line
  // const addProductLine = () => {
  //   setNewInvoiceData({
  //     ...newInvoiceData,
  //     products: [
  //       ...newInvoiceData.products,
  //       {
  //         id: "",
  //         name: "",
  //         qty: "",
  //         unitPrice: "",
  //         totalPrice: 0,
  //         unit_of_measure: "",
  //       },
  //     ],
  //   });
  // };

  // Handle amount paid changes
  const handleAmountPaidChange = (value) => {
    const numericValue = formatCurrencyInput(value);
    const balance = Number(newInvoiceData.total) - Number(numericValue || 0);

    setNewInvoiceData({
      ...newInvoiceData,
      amountPaid: numericValue,
      balance,
    });
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!newInvoiceData.vendor) {
      newErrors.vendor = "Vendor is required";
    }

    if (!newInvoiceData.dueDate) {
      newErrors.dueDate = "Due date is required";
    }

    let hasValidProduct = false;
    newInvoiceData.products.forEach((product, index) => {
      if (product.id && product.qty && product.unitPrice) {
        hasValidProduct = true;
      }

      if (product.id || product.qty || product.unitPrice) {
        if (!product.id) {
          newErrors[`product_${index}_id`] = "Product is required";
        }
        if (!product.qty || Number(product.qty) <= 0) {
          newErrors[`product_${index}_qty`] = "Valid quantity required";
        }
        if (!product.unitPrice || Number(product.unitPrice) <= 0) {
          newErrors[`product_${index}_unitPrice`] = "Valid price required";
        }
      }
    });

    if (!hasValidProduct) {
      newErrors.products = "At least one product is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (validateForm()) {
      const payload = {
        vendor: newInvoiceData.vendor,
        due_date: newInvoiceData.dueDate,
        purchase_order: newInvoiceData.poId,
        invoice_items: newInvoiceData.products
          .filter((p) => p.id && p.qty && p.unitPrice)
          .map((p) => ({
            product: p.id,
            quantity: Number(p.qty),
            unit_price: Number(p.unitPrice),
            total_price: Number(p.totalPrice),
          })),
        total_amount: Number(newInvoiceData.total),
        amount_paid: Number(newInvoiceData.amountPaid) || 0,
        balance: Number(newInvoiceData.balance),
        status: "unpaid",
      };

      console.log("Invoice payload:", payload);

      try {
        const result = await createInvoice(payload);
        if (result.success) {
          console.log("Invoice created successfully");
          setSnackbar({
            open: true,
            message: "Invoice created successfully!",
            severity: "success",
          });

          setTimeout(() => {
            history.push(`/${tenant_schema_name}/invoicing/invoices/`);
          }, 1500);
        }
      } catch (error) {
        console.error("Error creating invoice:", error);
        setSnackbar({
          open: true,
          message: submitError || "Failed to create invoice",
          severity: "error",
        });
      }
    } else {
      setSnackbar({
        open: true,
        message: "Please fill in all required fields correctly",
        severity: "error",
      });
    }
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Show loading spinner
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

  return (
    <Box p={3} sx={{ maxWidth: "1440px", marginInline: "auto" }}>
      {/* Header Section */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="h6">New Invoice from PO</Typography>
          <Typography variant="body2" color="textSecondary">
            Autosaved
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="body2">1 of 6</Typography>
          <Box
            display="flex"
            gap={1}
            sx={{ border: "solid 1px #f1ececff", borderRadius: "4px" }}
          >
            <IconButton size="small">
              <NavigateBefore />
            </IconButton>
            <IconButton size="small">
              <NavigateNext />
            </IconButton>
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          backgroundColor: "white",
          padding: "16px",
          border: "solid 1px #f1ececff",
          borderRadius: "4px",
          marginTop: "8px",
        }}
      >
        {/* Basic Information Section */}
        <Box sx={{ my: 3 }}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            gap={2}
            marginBottom={2}
          >
            <Typography variant="h6" color="primary" gutterBottom>
              Basic Information
            </Typography>
            <Link to={`/${tenant_schema_name}/invoicing/invoices/`}>
              <Button variant="text">Cancel</Button>
            </Link>
          </Box>

          {errors.vendor || errors.dueDate ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              Please fill in all required fields
            </Alert>
          ) : null}

          <Grid container spacing={3}>
            {/* Purchase Order ID (Read-only) */}
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="textSecondary">
                Purchase Order ID
              </Typography>
              <Typography fontWeight="bold">{newInvoiceData.poId}</Typography>
            </Grid>

            {/* Vendor (Read-only, prefilled from PO) */}
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="textSecondary">
                Vendor
              </Typography>
              <Typography fontWeight="bold">
                {newInvoiceData.vendorDetails?.company_name}
              </Typography>
            </Grid>

            {/* Date Created (Current date) */}
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="textSecondary">
                Date Created
              </Typography>
              <Typography fontWeight="bold">
                {formatDate(new Date())}
              </Typography>
            </Grid>

            {/* Due Date Selection */}
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Due Date *"
                type="date"
                error={!!errors.dueDate}
                helperText={errors.dueDate}
                InputLabelProps={{ shrink: true }}
                value={newInvoiceData.dueDate}
                onChange={(e) => {
                  setNewInvoiceData({
                    ...newInvoiceData,
                    dueDate: e.target.value,
                  });
                  if (errors.dueDate) {
                    const newErrors = { ...errors };
                    delete newErrors.dueDate;
                    setErrors(newErrors);
                  }
                }}
              />
            </Grid>
          </Grid>
        </Box>

        <Divider />

        {/* Product Information Section */}
        <Box sx={{ mt: 4 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h6" color="primary">
              Product Information
            </Typography>
          </Box>

          {errors.products && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errors.products}
            </Alert>
          )}

          {/* Product Lines Table */}
          <Box component={Paper}>
            <TableContainer component={Paper} elevation="none">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Product Name</TableCell>
                    <TableCell>QTY</TableCell>
                    <TableCell>Unit Price</TableCell>
                    <TableCell>Total Price</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {newInvoiceData.products.map((product, index) => (
                    <TableRow
                      key={index}
                      sx={{
                        backgroundColor: `${
                          index % 2 === 0 ? "#f1ececff" : ""
                        }`,
                      }}
                    >
                      {/* Product Name (Read-only) */}
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {product.name}
                          </Typography>
                        </Box>
                      </TableCell>

                      {/* Quantity (Read-only) */}
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body2">{product.qty}</Typography>
                          {product.unit_of_measure && (
                            <Typography variant="caption" color="textSecondary">
                              {product.unit_of_measure}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>

                      {/* Unit Price (Read-only) */}
                      <TableCell>
                        <Typography variant="body2">
                          {formatCurrency(product.unitPrice)}
                        </Typography>
                      </TableCell>

                      {/* Total Price (Calculated) */}
                      <TableCell>
                        <Typography fontWeight="bold">
                          {formatCurrency(product.totalPrice)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Summary Section */}
            <Box
              sx={{
                mt: 3,
                backgroundColor: "#f1ececff",
                paddingInline: "16px",
              }}
            >
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}></Grid>
                <Grid item xs={12} md={6}>
                  {/* Total Amount */}
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography>Total</Typography>
                    <Typography fontWeight="bold">
                      {formatCurrency(newInvoiceData.total)}
                    </Typography>
                  </Box>

                  {/* Amount Paid Input */}
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    mb={1}
                    alignItems="center"
                  >
                    <Typography>Amount Paid</Typography>
                    <TextField
                      size="small"
                      placeholder="0"
                      value={newInvoiceData.amountPaid}
                      onChange={(e) => handleAmountPaidChange(e.target.value)}
                      sx={{ width: 150 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">₦</InputAdornment>
                        ),
                      }}
                    />
                  </Box>

                  <Divider sx={{ my: 1 }} />

                  {/* Balance (Calculated) */}
                  <Box display="flex" justifyContent="space-between">
                    <Typography
                      color={newInvoiceData.balance > 0 ? "error" : "success"}
                    >
                      {newInvoiceData.balance > 0 ? "To Balance" : "Overpaid"}
                    </Typography>
                    <Typography
                      color={newInvoiceData.balance > 0 ? "error" : "success"}
                      fontWeight="bold"
                    >
                      {formatCurrency(Math.abs(newInvoiceData.balance))}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Box>

        {/* Submit Button */}
        <Box
          sx={{ py: 3 }}
          display="flex"
          justifyContent="flex-end"
          alignItems="center"
        >
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </Box>
      </Box>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default InvoiceCreateFromPO;
