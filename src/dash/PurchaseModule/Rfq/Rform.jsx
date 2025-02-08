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
import "./Rform.css";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import PurchaseHeader from "../PurchaseHeader";

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

export default function Rform({
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

  const [rows, setRows] = useState(defaultRows);

  const generateNewID = () => {
    const lastID = localStorage.getItem("lastGeneratedID");
    let newID = "RFQ00001";

    if (lastID && /^RFQ\d{5}$/.test(lastID)) {
      const idNumber = parseInt(lastID.slice(3), 10);
      if (!isNaN(idNumber)) {
        newID = "RFQ" + (idNumber + 1).toString().padStart(5, "0");
      }
    }

    localStorage.setItem("lastGeneratedID", newID);
    console.log(`Generated new ID: ${newID}`); // Debugging line
    return newID;
  };

  const [products, setProducts] = useState([]);

  useEffect(() => {
    const savedProducts = JSON.parse(localStorage.getItem("products")) || [];
    setProducts(savedProducts);
  }, []);
  
  const calculateTotalPrice = (product) => {
    const pricePerUnit = parseFloat(product.sp.replace("₦", "")) || 0;
    const totalQuantity = parseInt(product.availableProductQty) || 0;
    return `₦${(pricePerUnit * totalQuantity).toFixed(2)}`;
  };
  // const currentRows = rows.slice(page * rowsPerPage, (page + 1) * rowsPerPage);
  // const pageCount = Math.ceil(rows.length / rowsPerPage);

  // const formatDate = (date) => {
  //   const options = { day: "numeric", month: "short", year: "numeric" };
  //   return date.toLocaleDateString("en-US", options);
  // };

  const [formState, setFormState] = useState({
    id: initialData?.id || generateNewID(),
    productName: initialData?.productName || "",
    amount: initialData?.amount || "",
    status: initialData?.status || "Awaiting Vendor Selection", // Assuming default status
    date: initialData?.date ? new Date(initialData.date) : new Date(), // Current date or initial date
    expiryDate: initialData?.expiryDate || "",
    vendor: initialData?.vendor || "",
    vendorCategory: initialData?.vendorCategory || "",
  });

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
        unt: " ",
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
 // Load saved currencies from localStorage
 const [selectedCurrency, setSelectedCurrency] = useState(null);
 const [savedCurrencies, setSavedCurrencies] = useState([]);
 
 useEffect(() => {
   // Fetch currencies from localStorage
   const currencies = JSON.parse(localStorage.getItem("savedCurrencies")) || [];
   if (currencies.length === 0) {
     console.warn('No currencies found in localStorage.');
   }
   setSavedCurrencies(currencies);
 }, []);  // Only run this effect once, on component mount
 
 const handleCurrencyChange = (event, newValue) => {
   setSelectedCurrency(newValue);
   // Assuming you have a form state to update
   setFormState((prev) => ({
     ...prev,
     currency: newValue ? `${newValue.name} - ${newValue.symbol}` : "",
   }));
 
   // Log the selected currency
   if (newValue) {
     console.log("Selected Currency:", newValue);
   }
 };
  const addRows = rows.slice(page * rowsPerPage, (page + 1) * rowsPerPage);
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
  return (
    <div className="rpr-contain">
      <PurchaseHeader />
    <div id="newrfq" className={`rpr ${showForm ? "fade-in" : "fade-out"}`}>
      <div className="rpr1">
        <div className="rpr2">
          <div className="rpr2a">
            <p className="rprhed">New RFQs</p>
            <div className="rprauto">
              <p>Autosaved</p>
              <img src={autosave} alt="Autosaved" />
            </div>
          </div>
          <div className="rpr2b">
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
        <div className="rpr3">
          <form className="rprform" onSubmit={handleSubmit}>
            <div className="rpr3a">
              <p style={{ fontSize: "20px" }}>Basic Information</p>
              <div className="rpr3e">
                <button type="button" className="rpr3but" onClick={onClose}>
                  Cancel
                </button>
                <button type="button" className="rpr3btn" onClick={handleSave}>
                  Save
                </button>
                <button type="submit" className="rpr3btn">
                  Send to vendor
                </button>
              </div>
            </div>

            <div className="rpr3b">
              <div className="rpr3ba">
                <p>ID</p>
                <p style={{ fontSize: "14px", color: "#7a8a98" }}>
                  {formState.id}
                </p>
              </div>
              <div className="rpr3bb">
                <p>Date Opened</p>
                <p style={{ fontSize: "14px", color: "#7a8a98" }}>
                  {`${formatDate(formState.date)} - ${formatTime(
                    formState.date
                  )}`}
                </p>
              </div>
              <div className="npr3ca">
            <p>Select Currency</p>
                <Autocomplete
                  value={selectedCurrency}
                  onChange={handleCurrencyChange}
                  options={savedCurrencies}  // Populate options from localStorage
                  getOptionLabel={(option) => `${option.name} - ${option.symbol}`}
                  renderInput={(params) => (
                    <TextField {...params} label="Select Currency" className="newpod3cb" />
                  )}
                />
            </div>
            </div> <br /><br /> <br />
            <div className="rpr3c">
              <div className="rpr3ca">
                <label>Expiry Date</label>
                <input
                  type="date"
                  name="expiryDate"
                  placeholder="DD MMM YYYY - HH MM - AM"
                  className="rpr3cb"
                  value={formState.expiryDate}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      expiryDate: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="rpr3ca">
                <label>Vendor</label>
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
                    <TextField {...params} label="Select vendor" className="rpr3cb" />
                  )}
                />
              </div>
              <div className="rpr3ca">
                <p>Vendor Category</p>
                <input
                className="rpr3cb"
                  type="text"
                  value={formState.vendorCategory}
                  onChange={(e) =>
                    setFormState((prevState) => ({
                      ...prevState,
                      vendorCategory: e.target.value,
                    }))
                  }
                />
              </div>
              <button
                type="button"
                className="rpr3but"
                onClick={addRow}
                style={{ marginTop: "1rem" }}
              >
                Add Row
              </button>
            </div>
            <div className="rpr3d">
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
                      <StyledTableCell align="right">Unit Measurement</StyledTableCell>
                      <StyledTableCell align="right">
                        Estimated Unit Price
                      </StyledTableCell>
                      <StyledTableCell align="right">
                        Total Price
                      </StyledTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {products.map((product, index) => (
                      <StyledTableRow key={index + page * rowsPerPage}>
                        <StyledTableCell component="th" scope="row">
                        {product.name}
                        </StyledTableCell>
                        <StyledTableCell>
                        {product.productDesc}
                        </StyledTableCell>
                        <StyledTableCell align="right">
                          <input
                            type="number"
                            placeholder="0.00"
                            name="qty"
                            className="no-arrows"
                            style={{ textAlign: "right" }}
                            value={product.qty}
                            onChange={(e) =>
                              handleInputChange(
                                index + page * rowsPerPage,
                                "qty",
                                e.target.value
                              )
                            }
                          />
                            
                        </StyledTableCell>
                        <StyledTableCell align="right">{product.unt}
                        </StyledTableCell>
                        <StyledTableCell align="right">
                          <input
                            type="number"
                            placeholder="0.00"
                            name="unitPrice"
                            className="no-arrows"
                            style={{ textAlign: "right" }}
                            value={product.unitPrice}
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
                        {calculateTotalAmount()}

                        </StyledTableCell>
                      </StyledTableRow>
                    ))}
                    <StyledTableRow>
                      <StyledTableCell colSpan={5} align="right">
                       <b> Total Amount</b>
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
    </div>
  );
}
