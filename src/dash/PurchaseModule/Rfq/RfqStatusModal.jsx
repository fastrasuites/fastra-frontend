// src/dash/PurchaseModule/Rfq/RFQStatusModal.js
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
} from "@mui/material";
import PurchaseHeader from "../PurchaseHeader";
import autosave from "../../../image/autosave.svg";
import approved from "../../../../src/image/icons/approved-rfq.svg";
import { extractRFQID, formatDate } from "../../../helper/helper";
import { useRFQ } from "../../../context/RequestForQuotation";
import { Bounce, toast } from "react-toastify";
import "./RfqStatusModal.css";
import { useHistory } from "react-router-dom";
import { useTenant } from "../../../context/TenantContext";
import RfqForm from "./RfqForm/RfqForm";

const cellStyle = (index) => ({
  backgroundColor: index % 2 === 0 ? "#f2f2f2" : "#fff",
  color: "#7a8a98",
  fontSize: "12px",
});

const RFQStatusModal = ({
  item = {},
  statusColor,
  onEdit,
  onCancel,
  onNewRfq,
  triggerRefresh,
}) => {
  const [edit, setEdit] = useState(false);
  const { items = [], status = "pending", currency, expiry_date } = item;
  const { approveRFQ, rejectRFQ, pendingRFQ } = useRFQ();
  const tenant_schema_name = useTenant().tenantData?.tenant_schema_name;
  const history = useHistory();

  const handleConvertToPO = () => {
    // Navigate to the conversion route with RFQ data in location.state
    history.push({
      pathname: `/${tenant_schema_name}/purchase-order/convert`,
      state: {
        rfq: item,
      },
    });
  };

  const handleStatusUpdate = async (statusAction) => {
    try {
      const cleanFormData = () => ({
        expiry_date: item.expiry_date || "",
        vendor: item.vendor.url || item.vendor,
        vendor_category: item.vendor_category || "",
        purchase_request: item.purchase_request || "",
        currency: item?.currency?.url || item?.currency,
        status: status,
        items: Array.isArray(item.items)
          ? item.items.map((itm) => ({
              product: itm.product.url,
              description: itm.description,
              qty: Number(itm.qty) || 0,
              unit_of_measure: Array.isArray(itm.unit_of_measure)
                ? itm.unit_of_measure[0]
                : itm.unit_of_measure.url,
              estimated_unit_price: itm.estimated_unit_price,
            }))
          : [],
        is_hidden: item?.is_hidden,
      });
      const cleanedData = cleanFormData();
      const id = extractRFQID(item?.url);
      const actions = {
        approve: approveRFQ,
        reject: rejectRFQ,
        pending: pendingRFQ,
      };

      if (actions[statusAction]) {
        const result = await actions[statusAction](cleanedData, id);
        if (result && result.success) {
          toast.success(`Status ${statusAction} successfully`, {
            position: "top-right",
            autoClose: 5000,
            transition: Bounce,
          });
        } else {
          toast.error(`Failed to update status to ${statusAction}`, {
            position: "top-right",
            autoClose: 5000,
            transition: Bounce,
          });
        }
        onCancel();
      }
    } catch (error) {
      console.error("Status update failed:", error);
      toast.error(`Status update failed: ${error.message}`);
    } finally {
      if (triggerRefresh) triggerRefresh();
    }
  };

  const renderedRows = useMemo(() => {
    if (Array.isArray(items) && items.length > 0) {
      return items.map((row, index) => (
        <TableRow key={row?.url || index} sx={{ cursor: "pointer" }}>
          <TableCell sx={cellStyle(index)}>
            {row?.product?.product_name || "N/A"}
          </TableCell>
          <TableCell sx={cellStyle(index)}>
            {row?.description || "N/A"}
          </TableCell>
          <TableCell sx={cellStyle(index)}>{row?.qty || "N/A"}</TableCell>
          <TableCell sx={cellStyle(index)}>
            {row?.unit_of_measure?.unit_category || "N/A"}
          </TableCell>
          <TableCell sx={cellStyle(index)}>
            {row?.estimated_unit_price || "N/A"}
          </TableCell>
          <TableCell sx={cellStyle(index)}>
            {row?.get_total_price || "N/A"}
          </TableCell>
        </TableRow>
      ));
    }
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
  }, [items]);

  const renderStatusFooter = () => {
    switch (status) {
      case "approved":
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
                Successfully Sent
              </p>
            </div>
            <Button
              variant="contained"
              className="newRfqBtn"
              disableElevation
              onClick={handleConvertToPO}
            >
              Convert to PO
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
                onClick={() => handleStatusUpdate("pending")}
              >
                Save
              </Button>
            </div>
          </div>
        );
      case "pending":
        return (
          <div className="rfqStatusFooter">
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
      case "cancelled":
        return (
          <div className="rfqStatusFooter">
            <p
              style={{
                color: statusColor ? statusColor(status) : "#000",
                textTransform: "capitalize",
              }}
            >
              Rejected
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  const handleEdit = () => {
    setEdit(true);
    onEdit(item);
  };

  const handleEditClose = () => {
    setEdit(false);
    onEdit(null);
  };

  return (
    <div className="rfqStatus">
      <PurchaseHeader />
      <div className="rfqHeader">
        <div className="rfqHeaderLeft">
          <Button
            variant="contained"
            className="newRfqBtn"
            disableElevation
            onClick={onNewRfq}
          >
            New RFQ
          </Button>
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
            {status !== "pending" && status !== "approved" && (
              <Button
                className="edit"
                onClick={handleEdit}
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
              Close
            </Button>
          </div>
        </div>
        <div className="rfqStatusInfo">
          <p>Status</p>
          <p
            style={{
              color: statusColor ? statusColor(status) : "#000",
              textTransform: "capitalize",
            }}
          >
            {status}
          </p>
        </div>
        <div className="rfqRequestInfo">
          <TableContainer
            component={Paper}
            sx={{
              maxWidth: "1000px",
              boxShadow: "none",
              borderTop: "none",
              borderLeft: "none",
              borderRight: "none",
            }}
          >
            <Table
              sx={{
                "&.MuiTable-root": { border: "none" },
                "& .MuiTableCell-root": { border: "none" },
              }}
            >
              <TableHead sx={{ backgroundColor: "#f2f2f2" }}>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Date Opened</TableCell>
                  <TableCell>Currency Type</TableCell>
                  <TableCell>Expiry Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell
                    sx={{
                      backgroundColor: "#fff",
                      color: "#7a8a98",
                      fontSize: "12px",
                    }}
                  >
                    {extractRFQID(item?.url) || "N/A"}
                  </TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: "#fff",
                      color: "#7a8a98",
                      fontSize: "12px",
                    }}
                  >
                    {formatDate(item?.expiry_date) || "N/A"}
                  </TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: "#fff",
                      color: "#7a8a98",
                      fontSize: "12px",
                    }}
                  >
                    {currency
                      ? `${currency.currency_name} - ${currency.currency_symbol}`
                      : "N/A"}
                  </TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: "#fff",
                      color: "#7a8a98",
                      fontSize: "12px",
                    }}
                  >
                    {formatDate(expiry_date) || "N/A"}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </div>
        <p className="rfqContent">RFQ Items</p>
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
          {/* Assuming RfqForm is used for editing */}
          <RfqForm
            open={edit}
            onCancel={handleEditClose}
            quotation={item}
            formUse={"Edit RFQ"}
          />
        </div>
      )}
    </div>
  );
};

RFQStatusModal.propTypes = {
  item: PropTypes.object,
  statusColor: PropTypes.func,
  onEdit: PropTypes.func,
  onCancel: PropTypes.func.isRequired,
  onNewRfq: PropTypes.func,
  triggerRefresh: PropTypes.func,
};

export default RFQStatusModal;
