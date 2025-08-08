import React, { useCallback, useEffect, useState } from "react";
import { Link, useHistory, useParams } from "react-router-dom";
import { useTenant } from "../../../../../context/TenantContext";
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
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { useStockAdjustment } from "../../../../../context/Inventory/StockAdjustment";
import { useCustomLocation } from "../../../../../context/Inventory/LocationContext";
// import { usePurchase } from "../../../../../context/PurchaseContext";
import Swal from "sweetalert2";

// Safely normalize status to a string before lowercasing
const getStatusColor = (status) => {
  const s = status != null ? String(status) : "";
  switch (s.toLowerCase()) {
    case "done":
      return "#2ba24c";
    case "draft":
      return "#158fec";
    case "cancelled":
      return "#e43e2b";
    default:
      return "#9e9e9e";
  }
};

// Function to parse prefixed IDs (e.g., "LAGSADJ00009")
const parsePrefixedId = (id) => {
  if (!id) return null;

  const match = id.match(/^([A-Za-z]+)(\d+)$/);
  if (!match) return null;

  return {
    prefix: match[1],
    number: parseInt(match[2]),
    totalLength: match[2].length, // To preserve zero padding
  };
};

// Function to generate next/prev IDs
const generateAdjacentId = (baseId, increment) => {
  const parts = parsePrefixedId(baseId);
  if (!parts) return null;

  const newNumber = parts.number + increment;
  if (newNumber < 1) return null; // Prevent negative IDs

  return `${parts.prefix}${String(newNumber).padStart(parts.totalLength, "0")}`;
};

const InfoRow = ({ label, children }) => (
  <Box display="flex" flexDirection="column" gap={0.5}>
    <Typography variant="subtitle2">{label}</Typography>
    <Typography variant="body2" color="#7A8A98">
      {children}
    </Typography>
  </Box>
);

