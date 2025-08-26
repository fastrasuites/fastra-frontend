import React, { useEffect, useState, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
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
  TextField,
  CircularProgress,
  Typography,
  Tooltip,
  IconButton,
} from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import approved from "../../../../../src/image/icons/approved-rfq.svg";
import "../PoStatusModal.css";
import "../../Rfq/RfqStatusModal.css";
import { useHistory, useParams } from "react-router-dom";
import { usePurchaseOrder } from "../../../../context/PurchaseOrderContext.";
import { useTenant } from "../../../../context/TenantContext";
import { extractRFQID, formatDate } from "../../../../helper/helper";
import { useCustomLocation } from "../../../../context/Inventory/LocationContext";
import Can from "../../../../components/Access/Can";
import Swal from "sweetalert2";

// Shared cell style helper function to avoid repetition
const cellStyle = (index) => ({
  backgroundColor: index % 2 === 0 ? "#f2f2f2" : "#fff",
  color: "#353536",
  fontSize: 12,
  padding: "24px",
});

const statusColorMap = {
  completed: "#2ba24c",
  awaiting: "#f0b501",
  cancelled: "#e43e2b",
  default: "#3B7CED",
};

const PurchaseOrderInfo = () => {
  const { id } = useParams();
  const history = useHistory();
  const { tenantData } = useTenant();
  const tenantSchema = tenantData?.tenant_schema_name;

  const {
    getPurchaseOrderById,
    updatePurchaseOrder,
    updatePurchaseReject,
    updatePurchaseApproved,
  } = usePurchaseOrder();

  const { singleLocation, getSingleLocation } = useCustomLocation();

  const [item, setItem] = useState({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [navigation, setNavigation] = useState({
    nextId: null,
    prevId: null,
    loading: false,
  });

  const statusColor = (s) => statusColorMap[s] || statusColorMap.default;

  const showError = useCallback((msg) => {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: msg,
    });
  }, []);

  const showSuccess = useCallback((msg) => {
    Swal.fire({
      icon: "success",
      title: "Success",
      text: msg,
      showConfirmButton: false,
    });
  }, []);

  // Load adjacent PO IDs
  const loadAdjacentIds = useCallback((currentId) => {
    try {
      setNavigation((prev) => ({ ...prev, loading: true }));

      // Extract numeric portion from ID (works for formats like PO123, PO00123, etc.)
      const numericMatch = currentId.match(/\d+/);
      if (!numericMatch) return;

      const numericStr = numericMatch[0];
      const numericValue = parseInt(numericStr, 10);
      const prefix = currentId.substring(0, currentId.indexOf(numericStr));

      // Preserve zero padding
      const nextId = `${prefix}${String(numericValue + 1).padStart(
        numericStr.length,
        "0"
      )}`;
      const prevId =
        numericValue > 1
          ? `${prefix}${String(numericValue - 1).padStart(
              numericStr.length,
              "0"
            )}`
          : null;

      setNavigation({ nextId, prevId, loading: false });
    } catch (error) {
      console.error("Navigation error:", error);
      setNavigation((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  // Load Purchase Order data
  const loadPO = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getPurchaseOrderById(id);
      if (res.success) {
        setItem(res.data);
        loadAdjacentIds(id);
      } else {
        showError(res.message || "Failed to load purchase order");
        history.push(`/${tenantSchema}/purchase/purchase-order`);
      }
    } catch (err) {
      showError(err.message || "Error loading purchase order details");
    } finally {
      setLoading(false);
    }
  }, [getPurchaseOrderById, id, showError, history, tenantSchema]);

  useEffect(() => {
    loadPO();
  }, [loadPO]);

  // Load location data when item changes
  useEffect(() => {
    if (item?.destination_location) {
      getSingleLocation(item.destination_location);
    }
  }, [item, getSingleLocation]);

  // Handle status change actions
  const handleStatusChange = useCallback(
    async (newStatus) => {
      if (!item) return;

      setActionLoading(true);
      try {
        const actionMap = {
          completed: updatePurchaseOrder,
          cancelled: updatePurchaseOrder,
          awaiting: updatePurchaseOrder,
        };

        const action = actionMap[newStatus];
        if (!action) {
          throw new Error(`Invalid status action: ${newStatus}`);
        }

        const result = await action({ status: newStatus }, id);
        if (result.success) {
          showSuccess(`Purchase order status updated to ${newStatus}`);
          await loadPO();
        } else {
          showError(
            result.message || `Failed to update status to ${newStatus}`
          );
        }
      } catch (err) {
        showError(err.message || `Error during status update`);
      } finally {
        setActionLoading(false);
      }
    },
    [
      item,
      id,
      loadPO,
      showError,
      showSuccess,
      updatePurchaseOrder,
      updatePurchaseReject,
      updatePurchaseApproved,
    ]
  );

  // Handle navigation to inventory conversion
  const handleConvertToInventory = useCallback(() => {
    if (!item) return;

    history.push({
      pathname: `/${tenantSchema}/inventory/operations/incoming-product/inventory-conversion`,
      state: { po: item },
    });
  }, [history, tenantSchema, item]);

  // Navigation handler
  const handleNavigate = useCallback(
    (newId) => {
      if (!newId || navigation.loading) return;
      history.push(`/${tenantSchema}/purchase/purchase-order/${newId}`);
    },
    [history, tenantSchema, navigation.loading]
  );

  //   // Navigate to inventory conversion
  // Render table rows
  const renderedRows = useMemo(() => {
    const rows = item.items || [];
    if (!rows.length) {
      return (
        <TableRow key="empty">
          <TableCell
            colSpan={6}
            align="center"
            sx={{ color: "#7a8a98", fontSize: 12 }}
          >
            No items available
          </TableCell>
        </TableRow>
      );
    }
    return rows.map((row, idx) => (
      <TableRow key={row.url || idx}>
        <TableCell sx={cellStyle(idx)}>
          {row.product_details?.product_name || "N/A"}
          <Box />
        </TableCell>
        <TableCell sx={cellStyle(idx)}>
          {row.description || "N/A"}
          <Box />
        </TableCell>
        <TableCell sx={cellStyle(idx)}>
          {row.qty || "N/A"}
          <Box />
        </TableCell>
        <TableCell sx={cellStyle(idx)}>
          {row?.product_details?.unit_of_measure_details?.unit_name || "N/A"}
          <Box />
        </TableCell>
        <TableCell sx={cellStyle(idx)}>
          {row.estimated_unit_price || "N/A"}
          <Box />
        </TableCell>
        <TableCell sx={cellStyle(idx)}>
          {row.estimated_unit_price * row.qty || "N/A"}
          <Box />
        </TableCell>
      </TableRow>
    ));
  }, [item.items]);

  // Footer configuration based on status
  const footerConfig = useMemo(() => {
    switch (item.status) {
      case "completed":
        return {
          icon: <img src={approved} alt="approved" width={24} height={24} />,
          label: "Approved",
          actions: [
            {
              text: "Send to Inventory",
              onClick: handleConvertToInventory,
              disabled: actionLoading,
              action: ["inventory", "incomingproduct", "create"],
            },
          ],
        };
      case "awaiting":
        return {
          label: "Awaiting",
          actions: [
            {
              text: "Approve",
              color: "success",
              onClick: () => handleStatusChange("completed"),
              action: ["purchase", "purchaseorder", "approve"],
            },
            {
              text: "Reject",
              color: "error",
              onClick: () => handleStatusChange("cancelled"),
              action: ["purchase", "purchaseorder", "reject"],
            },
          ],
        };
      case "cancelled":
        return {
          label: "Rejected",
          actions: [
            {
              text: "Set Back to Draft",
              onClick: () => handleStatusChange("pending"),
              action: ["purchase", "purchaseorder", "edit"],
            },
          ],
        };
      case "draft":
        return {
          label: "Drafted",
          actions: [
            {
              text: "Send to Approval",
              onClick: () => handleStatusChange("awaiting"),
              action: ["purchase", "purchaseorder", "edit"],
            },
          ],
        };
      default:
        return null;
    }
  }, [item.status, handleStatusChange, actionLoading]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: 300,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  console.log(item);
  return (
    <div className="rfqStatus">
      <div className="rfqHeader">
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          width="100%"
        >
          <Typography variant="h5" fontWeight={500}>
            Purchase Order Details
          </Typography>

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
            <Tooltip title="Previous Purchase Order">
              <span>
                <IconButton
                  onClick={() => handleNavigate(navigation.prevId)}
                  disabled={!navigation.prevId || navigation.loading}
                  size="small"
                >
                  {navigation.loading ? (
                    <CircularProgress size={20} />
                  ) : (
                    <ArrowBackIosIcon fontSize="small" />
                  )}
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

            <Tooltip title="Next Purchase Order">
              <span>
                <IconButton
                  onClick={() => handleNavigate(navigation.nextId)}
                  disabled={!navigation.nextId || navigation.loading}
                  size="small"
                >
                  {navigation.loading ? (
                    <CircularProgress size={20} />
                  ) : (
                    <ArrowForwardIosIcon fontSize="small" />
                  )}
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        </Box>
      </div>

      <div className="rfqStatusContent">
        <div className="rfqBasicInfo">
          <h2>Basic Information</h2>
          <div className="editCancel">
            {!["awaiting", "completed", "cancelled"].includes(item.status) && (
              <Can app="purchase" module="purchaseorder" action="edit">
                <Button
                  onClick={() =>
                    history.push({
                      pathname: `/${tenantSchema}/purchase/purchase-order/${extractRFQID(
                        item.url
                      )}/edit`,
                      state: {
                        po: {
                          item,
                          rfq: {
                            id: item?.related_rfq,
                            vendor: item?.vendor,
                            items: item?.items,
                          },
                          destination_location: {
                            ...singleLocation,
                          },
                          currency: item?.currency,
                          payment_terms: item?.payment_terms,
                          purchase_policy: item?.purchase_policy,
                          delivery_terms: item?.delivery_terms,
                          status: "draft",
                          is_hidden: true,
                        },
                        edit: true,
                      },
                    })
                  }
                >
                  Edit
                </Button>
              </Can>
            )}
            <Button
              variant="outlined"
              onClick={() =>
                history.push(`/${tenantSchema}/purchase/purchase-order`)
              }
            >
              Close
            </Button>
          </div>
        </div>

        <Box width="80%">
          <TableContainer
            component={Paper}
            sx={{ boxShadow: "none", border: "none" }}
          >
            <Table
              sx={{
                border: "none",
                "& .MuiTableCell-root": {
                  borderBottom: "none",
                },
              }}
              size="small"
            >
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>RFQ ID</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>
                    Destination Location
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>
                    Date Created
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Created By</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell
                    sx={{
                      backgroundColor: "#fff",
                      color: "#353536",
                      fontSize: 12,
                    }}
                  >
                    {extractRFQID(item.url) || "N/A"}
                  </TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: "#fff",
                      color: "#353536",
                      fontSize: 12,
                    }}
                  >
                    {extractRFQID(item?.related_rfq) || "N/A"}
                  </TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: "#fff",
                      color: "#353536",
                      fontSize: 12,
                    }}
                  >
                    {singleLocation?.location_name || "N/A"}
                  </TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: "#fff",
                      color: "#353536",
                      fontSize: 12,
                    }}
                  >
                    {formatDate(item.date_created) || "N/A"}
                  </TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: "#fff",
                      color: "#353536",
                      fontSize: 12,
                    }}
                  >
                    {" "}
                    {item?.created_by_details.user?.first_name.trim().length <=
                      0 &&
                    item?.created_by_details.user?.last_name.trim().length <= 0
                      ? item?.created_by_details.user?.username
                      : `${item?.created_by_details?.user?.first_name}
                    ${item?.created_by_details?.user?.last_name}`}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Box borderBottom={1} borderColor="#f2f2f2" mt={-4} />

        <div className="poStatusVendor">
          <Box display={"grid"} gap={1}>
            <Typography fontWeight={"bold"} mb={1}>
              Vendor
            </Typography>

            <Typography variant="p" color={"#353536"}>
              {item?.vendor_details?.company_name || ""}
            </Typography>
          </Box>
        </div>

        <div className="rfqRequestInfo">
          <div className="poStatusVendor">
            <div>
              <Typography fontWeight={"bold"} mb={1}>
                Vendor Address
              </Typography>
              <Typography variant="p" color={"#353536"}>
                {item.vendor_details?.address || "N/A"}
              </Typography>
            </div>
            <div>
              <Typography fontWeight={"bold"} mb={1}>
                Vendor Email
              </Typography>
              <Typography variant="p" color={"#353536"}>
                {item.vendor_details?.email || "N/A"}
              </Typography>
            </div>
          </div>

          <div className="poStatusInfo" style={{ marginTop: 25 }}>
            <div>
              <Typography fontWeight={"bold"} mb={1}>
                Currency Type
              </Typography>
              <Typography variant="p" color={"#353536"}>
                {item.currency_details
                  ? `${item.currency_details.currency_name} - ${item.currency_details.currency_symbol}`
                  : "N/A"}
              </Typography>
            </div>
            <div>
              <Typography fontWeight={"bold"} mb={1}>
                Payment Terms
              </Typography>
              <Typography variant="p" color={"#353536"}>
                {item.payment_terms || "N/A"}
              </Typography>
            </div>
            <div>
              <Typography fontWeight={"bold"} mb={1}>
                Purchase Policy
              </Typography>
              <Typography variant="p" color={"#353536"}>
                {item.purchase_policy || "N/A"}
              </Typography>
            </div>
            <div>
              <Typography fontWeight={"bold"} mb={1}>
                {" "}
                Delivery Terms
              </Typography>
              <Typography variant="p" color={"#353536"}>
                {item.delivery_terms || "N/A"}
              </Typography>
            </div>
          </div>
        </div>

        <p className="rfqContent">Purchase Order Items</p>
        <TableContainer
          component={Paper}
          sx={{
            boxShadow: "none",
            borderRadius: 2,
            border: "1px solid #f2f2f2",
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                {[
                  "Product Name",
                  "Description",
                  "Qty",
                  "Unit of Measure",
                  "Actual Unit Price",
                  "Total Price",
                ].map((head) => (
                  <TableCell
                    key={head}
                    sx={{ padding: "24px", fontWeight: "bold" }}
                  >
                    {head}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>{renderedRows}</TableBody>
          </Table>
        </TableContainer>

        {footerConfig && (
          <div className="rfqStatusFooter">
            <div className="approvedIcon">
              {footerConfig.icon}
              <p
                style={{
                  color: statusColor(item.status),
                  textTransform: "capitalize",
                  marginLeft: 8,
                }}
              >
                {footerConfig.label}
              </p>
            </div>
            <div className="rfqStatusDraftFooterBtns">
              {footerConfig.actions.map((action, idx) => (
                <Can
                  app={action.action[0]}
                  module={action.action[1]}
                  action={action.action[2]}
                  key={idx}
                >
                  <Button
                    variant="contained"
                    disableElevation
                    color={action.color}
                    onClick={action.onClick}
                    disabled={action.disabled || actionLoading}
                    sx={{ ml: 1 }}
                  >
                    {action.text}
                  </Button>
                </Can>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchaseOrderInfo;
