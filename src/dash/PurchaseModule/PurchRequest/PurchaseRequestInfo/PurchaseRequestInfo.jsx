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
} from "@mui/material";

import autosaveIcon from "../../../../image/autosave.svg";
import approvedIcon from "../../../../../src/image/icons/approved-rfq.svg";
import { extractRFQID, formatDate } from "../../../../helper/helper";
import { useTenant } from "../../../../context/TenantContext";
import { usePurchase } from "../../../../context/PurchaseContext";
import { useCustomLocation } from "../../../../context/Inventory/LocationContext";
import Can from "../../../../components/Access/Can";

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

  const { getSingleLocation, singleLocation } = useCustomLocation();

  const tenantSchema = tenantData?.tenant_schema_name;
  const { id } = useParams();
  const history = useHistory();

  // State
  const [item, setItem] = useState({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Placeholder notification hooks (plug in your toast library)
  const showError = useCallback((msg) => {
    // e.g. enqueueSnackbar(msg, { variant: "error" });
    console.error(msg);
  }, []);
  const showSuccess = useCallback((msg) => {
    // e.g. enqueueSnackbar(msg, { variant: "success" });
  }, []);

  // Centralized data loader
  const loadPurchaseRequest = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchSinglePurchaseRequest(id);
      if (res.success) {
        setItem(res.data);
      } else {
        showError("Failed to load purchase request.");
      }
    } catch (err) {
      showError("An error occurred while fetching data.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [fetchSinglePurchaseRequest, id, showError]);

  const requester =
    item?.requester_details?.user?.first_name &&
    item?.requester_details?.user?.last_name
      ? `${item?.requester_details?.user?.first_name} ${item?.requester_details?.user?.last_name}`
      : item?.requester_details?.user?.username;

  useEffect(() => {
    loadPurchaseRequest();
  }, [loadPurchaseRequest]);

  useEffect(() => {
    if (item.requesting_location) {
      getSingleLocation(item.requesting_location);
    }
  }, [getSingleLocation, item.requesting_location]);

  // Unified status-change handler
  const handleStatusChange = useCallback(
    async (newStatus) => {
      setActionLoading(true);

      // build payload
      const prId = extractRFQID(item.url);
      const payload = {
        //   vendor: item.vendor?.url || item.vendor,
        //   currency: item.currency?.url || item.currency,
        status: newStatus,
        // purpose: item.purpose,
        // items: (item.items || []).map((it) => ({
        //   product: it.product.url,
        //   description: it.description,
        //   qty: Number(it.qty) || 0,
        //   unit_of_measure: it.unit_of_measure?.url || it.unit_of_measure?.[0],
        //   estimated_unit_price: it.estimated_unit_price,
        // })),
        // is_hidden: item.is_hidden,
      };

      try {
        const actionName = statusActions[newStatus];
        if (!actionName) throw new Error("Unknown action");

        // call the appropriate context method
        await {
          approvePurchaseRequest,
          rejectPurchaseRequest,
          pendingPurchaseRequest,
          updatePurchaseRequest,
        }[actionName](payload, prId);

        showSuccess(`Successfully set status to "${newStatus}"`);
        await loadPurchaseRequest();
      } catch (err) {
        showError(`Could not ${newStatus} request.`);
        console.error(err);
      } finally {
        setActionLoading(false);
      }
    },
    [
      item,
      approvePurchaseRequest,
      rejectPurchaseRequest,
      pendingPurchaseRequest,
      updatePurchaseRequest,
      loadPurchaseRequest,
      showError,
      showSuccess,
    ]
  );

  // Convert to RFQ
  const handleConvertToRFQ = useCallback(() => {
    history.push({
      pathname: `/${tenantSchema}/purchase/request-for-quotations/new`,
      state: { rfq: item, isConvertToRFQ: true },
    });
  }, [history, tenantSchema, item]);

  const handleEditClick = (id) => {
    history.push({
      pathname: `/${tenantSchema}/purchase/purchase-request/${id}/edit`,
      state: { pr: item, edit: true },
    });
  };

  // Render items table rows
  const renderedRows = useMemo(
    () =>
      (item.items || []).length
        ? item.items.map((row, idx) => (
            <TableRow key={row.url || idx}>
              <TableCell sx={cellStyle(idx)}>
                {row.product_details?.product_name || "N/A"}
              </TableCell>
              <TableCell sx={cellStyle(idx)}>
                {row.description || "N/A"}
              </TableCell>
              <TableCell sx={cellStyle(idx)}>{row.qty ?? "N/A"}</TableCell>
              <TableCell sx={cellStyle(idx)}>
                {row.product_details.unit_of_measure_details.unit_name || "N/A"}
              </TableCell>
              <TableCell sx={cellStyle(idx)}>
                {row.estimated_unit_price || "N/A"}
              </TableCell>
              <TableCell sx={cellStyle(idx)}>
                {row.estimated_unit_price * row.qty || "N/A"}
              </TableCell>
            </TableRow>
          ))
        : [
            <TableRow key="empty">
              <TableCell
                colSpan={6}
                align="center"
                sx={{ color: "#7a8a98", fontSize: 12 }}
              >
                No items available
              </TableCell>
            </TableRow>,
          ],
    [item.items]
  );

  // Footer configuration
  const footerConfig = useMemo(() => {
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
          actions: [
            {
              action: "reject",
            },
          ],
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
  }, [item.status, handleConvertToRFQ, handleStatusChange, actionLoading]);

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
      </div>

      {/* Content */}
      <div className="rfqStatusContent">
        {/* Basic Info */}
        <div className="rfqBasicInfo">
          <h2>Basic Information</h2>
          <div className="editCancel">
            <Can app="purchase" module="purchaserequest" action="edit">
              {!["pending", "approved", "rejected"].includes(item.status) && (
                <Button onClick={() => handleEditClick(item.id)}>Edit</Button>
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
        <Paper elevation={0}>
          <Grid container spacing={2}>
            {/* Row 1: ID | Location ID | Date */}
            <Grid item xs={12} sm={6} md={4}>
              <Typography sx={labelStyle}>ID</Typography>
              <Typography sx={textStyle}>
                {extractRFQID(item.url) || "N/A"}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography sx={labelStyle}>Requesting Location ID</Typography>
              <Typography sx={textStyle}>
                {singleLocation?.location_name || "N/A"}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography sx={labelStyle}>Date</Typography>
              <Typography sx={textStyle}>
                {formatDate(item.date_created) || "N/A"}
              </Typography>
            </Grid>

            {/* Row 2: Requester | Purpose | Vendor */}
            <Grid item xs={12} sm={6} md={4}>
              <Typography sx={labelStyle}>Requester</Typography>
              <Typography sx={textStyle}>{requester || "N/A"}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography sx={labelStyle}>Purpose</Typography>
              <Typography sx={textStyle}>{item.purpose || "N/A"}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography sx={labelStyle}>Vendor</Typography>
              <Typography sx={textStyle}>
                {item.vendor_details?.company_name || "N/A"}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

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
                  app="purchase"
                  module="purchaserequest"
                  action={action.action}
                >
                  <Button
                    key={i}
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

export default PurchaseRequestInfo;
