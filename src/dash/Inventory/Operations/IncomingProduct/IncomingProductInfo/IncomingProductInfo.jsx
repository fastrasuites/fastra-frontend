import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Link, useHistory, useParams } from "react-router-dom";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import Swal from "sweetalert2";

import { useIncomingProduct } from "../../../../../context/Inventory/IncomingProduct";
import { usePurchase } from "../../../../../context/PurchaseContext";
import { useTenant } from "../../../../../context/TenantContext";

const getStatusColor = (status) => {
  const s = status != null ? String(status).toLowerCase() : "";
  switch (s) {
    case "validated":
      return "#2ba24c";
    case "draft":
      return "#158fec";
    case "canceled":
      return "#e43e2b";
    default:
      return "#9e9e9e";
  }
};

// Function to parse prefixed IDs (e.g., "SUPPIN00010")
const parsePrefixedId = (id) => {
  if (!id) return null;

  // Extract prefix and numeric part
  const match = id.match(/^([A-Za-z]+)(\d+)$/);
  if (!match) return null;

  const prefix = match[1];
  const numericPart = match[2];
  const number = parseInt(numericPart, 10);

  return {
    prefix,
    number,
    totalLength: numericPart.length, // To preserve zero padding
  };
};

// Function to generate next/prev IDs
const generateAdjacentId = (baseId, increment) => {
  const parts = parsePrefixedId(baseId);
  if (!parts) return null;

  const newNumber = parts.number + increment;
  if (newNumber < 1) return null; // No negative IDs

  // Format number with original zero padding
  const formattedNumber = String(newNumber).padStart(parts.totalLength, "0");
  return `${parts.prefix}${formattedNumber}`;
};

