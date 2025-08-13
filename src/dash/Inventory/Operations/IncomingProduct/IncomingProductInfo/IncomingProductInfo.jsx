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
import { useIncomingProduct } from "../../../../../context/Inventory/IncomingProduct";
import { useTenant } from "../../../../../context/TenantContext";
import Can from "../../../../../components/Access/Can";

// Status color mapping
const STATUS_COLORS = {
  validated: "#2ba24c",
  draft: "#158fec",
  canceled: "#e43e2b",
  default: "#9e9e9e",
};

// Helper function to get status color
const getStatusColor = (status) =>
  STATUS_COLORS[(status || "").toLowerCase()] || STATUS_COLORS.default;

// Helper function to parse prefixed IDs
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

// Helper function to generate adjacent IDs
const generateAdjacentId = (baseId, increment) => {
  const parts = parsePrefixedId(baseId);
  if (!parts || parts.number + increment < 1) return null;

  return `${parts.prefix}${String(parts.number + increment).padStart(
    parts.totalLength,
    "0"
  )}`;
};

// Component for navigation controls
const NavigationControls = ({
  prevId,
  nextId,
  onNavigate,
  onClose,
  tenantSchema,
}) => (
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
      <Tooltip title="Previous Incoming Product">
        <IconButton
          onClick={() => onNavigate(prevId)}
          disabled={!prevId}
          size="small"
        >
          <ArrowBackIosIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Box sx={{ width: "2px", bgcolor: "#E2E6E9", alignSelf: "stretch" }} />

      <Tooltip title="Next Incoming Product">
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

// Component for product info table
const ProductTable = ({ items, columns, emptyMessage }) => {
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
    <TableRow
      key={`${row.id}-${idx}`}
      hover
      sx={{ "&:nth-of-type(odd)": { bgcolor: "#f5f5f5" } }}
    >
      {columns.map(({ key, render }) => (
        <TableCell key={key} sx={{ fontSize: "14px", color: "#7A8A98" }}>
          {render(row)}
        </TableCell>
      ))}
    </TableRow>
  ));
};

