import React, { useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import {
  FaCaretLeft,
  FaCaretRight,
  FaTrashAlt,
  FaRegStar,
} from "react-icons/fa";
import autosave from "../../../image/autosave.svg";
import "./Receipt.css";
import PrintConfigPopup from "./PrintConfigPopup";

const Receipt = ({ formData, onClose }) => {
  const [showPrintConfig, setShowPrintConfig] = useState(false);
  const [page, setPage] = useState(0);
  const rows = formData && formData.rows ? formData.rows : [];

  const formatDate = (date) => {
    const options = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    };
    return new Date(date).toLocaleString("en-GB", options).replace(",", "");
  };

  const handleNextPage = () => {
    if ((page + 1) * 2 < rows.length) {
      setPage(page + 1);
    }
  };

  const handlePreviousPage = () => {
    if (page > 0) {
      setPage(page - 1);
    }
  };

  const handleDeleteRow = (index) => {
    // Implement delete functionality here
  };

  const handlePrintButton = () => {
    setShowPrintConfig(true);
  };
  console.log(showPrintConfig);
  return (
    <div id="receipt" className="receipt-container">
      <div className="newpodr2">
        <div className="newpod2a">
          <button className="new-purchase-order">New Purchase Order</button>
          <div className="rprauto">
            <span>Autosaved</span>
            <img src={autosave} alt="Autosaved" />
          </div>
        </div>
        <div className="newpod2b">
          <span className="rprbpg">
            {page + 1}-{Math.ceil(rows.length / 2)} of{" "}
            {Math.ceil(rows.length / 2)}
          </span>
          <div className="rprbnav">
            <FaCaretLeft className="nr" onClick={handlePreviousPage} />
            <div className="sep"></div>
            <FaCaretRight className="nr" onClick={handleNextPage} />
          </div>
        </div>
      </div>
      <div className="receipt-header">
        <div className="receipt-actions">
          <button className="validate-button">Validate</button>
          <button onClick={handlePrintButton}>Print</button>
          <button onClick={onClose}>Cancel</button>
        </div>
        <div className="receipt-status">
          <button className="tab-active">Ready</button>
          <button>Draft</button>
          <button>Done</button>
        </div>
      </div>

      <div className="receipt-info">
        <div className="receipt-left">
          <h3>
            <FaRegStar className="outlined-star" /> WH/IN/00006
          </h3>
          <p>
            Receive From <span>Ready Mat</span>
          </p>
        </div>
        <div className="receipt-right">
          {/* <div className="receipt-dates"> */}
          <div className="receipt-text">
            <p>Scheduled Date: </p>
            <p className="status-active">
              {formData ? formatDate(formData.date) : ""}
            </p>
          </div>
          <div className="receipt-text">
            <p>Deadline:</p>
            <p className="">{formData ? formatDate(formData.date) : ""}</p>
          </div>
          {""}
          <div className="receipt-text">
            <p>Source Document: </p>
            <p className="">{formData ? formData.id : ""}</p>
          </div>
          {/* </div> */}
        </div>
      </div>

      <div className="receipt-container2">
        <div className="divider"></div>

        <div className="receipt-tabs">
          <button className="tab-active">Operations</button>
          <button>Additional Info</button>
          <button>Note</button>
        </div>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Product Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right">QTY</TableCell>
                <TableCell align="right">Estimated Unit Price</TableCell>
                <TableCell align="right">Total Price</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.slice(page * 2, (page + 1) * 2).map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row.productName}</TableCell>
                  <TableCell>{row.description}</TableCell>
                  <TableCell align="right">{row.qty}</TableCell>
                  <TableCell align="right">{row.unitPrice}</TableCell>
                  <TableCell align="right">
                    {row.totalPrice}
                    <button
                      className="delete-button"
                      onClick={() => handleDeleteRow(index)}
                    >
                      <FaTrashAlt />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={4} align="right">
                  Total
                </TableCell>
                <TableCell align="right">
                  {rows
                    .reduce((sum, row) => sum + parseFloat(row.totalPrice), 0)
                    .toFixed(2)}
                </TableCell>
                <TableCell />
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </div>
      {showPrintConfig && (
        <PrintConfigPopup
          showPrintConfig={showPrintConfig}
          setShowPrintConfig={setShowPrintConfig}
        />
      )}
    </div>
  );
};

export default Receipt;
