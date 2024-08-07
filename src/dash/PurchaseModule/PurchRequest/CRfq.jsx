import React, { useState, useEffect } from "react";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import "./CRfq.css";
import autosave from "../../../image/autosave.svg";
import { useHistory } from "react-router-dom";

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
export default function CRfq({ formData, onUpdateStatus }) {
  const [rejectionReason, setRejectionReason] = useState("");
  const [stakeholderUsername, setStakeholderUsername] = useState("");
  const [totalPrice, setTotalPrice] = useState(0);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (formData && formData.rows) {
      const total = formData.rows.reduce((sum, row) => {
        const rowTotal = parseFloat(row.totalPrice) || 0;
        return sum + rowTotal;
      }, 0);
      setTotalPrice(total);
      setRows(formData.rows);
    }
  }, [formData]);

  const handleRejection = () => {
    onUpdateStatus(formData.id, "Rejected");
    console.log("Rejected with reason: ", rejectionReason);
    // Implement rejection logic here
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

  const history = useHistory();

  const handleNewRFQClick = () => {
    const data = {
      date: formData ? formData.date : "",
      vendor: formData ? formData.vendor : "",
      productName: formData ? formData.productName : "",
      qty: formData ? formData.qty : "",
      rows: formData ? formData.rows : [],
    };

    history.push({
      pathname: "/rfq",
      state: { formData: data },
    });
  };

  return (
    <div id="crfq" className="crfq fade-in">
      <div className="crfq1">
        <div className="crfq2">
          <div className="crfq2a">
            <p className="crfqhed">New Purchase Request</p>
            <div className="crfqauto">
              <p>Autosaved</p>
              <img src={autosave} alt="Autosaved" />
            </div>
          </div>
        </div>
        <div className="crfq3" style={{ height: "auto" }}>
          <form className="crfqform">
            <div className="crfq3a">
              <div className="crfq3ae">
                <p style={{ fontSize: "20px" }}>Basic Information</p>
                <button
                  type="submit"
                  className="crfq3btn"
                  onClick={handleNewRFQClick}
                >
                  New RFQ
                </button>
              </div>
              <div style={{ margin: "1rem 0" }}>
                <p>Status</p>
                <p style={{ fontSize: "14px" }}>
                  {formData ? formData.status : ""}
                </p>
              </div>
            </div>
            <div className="crfq3b">
              <div className="crfq3ba">
                <p>ID</p>
                <p style={{ fontSize: "14px", color: "#7a8a98" }}>
                  {formData ? formData.id : ""}
                </p>
              </div>
              <div className="crfq3bb">
                <p>Date</p>
                <p style={{ fontSize: "14px", color: "#7a8a98" }}>
                  {formData
                    ? formatDate(formData.date) +
                      " - " +
                      formatTime(formData.date)
                    : ""}
                </p>
              </div>
              <div className="crfq3bb">
                <p>Requester</p>
                <p style={{ fontSize: "14px", color: "#7a8a98" }}>
                  {formData ? formData.requester : ""}
                </p>
              </div>
              <div className="crfq3ba">
                <p>Department</p>
                <p style={{ fontSize: "14px", color: "#7a8a98" }}>
                  {formData ? formData.department : ""}
                </p>
              </div>
            </div>
            <div className="crfq3c">
              <div className="crfq3ca">
                <label>Purpose</label>
                <p style={{ fontSize: "14px", color: "#7a8a98" }}>
                  {formData ? formData.purpose : ""}
                </p>
              </div>
              <div className="crfq3ca">
                <label>Suggested Vendor</label>
                <p style={{ fontSize: "14px", color: "#7a8a98" }}>
                  {formData ? formData.vendor : ""}
                </p>
              </div>
            </div>
            <div className="crfq3d">
              <StyledTableContainer
                component={Paper}
                sx={{
                  boxShadow: "none",
                  border: "1px solid #e2e6e9",
                  margin: "1rem 0",
                }}
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
              style={{
                display: "flex",
                justifyContent: "start",
                margin: "1rem 0",
              }}
            >
              <RejectButton onClick={handleRejection}>Reject</RejectButton>
            </div>
            <div style={{ margin: "1rem 0" }}>
              <TextArea
                id="rejectionReason"
                placeholder="Enter reason for rejection"
                value={rejectionReason}
                onChange={handleRejectionReasonChange}
              />
            </div>
            <div style={{ margin: "1rem 0" }}>
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