// src/dash/PurchaseModule/PurchaseRequestModule.js
import React, { useMemo, useState } from "react";
import autosave from "../../../image/autosave.svg";
import approvedIcon from "../../../../src/image/icons/approved-rfq.svg";
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
import "../Rfq/RfqStatusModal.css";
import { extractRFQID } from "../../../helper/helper";
import { usePurchase } from "../../../context/PurchaseContext";
import PRForm from "./PRForm/PRForm";
import { useHistory } from "react-router-dom";
import { useTenant } from "../../../context/TenantContext";

// Helper for cell styles
const cellStyle = (index) => ({
  backgroundColor: index % 2 === 0 ? "#f2f2f2" : "#fff",
  color: "#7a8a98",
  fontSize: "12px",
});

const PurchaseRequestModule = ({
  item = {},
  formatDate,
  statusColor,
  onEdit,
  onCancel,
  onNewRfq,
}) => {
  const [edit, setEdit] = useState(false);
  const tenant_schema_name = useTenant().tenantData?.tenant_schema_name;
  const history = useHistory();

    // Reloads the page after a slight delay (if needed)
    const handleReload = () => {
      setTimeout(() => window.location.reload(), 1000);
    };
  
  // Conversion handler: navigates to the RFQ conversion route, passing the current PR as state
  const handleConvertToRFQ = () => {
    history.push({
      pathname: `/${tenant_schema_name}/rfq/convert`,
      state: {
        pr: item,
      },
    });
    handleReload();
  };

  const {
    items = [],
    status = "pending",
    purpose,
    vendor,
    date_created,
    requester,
    url,
  } = item;

  const {
    approvePurchaseRequest,
    rejectPurchaseRequest,
    pendingPurchaseRequest,
  } = usePurchase();


  // Handlers for edit mode
  const handleEdit = () => {
    setEdit(true);
    onEdit(item);
  };

  const handleEditClose = () => {
    setEdit(false);
    onEdit(null);
  };

  // Handles submission for various statuses
  const handleSubmit = (formData, newStatus = "pending") => {
    const id = extractRFQID(formData.url);
    const cleanedFormData = {
      vendor: formData.vendor.url || formData.vendor,
      currency: formData?.currency?.url || formData?.currency,
      status: newStatus,
      purpose: formData?.purpose,
      items: Array.isArray(formData.items)
        ? formData.items.map((itm) => ({
            product: itm.product.url,
            description: itm.description,
            qty: Number(itm.qty) || 0,
            unit_of_measure: itm.unit_of_measure.url || itm.unit_of_measure[0],
            estimated_unit_price: itm.estimated_unit_price,
          }))
        : [],
      is_hidden: formData?.is_hidden,
    };


    switch (newStatus) {
      case "pending":
        pendingPurchaseRequest(cleanedFormData, id).then(console.log);
        break;
      case "approve":
        approvePurchaseRequest(cleanedFormData, id).then(console.log);
        break;
      case "reject":
        rejectPurchaseRequest(cleanedFormData, id).then(console.log);
        break;
      default:
        break;
    }
  };

  // Memoized rows for the PR items table
  const renderedRows = useMemo(() => {
    if (Array.isArray(items) && items.length) {
      return items.map((row, index) => (
        <TableRow
          key={row?.url || index}
          sx={{
            cursor: "pointer",
            "&:last-child td, &:last-child th": { border: 0 },
          }}
        >
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
            {row?.total_price || "N/A"}
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

  return (
    <div className="rfqStatus">
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
        {/* Basic Information */}
        <div className="rfqBasicInfo">
          <h2>Basic Information</h2>
          <div className="editCancel">
            {!(
              status === "pending" ||
              status === "approved" ||
              status === "rejected"
            ) && (
              <Button className="edit" onClick={handleEdit}>
                Edit
              </Button>
            )}
            <Button variant="outlined" className="cancel" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </div>

        {/* Status Section */}
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

        {/* Request Information */}
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
              <TableHead
                sx={{
                  backgroundColor: "#f2f2f2",
                  padding: 0,
                  margin: 0,
                  lineHeight: 0,
                }}
              >
                <TableRow>
                  <TableCell sx={{ paddingBottom: 0 }}>ID</TableCell>
                  <TableCell sx={{ paddingBottom: 0 }}>Date</TableCell>
                  <TableCell sx={{ paddingBottom: 0 }}>Requester</TableCell>
                </TableRow>
              </TableHead>
              <TableBody sx={{ borderBottom: "1px solid #E2E6E9" }}>
                <TableRow
                  sx={{
                    cursor: "pointer",
                    "&:last-child td, &:last-child th": { border: 0 },
                  }}
                >
                  <TableCell
                    sx={{
                      backgroundColor: "#fff",
                      color: "#7a8a98",
                      fontSize: "12px",
                    }}
                  >
                    {extractRFQID(url) || "N/A"}
                  </TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: "#fff",
                      color: "#7a8a98",
                      fontSize: "12px",
                    }}
                  >
                    {formatDate(date_created) || "N/A"}
                  </TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: "#fff",
                      color: "#7a8a98",
                      fontSize: "12px",
                    }}
                  >
                    {requester || "N/A"}
                  </TableCell>
                </TableRow>
              </TableBody>
              <TableHead
                sx={{
                  backgroundColor: "#f2f2f2",
                  padding: 0,
                  margin: 0,
                  lineHeight: 0,
                }}
              >
                <TableRow>
                  <TableCell sx={{ paddingBottom: 0 }}>Purpose</TableCell>
                  <TableCell sx={{ paddingBottom: 0 }}>Vendor</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow
                  sx={{
                    cursor: "pointer",
                    "&:last-child td, &:last-child th": { border: 0 },
                  }}
                >
                  <TableCell
                    sx={{
                      backgroundColor: "#fff",
                      color: "#7a8a98",
                      fontSize: "12px",
                    }}
                  >
                    {purpose || "N/A"}
                  </TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: "#fff",
                      color: "#7a8a98",
                      fontSize: "12px",
                    }}
                  >
                    {vendor?.company_name || "N/A"}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </div>

        <p className="rfqContent">Purchase Request Items</p>

        {/* PR Items Table */}
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

        {/* Footer Section based on status */}
        {status === "approved" && (
          <div className="rfqStatusFooter">
            <div className="approvedIcon">
              <img src={approvedIcon} alt="approved" />
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
              onClick={handleConvertToRFQ}
            >
              Convert to RFQ
            </Button>
          </div>
        )}

        {status === "draft" && (
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
                  handleSubmit(item, "pending");
                  handleReload();
                }}
              >
                Save
              </Button>
            </div>
          </div>
        )}

        {status === "pending" && (
          <div className="rfqStatusFooter">
            <div className="rfqStatusDraftFooterBtns">
              <Button
                variant="contained"
                color="success"
                className="newRfqBtn"
                disableElevation
                onClick={() => {
                  handleSubmit(item, "approve");
                  handleReload();
                }}
              >
                Approve
              </Button>
              <Button
                variant="contained"
                color="error"
                className="newRfqBtn"
                disableElevation
                onClick={() => {
                  handleSubmit(item, "reject");
                  handleReload();
                }}
              >
                Reject
              </Button>
            </div>
          </div>
        )}

        {status === "cancelled" && (
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
        )}
      </div>

      {/* Overlay for editing; uncomment PRForm import and component if needed */}
      {edit && (
        <div className="overlay">
          <PRForm
            open={edit}
            onCancel={handleEditClose}
            quotation={item}
            formUse="Edit Purchase Request"
          />
        </div>
      )}
    </div>
  );
};

export default PurchaseRequestModule;
