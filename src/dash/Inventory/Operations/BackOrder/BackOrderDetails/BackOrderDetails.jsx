// src/dash/Inventory/Operations/BackOrder/BackOrderInfo.jsx

import React, { useCallback, useEffect, useState, useMemo } from "react";
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
  Skeleton,
} from "@mui/material";
import { Link, useHistory, useParams } from "react-router-dom";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import Swal from "sweetalert2";
import { useTenant } from "../../../../../context/TenantContext";
import Can from "../../../../../components/Access/Can";
import { useBackOrder } from "../../../../../context/Inventory/BackOrderContext";
import { formatDate } from "../../../../../helper/helper";

// Status color mapping (same palette as your Incoming view)
const STATUS_COLORS = {
  validated: "#2ba24c",
  draft: "#158fec",
  canceled: "#e43e2b",
  default: "#9e9e9e",
};

const getStatusColor = (status) =>
  STATUS_COLORS[(status || "").toLowerCase()] || STATUS_COLORS.default;

// Parse prefixed id e.g. "BO00012" or "BACK0001"
const parsePrefixedId = (id) => {
  if (!id) return null;
  const match = id.match(/^([A-Za-z]+)(\d+)$/);
  if (!match) return null;
  const prefix = match[1];
  const numericPart = match[2];
  return {
    prefix,
    number: parseInt(numericPart, 10),
    totalLength: numericPart.length,
  };
};

const generateAdjacentId = (baseId, increment) => {
  const parts = parsePrefixedId(baseId);
  if (!parts || parts.number + increment < 1) return null;
  return `${parts.prefix}${String(parts.number + increment).padStart(
    parts.totalLength,
    "0"
  )}`;
};

// Navigation controls (same UX pattern)
const NavigationControls = ({ prevId, nextId, onNavigate, onClose }) => (
  <Box display="flex" alignItems="center" gap={2}>
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
      <Tooltip title="Previous Back Order">
        <IconButton
          onClick={() => onNavigate(prevId)}
          disabled={!prevId}
          size="small"
        >
          <ArrowBackIosIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Box sx={{ width: "2px", bgcolor: "#E2E6E9", alignSelf: "stretch" }} />

      <Tooltip title="Next Back Order">
        <IconButton
          onClick={() => onNavigate(nextId)}
          disabled={!nextId}
          size="small"
        >
          <ArrowForwardIosIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>

    <Button size="large" disableElevation onClick={onClose}>
      Close
    </Button>
  </Box>
);

// Table rows renderer (reused logic)
const ProductTableRows = ({ items, columns, emptyMessage }) => {
  if (!items || items.length === 0) {
    return (
      <TableRow>
        <TableCell colSpan={columns.length} align="center" sx={{ py: 4 }}>
          <Typography variant="body2" color="textSecondary">
            {emptyMessage}
          </Typography>
        </TableCell>
      </TableRow>
    );
  }

  return items.map((row, idx) => (
    <TableRow key={`${row.id || row.product}-${idx}`} hover>
      {columns.map(({ key, render }) => (
        <TableCell
          key={key}
          sx={{
            fontSize: "14px",
            color: "#7A8A98",
            backgroundColor: idx % 2 === 0 ? "#F2F2F2" : "white", // ✅ fixed
          }}
        >
          {render(row)}
        </TableCell>
      ))}
    </TableRow>
  ));
};

