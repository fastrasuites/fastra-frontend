// src/dash/PurchaseModule/Rfq/RFQInfo.js
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
  IconButton,
  Tooltip,
} from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import autosaveIcon from "../../../../image/autosave.svg";
import approvedIcon from "../../../../../src/image/icons/approved-rfq.svg";
import { extractRFQID, formatDate } from "../../../../helper/helper";
import { useTenant } from "../../../../context/TenantContext";
import { useRFQ } from "../../../../context/RequestForQuotation";
import Can from "../../../../components/Access/Can";
import Swal from "sweetalert2";

// Style constants
const cellStyle = (index) => ({
  backgroundColor: index % 2 === 0 ? "#f2f2f2" : "#fff",
  color: "#353536",
  fontSize: 12,
});
const statusColorMap = {
  approved: "#2ba24c",
  pending: "#f0b501",
  rejected: "#e43e2b",
  cancelled: "#e43e2b",
  default: "#3B7CED",
};
const statusColor = (s) => statusColorMap[s] || statusColorMap.default;

const RFQInfo = () => {
  const { tenantData } = useTenant();
  const tenantSchema = tenantData?.tenant_schema_name;
  const { id } = useParams();
  const history = useHistory();

  const { getRFQById, approveRFQ, rejectRFQ, pendingRFQ } = useRFQ();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
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

  // Improved RFQ data loading
  const loadRFQ = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getRFQById(id);
      if (res.success) {
        setItem(res.data);
        // Load adjacent IDs after successful fetch
        loadAdjacentIds(id);
      } else {
        showError("Failed to load RFQ");
        history.push(`/${tenantSchema}/purchase/request-for-quotations`);
      }
    } catch (err) {
      if (err?.response?.status === 403) {
        setItem("FORBIDDEN");
      } else {
        showError(err.response.data.detail || "Error loading RFQ details");
      }
    } finally {
      setLoading(false);
    }
  }, [getRFQById, id, showError, history, tenantSchema]);

  // Simplified adjacent ID loading without parsePRId
  const loadAdjacentIds = useCallback((currentId) => {
    try {
      setNavigation((prev) => ({ ...prev, loading: true }));

      // Extract numeric portion from ID (works for formats like RFQ123, RFQ00123, etc.)
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

  useEffect(() => {
    loadRFQ();
  }, [loadRFQ]);

  // Enhanced status change handler
  const handleStatusChange = useCallback(
    async (newStatus) => {
      if (!item) return;

      setActionLoading(true);
      try {
        const rfqId = extractRFQID(item.url);
        if (!rfqId) {
          showError("Invalid RFQ ID");
          return;
        }

        const actionMap = {
          approve: approveRFQ,
          reject: rejectRFQ,
          pending: pendingRFQ,
        };

        const action = actionMap[newStatus];
        if (!action) {
          throw new Error(`Invalid status action: ${newStatus}`);
        }

        const payload = { status: newStatus };
        await action(payload, rfqId);

        showSuccess(`RFQ status updated to ${newStatus}`);
        await loadRFQ();
      } catch (err) {
        showError(err.message || `Failed to ${newStatus} RFQ`);
      } finally {
        setActionLoading(false);
      }
    },
    [item, approveRFQ, rejectRFQ, pendingRFQ, loadRFQ, showError, showSuccess]
  );

  // Improved Convert to PO handler
  const handleConvertToPO = useCallback(() => {
    if (!item) return;

    history.push({
      pathname: `/${tenantSchema}/purchase/purchase-order/new`,
      state: {
        conversionRFQ: { item, rfq: item },
        ref: item,
        isConvertToPO: true,
      },
    });
  }, [history, tenantSchema, item]);

  // Navigation handler with validation
  const handleNavigate = useCallback(
    (newId) => {
      if (!newId || navigation.loading) return;
      history.push(`/${tenantSchema}/purchase/request-for-quotations/${newId}`);
    },
    [history, tenantSchema, navigation.loading]
  );

  // Memoized table rows with better empty state
  const renderedRows = useMemo(() => {
    if (!item?.items) return null;

    if (item.items.length === 0) {
      return (
        <TableRow>
          <TableCell
            colSpan={6}
            align="center"
            sx={{ py: 4, color: "#7a8a98", fontSize: 12 }}
          >
            No items available
          </TableCell>
        </TableRow>
      );
    }

    return item.items.map((row, idx) => {
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
          <TableCell sx={cellStyle(idx)}>
            {row.product_details?.unit_of_measure_details?.unit_name || "N/A"}
          </TableCell>
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

  // Footer configuration with loading states
  const footerConfig = useMemo(() => {
    if (!item?.status) return null;
    console.log(item);

    const baseConfig = {
      icon:
        item.status === "approved" ? (
          <img src={approvedIcon} alt="approved" width={24} height={24} />
        ) : null,
      label:
        item.status === "approved"
          ? "Successfully Sent"
          : item.status.charAt(0).toUpperCase() + item.status.slice(1),
    };

    switch (item.status) {
      case "approved":
        return {
          ...baseConfig,
          actions: [
            {
              text: actionLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Convert to PO"
              ),
              onClick: handleConvertToPO,
              disabled: actionLoading,
              action: ["purchaseorder", "create"],
            },
          ],
        };
      case "pending":
        return {
          ...baseConfig,
          actions: [
            {
              text: actionLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Approve"
              ),
              onClick: () => handleStatusChange("approve"),
              color: "success",
              action: ["requestforquotation", "approve"],
            },
            {
              text: actionLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Reject"
              ),
              onClick: () => handleStatusChange("reject"),
              color: "error",
              action: ["requestforquotation", "reject"],
            },
          ],
        };
      case "draft":
        return {
          ...baseConfig,
          actions: [
            {
              text: actionLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Send to Approval"
              ),
              onClick: () => handleStatusChange("pending"),
              color: "primary",
              action: ["requestforquotation", "edit"],
            },
          ],
        };
      default:
        return baseConfig;
    }
  }, [item, handleConvertToPO, handleStatusChange, actionLoading]);

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

  if (item === "FORBIDDEN") {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: 400,
          color: "red",
          fontWeight: "bold",
          fontSize: 24,
          textAlign: "center",
          px: 2,
        }}
      >
        You do not have permission to view this page.
        <br />
        Please request access from the admin.
      </Box>
    );
  }

  return (
    <div className="rfqStatus">
      {/* Header with improved navigation */}
      <div className="rfqHeader">
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          width="100%"
        >
          <Box display="flex" gap={4}>
            <Can app="purchase" module="requestforquotation" action="create">
              <Link to={`/${tenantSchema}/purchase/request-for-quotations/new`}>
                <Button variant="contained" disableElevation>
                  New RFQ
                </Button>
              </Link>
            </Can>
            <div className="rfqAutosave">
              <p>Autosave</p>
              <img src={autosaveIcon} alt="Autosave" width={20} height={20} />
            </div>
          </Box>

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
            <Tooltip title="Previous RFQ">
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

            <Tooltip title="Next RFQ">
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

      {/* Main content */}
      <div className="rfqStatusContent">
        <div className="rfqBasicInfo">
          <h2>Basic Information</h2>
          <div className="editCancel">
            {!["pending", "approved", "rejected", "cancelled"].includes(
              item.status
            ) && (
              <Can app="purchase" module="requestforquotation" action="edit">
                <Button
                  onClick={() =>
                    history.push({
                      pathname: `/${tenantSchema}/purchase/request-for-quotations/${extractRFQID(
                        item.url
                      )}/edit`,
                      state: { rfq: item, edit: true },
                    })
                  }
                  disabled={actionLoading}
                >
                  Edit
                </Button>
              </Can>
            )}
            <Link to={`/${tenantSchema}/purchase/request-for-quotations`}>
              <Button variant="outlined">Close</Button>
            </Link>
          </div>
        </div>

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

        {/* Improved table layout */}
        <Box width="80%">
          <TableContainer component={Paper} sx={{ boxShadow: "none" }}>
            <Table sx={{ "& .MuiTableCell-root": { borderBottom: "none" } }}>
              <TableHead sx={{ bgcolor: "#f2f2f2" }}>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Date Opened</TableCell>
                  <TableCell>Currency</TableCell>
                  <TableCell>Expiry Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell sx={cellStyle(0)}>
                    {extractRFQID(item.url) || "N/A"}
                  </TableCell>
                  <TableCell sx={cellStyle(0)}>
                    {formatDate(item.date_created) || "N/A"}
                  </TableCell>
                  <TableCell sx={cellStyle(0)}>
                    {item.currency_details
                      ? `${item.currency_details.currency_name} (${item.currency_details.currency_symbol})`
                      : "N/A"}
                  </TableCell>
                  <TableCell sx={cellStyle(0)}>
                    {formatDate(item.expiry_date) || "N/A"}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Box borderBottom={1} borderColor="#f2f2f2" mt={-4} />

        <p className="rfqContent">RFQ Items</p>
        <TableContainer
          component={Paper}
          sx={{
            boxShadow: "none",
            borderRadius: 2,
            border: "1px solid #f2f2f2",
          }}
        >
          <Table>
            <TableHead sx={{ bgcolor: "#f2f2f2" }}>
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

        {/* Footer with loading states */}
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
              {footerConfig.actions?.map((action, idx) => (
                <Can
                  key={idx}
                  app="purchase"
                  module={action.action[0]}
                  action={action.action[1]}
                >
                  <Button
                    variant="contained"
                    disableElevation
                    color={action.color}
                    onClick={action.onClick}
                    disabled={action.disabled}
                    sx={{ ml: 1, minWidth: 120 }}
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

export default RFQInfo;