export default function IncomingProductInfo() {
  const { id } = useParams();
  const { tenantData } = useTenant();
  const schema = tenantData?.tenant_schema_name || "";
  const history = useHistory();

  // Context hooks
  const {
    getSingleIncomingProduct,
    updateIncomingProductStatus,
    getIncomingProductBackOrder,
    backOrder,
  } = useIncomingProduct();

  // State management
  const [incoming, setIncoming] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [navigation, setNavigation] = useState({
    nextId: null,
    prevId: null,
  });
  const [tab, setTab] = useState("current");
  const [backOrderLoading, setBackOrderLoading] = useState(false);

  // Alert helpers
  const showAlert = useCallback((icon, title, text) => {
    Swal.fire({
      icon,
      title,
      text,
      timer: icon === "error" ? 3000 : 2000,
      ...(icon !== "error" && { showConfirmButton: false }),
    });
  }, []);

  // Data loader
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await getSingleIncomingProduct(id);
      setIncoming(data);

      // Generate adjacent IDs
      const parts = parsePrefixedId(id);
      if (parts) {
        setNavigation({
          nextId: generateAdjacentId(id, 1),
          prevId: generateAdjacentId(id, -1),
        });
      }
    } catch (e) {
      const errorMsg =
        e.response?.data?.detail || "Failed to load incoming product";
      setError(errorMsg);
      showAlert("error", "Error", errorMsg);
    } finally {
      setLoading(false);
    }
  }, [id, getSingleIncomingProduct, showAlert]);

  // Back order loader
  const loadBackOrder = useCallback(async () => {
    if (!id) return;

    setBackOrderLoading(true);
    try {
      await getIncomingProductBackOrder(id);
    } catch (e) {
      console.error("Failed to load back order:", e);
    } finally {
      setBackOrderLoading(false);
    }
  }, [id, getIncomingProductBackOrder]);

  // Handle navigation
  const handleNavigate = useCallback(
    (newId) =>
      newId &&
      history.push(`/${schema}/inventory/operations/incoming-product/${newId}`),
    [history, schema]
  );

  // Handle edit
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
        showAlert(
          "success",
          "Success",
          `Incoming product has been ${newStatus}`
        );
        await loadData();
      } catch (err) {
        const errorMsg =
          err.response?.data?.detail ||
          `Failed to ${newStatus} incoming product`;
        showAlert("error", "Error", errorMsg);
      } finally {
        setActionLoading(false);
      }
    },
    [incoming, id, updateIncomingProductStatus, showAlert, loadData]
  );

  // Load data on mount
  useEffect(() => {
    if (id) {
      loadData();
      loadBackOrder();
    }
  }, [id, loadData, loadBackOrder]);

  // Reset tab when ID changes
  useEffect(() => {
    setTab("current");
  }, [id]);

  // Table columns configuration
  const tableColumns = useMemo(
    () => [
      {
        key: "product",
        label: "Product Name",
        render: (row) => row.product_details?.product_name || "N/A",
      },
      {
        key: "expected",
        label: "Expected QTY",
        render: (row) => row.expected_quantity || "N/A",
      },
      {
        key: "uom",
        label: "Unit of Measure",
        render: (row) =>
          row.product_details?.unit_of_measure_details?.unit_name || "N/A",
      },
      {
        key: "received",
        label: "Qty Received",
        render: (row) => row.quantity_received || "N/A",
      },
    ],
    []
  );

  // Loading state
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

  // Error state
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

  // Back order data
  const hasBackOrder = Boolean(backOrder?.data?.backorder_id);
  const hasBackOrderItems = backOrder?.data?.backorder_items?.length > 0;

  return (
    <Box p={4} display="grid" gap={4} mr={4}>
      {/* Header Section */}
      <Box display="flex" justifyContent="space-between" mb={2}>
        <div>
          <Can app="purchase" module="incomingproduct" action="create">
            <Link to={`/${schema}/inventory/operations/creat-incoming-product`}>
              <Button variant="contained" size="large" disableElevation>
                New Incoming Product
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
            tenantSchema={schema}
          />

          {incoming.status === "draft" && (
            <Can app="inventory" module="incomingproduct" action="edit">
              <Button
                variant="contained"
                size="large"
                disableElevation
                onClick={handleEdit}
                disabled={actionLoading}
              >
                {actionLoading ? <CircularProgress size={24} /> : "Edit"}
              </Button>
            </Can>
          )}
        </Box>
      </Box>

      {/* Main Content */}
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

        {/* Status Indicator */}
        <Box>
          <Typography>Status</Typography>
          <Typography color={getStatusColor(incoming.status)}>
            {incoming.status}
          </Typography>
        </Box>

        {/* Product Metadata */}
        <Box
          display="grid"
          gridTemplateColumns="repeat(auto-fill, minmax(200px, 1fr))"
          justifyContent="space-between"
          gap={3}
          borderBottom="1px solid #E2E6E9"
          pb={3}
        >
          <InfoItem
            label="Incoming Product ID"
            value={incoming?.incoming_product_id}
          />
          <InfoItem
            label="Receipt Type"
            value={incoming.receipt_type?.replace(/_/g, " ")}
            capitalize
          />
          <InfoItem
            label="Source Location"
            value={incoming?.source_location_details?.location_name}
          />
          <InfoItem
            label="Destination Location"
            value={incoming?.destination_location_details?.location_name}
          />
          <InfoItem
            label="Supplier"
            value={incoming?.supplier_details?.company_name}
          />
        </Box>

        {/* Back Order Info */}
        {hasBackOrder && (
          <Box>
            <Typography mb={1}>Back Order ID:</Typography>
            <Typography
              variant="body2"
              sx={{
                textDecoration: "underline",
                color: "#E43D2B",
                fontStyle: "italic",
              }}
            >
              {backOrder?.data.backorder_id}
            </Typography>
          </Box>
        )}

        {/* Table Section */}
        <Box>
          {hasBackOrderItems && (
            <Box display="flex" gap={2} mb={2}>
              <TabButton
                active={tab === "current"}
                onClick={() => setTab("current")}
              >
                Current Receipt
              </TabButton>
              <TabButton
                active={tab === "backorder"}
                onClick={() => setTab("backorder")}
              >
                Back Order
              </TabButton>
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
            {backOrderLoading ? (
              <TableSkeleton columns={tableColumns} />
            ) : (
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    {tableColumns.map(({ key, label }) => (
                      <TableCell
                        key={key}
                        sx={{
                          fontWeight: 500,
                          color: "#7A8A98",
                          fontSize: "14px",
                          p: 3,
                        }}
                      >
                        {label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  <ProductTable
                    items={
                      tab === "current"
                        ? incoming.incoming_product_items
                        : backOrder?.data?.backorder_items
                    }
                    columns={tableColumns}
                    emptyMessage="No items found"
                  />
                </TableBody>
              </Table>
            )}
          </TableContainer>
        </Box>
      </Box>

      {/* Footer Actions */}
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
            <Can app="inventory" module="incomingproduct" action="reject">
              <ActionButton
                color="error"
                onClick={() => handleStatusChange("canceled")}
                loading={actionLoading}
              >
                Cancel
              </ActionButton>
            </Can>

            <Can app="inventory" module="incomingproduct" action="approve">
              <ActionButton
                onClick={() => handleStatusChange("validated")}
                loading={actionLoading}
              >
                Validate
              </ActionButton>
            </Can>
          </Box>
        )}
      </Box>
    </Box>
  );
}

// Helper Components
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

const TabButton = ({ children, active, onClick }) => (
  <Button
    variant={active ? "contained" : "outlined"}
    disableElevation
    onClick={onClick}
  >
    {children}
  </Button>
);

const ActionButton = ({ children, color, onClick, loading }) => (
  <Button
    variant="contained"
    color={color}
    size="large"
    disableElevation
    onClick={onClick}
    disabled={loading}
  >
    {loading ? <CircularProgress size={24} color="inherit" /> : children}
  </Button>
);

const TableSkeleton = ({ columns }) => (
  <>
    {Array.from({ length: 5 }).map((_, idx) => (
      <TableRow key={idx}>
        {columns.map((col) => (
          <TableCell key={col.key}>
            <Skeleton variant="text" />
          </TableCell>
        ))}
      </TableRow>
    ))}
  </>
);