export default function IncomingProductInfo() {
  const { id } = useParams();
  const { tenantData } = useTenant();
  const schema = tenantData?.tenant_schema_name;
  const history = useHistory();

  // Context hooks
  const { getSingleIncomingProduct, updateIncomingProductStatus } =
    useIncomingProduct();
  const { fetchVendors, vendors, fetchSingleProduct } = usePurchase();

  // Local state
  const [incoming, setIncoming] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [navigation, setNavigation] = useState({
    nextId: null,
    prevId: null,
    loading: false,
  });

  // Enhanced error handling
  const showError = useCallback((msg) => {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: msg,
      timer: 3000,
    });
  }, []);

  const showSuccess = useCallback((msg) => {
    Swal.fire({
      icon: "success",
      title: "Success",
      text: msg,
      timer: 2000,
      showConfirmButton: false,
    });
  }, []);

  // Load data with error handling
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch the raw incoming product
      const { data: raw } = await getSingleIncomingProduct(id);

      // Fetch all vendors
      await fetchVendors();

      // Enrich each item with full product info
      const items = await Promise.all(
        (raw.incoming_product_items || []).map(async (item) => {
          const { data: product } = await fetchSingleProduct(item.product);
          return {
            ...item,
            product,
          };
        })
      );

      setIncoming({
        ...raw,
        incoming_product_items: items,
      });
      setError(null);

      // Load adjacent IDs after successful data load
      const parts = parsePrefixedId(id);
      if (parts) {
        setNavigation({
          nextId: generateAdjacentId(id, 1),
          prevId: generateAdjacentId(id, -1),
          loading: false,
        });
      }
    } catch (e) {
      console.error(e);
      setError(e.response.data.detail || "Failed to load incoming product");
      showError(e.response.data.detail || "Failed to load incoming product");
    } finally {
      setLoading(false);
    }
  }, [
    id,
    getSingleIncomingProduct,
    fetchVendors,
    fetchSingleProduct,
    showError,
  ]);

  // Handle navigation
  const handleNavigate = useCallback(
    (newId) => {
      if (!newId) return;
      history.push(`/${schema}/inventory/operations/incoming-product/${newId}`);
    },
    [history, schema]
  );

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id, loadData]);

  // Navigate to edit screen
  const handleEdit = useCallback(() => {
    history.push(
      `/${schema}/inventory/operations/incoming-product/${id}/edit`,
      { incoming }
    );
  }, [history, schema, id, incoming]);

  // Handle status changes
  const handleStatusChange = useCallback(
    async (newStatus) => {
      if (!incoming) return;

      setActionLoading(true);
      try {
        const payload = {
          status: newStatus,
          is_hidden: false,
          is_validated: newStatus === "validated",
          can_edit: false,
        };

        await updateIncomingProductStatus(id, payload);
        showSuccess(`Incoming product has been ${newStatus}`);
        await loadData();
      } catch (err) {
        console.error("Status change error:", err);
        if (err.validation) {
          showError(Object.values(err.validation).join("<br>"));
        } else {
          showError(err.message || `Failed to ${newStatus} incoming product`);
        }
      } finally {
        setActionLoading(false);
      }
    },
    [
      incoming,
      id,
      updateIncomingProductStatus,
      showSuccess,
      showError,
      loadData,
    ]
  );

  if (loading) {
    return (
      <Box p={4} textAlign="center">
        <CircularProgress size={64} />
        <Typography variant="h6" mt={2}>
          Loading incoming product details...
        </Typography>
      </Box>
    );
  }

  if (error || !incoming) {
    return (
      <Box p={4} textAlign="center">
        <Typography variant="h6" color="error">
          {error || "Incoming product not found"}
        </Typography>
        <Button
          variant="outlined"
          sx={{ mt: 2 }}
          onClick={() => history.push(`/${schema}/inventory/operations`)}
        >
          Back to List
        </Button>
      </Box>
    );
  }

  const supplier = vendors.find((v) => v.id === incoming.supplier);

  return (
    <Box p={4} display="grid" gap={4} mr={4}>
      {/* Header with navigation */}
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Link to={`/${schema}/inventory/operations/creat-incoming-product`}>
          <Button variant="contained" size="large" disableElevation>
            New Incoming Product
          </Button>
        </Link>

        <Box display="flex" alignItems="center" gap={2}>
          {/* Navigation controls */}
          <Box
            display="flex"
            alignItems="center"
            gap={1}
            bgcolor="white"
            border="1px solid #E2E6E9"
            borderRadius={1}
            py={0.5}
            px={1}
          >
            <Tooltip title="Previous Incoming Product">
              <span>
                <IconButton
                  onClick={() => handleNavigate(navigation.prevId)}
                  disabled={!navigation.prevId}
                  size="small"
                >
                  <ArrowBackIosIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>

            <Box
              sx={{
                width: "2px",
                bgcolor: "#E2E6E9",
                alignSelf: "stretch",
                borderRadius: "1px",
              }}
            />

            <Tooltip title="Next Incoming Product">
              <span>
                <IconButton
                  onClick={() => handleNavigate(navigation.nextId)}
                  disabled={!navigation.nextId}
                  size="small"
                >
                  <ArrowForwardIosIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Box>

          <Button
            size="large"
            disableElevation
            onClick={() => history.push(`/${schema}/inventory/operations`)}
          >
            Close
          </Button>

          {incoming.status === "draft" && (
            <Button
              variant="contained"
              size="large"
              disableElevation
              onClick={handleEdit}
              disabled={actionLoading}
            >
              Edit
            </Button>
          )}
        </Box>
      </Box>

      {/* Main content */}
      <Box
        p={3}
        display="grid"
        gap={4}
        border="1px solid #E2E6E9"
        bgcolor="#FFFFFF"
      >
        <Typography variant="h6" color="#3B7CED" fontSize={20} fontWeight={500}>
          Product Information
        </Typography>

        <Box>
          <Typography>Status</Typography>
          <Typography color={getStatusColor(incoming.status)}>
            {incoming.status}
          </Typography>
        </Box>

        <Box
          display="grid"
          gridTemplateColumns={"1fr 1fr 1fr 1fr 1fr"}
          justifyContent={"space-between"}
          gap={1}
          borderBottom="1px solid #E2E6E9"
          pb={3}
        >
          <Box>
            <Typography mb={1}>ID</Typography>
            <Typography variant="body2" color="#7A8A98">
              {incoming.incoming_product_id || "N/A"}
            </Typography>
          </Box>
          <Box>
            <Typography mb={1}>Receipt Type</Typography>
            <Typography
              variant="body2"
              color="#7A8A98"
              sx={{ textTransform: "capitalize" }}
            >
              {incoming.receipt_type
                ? incoming.receipt_type.replace(/_/g, " ")
                : "N/A"}
            </Typography>
          </Box>
          <Box>
            <Typography mb={1}>Source Location</Typography>
            <Typography variant="body2" color="#7A8A98">
              {incoming.source_location_details?.location_name || "N/A"}
            </Typography>
          </Box>
          <Box>
            <Typography mb={1}>Destination Location</Typography>
            <Typography variant="body2" color="#7A8A98">
              {incoming.destination_location_details?.location_name || "N/A"}
            </Typography>
          </Box>
          <Box>
            <Typography mb={1}>Name of Supplier</Typography>
            <Typography variant="body2" color="#7A8A98">
              {supplier?.company_name || "N/A"}
            </Typography>
          </Box>
        </Box>

        <TableContainer
          component={Paper}
          elevation={0}
          sx={{ borderRadius: 2, border: "1px solid #E2E6E9", bgcolor: "#fff" }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {[
                  "Product Name",
                  "Expected QTY",
                  "Unit of Measure",
                  "Qty Received",
                ].map((text) => (
                  <TableCell
                    key={text}
                    sx={{
                      fontWeight: 500,
                      color: "#7A8A98",
                      fontSize: "14px",
                      p: 3,
                    }}
                  >
                    {text}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {incoming.incoming_product_items?.length > 0 ? (
                incoming.incoming_product_items.map((row, idx) => (
                  <TableRow
                    key={idx}
                    hover
                    sx={{ "&:nth-of-type(odd)": { bgcolor: "#f5f5f5" } }}
                  >
                    <TableCell
                      sx={{ fontSize: "14px", color: "#7A8A98", p: 3 }}
                    >
                      {row.product?.product_name || "N/A"}
                    </TableCell>
                    <TableCell sx={{ fontSize: "14px", color: "#7A8A98" }}>
                      {row.expected_quantity || "N/A"}
                    </TableCell>
                    <TableCell sx={{ fontSize: "14px", color: "#7A8A98" }}>
                      {row.product?.unit_of_measure_details?.unit_name || "N/A"}
                    </TableCell>
                    <TableCell sx={{ fontSize: "14px", color: "#7A8A98" }}>
                      {row.quantity_received || "N/A"}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="textSecondary">
                      No items found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Footer actions */}
      <Box display="flex" justifyContent="space-between" mr={4}>
        <Typography
          variant="body1"
          color={getStatusColor(incoming.status)}
          sx={{ textTransform: "capitalize" }}
        >
          {incoming.status}
        </Typography>
        {incoming.status === "draft" && (
          <Box display="flex" gap={2}>
            <Button
              variant="contained"
              color="error"
              size="large"
              disableElevation
              onClick={() => handleStatusChange("canceled")}
              disabled={actionLoading}
            >
              {actionLoading ? <CircularProgress size={24} /> : "Cancel"}
            </Button>
            <Button
              variant="contained"
              size="large"
              disableElevation
              onClick={() => handleStatusChange("validated")}
              disabled={actionLoading}
            >
              {actionLoading ? <CircularProgress size={24} /> : "Validate"}
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
}
