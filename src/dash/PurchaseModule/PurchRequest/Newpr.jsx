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
import PurchaseHeader from "../PurchaseHeader";
import { usePurchase } from "../../../context/PurchaseContext";
import { products } from "./products";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.white,
    color: '#7A8A98',
    border: 0,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
    border: 0,
    backgroundColor: '#F2F2F2',
    color:'#A9B3BC'
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


export default function Newpr({onSaveAndSubmit,onFormDataChange, onClose }) {
  const { vendors } = usePurchase();

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
        (newRows[index]["qty"]) * (newRows[index]["unitPrice"] || 0)
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
  /*
{
  "department": "<uri>",
  "suggested_vendor": "<uri>",
  "status": "draft",
  "purpose": "<string>",
  "is_hidden": "<boolean>",
  "date_created": -44489739.02090701,
  "date_updated": false
}
*/



const handleProductChange = (index, selectedProduct) => {
  console.log(selectedProduct)
  if (selectedProduct) {
    const updatedRows = [...rows];
    updatedRows[index] = {
      ...updatedRows[index],
      productName: selectedProduct.product_name,
      description: selectedProduct.description,
      unitPrice: selectedProduct.unit_price,
      unt: selectedProduct.unit_of_Measure,
      totalPrice: selectedProduct.unit_price * (updatedRows[index].qty || 0),
    };
    setRows(updatedRows);
  }
};

  const addRow = () => {
    console.log("Adding a new row...");
    setRows([
      ...rows,
      {
        productName: "",
        description: "",
        unt: "",
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
 /* const [products, setProducts] = useState([]);

  useEffect(() => {
   const savedProducts = JSON.parse(localStorage.getItem("products")) || [];
    setProducts(savedProducts);
  }, []);
  */

  const calculateTotalPrice = (product) => {
    const pricePerUnit = parseFloat(product.sp.replace("₦", "")) || 0;
    const totalQuantity = parseInt(product.availableProductQty) || 0;
    return `₦${(pricePerUnit * totalQuantity).toFixed(2)}`;
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

  // Load saved currencies from localStorage
  const [selectedCurrency, setSelectedCurrency] = useState(null);
  const [savedCurrencies, setSavedCurrencies] = useState([]);

  useEffect(() => {
    // Fetch currencies from localStorage
    const currencies =
      JSON.parse(localStorage.getItem("savedCurrencies")) || [];
    if (currencies.length === 0) {
      console.warn("No currencies found in localStorage.");
    }
    setSavedCurrencies(currencies);
  }, []); // Only run this effect once, on component mount 

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

  return (
    <div className="npr-contain">
     {/* <PurchaseHeader /> */}
      <div id="npr" /*className={`npr ${showForm ? "fade-in" : "fade-out"}`}*/ className="npr">
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
              <br />
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
              </div>{" "}
              <br />
              <br />
              <div className="npr3c">
                <div className="npr3ca">
                  <p>Select Currency</p>
                  <Autocomplete
                    value={selectedCurrency}
                    onChange={handleCurrencyChange}
                    options={savedCurrencies} // Populate options from localStorage
                    getOptionLabel={(option) =>
                      `${option.name} - ${option.symbol}`
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select Currency"
                        className="newpod3cb"
                      />
                    )}
                  />
                </div>
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
                          outline: "none", // Remove default outline
                          border: "2px solid #e2e6e9",
                          borderRadius: "4px",
                          // padding: "15px",
                          marginBottom: "1rem",
                        }}
                        InputProps={{
                          ...params.InputProps,
                          style: {
                            outline: "none", // Remove default outline
                          },
                        }}
                      />
                    )}
                  />
                </div>
                <button type="button" className="npr3but" onClick={addRow}>
                  Add Row
                </button>
              </div>{" "}
              <br />
              {/* product line */}
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
                        <StyledTableCell align="left">Qty</StyledTableCell>
                        <StyledTableCell align="left">
                          Unit Measurement
                        </StyledTableCell>
                        <StyledTableCell align="left">
                          Estimated Unit Price
                        </StyledTableCell>
                        <StyledTableCell align="left">
                          Total Price
                        </StyledTableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((row, index) => (

                          <StyledTableRow key={index + page * rowsPerPage}>
                              <StyledTableCell component="th" scope="row">
                                  <Autocomplete
                                    options={products || []}
                                    getOptionLabel={(option) => option.product_name || ""}
                                    value={products.find((p) => p.product_name === row.productName) || null}
                                    onChange={(event, newValue) => handleProductChange(index, newValue)}
                                    disableClearable 
                                    popupIcon={null}
                                    renderInput={(params) => <TextField  className="no-arrows" {...params} variant="standard" sx={{ width: "100%",  "& .MuiInput-underline:before": {
                                      borderBottomColor: "#C6CCD2"},
                                      "& .MuiInputBase-input": {
                                        color: "#A9B3BC", // Change text color
                                      }
                                     }} />}
                                  />
                              </StyledTableCell>
                              <StyledTableCell>
                                <TextField value={row.description}  variant="standard" InputProps={{ readOnly: true }} 
                                sx={{ width: "100%",  "& .MuiInput-underline:before": {
                                  borderBottomColor: "#C6CCD2", // Default border color
                                } ,
                                "& .MuiInputBase-input": {
                                  color: "#A9B3BC", 
                                },}}  />
                              </StyledTableCell>
                              <StyledTableCell>
                                <TextField
                                  type="number"
                                  placeholder="0"
                                  value={row.qty}
                                  sx={{ width: "100%",
                                    "& .MuiInput-underline:before": {
                                  borderBottomColor: "#C6CCD2"},
                                  "& .MuiInputBase-input": {
                                  color: "#A9B3BC",
                                }
                                   }}
                                  className="no-arrows"
                                  style={{ textAlign: "right" }}
                                  onChange={(e) =>
                                    handleInputChange(
                                      index + page * rowsPerPage,
                                      "qty",
                                      e.target.value || 0
                                    )
                                  }
                                  variant="standard"
                                />
                              </StyledTableCell>

                              {/* Unit of Measure (Editable) */}
                              <StyledTableCell  align="right">
                                <TextField 
                                value={row.unt}
                                 placeholder="kg"
                                sx={{ width: "100%",
                                  "& .MuiInput-underline:before": {
                                  borderBottomColor: "#C6CCD2"},
                                  "& .MuiInputBase-input": {
                                  color: "#A9B3BC",
                                }
                                 }}
                                className="no-arrows"
                                style={{ textAlign: "right" }}
                                InputProps={{ readOnly: true }} 
                                variant="standard" />
                              </StyledTableCell>

                              {/* Unit Price (Autofilled) */}
                              <StyledTableCell>
                                <TextField value={row.unitPrice}  placeholder="000,000" sx={{ width: "100%",
                                  "& .MuiInput-underline:before": {
                                  borderBottomColor: "#C6CCD2"},
                                  "& .MuiInputBase-input": {
                                  color: "#A9B3BC",
                                }
                                 }} variant="standard" InputProps={{ readOnly: true }} />
                              </StyledTableCell>

                              

                              {/* Total Price (Autofilled) */}
                              <StyledTableCell>
                                <TextField value={row.totalPrice} placeholder="000,000"  variant="standard" sx={{ width: "100%",
                                  "& .MuiInput-underline:before": {
                                  borderBottomColor: "#C6CCD2"},
                                  "& .MuiInputBase-input": {
                                  color: "#A9B3BC", 
                                }
                                 }} InputProps={{ readOnly: true }} />
                              </StyledTableCell>
                          </StyledTableRow>
                        ))}
                        <StyledTableRow>
                          <TableCell colSpan={5} align="right">
                            <b> Total Amount</b>
                          </TableCell>
                          <TableCell align="right">
                            {calculateTotalAmount()}
                          </TableCell>
                      </StyledTableRow>
                    </TableBody>
                    {/*(<TableBody>
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
                          <StyledTableCell align="right">
                            {product.unt}
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
                    </TableBody>*/}
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
            <br />
          </div>
        </div>
      </div>
    </div>
  );
}
