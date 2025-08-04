import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Link, useHistory, useParams } from "react-router-dom";
import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Box,
  Grid,
  Typography,
  IconButton,
  Tooltip,
} from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

import autosaveIcon from "../../../../image/autosave.svg";
import approvedIcon from "../../../../../src/image/icons/approved-rfq.svg";
import { extractRFQID, formatDate, parsePRId } from "../../../../helper/helper";
import { useTenant } from "../../../../context/TenantContext";
import { usePurchase } from "../../../../context/PurchaseContext";
import { useCustomLocation } from "../../../../context/Inventory/LocationContext";
import Can from "../../../../components/Access/Can";
import Swal from "sweetalert2";

const textStyle = {
  backgroundColor: "#fff",
  color: "#7a8a98",
  fontSize: 12,
  // padding: "8px 12px",
  // border: "1px solid #eee",
};

const labelStyle = {
  ...textStyle,
  fontWeight: "bold",
  // backgroundColor: "#f5f5f5",
};

// Style constants
const cellStyle = (index) => ({
  backgroundColor: index % 2 === 0 ? "#f2f2f2" : "#fff",
  color: "#7a8a98",
  fontSize: 12,
});
const statusColorMap = {
  approved: "#2ba24c",
  pending: "#f0b501",
  rejected: "#e43e2b",
  default: "#3B7CED",
};
const statusColor = (s) => statusColorMap[s] || statusColorMap.default;

// Status → handler mapping
const statusActions = {
  approve: "approvePurchaseRequest",
  reject: "rejectPurchaseRequest",
  pending: "pendingPurchaseRequest",
  draft: "updatePurchaseRequest",
};