export default function BackOrderInfo() {
  // accept multiple param names so component doesn't hang if your route uses `id` or `backorderId` or `backorder_id`
  const params = useParams();
  const backorderId =
    params.backorderId ||
    params.backorder_id ||
    params.id ||
    params.backorder ||
    null;

  const { tenantData } = useTenant();
  const schema = tenantData?.tenant_schema_name || "";
  const history = useHistory();

  const {
    getSingleBackOrder,
    updateBackOrderStatus,
    toggleBackOrderHiddenStatus,
    softDeleteBackOrder,
  } = useBackOrder();

  const [backOrder, setBackOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [navigation, setNavigation] = useState({ nextId: null, prevId: null });
  const [tab, setTab] = useState("current"); // current vs backorder items
  const [error, setError] = useState(null);

  const showAlert = useCallback((icon, title, text) => {
    Swal.fire({
      icon,
      title,
      text,
      timer: icon === "error" ? 3000 : 2000,
      ...(icon !== "error" && { showConfirmButton: false }),
    });
  }, []);

  // Load backorder details
  const loadData = useCallback(async () => {
    // If no id, clear loading and error and return
    if (!backorderId) {
      setBackOrder(null);
      setLoading(false);
      setError("No backorder id provided");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await getSingleBackOrder(backorderId);
      // getSingleBackOrder may return { success: true, data } or raw data
      const data = res?.data ?? res;
      setBackOrder(data);

      // compute navigation if the id is prefixed
      const parts = parsePrefixedId(backorderId);
      if (parts) {
        setNavigation({
          nextId: generateAdjacentId(backorderId, 1),
          prevId: generateAdjacentId(backorderId, -1),
        });
      } else {
        setNavigation({ nextId: null, prevId: null });
      }
    } catch (e) {
      // handle axios-style error and generic error
      const msg =
        e?.response?.data?.detail || e?.message || "Failed to load back order";
      setError(msg);
      showAlert("error", "Error", msg);
      setBackOrder(null);
    } finally {
      setLoading(false);
    }
  }, [backorderId, getSingleBackOrder, showAlert]);

  useEffect(() => {
    // loadData will clear loading if no id
    loadData();
    setTab("current");
  }, [backorderId, loadData]);

  // navigation handler
  const handleNavigate = useCallback(
    (id) =>
      id && history.push(`/${schema}/inventory/operations/back-orders/${id}`),
    [history, schema]
  );

  // status change handler (validate / cancel)
  const handleStatusChange = useCallback(
    async (newStatus) => {
      if (!backOrder) return;
      setActionLoading(true);
      try {
        await updateBackOrderStatus(backOrder.backorder_id, {
          status: newStatus,
        });
        showAlert("success", "Success", `Back order marked ${newStatus}`);
        await loadData();
      } catch (err) {
        const msg =
          err?.response?.data?.detail ||
          err?.message ||
          `Failed to ${newStatus} back order`;
        showAlert("error", "Error", msg);
      } finally {
        setActionLoading(false);
      }
    },
    [backOrder, updateBackOrderStatus, showAlert, loadData]
  );

  // toggle hidden status
  const handleToggleHidden = useCallback(async () => {
    if (!backOrder) return;
    setActionLoading(true);
    try {
      await toggleBackOrderHiddenStatus(backOrder.backorder_id, "PATCH");
      showAlert("success", "Success", "Hidden status toggled");
      await loadData();
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        "Failed to toggle hidden status";
      showAlert("error", "Error", msg);
    } finally {
      setActionLoading(false);
    }
  }, [backOrder, toggleBackOrderHiddenStatus, showAlert, loadData]);

  // soft delete
  const handleSoftDelete = useCallback(async () => {
    if (!backOrder) return;
    const result = await Swal.fire({
      title: "Confirm",
      text: "This will soft-delete the back order. Continue?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
    });
    if (!result.isConfirmed) return;
    setActionLoading(true);
    try {
      await softDeleteBackOrder(backOrder.backorder_id);
      showAlert("success", "Deleted", "Back order soft-deleted");
      history.push(`/${schema}/inventory/operations`);
    } catch (err) {
      const msg =
        err?.response?.data?.detail || err?.message || "Failed to delete";
      showAlert("error", "Error", msg);
    } finally {
      setActionLoading(false);
    }
  }, [backOrder, softDeleteBackOrder, history, schema, showAlert]);

  // Table columns for backorder_items
  const tableColumns = useMemo(
    () => [
      {
        key: "product",
        label: "Product Name",
        render: (r) => r.product_details?.product_name || "N/A",
      },
      {
        key: "expected",
        label: "Expected QTY",
        render: (r) => r.expected_quantity ?? "N/A",
      },
      {
        key: "uom",
        label: "Unit of Measure",
        render: (r) =>
          r.product_details?.unit_of_measure_details?.unit_name || "N/A",
      },
      {
        key: "received",
        label: "Qty Received",
        render: (r) => r.quantity_received ?? "N/A",
      },
    ],
    []
  );

  if (loading) {
    return (
      <Box p={4} textAlign="center">
        <CircularProgress size={64} />
        <Typography variant="h6" mt={2}>
          Loading back order details...
        </Typography>
      </Box>
    );
  }

  if (error || !backOrder) {
    return (
      <Box p={4} textAlign="center">
        <Typography variant="h6" color="error">
          {error || "Back order not found"}
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

  const hasBackorderItems =
    Array.isArray(backOrder.backorder_items) &&
    backOrder.backorder_items.length > 0;

  console.log(backOrder);

  return (
    <Box p={4} display="grid" gap={4} mr={4}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" mb={2}>
        <div>
          <Can app="inventory" module="backorder" action="create">
            <Link to={`/${schema}/inventory/operations/create-back-order`}>
              <Button variant="contained" size="large" disableElevation>
                New Back Order
              </Button>
            </Link>
          </Can>
        </div>

        <Box display="flex" alignItems="center" gap={2}>
          <NavigationControls
            prevId={navigation.prevId}
            nextId={navigation.nextId}
            onNavigate={handleNavigate}
            onClose={() => history.push(`/${schema}/inventory/operations`)}
          />

          {/* Edit / actions area - show edit if draft */}
          {backOrder.status === "draft" && (
            <Can app="inventory" module="backorder" action="edit">
              <Button
                variant="contained"
                size="large"
                disableElevation
                component={Link}
                to={{
                  pathname: `/${schema}/inventory/operations/back-order/${backOrder.backorder_id}/edit`,
                  state: { backOrder },
                }}
              >
                Edit
              </Button>
            </Can>
          )}
        </Box>
      </Box>

      {/* Main card */}
      <Box
        p={3}
        display="grid"
        gap={4}
        border="1px solid #E2E6E9"
        bgcolor="#FFFFFF"
      >
        <Typography variant="h6" color="#3B7CED" fontSize={20} fontWeight={500}>
          Back Order Information
        </Typography>

        <Box>
          <Typography>Status</Typography>
          <Typography
            color={getStatusColor(backOrder.status)}
            sx={{ textTransform: "capitalize" }}
          >
            {backOrder.status}
          </Typography>
        </Box>

        {/* Metadata */}
        <Box
          display="grid"
          gridTemplateColumns="repeat(auto-fill, minmax(200px, 1fr))"
          gap={3}
          borderBottom="1px solid #E2E6E9"
          pb={3}
        >
          <InfoItem label="Backorder ID" value={backOrder.backorder_id} />

          <InfoItem
            label="Date Created"
            value={formatDate(backOrder.date_created)}
          />
          <InfoItem
            label="Receipt Type"
            value={(
              backOrder.backorder_of_details?.receipt_type ||
              backOrder.receipt_type
            )?.replace(/_/g, " ")}
            capitalize
          />
          <InfoItem
            label="Source Location"
            value={
              backOrder?.backorder_of_details?.source_location_details
                ?.location_name || backOrder.source_location
            }
          />
          <InfoItem
            label="Destination Location"
            value={
              backOrder?.backorder_of_details?.destination_location_details
                ?.location_name || backOrder.destination_location
            }
          />
          <InfoItem
            label="Name of Supplier"
            value={
              backOrder?.backorder_of_details.supplier_details?.company_name ||
              String(backOrder.supplier || "N/A")
            }
          />
          <InfoItem
            label="From Incoming Product"
            value={
              backOrder.backorder_of_details?.incoming_product_id ||
              backOrder.backorder_of
            }
          />
        </Box>

        {/* Backorder items */}
        <Box>
          {hasBackorderItems && (
            <Box display="flex" gap={2} mb={2}>
              <Button
                variant={tab === "current" ? "contained" : "outlined"}
                onClick={() => setTab("current")}
                style={{ border: "0px" }}
              >
                Expected Products
              </Button>
              <Button
                variant={tab === "backorder" ? "contained" : "outlined"}
                onClick={() => setTab("backorder")}
                style={{ border: "0px" }}
              >
                Initial Demand
              </Button>
            </Box>
          )}

          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              borderRadius: 2,
              border: "1px solid #E2E6E9",
              bgcolor: "#fff",
              minHeight: 300,
            }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  {tableColumns.map((col) => (
                    <TableCell
                      key={col.key}
                      sx={{
                        fontWeight: 500,
                        color: "#7A8A98",
                        fontSize: "14px",
                        p: 3,
                      }}
                    >
                      {col.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                <ProductTableRows
                  items={
                    tab === "current"
                      ? backOrder.backorder_of_details
                          ?.incoming_product_items || []
                      : backOrder.backorder_items
                  }
                  columns={tableColumns}
                  emptyMessage="No items found"
                />
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>

      {/* Footer actions */}
      <Box display="flex" justifyContent="space-between" mr={4}>
        <Typography
          variant="body1"
          color={getStatusColor(backOrder.status)}
          sx={{ textTransform: "capitalize" }}
        >
          {backOrder.status}
        </Typography>

        <Box display="flex" gap={2}>
          {/* Cancel / Validate */}
          {backOrder.status === "draft" && (
            <>
              {/* <Can app="inventory" module="backorder" action="reject"> */}
              <Button
                variant="contained"
                color="error"
                onClick={() => handleStatusChange("canceled")}
                disabled={actionLoading}
              >
                {actionLoading ? <CircularProgress size={20} /> : "Cancel"}
              </Button>
              {/* </Can> */}

              {/* <Can app="inventory" module="backorder" action="approve"> */}
              <Button
                variant="contained"
                onClick={() => handleStatusChange("validated")}
                disabled={actionLoading}
              >
                {actionLoading ? <CircularProgress size={20} /> : "Validate"}
              </Button>
              {/* </Can> */}
            </>
          )}

          {/* Toggle hidden */}
          <Can app="inventory" module="backorder" action="edit">
            <Button
              variant="outlined"
              onClick={handleToggleHidden}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <CircularProgress size={20} />
              ) : backOrder.is_hidden ? (
                "Unhide"
              ) : (
                "Hide"
              )}
            </Button>
          </Can>

          {/* Soft delete */}
          <Can app="inventory" module="backorder" action="delete">
            <Button
              variant="contained"
              color="error"
              onClick={handleSoftDelete}
              disabled={actionLoading}
            >
              {actionLoading ? <CircularProgress size={20} /> : "Delete"}
            </Button>
          </Can>
        </Box>
      </Box>
    </Box>
  );
}

// small helper components
const InfoItem = ({ label, value, capitalize = false }) => (
  <Box>
    <Typography mb={1}>{label}</Typography>
    <Typography
      variant="body2"
      color="#7A8A98"
      sx={capitalize ? { textTransform: "capitalize" } : {}}
    >
      {value || "N/A"}
    </Typography>
  </Box>
);