export default function StockAdjustmentInfo() {
  const { id } = useParams();
  const { tenantData } = useTenant();
  const schema = tenantData?.tenant_schema_name;
  const { getSingleStockAdjustment, updateStockAdjustmentToDone } =
    useStockAdjustment();
  const { getSingleLocation } = useCustomLocation();
  // const { fetchSingleProduct } = usePurchase();
  const history = useHistory();

  const [stock, setStock] = useState(null);
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
      const { data: raw } = await getSingleStockAdjustment(id);
      const { data: location } = await getSingleLocation(
        raw.warehouse_location
      );

      const items = await Promise.all(
        raw.stock_adjustment_items.map(async (item) => {
          // const { data: product } = await fetchSingleProduct(item.product);
          return {
            ...item,
            // product,
          };
        })
      );

      setStock({
        ...raw,
        warehouse_location: location,
        stock_adjustment_items: items,
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
      setError(e.response.data.detail || "Failed to load stock adjustment");
      showError(e.response.data.detail || "Failed to load stock adjustment");
    } finally {
      setLoading(false);
    }
  }, [
    id,
    getSingleStockAdjustment,
    getSingleLocation,
    // fetchSingleProduct,
    showError,
  ]);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id, loadData]);

  const handleNavigateToEdit = useCallback(() => {
    history.push({
      pathname: `/${schema}/inventory/stock/stock-adjustment/${id}/edit`,
      state: { StockAdjustment: stock },
    });
  }, [history, schema, id, stock]);

  const handleSubmitAsDone = useCallback(async () => {
    setActionLoading(true);
    try {
      await updateStockAdjustmentToDone(id);
      showSuccess("Stock adjustment marked as done");
      await loadData();
    } catch (err) {
      if (err.validation) {
        showError(Object.values(err.validation).join("<br>"));
      } else {
        showError(err.message || "Failed to mark adjustment as done");
      }
    } finally {
      setActionLoading(false);
    }
  }, [id, updateStockAdjustmentToDone, showSuccess, showError, loadData]);

  const handleNavigate = useCallback(
    (newId) => {
      if (!newId) return;
      history.push(`/${schema}/inventory/stock/stock-adjustment/${newId}`);
    },
    [history, schema]
  );

  if (loading) {
    return (
      <Box p={4} textAlign="center">
        <CircularProgress size={64} />
        <Typography variant="h6" mt={2}>
          Loading stock adjustment details...
        </Typography>
      </Box>
    );
  }

  console.log(stock);

  if (error || !stock) {
    return (
      <Box p={4} textAlign="center">
        <Typography variant="h6" color="error">
          {error || "Stock adjustment not found"}
        </Typography>
        <Button
          variant="outlined"
          sx={{ mt: 2 }}
          onClick={() =>
            history.push(`/${schema}/inventory/stock/stock-adjustment`)
          }
        >
          Back to List
        </Button>
      </Box>
    );
  }

  return (
    <Box p={4} display="grid" gap={4} mr={4}>
      {/* Header with navigation */}
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Link
          to={`/${schema}/inventory/stock/stock-adjustment/create-stock-adjustment`}
        >
          <Button variant="contained" size="large" disableElevation>
            Stock Adjustment
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
            <Tooltip title="Previous Adjustment">
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

            <Tooltip title="Next Adjustment">
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
            onClick={() =>
              history.push(`/${schema}/inventory/stock/stock-adjustment`)
            }
          >
            Close
          </Button>

          {stock.status === "draft" && (
            <Button
              variant="contained"
              size="large"
              disableElevation
              onClick={handleNavigateToEdit}
              disabled={actionLoading}
            >
              Edit
            </Button>
          )}
        </Box>
      </Box>

      {/* Main info card */}
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

        {/* Status row */}
        <InfoRow label="Status">
          <Typography color={getStatusColor(stock.status)}>
            {stock.status}
          </Typography>
        </InfoRow>

        {/* Key details */}
        <Box display="flex" gap={14} borderBottom="1px solid #E2E6E9" pb={3}>
          <InfoRow label="ID">{stock.id}</InfoRow>
          <InfoRow label="Adjustment Type">{stock.adjustment_type}</InfoRow>
          <InfoRow label="Location">
            {stock.warehouse_location?.location_name || "N/A"}
          </InfoRow>
          <InfoRow label="Notes">{stock.notes || "N/A"}</InfoRow>
        </Box>

        {/* Items table */}
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
                  "Unit of Measure",
                  "Current Quantity",
                  "Adjusted Quantity",
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
              {stock.stock_adjustment_items?.length > 0 ? (
                stock.stock_adjustment_items.map((row, idx) => (
                  <TableRow
                    key={idx}
                    hover
                    sx={{ "&:nth-of-type(odd)": { bgcolor: "#f5f5f5" } }}
                  >
                    <TableCell
                      sx={{ fontSize: "14px", color: "#7A8A98", p: 3 }}
                    >
                      {row.product_details?.product_name || "N/A"}
                    </TableCell>
                    <TableCell sx={{ fontSize: "14px", color: "#7A8A98" }}>
                      {row.product_details?.unit_of_measure_details
                        ?.unit_name || "N/A"}
                    </TableCell>
                    <TableCell sx={{ fontSize: "14px", color: "#7A8A98" }}>
                      {row.product?.current_quantity || 0}
                    </TableCell>
                    <TableCell sx={{ fontSize: "14px", color: "#7A8A98" }}>
                      {row.adjusted_quantity || "N/A"}
                      <Box borderBottom="1px solid #E2E6E9" mt={1} />
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

      {/* Footer with status and action */}
      <Box display="flex" justifyContent="space-between" mr={4}>
        <Typography
          variant="body1"
          color={getStatusColor(stock.status)}
          sx={{ textTransform: "capitalize" }}
        >
          {stock.status}
        </Typography>
        {stock.status === "draft" && (
          <Button
            variant="contained"
            size="large"
            disableElevation
            onClick={handleSubmitAsDone}
            disabled={actionLoading}
          >
            {actionLoading ? <CircularProgress size={24} /> : "Validate"}
          </Button>
        )}
      </Box>
    </Box>
  );
}
