import React, { useState, useEffect } from "react";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import "./Papr.css";
import autosave from "../../../image/autosave.svg";
import { usePurchase } from "../../../context/PurchaseContext";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.white,
    color: theme.palette.common.black,
    border: 0,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
    border: 0,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  border: "none",
}));

const StyledTable = styled(Table)(({ theme }) => ({
  borderCollapse: "separate",
  borderSpacing: "0 10px",
}));

const ApproveButton = styled("button")(({ theme }) => ({
  backgroundColor: "green",
  color: "white",
  border: "none",
  padding: "10px 20px",
  borderRadius: "5px",
  cursor: "pointer",
  marginLeft: "10px",
}));

const RejectButton = styled("button")(({ theme }) => ({
  backgroundColor: "red",
  color: "white",
  border: "none",
  padding: "10px 20px",
  borderRadius: "5px",
  cursor: "pointer",
  marginLeft: "10px",
}));

const TextArea = styled("textarea")(({ theme }) => ({
  width: "30%",
  padding: "2.5rem",
  marginBottom: "1rem",
  borderRadius: "5px",
  border: "1px solid #ccc",
  resize: "vertical",
  outline: "none",
}));

const InputField = styled("input")(({ theme }) => ({
  width: "30% !important",
  padding: "0.5rem",
  borderRadius: "5px",
  border: "1px solid #ccc",
  marginTop: "0.5rem",
  outline: "none",
}));

const SendButton = styled("button")(({ theme }) => ({
  marginTop: "1rem",
  backgroundColor: "blue",
  width: "10%",
  color: "white",
  border: "none",
  padding: "10px 20px",
  borderRadius: "5px",
  cursor: "pointer",
  /*marginLeft: "10px",*/
}));

