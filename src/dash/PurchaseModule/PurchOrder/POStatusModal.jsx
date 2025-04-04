import React, { useMemo, useState } from "react";
import PropTypes from "prop-types";
import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import PurchaseHeader from "../PurchaseHeader";
import autosave from "../../../image/autosave.svg";
import approved from "../../../../src/image/icons/approved-rfq.svg";
import { extractRFQID, formatDate } from "../../../helper/helper";
import POForm from "./POForm/POForm";
import { useTenant } from "../../../context/TenantContext";
import "./PoStatusModal.css";
import "../Rfq/RfqStatusModal.css";
import { usePurchaseOrder } from "../../../context/PurchaseOrderContext.";
import { Bounce, toast } from "react-toastify";

// Shared cell style helper function to avoid repetition
const cellStyle = (index) => ({
  backgroundColor: index % 2 === 0 ? "#f2f2f2" : "#fff",
  color: "#7a8a98",
  fontSize: "12px",
});

const POStatusModal = ({
  item = {},
  statusColor,
  onCancel,
  onNewRfq,
  triggerRefresh,
}) => {
  const [edit, setEdit] = useState(false);
  const { items = [], status = "pending", currency } = item;
  const {
    updatePurchasePending,
    updatePurchaseReject,
    updatePurchaseApproved,
  } = usePurchaseOrder();
  const tenant_schema_name = useTenant().tenantData?.tenant_schema_name;

  // Function to clean the form data for submission.
  const cleanFormData = () => ({
    vendor: item.vendor?.url || item.vendor,
    payment_terms: item.payment_terms,
    purchase_policy: item.purchase_policy,
    delivery_terms: item.delivery_terms,
    currency: item.currency?.url || item.currency,
    status: item.status,
    created_by: tenant_schema_name,
    items: item.items.map((itm) => ({
      product: itm.product?.url || itm.product,
      description: itm.description,
      qty: Number(itm.qty) || 0,
      unit_of_measure: itm.unit_of_measure[0] || itm.unit_of_measure?.url,
      estimated_unit_price: itm.estimated_unit_price,
    })),
    is_hidden: false,
  });

  // Handle status update with toast notifications
  const handleStatusUpdate = async (statusAction) => {
    try {
      const cleanedData = cleanFormData();
      const id = extractRFQID(item.url);

      const actions = {
        approve: updatePurchaseApproved,
        reject: updatePurchaseReject,
        pending: updatePurchasePending,
      };

      if (actions[statusAction]) {
        const result = await actions[statusAction](cleanedData, id);
        console.log(result);
        if (result && result.success) {
          
          toast.success(`Status ${statusAction} successfully`, {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                    transition: Bounce,
                    });
        } else {
          toast.success(`Failed to ${statusAction} status`, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
            transition: Bounce,
            });
          toast.error(`Failed to update status to ${statusAction}`);
        }
        onCancel();
      }
    } catch (error) {
      console.error("Status update failed:", error);
      toast.error(`Status update failed: ${error.message}`);
    } finally {
      triggerRefresh();
    }
  };

  const renderStatusFooter = () => {
    switch (status) {
      case "completed":
        return (
          <div className="rfqStatusFooter">
            <div className="approvedIcon">
              <img src={approved} alt="approved" />
              <p
                style={{
                  color: statusColor ? statusColor(status) : "#000",
                  textTransform: "capitalize",
                }}
              >
                Approved
              </p>
            </div>
            <Button
              variant="contained"
              className="newRfqBtn"
              disableElevation
              onClick={onNewRfq}
            >
              Send to Vendor
            </Button>
          </div>
        );
      case "draft":
        return (
          <div className="rfqStatusFooter">
            <div className="approvedIcon">
              <p
                style={{
                  color: statusColor ? statusColor(status) : "#000",
                  textTransform: "capitalize",
                }}
              >
                Drafted
              </p>
            </div>
            <div className="rfqStatusDraftFooterBtns">
              <Button
                variant="contained"
                className="newRfqBtn"
                disableElevation
                onClick={onNewRfq}
              >
                Share
              </Button>
              <Button
                variant="contained"
                className="newRfqBtn"
                disableElevation
                onClick={() => {
                  handleStatusUpdate("pending");
                  onCancel();
                }}
              >
                Save
              </Button>
            </div>
          </div>
        );
        case "cancelled":
        return (
          <div className="rfqStatusFooter">
            <div className="approvedIcon">
              <p
                style={{
                  color: statusColor ? statusColor(status) : "#000",
                  textTransform: "capitalize",
                }}
              >
                Rejected
              </p>
            </div>
            <div className="rfqStatusDraftFooterBtns">
              <Button
                variant="contained"
                className="newRfqBtn"
                disableElevation
                sx={{textTransform: "capitalize"}}
                onClick={onNewRfq}
              >
                Set back to Draft
              </Button>
            </div>
          </div>
        );
      case "awaiting":
        return (
          <div className="rfqStatusFooter">
            <br />
            <div className="rfqStatusDraftFooterBtns">
              <Button
                variant="contained"
                color="success"
                className="newRfqBtn"
                disableElevation
                onClick={() => handleStatusUpdate("approve")}
              >
                Approve
              </Button>
              <Button
                variant="contained"
                color="error"
                className="newRfqBtn"
                disableElevation
                onClick={() => handleStatusUpdate("reject")}
              >
                Reject
              </Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderedRows = useMemo(() => {
    if (items.length === 0) {
      return (
        <TableRow>
          <TableCell
            colSpan={6}
            align="center"
            sx={{ color: "#7a8a98", fontSize: "12px" }}
          >
            No items available
          </TableCell>
        </TableRow>
      );
    }
    return items.map((row, index) => (
      <TableRow key={row?.url || index} sx={{ cursor: "pointer" }}>
        <TableCell sx={cellStyle(index)}>
          {row?.product?.product_name || "N/A"}
        </TableCell>
        <TableCell sx={cellStyle(index)}>{row?.description || "N/A"}</TableCell>
        <TableCell sx={cellStyle(index)}>
          {row?.qty >= 0 ? row?.qty : "N/A"}
        </TableCell>
        <TableCell sx={cellStyle(index)}>
          {row?.unit_of_measure?.unit_category || "N/A"}
        </TableCell>
        <TableCell sx={cellStyle(index)}>
          {row?.estimated_unit_price || "N/A"}
        </TableCell>
        <TableCell sx={cellStyle(index)}>
          {row?.get_total_price >= 0 ? row?.get_total_price : "N/A"}
        </TableCell>
      </TableRow>
    ));
  }, [items]);

  return (
    <div className="rfqStatus">
      <PurchaseHeader />
      <div className="rfqHeader">
        <div className="rfqHeaderLeft">
          <h1>Purchase Order</h1>
          <div className="rfqAutosave">
            <p>Autosave</p>
            <img src={autosave} alt="Autosave icon" />
          </div>
        </div>
      </div>

      <div className="rfqStatusContent">
        {/* Basic Information Section */}
        <div className="rfqBasicInfo">
          <h2>Basic Information</h2>
          <div className="editCancel">
            {status !== "pending" && status !== "approved" && (
              <Button
                className="edit"
                onClick={() => setEdit(true)}
                style={{
                  display:
                    status === "approved" || status === "cancelled"
                      ? "none"
                      : "block",
                }}
              >
                Edit
              </Button>
            )}
            <Button variant="outlined" className="cancel" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </div>

        {/* Status Section */}
        <div className="poStatusInfo">
          <div>
            <p>ID</p>
            <p className="rfqStatusId">
              {item?.url ? extractRFQID(item?.url) : "N/A"}
            </p>
          </div>
          <div>
            <p>Date</p>
            <p className="rfqStatusDate">
              {formatDate(item?.date_created) || "N/A"}
            </p>
          </div>
          <div>
            <p>Created By</p>
            <p className="rfqStatusName">{tenant_schema_name}</p>
          </div>
        </div>

        <div className="poStatusVendor">
          <div>
            <p>Vendor</p>
            <TextField
              type="text"
              value={item?.vendor?.company_name || ""}
              sx={{ width: "100%" }}
              placeholder="Type your payment terms here."
              disabled
            />
          </div>
        </div>

        {/* Request Information Section */}
        <div className="rfqRequestInfo">
          <div className="poStatusVendor">
            <div>
              <p>Vendor Address</p>
              <p className="rfqStatusId">
                {item?.vendor?.address ? item?.vendor?.address : "N/A"}
              </p>
            </div>
            <div>
              <p>Vendor Email</p>
              <p className="rfqStatusDate">
                {item?.vendor?.email ? item?.vendor?.email : "N/A"}
              </p>
            </div>
          </div>

          <div className="poStatusInfo" style={{ marginTop: "25px" }}>
            <div>
              <p>Currency Type</p>
              <p className="rfqStatusId">
                {currency
                  ? `${currency.currency_name} - ${currency.currency_symbol}`
                  : "N/A"}
              </p>
            </div>
            <div>
              <p>Payment Terms</p>
              <p className="rfqStatusDate">{item.payment_terms || "N/A"}</p>
            </div>
            <div>
              <p>Purchase Policy</p>
              <p className="rfqStatusName">{item.purchase_policy || "N/A"}</p>
            </div>
            <div>
              <p>Delivery Terms</p>
              <p className="rfqStatusName">{item.delivery_terms || "N/A"}</p>
            </div>
          </div>
        </div>

        <p className="rfqContent">Purchase Order Items</p>

        {/* RFQ Items Table Section */}
        <div className="rfqStatusTable">
          <TableContainer
            component={Paper}
            sx={{ boxShadow: "none", borderRadius: "10px" }}
          >
            <Table
              sx={{
                "&.MuiTable-root": { border: "none" },
                "& .MuiTableCell-root": { border: "none" },
              }}
            >
              <TableHead sx={{ backgroundColor: "#f2f2f2" }}>
                <TableRow>
                  <TableCell>Product Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Qty</TableCell>
                  <TableCell>Unit of Measure</TableCell>
                  <TableCell>Estimated Unit Price</TableCell>
                  <TableCell>Total Price</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>{renderedRows}</TableBody>
            </Table>
          </TableContainer>
        </div>

        {renderStatusFooter()}
      </div>

      {edit && (
        <div className="overlay">
          <POForm
            open={edit}
            onCancel={() => setEdit(false)}
            purchaseOrder={item}
            formUse={"Edit RFQ"}
          />
        </div>
      )}
    </div>
  );
};

POStatusModal.propTypes = {
  item: PropTypes.object,
  statusColor: PropTypes.func,
  onCancel: PropTypes.func.isRequired,
  onNewRfq: PropTypes.func,
  triggerRefresh: PropTypes.func,
};

export default POStatusModal;
