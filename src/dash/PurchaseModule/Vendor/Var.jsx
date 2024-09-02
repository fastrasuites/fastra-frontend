import React, { useState, useEffect } from "react";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import "./Var.css";
import autosave from "../../../image/autosave.svg";

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
  width: "30%",
  padding: "0.5rem",
  borderRadius: "5px",
  border: "1px solid #ccc",
  marginTop: "0.5rem",
  outline: "none",
}));

const SendButton = styled("button")(({ theme }) => ({
  backgroundColor: "blue",
  color: "white",
  border: "none",
  padding: "10px 20px",
  borderRadius: "5px",
  cursor: "pointer",
  marginLeft: "10px",
}));

export default function Var({ formData, onUpdateStatus }) {
  const [rejectionReason, setRejectionReason] = useState("");
  const [stakeholderUsername, setStakeholderUsername] = useState("");
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    if (formData && formData.rows) {
      const total = formData.rows.reduce((sum, row) => {
        const rowTotal = parseFloat(row.totalPrice) || 0;
        return sum + rowTotal;
      }, 0);
      setTotalPrice(total);
    }
  }, [formData]);

  const handleRejection = () => {
    onUpdateStatus(formData.id, "Rejected");
    console.log("Rejected with reason: ", rejectionReason);
    // Implement rejection logic here
  };

  const handleApproval = () => {
    onUpdateStatus(formData.id, "Approved");
    console.log("Approved");
    // Implement approval logic here
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
    <div id="Var" className="Var fade-in">
      <div className="Var1">
        <div className="Var2">
          <div className="Var2a">
            <p className="Varhed">New Purchase Request</p>
            <div className="Varauto">
              <p>Autosaved</p>
              <img src={autosave} alt="Autosaved" />
            </div>
          </div>
        </div>
        <div className="Var3" style={{ height: "auto" }}>
          <form className="Varform">
            <div className="Var3a">
              <p style={{ fontSize: "20px", marginBottom: "2rem" }}>
                Basic Information
              </p>
            </div>
            <div style={{ marginBottom: "1rem", marginTop: "-1.5rem" }}>
              <p>Status</p>
              <p style={{ fontSize: "14px" }}>
                {formData ? formData.status : ""}
              </p>
            </div>
            <div className="Var3b">
              <div className="Var3ba">
                <p>ID</p>
                <p style={{ fontSize: "14px", color: "#7a8a98" }}>
                  {formData ? formData.id : ""}
                </p>
              </div>
              <div className="Var3bb">
                <p>Date</p>
                <p style={{ fontSize: "14px", color: "#7a8a98" }}>
                  {formData
                    ? formatDate(formData.date) +
                      " - " +
                      formatTime(formData.date)
                    : ""}
                </p>
              </div>
              <div className="Var3bb">
                <p>Requester</p>
                <p style={{ fontSize: "14px", color: "#7a8a98" }}>
                  {formData ? formData.requester : ""}
                </p>
              </div>
              <div className="Var3ba">
                <p>Department</p>
                <p style={{ fontSize: "14px", color: "#7a8a98" }}>
                  {formData ? formData.department : ""}
                </p>
              </div>
            </div>
            <div className="Var3c">
              <div className="Var3ca">
                <label>Purpose</label>
                <p style={{ fontSize: "14px", color: "#7a8a98" }}>
                  {formData ? formData.purpose : ""}
                </p>
              </div>
              <div className="Var3ca">
                <label>Suggested Vendor</label>
                <p style={{ fontSize: "14px", color: "#7a8a98" }}>
                  {formData ? formData.vendor : ""}
                </p>
              </div>
            </div>
            <div className="var3d">
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
                    {formData && formData.rows && formData.rows.length > 0 ? (
                      formData.rows.map((row, index) => (
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
              className="Var3e"
              style={{
                display: "flex",
                justifyContent: "start",
                marginBottom: "1rem",
              }}
            >
              <ApproveButton onClick={handleApproval}>Approve</ApproveButton>
              <RejectButton onClick={handleRejection}>Reject</RejectButton>
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <TextArea
                id="rejectionReason"
                placeholder="Enter reason for rejection"
                value={rejectionReason}
                onChange={handleRejectionReasonChange}
              />
            </div>
            <div style={{ marginBottom: "1rem" }}>
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
    </div>
  );
}
