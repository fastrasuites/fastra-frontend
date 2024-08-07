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
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { useHistory } from "react-router-dom";
import "./POrderform.css";

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

export default function POrderform({
  onClose,
  onSaveAndSubmit,
  initialData,
  vendors = [],
  categories = [],
}) {
  const defaultRows = initialData?.rows || [
    {
      productName: "",
      description: "",
      qty: "",
      unitPrice: "",
      totalPrice: "",
    },
  ];
  const history = useHistory();

  const generateNewID = () => {
    const lastID = localStorage.getItem("lastGeneratedID");
    let newID = "P00001";

    if (lastID && /^P\d{5}$/.test(lastID)) {
      const idNumber = parseInt(lastID.slice(1), 10);
      if (!isNaN(idNumber)) {
        newID = "P" + (idNumber + 1).toString().padStart(5, "0");
      }
    }

    localStorage.setItem("lastGeneratedID", newID);
    console.log(`Generated new ID: ${newID}`);
    return newID;
  };

  const [formState, setFormState] = useState({
    id: initialData?.id || generateNewID(),
    productName: initialData?.productName || "",
    amount: initialData?.amount || "",
    status: initialData?.status || "Awaiting Goods",
    date: initialData?.date ? new Date(initialData.date) : new Date(),
    expiryDate: initialData?.expiryDate || "",
    vendor: initialData?.vendor || "",
    vendorCategory: initialData?.vendorCategory || "",
  });

  const [rows, setRows] = useState(defaultRows);
  const [page, setPage] = useState(0);
  const rowsPerPage = 2;
  const [showForm] = useState(true);

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
      date: formState.date.toString(),
      rows,
    };

    onSaveAndSubmit(formDataWithStringDate);

    history.push("/orapr");
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

  const [vendorInputValue, setVendorInputValue] = useState("");
  const [selectedVendor, setSelectedVendor] = useState(null);
  const savedVendors = JSON.parse(localStorage.getItem("vendors")) || [];

  const handleVendorSelect = (event, newValue) => {
    setSelectedVendor(newValue);
    if (newValue) {
      setFormState((prev) => ({
        ...prev,
        vendor: newValue.vendorName,
        vendorCategory: newValue.vendorCategory,
      }));
    } else {
      setFormState((prev) => ({
        ...prev,
        vendor: "",
        vendorCategory: "",
      }));
    }
  };

  const handleVendorCategoryChange = (event, newValue) => {
    setFormState((prev) => ({
      ...prev,
      vendorCategory: newValue,
    }));
  };
  const handlePrint = () => {
    const printWindow = window.open("", "", "width=800,height=600");
    printWindow.document.write("<html><head><title>Print Order</title>");
    printWindow.document.write("<style>");
    printWindow.document.write(`
      body { font-family: PT Sans, sans-serif; }
      table { width: 100%; border-collapse: collapse; }
      th, td { padding: 8px; text-align: left; border: 1px solid #ddd; }
      th { background-color: #f2f2f2; }
    `);
    printWindow.document.write("</style></head><body>");
    printWindow.document.write(`
      <h1>Purchase Order</h1>
      <h2>Basic Information</h2>
      <p><strong>ID:</strong> ${formState.id}</p>
      <p><strong>Date Created:</strong> ${formatDate(formState.date)}</p>
      <p><strong>Vendor:</strong> ${formState.vendor}</p>
      <p><strong>Vendor Category:</strong> ${formState.vendorCategory}</p>
      <h2>Product Information</h2>
      <table>
        <thead>
          <tr>
            <th>Product Name</th>
            <th>Description</th>
            <th>Qty</th>
            <th>Estimated Unit Price</th>
            <th>Total Price</th>
          </tr>
        </thead>
        <tbody>
          ${rows
            .map(
              (row) => `
              <tr>
                <td>${row.productName}</td>
                <td>${row.description}</td>
                <td>${row.qty}</td>
                <td>${row.unitPrice}</td>
                <td>${row.totalPrice}</td>
              </tr>`
            )
            .join("")}
        </tbody>
      </table>
      <h2>Total Amount</h2>
      <p><strong>Total:</strong> $${calculateTotalAmount()}</p>
    `);
    printWindow.document.write("</body></html>");
    printWindow.document.close();
    printWindow.print();
    printWindow.addEventListener('afterprint', onClose);
  };

  return (
    <div
      id="newPurchaseOrder"
      className={`newpod ${showForm ? "fade-in" : "fade-out"}`}
    >
      <div className="newpod1">
        <div className="newpod2">
          <div className="newpod2a">
            <p className="rprhed">New Purchase Order</p>
            <div className="rprauto">
              <p>Autosaved</p>
              <img src={autosave} alt="Autosaved" />
            </div>
          </div>
          <div className="newpod2b">
            <p className="rprbpg">
              {page + 1}-{pageCount} of {pageCount}
            </p>
            <div className="rprbnav">
              <FaCaretLeft className="nr" onClick={handlePreviousPage} />
              <div className="sep"></div>
              <FaCaretRight className="nr" onClick={handleNextPage} />
            </div>
          </div>
        </div>
        <div className="newpod3">
          <form className="newform" onSubmit={handleSubmit}>
            <div className="newpod3a">
              <p style={{ fontSize: "20px" }}>Basic Information</p>
              <div className="newpod3e">
                <button type="button" className="new3but" onClick={onClose}>
                  Cancel
                </button>
                <button type="button" className="new3btn" onClick={handlePrint}>
                  Print Order
                </button>
                <button type="button" className="new3btn" onClick={handleSave}>
                  Save
                </button>
                <button type="submit" className="new3btn">
                  Save &amp; Send
                </button>
              </div>
            </div>
            <div className="newpod3b">
              <div className="newpod3ba">
                <p>ID</p>
                <p style={{ fontSize: "14px", color: "#7a8a98" }}>
                  {formState.id}
                </p>
              </div>
              <div className="newpod3bb">
                <p>Date Created</p>
                <p style={{ fontSize: "14px", color: "#7a8a98" }}>
                  {`${formatDate(formState.date)} - ${formatTime(
                    formState.date
                  )}`}
                </p>
              </div>
            </div>
            <div className="newpod3c">
              <div className="newpod3ca" style={{ marginTop: "-0.5rem" }}>
                <p>Vendor</p>
                <Autocomplete
                  value={selectedVendor}
                  onChange={handleVendorSelect}
                  inputValue={vendorInputValue}
                  onInputChange={(event, newInputValue) => {
                    setVendorInputValue(newInputValue);
                  }}
                  options={savedVendors}
                  getOptionLabel={(option) => option.vendorName}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select vendor"
                      className="newpod3cb"
                    />
                  )}
                />
              </div>
              <div className="newpod3ca">
                <p>Vendor Category</p>
                <Autocomplete
                  value={formState.vendorCategory}
                  onChange={handleVendorCategoryChange}
                  inputValue={formState.vendorCategory}
                  onInputChange={(event, newInputValue) => {
                    setFormState((prev) => ({
                      ...prev,
                      vendorCategory: newInputValue,
                    }));
                  }}
                  options={categories}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select category"
                      className="newpod3cb"
                    />
                  )}
                />
              </div>
              <button
                type="button"
                className="new3but"
                onClick={addRow}
                style={{ marginTop: "1rem" }}
              >
                Add Row
              </button>
            </div>

            <p style={{ fontSize: "20px", color: "blue", marginTop: "1rem" }}>
              Purchase Order Content
            </p>
            <div className="newpod3d">
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
                            placeholder="0"
                            name="qty"
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
                            placeholder="0.00"
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
          </form>
        </div>
      </div>
    </div>
  );
}