// export default function Papr({ formDAta, onUpdateStatus }) {
export default function Papr({ prData, onClose, onStatusChange }) {
  const { updatePurchaseRequest } = usePurchase();
  const [status, setStatus] = useState(prData.status);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [stakeholderUsername, setStakeholderUsername] = useState("");
  const [totalPrice, setTotalPrice] = useState(0);
  const [rows, setRows] = useState([]);

  console.log(prData);
  console.log(prData.result);
  console.log(prData.items);

  useEffect(() => {
    if (prData && prData.rows) {
      const total = prData.rows.reduce((sum, row) => {
        const rowTotal = parseFloat(row.totalPrice) || 0;
        return sum + rowTotal;
      }, 0);
      setTotalPrice(total);
      setRows(prData.rows);
    }
  }, [prData]);

  const handleReject = async (e) => {
    e.preventDefault();
    try {
      await updatePurchaseRequest(prData, { status: "rejected" });
      onClose();
    } catch (error) {
      console.error("Rejection failed:", error);
    }
  };

  const handleApprove = async (e) => {
    e.preventDefault();
    try {
      await updatePurchaseRequest(prData, { status: "approved" });
      setStatus("approved");
      setIsReadOnly(true);
    } catch (error) {
      console.error("Approval failed:", error);
    }
  };

  const handleConvertToRFQ = async () => {
    try {
      await client.post(
        `/purchase/purchase-request/${prData.id}/convert_to_rfq/`
      );
      // Handle RFQ conversion logic
    } catch (error) {
      console.error("Conversion failed:", error);
    }
  };

  const handleRejectionReasonChange = (event) => {
    setRejectionReason(event.target.value);
  };

  const handleStakeholderUsernameChange = (event) => {
    setStakeholderUsername(event.target.value);
  };

  const formatDate = (date) => {
    const options = { day: "numeric", month: "short", year: "numeric" };
    return new Date(date).toLocaleDateString("en-US", options);
  };

  const formatTime = (date) => {
    const hours = new Date(date).getHours();
    const minutes = new Date(date).getMinutes();
    const ampm = hours >= 12 ? "pm" : "am";
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes.toString().padStart(2, "0");
    return `${formattedHours}:${formattedMinutes}${ampm}`;
  };

  return (
    <div id="papr" className="papr fade-in">
      <div className="papr1">
        <div className="papr2">
          <div className="papr2a">
            <p className="paprhed">New Purchase Request</p>
            <div className="paprauto">
              <p>Autosaved</p>
              <img src={autosave} alt="Autosaved" />
            </div>
          </div>
        </div>
        <div className="papr3" style={{ height: "auto" }}>
          <form className="paprform">
            <div className="papr3a">
              <p style={{ fontSize: "20px", marginBottom: "2rem" }}>
                Basic Information
              </p>
            </div>
            <div style={{ marginBottom: "1rem", marginTop: "-1.5rem" }}>
              <p>Status</p>
              <p style={{ fontSize: "14px" }}>{prData ? prData.status : ""}</p>
            </div>
            <div className="papr3b">
              <div className="papr3ba">
                <p>ID</p>
                <p style={{ fontSize: "14px", color: "#7a8a98" }}>
                  {prData ? prData.id : ""}
                </p>
              </div>
              <div className="papr3bb">
                <p>Date</p>
                <p style={{ fontSize: "14px", color: "#7a8a98" }}>
                  {prData
                    ? formatDate(prData.date) + " - " + formatTime(prData.date)
                    : ""}
                </p>
              </div>
              <div className="papr3bb">
                <p>Requester</p>
                <p style={{ fontSize: "14px", color: "#7a8a98" }}>
                  {prData ? prData.requester : ""}
                </p>
              </div>
            </div>
            <div className="papr3c">
              <div className="papr3ca">
                <label>Purpose</label>
                <p style={{ fontSize: "14px", color: "#7a8a98" }}>
                  {prData ? prData.purpose : ""}
                </p>
              </div>
              <div className="papr3ca">
                <label>Suggested Vendor</label>
                <p style={{ fontSize: "14px", color: "#7a8a98" }}>
                  {prData ? prData.vendor : ""}
                </p>
              </div>
            </div>
            <div className="papr3d">
              <StyledTableContainer
                component={Paper}
                sx={{ boxShadow: "none", border: "1px solid #e2e6e9" }}
              >
                <StyledTable
                  sx={{ minWidth: 700, border: "none" }}
                  aria-label="customized table"
                >
                  <TableHead>
                    <TableRow>
                      <StyledTableCell>Product Name</StyledTableCell>
                      <StyledTableCell>Description</StyledTableCell>
                      <StyledTableCell align="right">Qty</StyledTableCell>
                      <StyledTableCell align="right">
                        Estimated Unit Price
                      </StyledTableCell>
                      <StyledTableCell align="right">
                        Total Price
                      </StyledTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows && rows.length > 0 ? (
                      rows.map((row, index) => (
                        <StyledTableRow key={index}>
                          <StyledTableCell>{row.productName}</StyledTableCell>
                          <StyledTableCell>{row.description}</StyledTableCell>
                          <StyledTableCell align="right">
                            {row.qty}
                          </StyledTableCell>
                          <StyledTableCell align="right">
                            {row.unitPrice}
                          </StyledTableCell>
                          <StyledTableCell align="right">
                            {row.totalPrice}
                          </StyledTableCell>
                        </StyledTableRow>
                      ))
                    ) : (
                      <StyledTableRow>
                        <StyledTableCell colSpan={5} align="center">
                          No products available
                        </StyledTableCell>
                      </StyledTableRow>
                    )}
                    <StyledTableRow>
                      <StyledTableCell
                        colSpan={4}
                        align="right"
                        style={{ fontWeight: "bold" }}
                      >
                        Total
                      </StyledTableCell>
                      <StyledTableCell
                        align="right"
                        style={{ fontWeight: "bold" }}
                      >
                        {totalPrice.toFixed(2)}
                      </StyledTableCell>
                    </StyledTableRow>
                  </TableBody>
                </StyledTable>
              </StyledTableContainer>
            </div>
            <div
              className="papr3e"
              style={{
                display: "flex",
                justifyContent: "start",
                marginBottom: "1rem",
              }}
            >
              <ApproveButton onClick={handleApprove}>Approve</ApproveButton>
              <RejectButton onClick={handleReject}>Reject</RejectButton>
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <TextArea
                id="rejectionReason"
                placeholder="Enter reason for rejection"
                value={rejectionReason}
                onChange={handleRejectionReasonChange}
              />
            </div>
            <div
              style={{
                marginBottom: "1rem",
                width: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <label htmlFor="stakeholderUsername">
                Send to another stakeholder
              </label>
              <InputField
                type="text"
                id="stakeholderUsername"
                placeholder="Enter username of stakeholder"
                value={stakeholderUsername}
                onChange={handleStakeholderUsernameChange}
              />
              <SendButton
                onClick={() =>
                  console.log("Sent to stakeholder: ", stakeholderUsername)
                }
              >
                Send
              </SendButton>
            </div>
          </form>
        </div>
      </div>
      {status === "approved" && (
        <div className="approval-section">
          <button onClick={handleConvertToRFQ}>Convert to RFQ</button>
          <button onClick={onClose}>Return to PR</button>
        </div>
      )}

      {status === "pending" && (
        <div className="action-buttons">
          <ApproveButton onClick={handleApprove}>Approve</ApproveButton>
          <RejectButton onClick={handleReject}>Reject</RejectButton>
        </div>
      )}
    </div>
  );
}
