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
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Divider,
  Alert,
  CircularProgress,
  Snackbar,
} from "@mui/material";
import {
  NavigateBefore,
  NavigateNext,
  Delete as DeleteIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import React, { useState, useEffect } from "react";
import { Link, useHistory } from "react-router-dom";
import { useTenant } from "../../../../context/TenantContext";
import { usePurchase } from "../../../../context/PurchaseContext";
import { useInvoices } from "../../../../context/Invoicing/InvoicesContext";
import { formatDate } from "../../../../helper/helper";
import { width } from "@mui/system";

const InvoiceCreateForm = () => {
  // Context hooks
  const { tenantData } = useTenant();
  const { fetchProducts, products, fetchVendors, vendors } = usePurchase();
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
    vendor: "",
    dueDate: getDefaultDueDate(),
    products: [
      {
        id: "",
        name: "",
        qty: "",
        unitPrice: "",
        totalPrice: 0,
        unit_of_measure: "",
      },
    ],
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

  // Load products and vendors on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([fetchProducts(), fetchVendors()]);
      } catch (error) {
        console.error("Error loading data", error);
        setSnackbar({
          open: true,
          message: "Failed to load products and vendors",
          severity: "error",
        });
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Format currency for display (₦1,000.00)
  const formatCurrency = (amount) => {
    return `₦${Number(amount || 0).toLocaleString()}`;
  };

  // Format currency input - remove non-numeric characters except decimal
  const formatCurrencyInput = (value) => {
    const numericValue = value.replace(/[^\d.]/g, "");
    const parts = numericValue.split(".");
    // Ensure only one decimal point
    if (parts.length > 2) {
      return parts[0] + "." + parts.slice(1).join("");
    }
    return numericValue;
  };

  // Handle product line changes
  const handleNewInvoiceProductChange = (index, field, value) => {
    const updatedProducts = [...newInvoiceData.products];
    let updatedValue = value;

    // Format unit price input
    if (field === "unitPrice") {
      updatedValue = formatCurrencyInput(value);
    }

    // When product is selected, auto-fill product details
    if (field === "id") {
      const selectedProduct = products.find((p) => p.id === value);
      if (selectedProduct) {
        updatedProducts[index] = {
          ...updatedProducts[index],
          id: value,
          name: selectedProduct.product_name,
          unit_of_measure:
            selectedProduct.unit_of_measure_details?.unit_symbol || "",
        };
      }
    } else {
      updatedProducts[index] = {
        ...updatedProducts[index],
        [field]: updatedValue,
      };
    }

    // Calculate total price for the product line
    if (field === "qty" || field === "unitPrice") {
      const qty = Number(updatedProducts[index].qty) || 0;
      const unitPrice = Number(updatedProducts[index].unitPrice) || 0;
      updatedProducts[index].totalPrice = qty * unitPrice;
    }

    // Calculate overall totals
    const total = updatedProducts.reduce(
      (sum, product) => sum + (Number(product.totalPrice) || 0),
      0
    );
    const balance = total - Number(newInvoiceData.amountPaid || 0);

    setNewInvoiceData({
      ...newInvoiceData,
      products: updatedProducts,
      total,
      balance,
    });

    // Clear field-specific errors when user corrects them
    if (errors[`product_${index}_${field}`]) {
      const newErrors = { ...errors };
      delete newErrors[`product_${index}_${field}`];
      setErrors(newErrors);
    }
  };

  // Add a new product line
  const addProductLine = () => {
    setNewInvoiceData({
      ...newInvoiceData,
      products: [
        ...newInvoiceData.products,
        {
          id: "",
          name: "",
          qty: "",
          unitPrice: "",
          totalPrice: 0,
          unit_of_measure: "",
        },
      ],
    });
  };

  // Remove a product line (minimum 1 line must remain)
  const removeProductLine = (index) => {
    if (newInvoiceData.products.length > 1) {
      const updatedProducts = newInvoiceData.products.filter(
        (_, i) => i !== index
      );

      // Recalculate totals after removing line
      const total = updatedProducts.reduce((sum, product) => {
        return sum + (Number(product.totalPrice) || 0);
      }, 0);
      const balance = total - Number(newInvoiceData.amountPaid || 0);

      setNewInvoiceData({
        ...newInvoiceData,
        products: updatedProducts,
        total,
        balance,
      });

      // Remove errors for the deleted product line
      const newErrors = { ...errors };
      Object.keys(newErrors).forEach((key) => {
        if (key.startsWith(`product_${index}_`)) {
          delete newErrors[key];
        }
      });
      setErrors(newErrors);
    }
  };

  // Handle amount paid changes and recalculate balance
  const handleAmountPaidChange = (value) => {
    const numericValue = formatCurrencyInput(value);
    const balance = Number(newInvoiceData.total) - Number(numericValue || 0);

    setNewInvoiceData({
      ...newInvoiceData,
      amountPaid: numericValue,
      balance,
    });
  };

  // Validate form before submission
  const validateForm = () => {
    const newErrors = {};

    // Validate vendor selection
    if (!newInvoiceData.vendor) {
      newErrors.vendor = "Please select a vendor";
    }

    // Validate due date
    if (!newInvoiceData.dueDate) {
      newErrors.dueDate = "Please select a due date";
    }

    // Validate products - ensure at least one complete product line
    let hasValidProduct = false;
    newInvoiceData.products.forEach((product, index) => {
      if (product.id && product.qty && product.unitPrice) {
        hasValidProduct = true;
      }

      // If any field is filled, validate all required fields for that line
      if (product.id || product.qty || product.unitPrice) {
        if (!product.id) {
          newErrors[`product_${index}_id`] = "Please select a product";
        }
        if (!product.qty || Number(product.qty) <= 0) {
          newErrors[`product_${index}_qty`] = "Please enter a valid quantity";
        }
        if (!product.unitPrice || Number(product.unitPrice) <= 0) {
          newErrors[`product_${index}_unitPrice`] =
            "Please enter a valid unit price";
        }
      }
    });

    // Ensure at least one complete product line exists
    if (!hasValidProduct) {
      newErrors.products = "Please add at least one complete product line";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (validateForm()) {
      // Prepare payload for API
      const payload = {
        vendor: newInvoiceData.vendor, // vendor_id
        due_date: newInvoiceData.dueDate,
        invoice_items: newInvoiceData.products
          .filter((p) => p.id && p.qty && p.unitPrice) // Only include complete lines
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

          // Navigate to invoice list after short delay
          setTimeout(() => {
            history.push(`/${tenant_schema_name}/invoicing/invoices/`);
          }, 1500);
        }
      } catch (error) {
        console.error("Error creating invoice:", error);
        setSnackbar({
          open: true,
          message: submitError || "Failed to create invoice. Please try again.",
          severity: "error",
        });
      }
    } else {
      // Show error if validation fails
      setSnackbar({
        open: true,
        message: "Please fill in all required fields correctly",
        severity: "error",
      });
    }
  };

  // Close snackbar notification
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Get selected vendor details
  const getSelectedVendor = () => {
    return vendors.find((v) => v.id === newInvoiceData.vendor);
  };

  // Show loading spinner while fetching data
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
    <Box p={3} sx={{ maxWidth: "1400px", marginInline: "auto" }}>
      {/* Header Section */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="h6">New Invoice</Typography>
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
        <Box sx={{ my: 2 }}>
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

          {/* Show error alert if basic info is incomplete */}
          {errors.vendor || errors.dueDate ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              Please fill in all required fields
            </Alert>
          ) : null}

          <Grid container spacing={3}>
            {/* Vendor Selection */}
            <Grid item xs={12} md={4}>
              <FormControl fullWidth error={!!errors.vendor}>
                <InputLabel>Vendor *</InputLabel>
                <Select
                  value={newInvoiceData.vendor}
                  onChange={(e) => {
                    setNewInvoiceData({
                      ...newInvoiceData,
                      vendor: e.target.value,
                    });
                    // Clear error when vendor is selected
                    if (errors.vendor) {
                      const newErrors = { ...errors };
                      delete newErrors.vendor;
                      setErrors(newErrors);
                    }
                  }}
                  label="Vendor *"
                >
                  {vendors.map((vendor) => (
                    <MenuItem key={vendor.id} value={vendor.id}>
                      {vendor.company_name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.vendor && (
                  <Typography variant="caption" color="error">
                    {errors.vendor}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            {/* Date Created (Read-only) */}
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
                  // Clear error when due date is selected
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

          {/* Show error if no valid products */}
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
                    <TableCell>Product Name *</TableCell>
                    <TableCell>QTY *</TableCell>
                    <TableCell>Unit Price *</TableCell>
                    <TableCell>Total Price</TableCell>
                    <TableCell width={50}>Actions</TableCell>
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
                      {/* Product Selection */}
                      <TableCell>
                        <FormControl
                          fullWidth
                          size="small"
                          error={!!errors[`product_${index}_id`]}
                        >
                          <Select
                            variant="standard"
                            value={product.id || ""}
                            onChange={(e) =>
                              handleNewInvoiceProductChange(
                                index,
                                "id",
                                e.target.value
                              )
                            }
                            displayEmpty
                          >
                            {/* Placeholder */}
                            <MenuItem value="" disabled>
                              <Typography variant="body2" color="textSecondary">
                                Select Product
                              </Typography>
                            </MenuItem>

                            {/* Real options */}
                            {products.map((prod) => (
                              <MenuItem key={prod.id} value={prod.id}>
                                <Box>
                                  <Typography variant="body2">
                                    {prod.product_name}
                                  </Typography>
                                </Box>
                              </MenuItem>
                            ))}
                          </Select>

                          {errors[`product_${index}_id`] && (
                            <Typography variant="caption" color="error">
                              {errors[`product_${index}_id`]}
                            </Typography>
                          )}
                        </FormControl>
                      </TableCell>

                      {/* Quantity Input */}
                      <TableCell>
                        <TextField
                          variant="standard"
                          size="small"
                          type="number"
                          placeholder="0"
                          error={!!errors[`product_${index}_qty`]}
                          inputProps={{ min: 0, step: 1 }}
                          value={product.qty}
                          onChange={(e) =>
                            handleNewInvoiceProductChange(
                              index,
                              "qty",
                              e.target.value
                            )
                          }
                          sx={{ width: 100 }}
                          InputProps={{
                            endAdornment: product.unit_of_measure && (
                              <InputAdornment position="end">
                                <Typography
                                  variant="caption"
                                  color="textSecondary"
                                >
                                  {product.unit_of_measure}
                                </Typography>
                              </InputAdornment>
                            ),
                          }}
                        />
                        {errors[`product_${index}_qty`] && (
                          <Typography
                            variant="caption"
                            color="error"
                            display="block"
                          >
                            {errors[`product_${index}_qty`]}
                          </Typography>
                        )}
                      </TableCell>

                      {/* Unit Price Input */}
                      <TableCell>
                        <TextField
                          variant="standard"
                          size="small"
                          placeholder="0"
                          error={!!errors[`product_${index}_unitPrice`]}
                          value={product.unitPrice}
                          onChange={(e) =>
                            handleNewInvoiceProductChange(
                              index,
                              "unitPrice",
                              e.target.value
                            )
                          }
                          sx={{ width: 120 }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                ₦
                              </InputAdornment>
                            ),
                          }}
                        />
                        {errors[`product_${index}_unitPrice`] && (
                          <Typography
                            variant="caption"
                            color="error"
                            display="block"
                          >
                            {errors[`product_${index}_unitPrice`]}
                          </Typography>
                        )}
                      </TableCell>

                      {/* Total Price (Calculated) */}
                      <TableCell>
                        <Typography fontWeight="bold">
                          {formatCurrency(product.totalPrice)}
                        </Typography>
                      </TableCell>

                      {/* Delete Button */}
                      <TableCell>
                        <IconButton
                          onClick={() => removeProductLine(index)}
                          disabled={newInvoiceData.products.length === 1}
                          size="small"
                          color="error"
                          title="Remove product line"
                        >
                          <DeleteIcon />
                        </IconButton>
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
                  <Box display="flex" justifyContent="space-between" mb={1}>
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
          justifyContent="space-between"
          alignItems="center"
        >
          {/* Add Product Button */}
          <Button
            startIcon={<AddIcon />}
            onClick={addProductLine}
            variant="outlined"
          >
            Add Product
          </Button>
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

export default InvoiceCreateForm;
