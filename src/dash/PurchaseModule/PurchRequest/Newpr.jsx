import React, { useState, useEffect } from "react";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { FaCaretLeft, FaCaretRight } from "react-icons/fa";
import autosave from "../../../image/autosave.svg";
import "./Newpr.css";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";

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

export default function Newpr({ onClose, onSaveAndSubmit, vendors }) {
  const [rows, setRows] = useState([
    {
      productName: "",
      description: "",
      qty: "",
      unitPrice: "",
      totalPrice: "",
    },
  ]);

  const generateNewID = () => {
    const lastID = localStorage.getItem("lastGeneratedID");
    let newID = "PR00001";

    if (lastID) {
      const idNumber = parseInt(lastID.slice(2), 10) + 1;
      newID = "PR" + idNumber.toString().padStart(5, "0");
    }

    localStorage.setItem("lastGeneratedID", newID);
    return newID;
  };

  const [formState, setFormState] = useState({
    id: generateNewID(),
    productName: "",
    amount: "",
    requester: "Firstname Lastname", // Assuming requester is the logged-in user
    department: "Sales",
    status: "Pending", // Assuming default status
    date: new Date(), // Current date
  });

  const [page, setPage] = useState(0);
  const rowsPerPage = 2;
  const [showForm] = useState(true);

  const [vendorInputValue, setVendorInputValue] = useState("");
  const [selectedVendor, setSelectedVendor] = useState(null);
  const savedVendors = JSON.parse(localStorage.getItem("vendors")) || [];
  const handleVendorSelect = (event, newValue) => {
    setSelectedVendor(newValue);
    if (newValue) {
      setFormState((prev) => ({
        ...prev,
        vendor: newValue.vendorName,
      }));
    } else {
      setFormState((prev) => ({
        ...prev,
        vendor: "",
      }));
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setFormState((prevState) => ({
        ...prevState,
        date: new Date(),
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleInputChange = (index, key, value) => {
    const newRows = [...rows];
    if (key === "qty" || key === "unitPrice") {
      value = Math.max(0, parseFloat(value) || 0);
    }
    newRows[index][key] = value;
    if (key === "qty" || key === "unitPrice") {
      newRows[index]["totalPrice"] = (
        newRows[index]["qty"] * newRows[index]["unitPrice"]
      ).toFixed(2);
    }
    setRows(newRows);

    const totalAmount = newRows.reduce(
      (sum, row) => sum + parseFloat(row.totalPrice || 0),
      0
    );

    setFormState((prevState) => ({
      ...prevState,
      productName: key === "productName" ? value : prevState.productName,
      amount: totalAmount.toFixed(2),
    }));
  };

  const handleSave = () => {
    console.log("Input data saved:", rows);
    alert("Data saved successfully!");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formDataWithStringDate = {
      ...formState,
      date: formState.date.toString(), // Convert date to string
      rows,
    };

    onSaveAndSubmit(formDataWithStringDate);
  };

  const addRow = () => {
    setRows([
      ...rows,
      {
        productName: "",
        description: "",
        qty: "",
        unitPrice: "",
        totalPrice: "",
      },
    ]);
  };

  const handleNextPage = () => {
    if ((page + 1) * rowsPerPage < rows.length) {
      setPage(page + 1);
    }
  };

  const handlePreviousPage = () => {
    if (page > 0) {
      setPage(page - 1);
    }
  };

  const currentRows = rows.slice(page * rowsPerPage, (page + 1) * rowsPerPage);
  const pageCount = Math.ceil(rows.length / rowsPerPage);

  const formatDate = (date) => {
    const options = { day: "numeric", month: "short", year: "numeric" };
    return date.toLocaleDateString("en-US", options);
  };

  const formatTime = (date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "pm" : "am";
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes.toString().padStart(2, "0");
    return `${formattedHours}:${formattedMinutes}${ampm}`;
  };

  const calculateTotalAmount = () => {
    return rows
      .reduce((sum, row) => sum + parseFloat(row.totalPrice || 0), 0)
      .toFixed(2);
  };

  return (
    <div id="npr" className={`npr ${showForm ? "fade-in" : "fade-out"}`}>
      <div className="npr1">
        <div className="npr2">
          <div className="npr2a">
            <p className="nprhed">New Purchase Request</p>
            <div className="nprauto">
              <p>Autosaved</p>
              <img src={autosave} alt="Autosaved" />
            </div>
          </div>
          <div className="npr2b">
            <p className="nprbpg">
              {page + 1}-{pageCount} of {pageCount}
            </p>
            <div className="nprbnav">
              <FaCaretLeft className="nr" onClick={handlePreviousPage} />
              <div className="sep"></div>
              <FaCaretRight className="nr" onClick={handleNextPage} />
            </div>
          </div>
        </div>
        <div className="npr3">
          <form className="nprform" onSubmit={handleSubmit}>
            <div className="npr3a">
              <p style={{ fontSize: "20px" }}>Basic Information</p>
              <button
                type="button"
                className="npr3but"
                onClick={onClose}
                style={{ marginTop: "1rem" }}
              >
                Cancel
              </button>
            </div>

            <div className="npr3b">
              <div className="npr3ba">
                <p>ID</p>
                <p style={{ fontSize: "14px", color: "#7a8a98" }}>
                  {formState.id}
                </p>
              </div>
              <div className="npr3bc">
                <p>Date</p>
                <p style={{ fontSize: "14px", color: "#7a8a98" }}>
                  {`${formatDate(formState.date)} - ${formatTime(
                    formState.date
                  )}`}
                </p>
              </div>
              <div className="npr3bc">
                <p>Requester</p>
                <p style={{ fontSize: "14px", color: "#7a8a98" }}>
                  {formState.requester}
                </p>
              </div>
              <div className="npr3bb">
                <p>Department</p>
                <p style={{ fontSize: "14px", color: "#7a8a98" }}>
                  {formState.department}
                </p>
              </div>
            </div>
            <div className="npr3c">
              <div className="npr3ca">
                <label>Purpose</label>
                <input
                  type="text"
                  name="purpose"
                  placeholder="Enter a purpose"
                  className="npr3cb"
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      purpose: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="npr3ca">
                <label>Suggested Vendors</label>
                <Autocomplete
  value={selectedVendor}
  onChange={handleVendorSelect}
  inputValue={vendorInputValue}
  onInputChange={(event, newInputValue) => {
    setVendorInputValue(newInputValue);
  }}
  id="vendor-autocomplete"
  options={savedVendors}
  getOptionLabel={(option) => option.vendorName}
  renderInput={(params) => (
    <TextField
      {...params}
      label="Select vendor"
      style={{
        width: "95%",
        marginTop: "0.1rem",
        cursor: "pointer",
        outline: "none",  // Remove default outline
        border: "2px solid #e2e6e9",
        borderRadius: "4px",
        // padding: "15px",
        marginBottom: "1rem",
      }}
      InputProps={{
        ...params.InputProps,
        style: {
          outline: "none",  // Remove default outline
        },
      }}
    />
  )}
/>

              </div>
              <button type="button" className="npr3but" onClick={addRow}>
                Add Row
              </button>
            </div>
            <div className="npr3d">
              <TableContainer
                component={Paper}
                sx={{
                  boxShadow: "none",
                  border: "1px solid #e2e6e9",
                  marginTop: "1rem",
                }}
              >
                <Table
                  sx={{
                    minWidth: 700,
                    "&.MuiTable-root": {
                      border: "none",
                    },
                    "& .MuiTableCell-root": {
                      border: "none",
                    },
                    "& .MuiTableCell-head": {
                      border: "none",
                    },
                    "& .MuiTableCell-body": {
                      border: "none",
                    },
                  }}
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
                    {currentRows.map((row, index) => (
                      <StyledTableRow key={index + page * rowsPerPage}>
                        <StyledTableCell component="th" scope="row">
                          <input
                            type="text"
                            placeholder="Enter a product name"
                            name="productName"
                            value={row.productName}
                            onChange={(e) =>
                              handleInputChange(
                                index + page * rowsPerPage,
                                "productName",
                                e.target.value
                              )
                            }
                          />
                        </StyledTableCell>
                        <StyledTableCell>
                          <input
                            type="text"
                            placeholder="Enter a description"
                            name="description"
                            value={row.description}
                            onChange={(e) =>
                              handleInputChange(
                                index + page * rowsPerPage,
                                "description",
                                e.target.value
                              )
                            }
                          />
                        </StyledTableCell>
                        <StyledTableCell align="right">
                          <input
                            type="number"
                            placeholder="0.00"
                            name="qty"
                            className="no-arrows"
                            style={{ textAlign: "right" }}
                            value={row.qty}
                            onChange={(e) =>
                              handleInputChange(
                                index + page * rowsPerPage,
                                "qty",
                                e.target.value
                              )
                            }
                          />
                        </StyledTableCell>
                        <StyledTableCell align="right">
                          <input
                            type="number"
                            placeholder="0.00"
                            name="unitPrice"
                            className="no-arrows"
                            style={{ textAlign: "right" }}
                            value={row.unitPrice}
                            onChange={(e) =>
                              handleInputChange(
                                index + page * rowsPerPage,
                                "unitPrice",
                                e.target.value
                              )
                            }
                          />
                        </StyledTableCell>
                        <StyledTableCell align="right">
                          <input
                            type="number"
                            placeholder="000,000"
                            name="totalPrice"
                            style={{ textAlign: "right" }}
                            value={row.totalPrice}
                            readOnly
                          />
                        </StyledTableCell>
                      </StyledTableRow>
                    ))}
                    <StyledTableRow>
                      <StyledTableCell colSpan={4} align="right">
                        Total Amount
                      </StyledTableCell>
                      <StyledTableCell align="right">
                        {calculateTotalAmount()}
                      </StyledTableCell>
                    </StyledTableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
            <div className="npr3e">
              <button type="button" className="npr3btn" onClick={handleSave}>
                Save
              </button>
              <button type="submit" className="npr3btn">
                Save & Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}