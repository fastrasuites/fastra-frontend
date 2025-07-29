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
} from "@mui/material";

import autosaveIcon from "../../../../image/autosave.svg";
import approvedIcon from "../../../../../src/image/icons/approved-rfq.svg";
import { extractRFQID, formatDate } from "../../../../helper/helper";
import { useTenant } from "../../../../context/TenantContext";
import { useRFQ } from "../../../../context/RequestForQuotation";
import Can from "../../../../components/Access/Can";

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

// Map action keys
const statusActions = {
  approve: "approveRFQ",
  reject: "rejectRFQ",
  pending: "pendingRFQ",
};

const RFQInfo = () => {
  const { tenantData } = useTenant();
  const tenantSchema = tenantData?.tenant_schema_name;
  const { id } = useParams();
  const history = useHistory();

  const { getRFQById, approveRFQ, rejectRFQ, pendingRFQ } = useRFQ();

  const [item, setItem] = useState({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Notifications (plug in toast/snackbar)
  const showError = useCallback((msg, err) => console.error(msg, err), []);
  const showSuccess = useCallback((msg) => console.log(msg), []);

  // Load RFQ data
  const loadRFQ = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getRFQById(id);
      if (res.success) {
        setItem(res.data);
      } else showError("Failed to load RFQ.");
    } catch (err) {
      showError("Error fetching RFQ.", err);
    } finally {
      setLoading(false);
    }
  }, [getRFQById, id, showError]);

  useEffect(() => {
    loadRFQ();
  }, [loadRFQ]);

  // Status change handler
  const handleStatusChange = useCallback(
    async (newStatus) => {
      setActionLoading(true);
      const prId = extractRFQID(item.url);
      const payload = {
        status: newStatus,
      };
      try {
        const actionName = statusActions[newStatus];
        if (!actionName) throw new Error("Unknown action");
        await { approveRFQ, rejectRFQ, pendingRFQ }[actionName](payload, prId);
        showSuccess(`Status set to "${newStatus}"`);
        await loadRFQ();
      } catch (err) {
        showError(`Could not ${newStatus} RFQ.`, err);
      } finally {
        setActionLoading(false);
      }
    },
    [item, approveRFQ, rejectRFQ, pendingRFQ, loadRFQ, showError, showSuccess]
  );

  // Convert to PO
  const handleConvertToPO = useCallback(() => {
    history.push({
      pathname: `/${tenantSchema}/purchase/purchase-order/new`,
      state: {
        conversionRFQ: { item, rfq: item },
        ref: item,
        isConvertToPO: true,
      },
    });
  }, [history, tenantSchema, item]);

  // Render rows
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
              <TableCell sx={cellStyle(idx)}>{row.qty || "N/A"}</TableCell>
              <TableCell sx={cellStyle(idx)}>
                {row.product_details.unit_of_measure_details?.unit_name ||
                  "N/A"}
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

  // Footer config
  const footerConfig = useMemo(() => {
    switch (item.status) {
      case "approved":
        return {
          icon: (
            <img src={approvedIcon} alt="approved" width={24} height={24} />
          ),
          label: "Successfully Sent",
          actions: [
            {
              text: "Convert to PO",
              onClick: handleConvertToPO,
              disabled: actionLoading,
              action: ["purchaseorder", "create"],
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
              action: ["requestforquotation", "approve"],
            },
            {
              text: "Reject",
              onClick: () => handleStatusChange("reject"),
              color: "error",
              action: ["requestforquotation", "reject"],
            },
          ],
        };
      case "rejected":
      case "cancelled":
        return {
          label: "Rejected",
          actions: [
            // {
            //   text: "Set Back to Pending",
            //   onClick: () => handleStatusChange("pending"),
            // },
          ],
        };
      case "draft":
        return {
          label: "Drafted",
          actions: [
            {
              text: "Set to Pending",
              onClick: () => handleStatusChange("pending"),
              action: ["requestforquotation", "edit"],
            },
          ],
        };
      default:
        return null;
    }
  }, [item.status, handleConvertToPO, handleStatusChange, actionLoading]);

  if (loading)
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

  return (
    <div className="rfqStatus">
      <div className="rfqHeader">
        <div className="rfqHeaderLeft">
          <Link to={`/${tenantSchema}/purchase/request-for-quotations/new`}>
            <Button variant="contained" disableElevation>
              New RFQ
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
        <Box width={"80%"}>
          <TableContainer
            component={Paper}
            sx={{
              boxShadow: "none",
              border: "none", // remove container border
            }}
          >
            <Table
              sx={{
                border: "none",
                "& .MuiTableCell-root": {
                  borderBottom: "none",
                },
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Date Opened</TableCell>
                  <TableCell>Currency</TableCell>
                  <TableCell>Expiry Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell
                    sx={{
                      backgroundColor: "#fff",
                      color: "#353536",
                      fontSize: 12,
                      borderBottom: "none", // reinforce no border
                    }}
                  >
                    {extractRFQID(item.url) || "N/A"}
                  </TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: "#fff",
                      color: "#353536",
                      fontSize: 12,
                      borderBottom: "none",
                    }}
                  >
                    {formatDate(Date.now()) || "N/A"}
                  </TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: "#fff",
                      color: "#353536",
                      fontSize: 12,
                      borderBottom: "none",
                    }}
                  >
                    {item.currency
                      ? `${item?.currency_details?.currency_name} (${item?.currency_details?.currency_symbol})`
                      : "N/A"}
                  </TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: "#fff",
                      color: "#353536",
                      fontSize: 12,
                      borderBottom: "none",
                    }}
                  >
                    {formatDate(item.expiry_date) || "N/A"}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Box borderBottom={1} borderColor={"#f2f2f2"} mt={-4} />

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
            <TableHead>
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
                  app="purchase"
                  module={action.action[0]}
                  action={action.action[1]}
                >
                  <Button
                    key={idx}
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

export default RFQInfo;
