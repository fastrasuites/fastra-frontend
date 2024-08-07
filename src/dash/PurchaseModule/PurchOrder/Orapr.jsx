import React, { useState, useEffect } from "react";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Receipt from "./Receipt"; 
import autosave from "../../../image/autosave.svg";
import { FaCaretLeft, FaCaretRight, FaReceipt } from "react-icons/fa";
import "./Orapr.css";

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

const DeselectButton = styled("button")(({ theme }) => ({
  backgroundColor: "red",
  color: "white",
  border: "none",
  padding: "10px 20px",
  borderRadius: "5px",
  cursor: "pointer",
  margin: "1rem 0",
}));

export default function Orapr({ onUpdateStatus, formData, onClose }) {
  const [showReceipt, setShowReceipt] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
  const [currentView, setCurrentView] = useState("orfq");
  const [currentFormData, setCurrentFormData] = useState(formData);

  useEffect(() => {
    if (currentFormData && currentFormData.rows) {
      const total = currentFormData.rows.reduce((sum, row) => {
        const rowTotal = parseFloat(row.totalPrice) || 0;
        return sum + rowTotal;
      }, 0);
      setTotalPrice(total);
    }
  }, [currentFormData]);

  const handleDeselect = () => {
    const updatedFormData = {
      ...currentFormData,
      vendorName: "",
      vendorCategory: "",
      status: "Deselect",
    };
    setCurrentFormData(updatedFormData);
    onUpdateStatus(currentFormData.id, "Deselect");
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

 const toggleReceipt = () => {
    setShowReceipt(!showReceipt);
  };

  if (showReceipt) {
    return <Receipt formData={formData} onClose={() => setShowReceipt(false)} />;
  }

  return (
    <div id="orapr" className="orapr fade-in">
      <div className="orapr1">
        <div className="orapr2">
          <div className="orapr2a">
            <p className="oraprhed">Purchase Order</p>
            <div className="oraprauto">
              <p>Autosaved</p>
              <img src={autosave} alt="Autosaved" />
            </div>
          </div>
        </div>
        <div className="oraprclk">
          <div className="oraprclka">
            <p
              className={`togclk ${currentView === "orfq" ? "active" : ""}`}
              onClick={() => setCurrentView("orfq")}
            >
              Purchase Order
            </p>
            <p
              className={`togclk ${
                currentView === "vendorQuote" ? "active" : ""
              }`}
              onClick={() => setCurrentView("vendorQuote")}
              style={{ marginRight: "20px" }}
            >
              Vendor Quotes
            </p>
          </div>
          <p className="receipt" onClick={toggleReceipt}>
            <FaReceipt style={{ marginRight: "5px" }} /> Receipt
          </p>

          {showReceipt && (
            <Receipt
              formData={formData}
              onClose={() => setShowReceipt(false)}
            />
          )}
        </div>
        {currentView === "orfq" ? (
          <div className="orapr3" style={{ height: "auto" }}>
            <form className="oraprform">
              <div className="orapr3a">
                <div className="orapr3ae">
                  <p style={{ fontSize: "20px" }}>Basic Information</p>
                  <div className="orapr3e">
                    <button
                      type="button"
                      className="orapr3but"
                      onClick={onClose}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="orapr3btn">
                      Send to vendor
                    </button>
                  </div>
                </div>
                <div style={{ marginTop: "1rem" }}>
                  <p>Status</p>
                  <p style={{ fontSize: "14px", color: "#f0b501" }}>
                    {formData ? formData.status : ""}
                  </p>
                </div>
              </div>
              <div className="orapr3b">
                <div className="orapr3ba">
                  <p>ID</p>
                  <p style={{ fontSize: "14px", color: "#7a8a98" }}>
                    {formData ? formData.id : ""}
                  </p>
                </div>
                <div className="orapr3bb">
                  <p>Date Created</p>
                  <p style={{ fontSize: "14px", color: "#7a8a98" }}>
                    {formData
                      ? formatDate(formData.date) +
                        " - " +
                        formatTime(formData.date)
                      : ""}
                  </p>
                </div>
                <div className="orapr3bb">
                  <p>Vendor</p>
                  <p style={{ fontSize: "14px", color: "#7a8a98" }}>
                    {formData ? formData.vendorName : ""}
                  </p>
                </div>
                <div className="orapr3bb">
                  <p>Vendor Category</p>
                  <p style={{ fontSize: "14px", color: "#7a8a98" }}>
                    {formData ? formData.vendorCategory : ""}
                  </p>
                </div>
              </div>
              <p className="orapr3c">RFQ Content</p>
              <div className="orapr3d">
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
            </form>
          </div>
        ) : (
          <div className="orapr4">
            <form className="oraprform2">
              <div className="orapr4a">
                <p style={{ fontSize: "20px" }}>Basic Details</p>
                <div className="orapr4ab">
                  <p className="orapr4pg">1 of 6</p>
                  <div className="orapr4nav">
                    <FaCaretLeft className="nr" />
                    <div className="sep"></div>
                    <FaCaretRight className="nr" />
                  </div>
                </div>
              </div>
              <div className="orapr4b">
                <div className="orapr4ba">
                  <p>Vendor Name</p>
                  <p style={{ fontSize: "14px", color: "#7a8a98" }}>
                    {formData ? formData.vendor : ""}
                  </p>
                </div>
                <div className="orapr4ba">
                  <p>Vendor Category</p>
                  <p style={{ fontSize: "14px", color: "#7a8a98" }}>
                    {formData ? formData.vendorCategory : ""}
                  </p>
                </div>
              </div>
              <p className="orapr3c">Quote</p>
              <div className="orapr3d">
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
              <div>
                <DeselectButton onClick={handleDeselect}>
                  Deselect Vendor
                </DeselectButton>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
