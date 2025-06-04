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
} from "@mui/material";
import autosave from "../../../../image/autosave.svg";
import approved from "../../../../../src/image/icons/approved-rfq.svg";
import "../PoStatusModal.css";
import "../../Rfq/RfqStatusModal.css";
import { Bounce, toast } from "react-toastify";
import { useHistory, useParams } from "react-router-dom";
import { usePurchaseOrder } from "../../../../context/PurchaseOrderContext.";
import { useTenant } from "../../../../context/TenantContext";
import { extractRFQID, formatDate } from "../../../../helper/helper";
import { useCustomLocation } from "../../../../context/Inventory/LocationContext";

// Shared cell style helper function to avoid repetition
const cellStyle = (index) => ({
  backgroundColor: index % 2 === 0 ? "#f2f2f2" : "#fff",
  color: "#7a8a98",
  fontSize: 12,
  padding: "24px",
});

const statusColorMap = {
  Completed: "#2ba24c",
  Awaiting: "#f0b501",
  Cancelled: "#e43e2b",
  default: "#3B7CED",
};
const statusColor = (s) =>
  statusColorMap[s.charAt(0).toUpperCase() + s.slice(1)] ||
  statusColorMap.default;

const PurchaseOrderInfo = () => {
  const { id } = useParams();
  const history = useHistory();
  const { tenantData } = useTenant();
  const tenant_schema_name = tenantData?.tenant_schema_name;
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

  const showError = useCallback((msg, err) => console.error(msg, err), []);
  const showSuccess = useCallback(
    (msg) => toast.success(msg, { transition: Bounce }),
    []
  );

  const handleConvertToInventory = () => {
    history.push({
      pathname: `/${tenant_schema_name}/inventory/operations/incoming-product/inventory-conversion`,
      state: { po: item },
    });
  };

  // console.log(item);

  // Load Purchase Order data
  const loadPO = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getPurchaseOrderById(id);
      if (res.success) setItem(res.data);
      else showError("Failed to load Purchase Order.");
    } catch (err) {
      showError("Error fetching Purchase Order.", err);
    } finally {
      setLoading(false);
    }
  }, [getPurchaseOrderById, id, showError]);

  useEffect(() => {
    loadPO();
  }, [loadPO]);

  useEffect(() => {
    if (item.destination_location) {
      getSingleLocation(item?.destination_location);
    }
  }, [getSingleLocation, item]);

  // Handle status change actions
  const handleStatusChange = useCallback(
    async (actionKey) => {
      setActionLoading(true);
      try {
        console.log(actionKey);
        const result = await updatePurchaseOrder({ status: actionKey }, id);
        if (result.success) showSuccess(`Status set to ${actionKey}`);
        else showError(`Failed to ${actionKey} purchase order.`);
        loadPO();
      } catch (err) {
        showError(`Error during ${actionKey}`, err);
      } finally {
        setActionLoading(false);
      }
    },
    [
      item,
      loadPO,
      showError,
      showSuccess,
      updatePurchaseOrder,
      updatePurchaseReject,
      updatePurchaseApproved,
    ]
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
          {row.product?.product_name || "N/A"}
          <Box borderBottom={"1px solid #C6CCD2"} mt={1} />
        </TableCell>
        <TableCell sx={cellStyle(idx)}>
          {row.description || "N/A"}
          <Box borderBottom={"1px solid #C6CCD2"} mt={1} />
        </TableCell>
        <TableCell sx={cellStyle(idx)}>
          {row.qty || "N/A"}
          <Box borderBottom={"1px solid #C6CCD2"} mt={1} />
        </TableCell>
        <TableCell sx={cellStyle(idx)}>
          {row.unit_of_measure?.unit_category || "N/A"}
          <Box borderBottom={"1px solid #C6CCD2"} mt={1} />
        </TableCell>
        <TableCell sx={cellStyle(idx)}>
          {row.estimated_unit_price || "N/A"}
          <Box borderBottom={"1px solid #C6CCD2"} mt={1} />
        </TableCell>
        <TableCell sx={cellStyle(idx)}>
          {row.get_total_price || "N/A"}
          <Box borderBottom={"1px solid #C6CCD2"} mt={1} />
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
            },
            {
              text: "Reject",
              color: "error",
              onClick: () => handleStatusChange("cancelled"),
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
            },
          ],
        };
      case "draft":
        return {
          label: "Drafted",
          actions: [
            {
              text: "Set to Pending",
              onClick: () => handleStatusChange("awaiting"),
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

  return (
    <div className="rfqStatus">
      <div className="rfqHeader">
        <div className="rfqHeaderLeft">
          <Typography
            variant="contained"
            disableElevation
            fontSize={"24px"}
            fontWeight={500}
          >
            New Purchase Order
          </Typography>
          <div className="rfqAutosave">
            <p>Autosave</p>
            <img src={autosave} alt="Autosave icon" />
          </div>
        </div>
      </div>

      <div className="rfqStatusContent">
        <div className="rfqBasicInfo">
          <h2>Basic Information</h2>
          <div className="editCancel">
            {!["awaiting", "completed", "cancelled"].includes(item.status) && (
              <Button
                onClick={() =>
                  history.push({
                    pathname: `/${tenant_schema_name}/purchase/purchase-order/${extractRFQID(
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
            )}
            <Button variant="outlined" onClick={() => history.goBack()}>
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
                  <TableCell>ID</TableCell>
                  <TableCell>RFQ ID</TableCell>
                  <TableCell>Destination Location</TableCell>
                  <TableCell>Date Created</TableCell>
                  <TableCell>Created By</TableCell>
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
                    {extractRFQID(item.url) || "N/A"}
                  </TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: "#fff",
                      color: "#7a8a98",
                      fontSize: 12,
                    }}
                  >
                    {extractRFQID(item?.related_rfq) || "N/A"}
                  </TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: "#fff",
                      color: "#7a8a98",
                      fontSize: 12,
                    }}
                  >
                    {extractRFQID(item?.destination_location) || "N/A"}
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
                  <TableCell
                    sx={{
                      backgroundColor: "#fff",
                      color: "#7a8a98",
                      fontSize: 12,
                    }}
                  >
                    {tenant_schema_name}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Box borderBottom={1} borderColor="#f2f2f2" mt={-4} />

        <div className="poStatusVendor">
          <Box display={"grid"} gap={1}>
            <p>Vendor</p>
            <TextField
              type="text"
              value={item.vendor?.company_name || ""}
              sx={{ width: "100%" }}
              disabled
            />
          </Box>
        </div>

        <div className="rfqRequestInfo">
          <div className="poStatusVendor">
            <div>
              <p>Vendor Address</p>
              <Typography variant="p" color={"#8C9AA6"}>
                {item.vendor?.address || "N/A"}
              </Typography>
            </div>
            <div>
              <p>Vendor Email</p>
              <Typography variant="p" color={"#8C9AA6"}>
                {item.vendor?.email || "N/A"}
              </Typography>
            </div>
          </div>

          <div className="poStatusInfo" style={{ marginTop: 25 }}>
            <div>
              <p>Currency Type</p>
              <Typography variant="p" color={"#8C9AA6"}>
                {item.currency
                  ? `${item.currency.currency_name} - ${item.currency.currency_symbol}`
                  : "N/A"}
              </Typography>
            </div>
            <div>
              <p>Payment Terms</p>
              <Typography variant="p" color={"#8C9AA6"}>
                {item.payment_terms || "N/A"}
              </Typography>
            </div>
            <div>
              <p>Purchase Policy</p>
              <Typography variant="p" color={"#8C9AA6"}>
                {item.purchase_policy || "N/A"}
              </Typography>
            </div>
            <div>
              <p>Delivery Terms</p>
              <Typography variant="p" color={"#8C9AA6"}>
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
                  "Estimated Unit Price",
                  "Total Price",
                ].map((head) => (
                  <TableCell key={head} sx={{ padding: "24px" }}>
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
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchaseOrderInfo;