const PurchaseRequestInfo = () => {
  const { tenantData } = useTenant();
  const {
    fetchSinglePurchaseRequest,
    approvePurchaseRequest,
    rejectPurchaseRequest,
    pendingPurchaseRequest,
    updatePurchaseRequest,
  } = usePurchase();

  const { getSingleLocation } = useCustomLocation();

  const tenantSchema = tenantData?.tenant_schema_name;
  const { id } = useParams();
  const history = useHistory();

  // State
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [navigation, setNavigation] = useState({
    nextId: null,
    prevId: null,
    loading: false,
  });

  // Placeholder notification hooks
  const showError = useCallback((msg) => {
    Swal.fire({
      icon: "error",
      title: "Error",
      html: msg || "An unknown error occurred.",
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

  // Load adjacent PR IDs
  const loadAdjacentIds = useCallback(async (currentId) => {
    try {
      setNavigation((prev) => ({ ...prev, loading: true }));

      const parsed = parsePRId(currentId);
      if (!parsed) return;

      const { prefix, number } = parsed;
      const nextId = `${prefix}${String(number + 1).padStart(
        String(number).length,
        "0"
      )}`;
      const prevId =
        number > 1
          ? `${prefix}${String(number - 1).padStart(
              String(number).length,
              "0"
            )}`
          : null;

      setNavigation({ nextId, prevId, loading: false });
    } catch (error) {
      console.error("Navigation error:", error);
      setNavigation((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  // Centralized data loader
  const loadPurchaseRequest = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchSinglePurchaseRequest(id);
      if (res.success) {
        setItem(res.data);

        // Load adjacent IDs after successful fetch
        loadAdjacentIds(id);
      } else {
        console.error(res);
        showError("Failed to load purchase request.");
      }
    } catch (err) {
      showError(err.message || "An error occurred while fetching data.");
    } finally {
      setLoading(false);
    }
  }, [fetchSinglePurchaseRequest, id, showError, loadAdjacentIds]);

  // Load location data
  const loadLocation = useCallback(
    async (locationId) => {
      if (!locationId) return;

      setLocationLoading(true);
      try {
        const locationData = await getSingleLocation(locationId);
        setLocation(locationData);
      } catch (err) {
        console.error("Location fetch error:", err);
        setLocation(null);
      } finally {
        setLocationLoading(false);
      }
    },
    [getSingleLocation]
  );

  const requester = useMemo(() => {
    if (!item) return "N/A";
    const user = item?.requester_details?.user;
    return user
      ? `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
          user.username
      : "N/A";
  }, [item]);

  useEffect(() => {
    loadPurchaseRequest();
  }, [loadPurchaseRequest]);

  useEffect(() => {
    if (item?.requesting_location) {
      loadLocation(item.requesting_location);
    }
  }, [item, loadLocation]);

  // Unified status-change handler
  const handleStatusChange = useCallback(
    async (newStatus) => {
      if (!item) return;

      setActionLoading(true);

      const prId = extractRFQID(item.url);
      if (!prId) {
        showError("Invalid purchase request ID");
        setActionLoading(false);
        return;
      }

      const payload = {
        status: newStatus,
        // Include other necessary fields here
      };

      try {
        const actionMap = {
          approve: approvePurchaseRequest,
          reject: rejectPurchaseRequest,
          pending: pendingPurchaseRequest,
          draft: updatePurchaseRequest,
        };

        const action = actionMap[newStatus];
        if (!action) throw new Error(`Unknown action: ${newStatus}`);

        await action(payload, prId);

        showSuccess(`Purchase request status updated to ${newStatus}`);
        await loadPurchaseRequest();
      } catch (err) {
        showError(err.message || `Could not ${newStatus} request.`);
      } finally {
        setActionLoading(false);
      }
    },
    [item, showError, showSuccess, loadPurchaseRequest]
  );

  // Convert to RFQ
  const handleConvertToRFQ = useCallback(() => {
    if (!item) return;

    history.push({
      pathname: `/${tenantSchema}/purchase/request-for-quotations/new`,
      state: { rfq: item, isConvertToRFQ: true },
    });
  }, [history, tenantSchema, item]);

  const handleEditClick = useCallback(() => {
    if (!item) return;

    history.push({
      pathname: `/${tenantSchema}/purchase/purchase-request/${item.id}/edit`,
      state: { pr: item, edit: true },
    });
  }, [history, tenantSchema, item]);

  const handleNavigate = useCallback(
    (newId) => {
      if (!newId) return;

      history.push(`/${tenantSchema}/purchase/purchase-request/${newId}/`);
    },
    [history, tenantSchema]
  );
  console.log(location);
  // Render items table rows
  const renderedRows = useMemo(() => {
    if (!item?.items) return null;

    if (item.items.length === 0) {
      return (
        <TableRow>
          <TableCell
            colSpan={6}
            align="center"
            sx={{ color: "#7a8a98", fontSize: 12, py: 4 }}
          >
            No items available
          </TableCell>
        </TableRow>
      );
    }

    return item.items.map((row, idx) => {
      const uom = row.product_details?.unit_of_measure_details?.unit_name;
      const price = parseFloat(row.estimated_unit_price || 0);
      const qty = parseInt(row.qty || 0, 10);
      const total = price * qty;

      return (
        <TableRow key={row.url || idx}>
          <TableCell sx={cellStyle(idx)}>
            {row.product_details?.product_name || "N/A"}
          </TableCell>
          <TableCell sx={cellStyle(idx)}>{row.description || "N/A"}</TableCell>
          <TableCell sx={cellStyle(idx)}>{qty || "N/A"}</TableCell>
          <TableCell sx={cellStyle(idx)}>{uom || "N/A"}</TableCell>
          <TableCell sx={cellStyle(idx)}>
            {price ? price.toFixed(2) : "N/A"}
          </TableCell>
          <TableCell sx={cellStyle(idx)}>
            {total ? total.toFixed(2) : "N/A"}
          </TableCell>
        </TableRow>
      );
    });
  }, [item]);

  // Footer configuration
  const footerConfig = useMemo(() => {
    if (!item) return null;

    const st = item.status;
    switch (st) {
      case "approved":
        return {
          icon: (
            <img src={approvedIcon} alt="approved" width={24} height={24} />
          ),
          label: "Approved",
          actions: [
            {
              text: "Convert to RFQ",
              onClick: handleConvertToRFQ,
              disabled: actionLoading,
              action: "create",
            },
          ],
        };
      case "pending":
        return {
          label: "Pending",
          actions: [
            {
              text: "Approve",
              onClick: () => handleStatusChange("approve"),
              color: "success",
              action: "approve",
            },
            {
              text: "Reject",
              onClick: () => handleStatusChange("reject"),
              color: "error",
              action: "reject",
            },
          ],
        };
      case "rejected":
        return {
          label: "Rejected",
          actions: [],
        };
      case "draft":
        return {
          label: "Drafted",
          actions: [
            {
              text: "Send for Approval",
              onClick: () => handleStatusChange("pending"),
              disabled: actionLoading,
              action: "edit",
            },
          ],
        };
      default:
        return null;
    }
  }, [item, handleConvertToRFQ, handleStatusChange, actionLoading]);

  if (loading || !item) {
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

  return (
    <div className="rfqStatus">
      {/* Header */}
      <div className="rfqHeader">
        <div className="rfqHeaderLeft">
          <Link to={`/${tenantSchema}/purchase/purchase-request/new`}>
            <Button variant="contained" disableElevation>
              New Purchase Request
            </Button>
          </Link>
          <div className="rfqAutosave">
            <p>Autosave</p>
            <img
              src={autosaveIcon}
              alt="Autosave icon"
              width={20}
              height={20}
            />
          </div>
        </div>

        <Box
          display="flex"
          alignItems="center"
          gap={1}
          backgroundColor="white"
          border="1px solid #E2E6E9"
          borderRadius="4px"
          paddingY={0.5}
          paddingX={1}
        >
          <Tooltip title="Previous Purchase Request">
            <span>
              <IconButton
                onClick={() => handleNavigate(navigation.prevId)}
                disabled={!navigation.prevId || navigation.loading}
              >
                <ArrowBackIosIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>

          <Box
            sx={{
              width: "2px",
              backgroundColor: "#E2E6E9",
              alignSelf: "stretch",
              borderRadius: "1px",
            }}
          />

          <Tooltip title="Next Purchase Request">
            <span>
              <IconButton
                onClick={() => handleNavigate(navigation.nextId)}
                disabled={!navigation.nextId || navigation.loading}
              >
                <ArrowForwardIosIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </div>

      {/* Content */}
      <div className="rfqStatusContent">
        {/* Basic Info */}
        <div className="rfqBasicInfo">
          <h2>Basic Information</h2>
          <div className="editCancel">
            <Can app="purchase" module="purchaserequest" action="edit">
              {!["pending", "approved", "rejected"].includes(item.status) && (
                <Button onClick={handleEditClick} disabled={actionLoading}>
                  Edit
                </Button>
              )}
            </Can>

            <Link to={`/${tenantSchema}/purchase/purchase-request`}>
              <Button variant="outlined">Close</Button>
            </Link>
          </div>
        </div>

        {/* Status */}
        <Box>
          <Typography>Status</Typography>
          <Typography
            style={{
              color: statusColor(item.status),
              textTransform: "capitalize",
            }}
          >
            {item.status}
          </Typography>
        </Box>

        {/* Details */}
        <TableContainer
          component={Paper}
          sx={{ boxShadow: "none", border: "none" }}
        >
          <Table>
            <TableHead sx={{ backgroundColor: "#f2f2f2" }}>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Requesting Location</TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody sx={{ borderBottom: "1px solid #E2E6E9" }}>
              <TableRow>
                <TableCell sx={{ color: "#7a8a98", fontSize: 12 }}>
                  {extractRFQID(item.url) || "N/A"}
                </TableCell>
                <TableCell sx={{ color: "#7a8a98", fontSize: 12 }}>
                  {locationLoading ? (
                    <CircularProgress size={20} />
                  ) : (
                    location?.data?.location_name || "N/A"
                  )}
                </TableCell>
                <TableCell sx={{ color: "#7a8a98", fontSize: 12 }}>
                  {formatDate(item.date_created) || "N/A"}
                </TableCell>
              </TableRow>
            </TableBody>

            {/* Purpose/Vendor */}
            <TableHead sx={{ backgroundColor: "#f2f2f2" }}>
              <TableRow>
                <TableCell>Requester</TableCell>
                <TableCell>Purpose</TableCell>
                <TableCell>Vendor</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell sx={{ color: "#7a8a98", fontSize: 12 }}>
                  {requester}
                </TableCell>
                <TableCell sx={{ color: "#7a8a98", fontSize: 12 }}>
                  {item.purpose || "N/A"}
                </TableCell>
                <TableCell sx={{ color: "#7a8a98", fontSize: 12 }}>
                  {item.vendor_details?.company_name || "N/A"}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        {/* Items */}
        <p className="rfqContent">Purchase Request Items</p>
        <TableContainer
          component={Paper}
          sx={{ boxShadow: "none", borderRadius: 2 }}
        >
          <Table>
            <TableHead sx={{ backgroundColor: "#f2f2f2" }}>
              <TableRow>
                {[
                  "Product Name",
                  "Description",
                  "Qty",
                  "Unit of Measure",
                  "Estimated Unit Price",
                  "Total Price",
                ].map((head) => (
                  <TableCell key={head}>{head}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>{renderedRows}</TableBody>
          </Table>
        </TableContainer>

        {/* Footer */}
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
              {footerConfig.actions.map((action, i) => (
                <Can
                  key={i}
                  app="purchase"
                  module="purchaserequest"
                  action={action.action}
                >
                  <Button
                    variant="contained"
                    disableElevation
                    color={action.color}
                    onClick={action.onClick}
                    disabled={action.disabled || actionLoading}
                    sx={{ ml: 1 }}
                  >
                    {actionLoading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      action.text
                    )}
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

export default PurchaseRequestInfo;
