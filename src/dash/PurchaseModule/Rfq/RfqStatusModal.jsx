import React, { useMemo, useState } from "react";
import PurchaseHeader from "../PurchaseHeader";
import autosave from "../../../image/autosave.svg";
import approved from "../../../../src/image/icons/approved-rfq.svg";
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
import "./RfqStatusModal.css";
import RfqForm from "./RfqForm/RfqForm";
import { extractRFQID } from "../../../helper/helper";
import { useRFQ } from "../../../context/RequestForQuotation";
import { useHistory } from "react-router-dom";

// Shared cell style helper function to avoid repetition
const cellStyle = (index) => ({
  backgroundColor: index % 2 === 0 ? "#f2f2f2" : "#fff",
  color: "#7a8a98",
  fontSize: "12px",
});

const RfqStatusModal = ({
  item = {},
  formatDate,
  statusColor,
  onEdit,
  onCancel,
  onNewRfq,
}) => {
  const [edit, setEdit] = useState(false);
  const { items = [], status = "pending", currency, expiry_date } = item;

  const { approveRFQ, rejectRFQ, pendingRFQ } = useRFQ();

  const handleReload = () => {
    setTimeout(() => {
    window.location.reload();
    }, 1000);
  };

  const handleEdit = () => {
    setEdit(true);
    onEdit(item);
  };

  const handleEditClose = () => {
    setEdit(false);
    onEdit(null);
    console.log("hello");
  };

  const handleSubmit = (formData, status = "pending") => {
    // e.preventDefault();
    const url = formData.url;
    console.log(url);
    const cleanedFormData = {
      expiry_date: formData.expiry_date || "",
      vendor: formData.vendor.url || formData.vendor,
      vendor_category: formData.vendor_category || "",
      purchase_request: formData.purchase_request || "",
      currency: formData?.currency?.url || formData?.currency,
      status: status,
      items: Array.isArray(formData.items)
        ? formData.items.map((item) => ({
            product: item.product.url,
            description: item.description,
            qty: Number(item.qty) || 0,
            unit_of_measure:
              item.unit_of_measure.url || item.unit_of_measure[0],
            estimated_unit_price: item.estimated_unit_price,
          }))
        : [],
      is_hidden: formData?.is_hidden,
    };
    if (status === "pending") {
      const id = extractRFQID(url);
      console.log("Updating RFQ:", cleanedFormData);
      pendingRFQ(cleanedFormData, id).then((data) => {
        console.log(data);
      });
    } else if (status === "approve") {
      const id = extractRFQID(url);
      console.log("Updating RFQ:", cleanedFormData);
      approveRFQ(cleanedFormData, id).then((data) => {
        console.log(data);
      });
    } else if (status === "reject") {
      const id = extractRFQID(url);
      console.log("Updating RFQ:", cleanedFormData);
      rejectRFQ(cleanedFormData, id).then((data) => {
        console.log(data);
      });
    }
  };

  const renderedRows = useMemo(() => {
    if (Array.isArray(items) && items.length > 0) {
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
        {/* Basic Information Section */}
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

        {/* Request Information Section */}
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
                  <TableCell sx={{ paddingButtom: 0 }}>ID</TableCell>
                  <TableCell sx={{ paddingButtom: 0 }}>Date Opened</TableCell>
                  <TableCell sx={{ paddingButtom: 0 }}>Currency Type</TableCell>
                  <TableCell sx={{ paddingButtom: 0 }}>Expiry Date</TableCell>
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
                    {extractRFQID(item?.url) || "N/A"}
                  </TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: "#fff",
                      color: "#7a8a98",
                      fontSize: "12px",
                    }}
                  >
                    {formatDate(Date.now()) || "N/A"}
                  </TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: "#fff",
                      color: "#7a8a98",
                      fontSize: "12px",
                    }}
                  >
                    {`${currency.currency_name}${" - "}${
                      currency.currency_symbol
                    }` || "N/A"}
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

        {/* Footer Section */}
        {status === "approved" && (
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
              onClick={onNewRfq}
            >
              Convert to PO
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
                  onCancel();
                }}
              >
                Save
              </Button>
            </div>
          </div>
        )}

        {status === "pending" && (
          <div className="rfqStatusFooter">
            <br />

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

      {edit && (
        <div className="overlay">
          <RfqForm
            open={edit}
            onCancel={handleEditClose}
            quotation={item}
            formUse={"Edit RFQ"}
            // onSave={handleEditSave}
          />
        </div>
      )}
    </div>
  );
};

export default RfqStatusModal;
