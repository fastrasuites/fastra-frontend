import React, { useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

const Receipt3 = ({
  formData,
  setligthFont,
  lightFont,
  darkFont,
  boxedBorder,
  strippedBorder,
  invoiceNumberTextColor,
  invoiceTableHeadTextColor,
}) => {
  const [isboldLayout, setIsBoldLayout] = useState(false);
  const [toggle] = useState(false);
  const [page, setPage] = useState(0);
  const rows = formData && formData.rows ? formData.rows : [];

  console.log(formData); // Expected more data like 'rows' and it's contents

  // Dummy Addressess
  const [vendorAddress, setVendorAddress] = useState({
    line1: "Bela Const",
    line2: "No 8 Adelabu street Surulere",
    line3: "Lagos state 100001",
    line4: "Nigeria",
  });

  const [companyAddress, setCompanyAddress] = useState({
    line1: "Demo Company",
    line2: "No 8 Adelabu street Surulere",
    line3: "Lagos state 100001",
    line4: "Nigeria",
  });

  return (
    <div
      style={{
        fontWeight: `${lightFont ? "400" : "700"}`,
        color: `${lightFont ? "#8c9aa6" : "#1a1a1a"}`,
      }}
    >
      <div
        className="header"
        style={{
          display: "flex",
          gap: "10px",
          borderBottom: "solid 2px #7A8A98",
          margin: "20px",
          paddingBottom: "20px",
        }}
      >
        {/* <img src="" alt="comp Logo" style={{ maxWidth: "100px" }} /> */}
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M17 6C19.3456 6 20.0184 6 20.8263 6.61994C21.0343 6.77954 21.2205 6.96572 21.3801 7.17372C22 7.98164 22 9.15442 22 11.5V16C22 18.8284 22 20.2426 21.1213 21.1213C20.2426 22 18.8284 22 16 22H8C5.17157 22 3.75736 22 2.87868 21.1213C2 20.2426 2 18.8284 2 16V11.5C2 9.15442 2 7.98164 2.61994 7.17372C2.77954 6.96572 2.96572 6.77954 3.17372 6.61994C3.98164 6 4.65442 6 7 6"
            stroke="#7A8A98"
            stroke-width="1.5"
            stroke-linecap="round"
          />
          <path
            d="M17 7L16.1142 4.78543C15.732 3.82996 15.3994 2.7461 14.4166 2.25955C13.8924 2 13.2616 2 12 2C10.7384 2 10.1076 2 9.58335 2.25955C8.6006 2.7461 8.26801 3.82996 7.88583 4.78543L7 7"
            stroke="#7A8A98"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M15.5 14C15.5 15.933 13.933 17.5 12 17.5C10.067 17.5 8.5 15.933 8.5 14C8.5 12.067 10.067 10.5 12 10.5C13.933 10.5 15.5 12.067 15.5 14Z"
            stroke="#7A8A98"
            stroke-width="1.5"
          />
          <path
            d="M12 6H12.009"
            stroke="#7A8A98"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <h3>Your Logo </h3>
      </div>

      {/* Addresses */}
      <div
        className="addresses"
        style={{
          display: "flex",
          flexDirection: "column",
          marginBottom: "50px",
        }}
      >
        <div className="company" style={{ marginBottom: "10px" }}>
          <p>{companyAddress.line1}</p>
          <p>{companyAddress.line2}</p>
          <p>{companyAddress.line3}</p>
          <p>{companyAddress.line4}</p>
        </div>

        <div className="vendor" style={{ alignSelf: "flex-end" }}>
          <p>{vendorAddress.line1}</p>
          <p>{vendorAddress.line2}</p>
          <p>{vendorAddress.line3}</p>
          <p>{vendorAddress.line4}</p>
        </div>
      </div>

      {/* Invoice Details */}
      <div className="invoice-detail" style={{ marginBottom: "5px" }}>
        <p style={{ fontWeight: "700", marginBottom: "5px" }}>
          Invoice{" "}
          <span style={{ color: invoiceNumberTextColor }}>WH/IN/00006</span>{" "}
        </p>
        <div
          style={{
            display: "inline-flex",
            flexDirection: "row",
            gap: "50px",
          }}
        >
          <div>
            <p style={{ color: "#1a1a1a" }}>Invoice Date:</p>
            <p>01/08/2020</p>
          </div>
          <div>
            <p style={{ color: "#1a1a1a" }}>Due Date:</p>
            <p>07/01/2020</p>
          </div>
        </div>
      </div>

      <TableContainer component={Paper}>
        <Table
          style={{
            border: `${boxedBorder ? "solid 2px #1a1a1a" : ""}`,
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell style={{ color: invoiceTableHeadTextColor }}>
                Product Name
              </TableCell>
              <TableCell style={{ color: invoiceTableHeadTextColor }}>
                Description
              </TableCell>
              <TableCell
                align="right"
                style={{ color: invoiceTableHeadTextColor }}
              >
                QTY
              </TableCell>
              <TableCell
                align="right"
                style={{ color: invoiceTableHeadTextColor }}
              >
                Estimated Unit Price
              </TableCell>
              <TableCell
                align="right"
                style={{ color: invoiceTableHeadTextColor }}
              >
                Total Price
              </TableCell>
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
                  {/* <button
                    className="delete-button"
                    onClick={() => handleDeleteRow(index)}
                  >
                    <FaTrashAlt />
                  </button> */}
                </TableCell>
              </TableRow>
            ))}
            <TableRow
              style={{
                border: `${boxedBorder ? "solid 2px black" : ""}`,
              }}
            >
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
  );
};

export default Receipt3;
