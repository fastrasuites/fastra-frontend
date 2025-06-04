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
} from "@mui/material";

import autosaveIcon from "../../../../image/autosave.svg";
import approvedIcon from "../../../../../src/image/icons/approved-rfq.svg";
import { extractRFQID, formatDate } from "../../../../helper/helper";
import { useTenant } from "../../../../context/TenantContext";
import { usePurchase } from "../../../../context/PurchaseContext";

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
    console.log(msg);
  }, []);

  // Centralized data loader
  const loadPurchaseRequest = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchSinglePurchaseRequest(id);
      console.log(res, "res");
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

  useEffect(() => {
    loadPurchaseRequest();
  }, [loadPurchaseRequest]);

  // Unified status-change handler
  const handleStatusChange = useCallback(
    async (newStatus) => {
      setActionLoading(true);

      // build payload
      const prId = extractRFQID(item.url);
      const payload = {
        vendor: item.vendor?.url || item.vendor,
        currency: item.currency?.url || item.currency,
        status: newStatus,
        purpose: item.purpose,
        items: (item.items || []).map((it) => ({
          product: it.product.url,
          description: it.description,
          qty: Number(it.qty) || 0,
          unit_of_measure: it.unit_of_measure?.url || it.unit_of_measure?.[0],
          estimated_unit_price: it.estimated_unit_price,
        })),
        is_hidden: item.is_hidden,
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
    const prToConvert = {
      purchase_request: { id: item.id, items: item.items },
      currency: item.currency,
      vendor: item.vendor,
      vendor_category: "",
      items: item.items,
      status: "draft",
      is_hidden: false,
    };
    history.push({
      pathname: `/${tenantSchema}/purchase/request-for-quotations/new`,
      state: { rfq: prToConvert },
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
                {row.product?.product_name || "N/A"}
              </TableCell>
              <TableCell sx={cellStyle(idx)}>
                {row.description || "N/A"}
              </TableCell>
              <TableCell sx={cellStyle(idx)}>{row.qty ?? "N/A"}</TableCell>
              <TableCell sx={cellStyle(idx)}>
                {row.unit_of_measure?.unit_category || "N/A"}
              </TableCell>
              <TableCell sx={cellStyle(idx)}>
                {row.estimated_unit_price || "N/A"}
              </TableCell>
              <TableCell sx={cellStyle(idx)}>
                {row.total_price || "N/A"}
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
            },
            {
              text: "Reject",
              onClick: () => handleStatusChange("reject"),
              color: "error",
            },
          ],
        };
      case "rejected":
        return {
          label: "Rejected",
          actions: [
            {
              text: "Set Back to Draft",
              onClick: () => handleStatusChange("draft"),
            },
          ],
        };
      case "draft":
        return {
          label: "Drafted",
          actions: [],
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
            {!["pending", "approved", "rejected"].includes(item.status) && (
              <Button onClick={() => handleEditClick(item.id)}>Edit</Button>
            )}
            <Link to={`/${tenantSchema}/purchase/purchase-request`}>
              <Button variant="outlined" onClick={() => history.goBack()}>
                Close
              </Button>
            </Link>
          </div>
        </div>

        {/* Status */}
        <div className="rfqStatusInfo">
          <p>Status</p>
          <p
            style={{
              color: statusColor(item.status),
              textTransform: "capitalize",
            }}
          >
            {item.status}
          </p>
        </div>

        {/* Details */}
        <TableContainer
          component={Paper}
          sx={{ boxShadow: "none", border: "none" }}
        >
          <Table>
            <TableHead sx={{ backgroundColor: "#f2f2f2" }}>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Requesting Location ID</TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody sx={{ borderBottom: "1px solid #E2E6E9" }}>
              <TableRow>
                <TableCell
                  sx={{
                    backgroundColor: "#fff",
                    color: "#7a8a98",
                    fontSize: 12,
                  }}
                >
                  {extractRFQID(item.url) || "N/A"}
                </TableCell>
                <TableCell
                  sx={{
                    backgroundColor: "#fff",
                    color: "#7a8a98",
                    fontSize: 12,
                  }}
                >
                  {item?.requesting_location}
                </TableCell>
                <TableCell
                  sx={{
                    backgroundColor: "#fff",
                    color: "#7a8a98",
                    fontSize: 12,
                  }}
                >
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
                <TableCell
                  sx={{
                    backgroundColor: "#fff",
                    color: "#7a8a98",
                    fontSize: 12,
                  }}
                >
                  {item.requester || "N/A"}
                </TableCell>
                <TableCell
                  sx={{
                    backgroundColor: "#fff",
                    color: "#7a8a98",
                    fontSize: 12,
                  }}
                >
                  {item.purpose || "N/A"}
                </TableCell>
                <TableCell
                  sx={{
                    backgroundColor: "#fff",
                    color: "#7a8a98",
                    fontSize: 12,
                  }}
                >
                  {item.vendor?.company_name || "N/A"}
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
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchaseRequestInfo;
