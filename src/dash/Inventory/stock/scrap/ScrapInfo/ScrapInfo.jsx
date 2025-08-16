import React, { useCallback, useEffect, useState } from "react";
import { Link, useHistory, useParams } from "react-router-dom";
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Tooltip,
} from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { useTenant } from "../../../../../context/TenantContext";
import { useScrap } from "../../../../../context/Inventory/Scrap";
import { useCustomLocation } from "../../../../../context/Inventory/LocationContext";
// import { usePurchase } from "../../../../../context/PurchaseContext";
import Swal from "sweetalert2";
import Can from "../../../../../components/Access/Can";

// Status-to-color mapping
const STATUS_COLOR = {
  done: "#2ba24c",
  Done: "#2ba24c",
  draft: "#158fec",
  Drafted: "#158fec",
  Cancel: "#e43e2b",
  Cancelled: "#e43e2b",
};

const getStatusColor = (status) => STATUS_COLOR[status] || "#9e9e9e";

// Helper component for consistent label-value pairs
const InfoRow = ({ label, children }) => (
  <Box>
    <Typography>{label}</Typography>
    <Typography color="#7A8A98">{children || "N/A"}</Typography>
  </Box>
);

// Function to parse prefixed IDs (e.g., "LAGSADJ00006")
const parsePrefixedId = (id) => {
  if (!id) return null;
  const match = id.match(/^([A-Za-z]+)(\d+)$/);
  if (!match) return null;

  return {
    prefix: match[1], // "LAGSADJ"
    number: parseInt(match[2]), // 6
    totalLength: match[2].length, // 5 (digits)
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

const ScrapInfo = () => {
  const { id } = useParams();
  const history = useHistory();
  const { tenantData } = useTenant();
  const tenant_schema_name = tenantData?.tenant_schema_name;
  const { getSingleScrap, updateScrap } = useScrap();
  const { getSingleLocation } = useCustomLocation();
  // const { fetchSingleProduct } = usePurchase();

  const [scrap, setScrap] = useState(null);
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
      const { data: raw } = await getSingleScrap(id);
      const { data: location } = await getSingleLocation(
        raw.warehouse_location
      );

      const items = await Promise.all(
        raw.scrap_items.map(async (item) => {
          // const { data: product } = await fetchSingleProduct(item.product);
          return {
            ...item,
            // product,
          };
        })
      );

      setScrap({
        ...raw,
        warehouse_location: location,
        scrap_items: items,
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
      setError(e.response.data.detail || "Failed to load scrap");
      showError(e.response.data.detail || "Failed to load scrap");
    } finally {
      setLoading(false);
    }
  }, [id, getSingleScrap, getSingleLocation, showError]);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id, loadData]);

  const handleNavigateToEdit = useCallback(() => {
    history.push({
      pathname: `/${tenant_schema_name}/inventory/stock/scrap/${id}/edit`,
      state: { Scrap: scrap },
    });
  }, [history, tenant_schema_name, id, scrap]);

  const handleValidate = useCallback(async () => {
    try {
      const items = scrap.scrap_items.map((item) => ({
        id: parseInt(item?.id),
        product: parseInt(item.product),
        scrap_quantity: parseInt(item?.scrap_quantity),
      }));
      const payload = {
        ...scrap,
        location: scrap.warehouse_location.id,
        adjustmentType: scrap.adjustment_type,
        items,
        status: "done",
      };
      // Add your validation logic here
      // await validateScrap(id);
      await updateScrap(payload, id);
      showSuccess("Scrap has been validated");
      await loadData();
    } catch (err) {
      console.error(err);
      showError(err.message || "Failed to validate scrap");
    } finally {
      setActionLoading(false);
    }
  }, [showSuccess, showError, loadData, id, updateScrap, scrap]);

  const handleNavigate = useCallback(
    (newId) => {
      if (!newId) return;
      history.push(`/${tenant_schema_name}/inventory/stock/scrap/${newId}`);
    },
    [history, tenant_schema_name]
  );

  console.log(scrap);

  if (loading) {
    return (
      <Box p={4} textAlign="center">
        <CircularProgress size={64} />
        <Typography variant="h6" mt={2}>
          Loading scrap details...
        </Typography>
      </Box>
    );
  }

  if (error || !scrap) {
    return (
      <Box p={4} textAlign="center">
        <Typography variant="h6" color="error">
          {error || "Scrap not found"}
        </Typography>
        <Button
          variant="outlined"
          sx={{ mt: 2 }}
          onClick={() =>
            history.push(`/${tenant_schema_name}/inventory/stock/scrap`)
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
        <Link to={`/${tenant_schema_name}/inventory/stock/scrap/create-scrap`}>
          <Button variant="contained" size="large" disableElevation>
            New Scrap
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
            <Tooltip title="Previous Scrap">
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

            <Tooltip title="Next Scrap">
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
            variant="outlined"
            size="large"
            disableElevation
            onClick={() =>
              history.push(`/${tenant_schema_name}/inventory/stock/scrap`)
            }
          >
            Close
          </Button>

          {scrap.status === "draft" && (
            <Can app="inventory" module="scrap" action="edit">
              <Button
                variant="contained"
                size="large"
                disableElevation
                onClick={handleNavigateToEdit}
                disabled={actionLoading}
              >
                Edit
              </Button>
            </Can>
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
          <Typography color={getStatusColor(scrap.status)}>
            {scrap.status.toUpperCase()}
          </Typography>
        </InfoRow>

        {/* Key details */}
        <Box display="flex" gap={14} borderBottom="1px solid #E2E6E9" pb={3}>
          <InfoRow label="ID">{scrap.id}</InfoRow>
          <InfoRow label="Adjustment Type">{scrap.adjustment_type}</InfoRow>
          <InfoRow label="Warehouse Location">
            {scrap.warehouse_location?.location_name}
          </InfoRow>
        </Box>

        {/* Optional notes section */}
        {scrap.notes && (
          <Box display="flex" gap={6} borderBottom="1px solid #E2E6E9" pb={3}>
            <InfoRow label="Notes">{scrap.notes}</InfoRow>
          </Box>
        )}

        {/* Items table */}
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{ borderRadius: 2, border: "1px solid #E2E6E9", bgcolor: "#fff" }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {["Product Name", "Scrap Quantity", "Adjusted Quantity"].map(
                  (text) => (
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
                  )
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {scrap.scrap_items?.length > 0 ? (
                scrap.scrap_items.map((row, idx) => (
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
                      {row.scrap_quantity || "N/A"}
                    </TableCell>
                    <TableCell sx={{ fontSize: "14px", color: "#7A8A98" }}>
                      {row.adjusted_quantity || "N/A"}
                      <Box borderBottom="1px solid #E2E6E9" mt={1} />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
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
          color={getStatusColor(scrap.status)}
          sx={{ textTransform: "capitalize" }}
        >
          {scrap.status}
        </Typography>
        {scrap.status === "draft" && (
          <Can app="inventory" module="scrap" action="approve">
            <Button
              variant="contained"
              size="large"
              disableElevation
              onClick={handleValidate}
              disabled={actionLoading}
            >
              {actionLoading ? <CircularProgress size={24} /> : "Validate"}
            </Button>
          </Can>
        )}
      </Box>
    </Box>
  );
};

export default ScrapInfo;
