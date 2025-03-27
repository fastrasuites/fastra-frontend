import React, { useState, useEffect } from "react";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import "./Rapr.css";
import autosave from "../../../image/autosave.svg";
import { FaCaretLeft, FaCaretRight } from "react-icons/fa";

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
  margin: "1rem 0",
}));

export default function Rapr({ onUpdateRfq, formData, onClose }) {
  const [totalPrice, setTotalPrice] = useState(0);
  const [currentView, setCurrentView] = useState("rfq");

  useEffect(() => {
    if (formData && formData.rows) {
      const total = formData.rows.reduce((sum, row) => {
        const rowTotal = parseFloat(row.totalPrice) || 0;
        return sum + rowTotal;
      }, 0);
      setTotalPrice(total);
    }
  }, [formData]);

  const handleApproval = () => {
    // Using onUpdateRfq to update status to "Approved"
    onUpdateRfq(formData.id, "Approved");
    console.log("Approved");
  };

  const handleSendToVendor = (e) => {
    e.preventDefault();
    // Implement sending logic here
    console.log("Sent to vendor");
  };

  const formatDate = (date) => {
    const options = { day: "numeric", month: "short", year: "numeric" };
    return new Date(date).toLocaleDateString("en-US", options);
  };

  const formatTime = (date) => {
    const dt = new Date(date);
    const hours = dt.getHours();
    const minutes = dt.getMinutes();
    const ampm = hours >= 12 ? "pm" : "am";
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes.toString().padStart(2, "0");
    return `${formattedHours}:${formattedMinutes}${ampm}`;
  };

  const renderTable = () => (
    <StyledTableContainer component={Paper} sx={{ boxShadow: "none", border: "1px solid #e2e6e9" }}>
      <StyledTable sx={{ minWidth: 700, border: "none" }} aria-label="customized table">
        <TableHead>
          <TableRow>
            <StyledTableCell>Product Name</StyledTableCell>
            <StyledTableCell>Description</StyledTableCell>
            <StyledTableCell align="right">Qty</StyledTableCell>
            <StyledTableCell align="right">Estimated Unit Price</StyledTableCell>
            <StyledTableCell align="right">Total Price</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {formData && formData.rows && formData.rows.length > 0 ? (
            formData.rows.map((row, index) => (
              <StyledTableRow key={index}>
                <StyledTableCell>{row.productName}</StyledTableCell>
                <StyledTableCell>{row.description}</StyledTableCell>
                <StyledTableCell align="right">{row.qty}</StyledTableCell>
                <StyledTableCell align="right">{row.unitPrice}</StyledTableCell>
                <StyledTableCell align="right">{row.totalPrice}</StyledTableCell>
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
            <StyledTableCell colSpan={4} align="right" style={{ fontWeight: "bold" }}>
              Total
            </StyledTableCell>
            <StyledTableCell align="right" style={{ fontWeight: "bold" }}>
              {totalPrice.toFixed(2)}
            </StyledTableCell>
          </StyledTableRow>
        </TableBody>
      </StyledTable>
    </StyledTableContainer>
  );

  return (
    <div id="rapr" className="rapr fade-in">
      <div className="rapr1">
        <div className="rapr2">
          <div className="rapr2a">
            <p className="raprhed">New RFQ</p>
            <div className="raprauto">
              <p>Autosaved</p>
              <img src={autosave} alt="Autosaved" />
            </div>
          </div>
        </div>
        <div className="raprclk">
          <p
            className={`togclk ${currentView === "rfq" ? "active" : ""}`}
            onClick={() => setCurrentView("rfq")}
          >
            RFQ
          </p>
          <p
            className={`togclk ${currentView === "vendorQuote" ? "active" : ""}`}
            onClick={() => setCurrentView("vendorQuote")}
          >
            Vendor Quotes
          </p>
        </div>
        {currentView === "rfq" ? (
          <div className="rapr3" style={{ height: "auto" }}>
            <form className="raprform" onSubmit={handleSendToVendor}>
              <div className="rapr3a">
                <div className="rapr3ae">
                  <p style={{ fontSize: "20px" }}>Basic Information</p>
                  <div className="rapr3e">
                    <button type="button" className="rapr3but" onClick={onClose}>
                      Cancel
                    </button>
                    <button type="submit" className="rapr3btn">
                      Send to vendor
                    </button>
                  </div>
                </div>
                <div style={{ marginTop: "1rem" }}>
                  <p>Status</p>
                  <p style={{ fontSize: "14px" }}>
                    {formData ? formData.status : ""}
                  </p>
                </div>
              </div>
              <div className="rapr3b">
                <div className="rapr3ba">
                  <p>ID</p>
                  <p style={{ fontSize: "14px", color: "#7a8a98" }}>
                    {formData ? formData.id : ""}
                  </p>
                </div>
                <div className="rapr3bb">
                  <p>Date Opened</p>
                  <p style={{ fontSize: "14px", color: "#7a8a98" }}>
                    {formData ? `${formatDate(formData.date)} - ${formatTime(formData.date)}` : ""}
                  </p>
                </div>
                <div className="rapr3bb">
                  <p>Expiry Date</p>
                  <p style={{ fontSize: "14px", color: "#7a8a98" }}>
                    {formData ? formData.expiryDate : ""}
                  </p>
                </div>
                <div className="rapr3bb">
                  <p>Vendor Category</p>
                  <p style={{ fontSize: "14px", color: "#7a8a98" }}>
                    {formData ? formData.vendorCategory : ""}
                  </p>
                </div>
              </div>
              <p className="rapr3c">RFQ Content</p>
              <div className="rapr3d">{renderTable()}</div>
            </form>
          </div>
        ) : (
          <div className="rapr4">
            <form className="raprform2">
              <div className="rapr4a">
                <p style={{ fontSize: "20px" }}>Basic Details</p>
                <div className="rapr4ab">
                  <p className="rapr4pg">1 of 6</p>
                  <div className="rapr4nav">
                    <FaCaretLeft className="nr" />
                    <div className="sep"></div>
                    <FaCaretRight className="nr" />
                  </div>
                </div>
              </div>
              <div className="rapr4b">
                <div className="rapr4ba">
                  <p>Vendor Name</p>
                  <p style={{ fontSize: "14px", color: "#7a8a98" }}>
                    {formData ? formData.vendor : ""}
                  </p>
                </div>
                <div className="rapr4ba">
                  <p>Vendor Category</p>
                  <p style={{ fontSize: "14px", color: "#7a8a98" }}>
                    {formData ? formData.vendorCategory : ""}
                  </p>
                </div>
              </div>
              <p className="rapr3c">Quote</p>
              <div className="rapr3d">{renderTable()}</div>
              <div>
                <ApproveButton type="button" onClick={handleApproval}>
                  Approve
                </ApproveButton>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
