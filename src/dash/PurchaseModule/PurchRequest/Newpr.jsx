import React, { useState, useEffect, useCallback, useMemo } from "react";
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
// import PurchaseHeader from "../PurchaseHeader"; // Not used currently
import { usePurchase } from "../../../context/PurchaseContext";
import { useTenant } from "../../../context/TenantContext";

// Styled components for table cells/rows
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.white,
    color: "#7A8A98",
    border: 0,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
    border: 0,
    backgroundColor: "#F2F2F2",
    color: "#A9B3BC",
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

// Memoized ProductRow component to reduce unnecessary re-renders
const ProductRow = React.memo(
  ({ row, index, products, onProductChange, onInputChange }) => {
    return (
      <StyledTableRow>
        {/* Product Name Autocomplete */}
        <StyledTableCell component="th" scope="row">
          <Autocomplete
            options={products}
            getOptionLabel={(option) => option.product_name || ""}
            value={products.find((p) => p.url === row.productName) || null}
            onChange={(event, newValue) => onProductChange(index, newValue)}
            disableClearable
            popupIcon={null}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="standard"
                sx={{
                  width: "100%",
                  "& .MuiInput-underline:before": {
                    borderBottomColor: "#C6CCD2",
                  },
                  "& .MuiInputBase-input": { color: "#A9B3BC" },
                }}
              />
            )}
          />
        </StyledTableCell>

        {/* Description (read-only) */}
        <StyledTableCell>
          <TextField
            value={row.description}
            variant="standard"
            InputProps={{ readOnly: true }}
            sx={{
              width: "100%",
              "& .MuiInput-underline:before": { borderBottomColor: "#C6CCD2" },
              "& .MuiInputBase-input": { color: "#A9B3BC" },
            }}
          />
        </StyledTableCell>

        {/* Quantity Input */}
        <StyledTableCell>
          <TextField
            type="number"
            placeholder="0"
            value={row.qty}
            sx={{
              width: "100%",
              "& .MuiInput-underline:before": { borderBottomColor: "#C6CCD2" },
              "& .MuiInputBase-input": { color: "#A9B3BC" },
            }}
            className="no-arrows"
            style={{ textAlign: "right" }}
            onChange={(e) => onInputChange(index, "qty", e.target.value || 0)}
            variant="standard"
          />
        </StyledTableCell>

        {/* Unit Measurement (read-only) */}
        <StyledTableCell align="right">
          <TextField
            value={row.unt[1] || ""}
            placeholder="kg"
            sx={{
              width: "100%",
              "& .MuiInput-underline:before": { borderBottomColor: "#C6CCD2" },
              "& .MuiInputBase-input": { color: "#A9B3BC" },
            }}
            className="no-arrows"
            style={{ textAlign: "right" }}
            InputProps={{ readOnly: true }}
            variant="standard"
          />
        </StyledTableCell>

        {/* Estimated Unit Price Input */}
        <StyledTableCell>
          <TextField
            type="number"
            value={row.unitPrice}
            onChange={(e) =>
              onInputChange(index, "unitPrice", e.target.value || 0)
            }
            placeholder="0.00"
            inputProps={{ min: 0, step: 0.01 }}
            sx={{
              width: "100%",
              "& .MuiInput-underline:before": { borderBottomColor: "#C6CCD2" },
              "& .MuiInputBase-input": { color: "#A9B3BC" },
            }}
            variant="standard"
          />
        </StyledTableCell>

        {/* Total Price (read-only) */}
        <StyledTableCell>
          <TextField
            value={row.totalPrice}
            placeholder="0.00"
            variant="standard"
            sx={{
              width: "100%",
              "& .MuiInput-underline:before": { borderBottomColor: "#C6CCD2" },
              "& .MuiInputBase-input": { color: "#A9B3BC" },
            }}
            InputProps={{ readOnly: true }}
          />
        </StyledTableCell>
      </StyledTableRow>
    );
  }
);

export default function Newpr({ onSaveAndSubmit, onFormDataChange, onClose }) {
  const { tenantData } = useTenant();
  const {
    products,
    fetchProducts,
    vendors,
    createPurchaseRequest,
    currencies,
    fetchCurrencies,
    fetchVendors,
  } = usePurchase();

  // Fetch related data when tenantData is available
  useEffect(() => {
    if (tenantData) {
      fetchVendors();
      fetchCurrencies();
      fetchProducts();
    }
  }, [tenantData, fetchVendors, fetchCurrencies, fetchProducts]);

  // Initialize product rows with consistent data types
  const [rows, setRows] = useState([
    {
      productName: "",
      description: "",
      qty: "",
      unt: [],
      unitPrice: "",
      totalPrice: "",
    },
  ]);

  // Generate a unique Purchase Request ID
  const generateNewID = useCallback(() => {
    const lastID = localStorage.getItem("lastGeneratedID");
    let newID = "PR00001";
    if (lastID) {
      const idNumber = parseInt(lastID.slice(2), 10) + 1;
      newID = "PR" + idNumber.toString().padStart(5, "0");
    }
    localStorage.setItem("lastGeneratedID", newID);
    return newID;
  }, []);

  // Form state initialization (controlled inputs)
  const [formState, setFormState] = useState({
    id: generateNewID(),
    productName: "",
    amount: "",
    requester: "Firstname Lastname",
    department: "Sales",
    status: "Pending",
    date: new Date(),
    vendor: "",
    currency: "",
    purpose: "",
  });

  // Pagination state
  const [page, setPage] = useState(0);
  const rowsPerPage = 2;

  // Vendor selection state
  const [selectedVendor, setSelectedVendor] = useState(null);
  const savedVendors = vendors || [];

  const handleVendorSelect = useCallback((event, newValue) => {
    setSelectedVendor(newValue);
    setFormState((prev) => ({
      ...prev,
      vendor: newValue ? newValue.url : "",
    }));
  }, []);

  // Handle row input changes and recalculate totals
  const handleInputChange = useCallback((index, key, value) => {
    setRows((prevRows) => {
      const newRows = [...prevRows];
      if (key === "qty" || key === "unitPrice") {
        value = Math.max(0, parseFloat(value) || 0);
      }
      newRows[index] = { ...newRows[index], [key]: value };

      if (key === "qty" || key === "unitPrice") {
        const qty = newRows[index].qty;
        const unitPrice = newRows[index].unitPrice || 0;
        newRows[index].totalPrice = (qty * unitPrice).toFixed(2);
      }

      const totalAmount = newRows.reduce(
        (sum, row) => sum + parseFloat(row.totalPrice || 0),
        0
      );
      setFormState((prevState) => ({
        ...prevState,
        amount: totalAmount.toFixed(2),
      }));

      return newRows;
    });
  }, []);

  // Handle product selection to autofill row details
  const handleProductChange = useCallback((index, selectedProduct) => {
    if (selectedProduct) {
      setRows((prevRows) => {
        const newRows = [...prevRows];
        const defaultQty = selectedProduct.default_qty || 1;
        const estimatedUnitPrice =
          selectedProduct.estimated_unit_price ||
          selectedProduct.unit_price ||
          0;
        newRows[index] = {
          ...newRows[index],
          productName: selectedProduct.url,
          description: selectedProduct.product_description,
          qty: defaultQty,
          unt: selectedProduct.unit_of_measure,
          unitPrice: estimatedUnitPrice,
          totalPrice: (defaultQty * estimatedUnitPrice).toFixed(2),
        };

        const totalAmount = newRows.reduce(
          (sum, row) => sum + parseFloat(row.totalPrice || 0),
          0
        );
        setFormState((prevState) => ({
          ...prevState,
          amount: totalAmount.toFixed(2),
        }));

        return newRows;
      });
    }
  }, []);

  // Add a new row with consistent initialization
  const addRow = useCallback(() => {
    setRows((prevRows) => [
      ...prevRows,
      {
        productName: "",
        description: "",
        unt: [],
        qty: "",
        unitPrice: "",
        totalPrice: "",
      },
    ]);
  }, []);

  // Pagination handlers
  const handleNextPage = useCallback(() => {
    setPage((prevPage) =>
      (prevPage + 1) * rowsPerPage < rows.length ? prevPage + 1 : prevPage
    );
  }, [rows.length, rowsPerPage]);

  const handlePreviousPage = useCallback(() => {
    setPage((prevPage) => (prevPage > 0 ? prevPage - 1 : prevPage));
  }, []);

  // Derived values for total amount, current rows, and page count
  const totalAmount = useMemo(() => {
    return rows
      .reduce((sum, row) => sum + parseFloat(row.totalPrice || 0), 0)
      .toFixed(2);
  }, [rows]);

  const currentRows = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return rows.slice(startIndex, startIndex + rowsPerPage);
  }, [rows, page, rowsPerPage]);

  const pageCount = useMemo(
    () => Math.ceil(rows.length / rowsPerPage),
    [rows, rowsPerPage]
  );

  // Date/time formatting functions
  const formatDate = useCallback((date) => {
    const options = { day: "numeric", month: "short", year: "numeric" };
    return date.toLocaleDateString("en-US", options);
  }, []);

  const formatTime = useCallback((date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "pm" : "am";
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes.toString().padStart(2, "0");
    return `${formattedHours}:${formattedMinutes}${ampm}`;
  }, []);

  // Save draft handler
  const handleSave = useCallback(() => {
    if (!formState.vendor) {
      alert("Please select a vendor");
      return;
    }
    const items = rows.map((row) => ({
      product: row.productName,
      description: row.description,
      qty: parseInt(row.qty) || 0,
      unit_of_measure: Array.isArray(row.unt) && row.unt[0],
      estimated_unit_price: parseFloat(row.unitPrice) || 0,
    }));
    const payload = {
      status: "draft",
      currency: formState.currency,
      purpose: formState.purpose,
      vendor: formState.vendor,
      items,
      is_hidden: false,
    };
    // console.log("Payload:", payload);
    createPurchaseRequest(payload)
    // alert("Data saved successfully!");
  }, [formState, rows, createPurchaseRequest]);

  // Validate product rows before submission
  const validateSubmission = useCallback(() => {
    return rows.every(
      (row) => row.productName && row.qty && row.unitPrice && row.unt
    );
  }, [rows]);

  // Final submit handler
  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (!formState.vendor) {
        alert("Please select a vendor");
        return;
      }
      if (!validateSubmission()) {
        alert("Please fill all required fields in the product rows");
        return;
      }
      const items = rows.map((row) => ({
        product: row.productName,
        description: row.description,
        qty: parseInt(row.qty) || 0,
        unit_of_measure: Array.isArray(row.unt) && row.unt[0],
        estimated_unit_price: parseFloat(row.unitPrice) || 0,
      }));
      const payload = {
        status: "pending",
        currency: formState.currency,
        purpose: formState.purpose,
        vendor: formState.vendor,
        items,
        is_hidden: false,
      };
      onSaveAndSubmit(payload);
    },
    [formState, rows, validateSubmission, onSaveAndSubmit]
  );

  // Currency selection state
  // eslint-disable-next-line no-unused-vars
  const [selectedCurrency, setSelectedCurrency] = useState(null);
  const [savedCurrencies, setSavedCurrencies] = useState([]);

  // Load currencies from context or localStorage
  useEffect(() => {
    if (currencies && currencies.length > 0) {
      setSavedCurrencies(currencies);
    } else {
      try {
        const localCurrencies =
          JSON.parse(localStorage.getItem("savedCurrencies")) || [];
        setSavedCurrencies(
          Array.isArray(localCurrencies) ? localCurrencies : []
        );
      } catch (error) {
        console.error("Error parsing savedCurrencies:", error);
        setSavedCurrencies([]);
      }
    }
  }, [currencies]);

  const handleCurrencyChange = useCallback((event, newValue) => {
    setSelectedCurrency(newValue);
    setFormState((prev) => ({
      ...prev,
      currency: newValue ? newValue.url : "",
    }));
  }, []);

  return (
    <div className="npr-contain">
      <div id="npr" className="npr">
        <div className="npr1">
          {/* Header Section */}
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
                {page + 1} - {pageCount} of {pageCount}
              </p>
              <div className="nprbnav">
                <FaCaretLeft className="nr" onClick={handlePreviousPage} />
                <div className="sep" />
                <FaCaretRight className="nr" onClick={handleNextPage} />
              </div>
            </div>
          </div>

          {/* Main Form */}
          <div className="npr3">
            <form className="nprform" onSubmit={handleSubmit}>
              {/* Basic Information */}
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
              </div>
              <br />
              <br />

              {/* Currency, Purpose, and Vendor Selection */}
              <div className="npr3c">
                <div className="npr3ca">
                  <p>Select Currency</p>
                  <Autocomplete
                    value={
                      savedCurrencies.find(
                        (c) => c.url === formState.currency
                      ) || null
                    }
                    onChange={handleCurrencyChange}
                    options={savedCurrencies}
                    getOptionLabel={(option) =>
                      `${option.currency_name} - ${option.currency_symbol}`
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select Currency"
                        required
                        error={!formState.currency}
                        helperText={
                          !formState.currency && "Currency is required"
                        }
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
                    value={formState.purpose}
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
                    options={savedVendors}
                    getOptionLabel={(option) => option.company_name || ""}
                    isOptionEqualToValue={(option, value) =>
                      option.url === value.url
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select vendor"
                        style={{
                          width: "95%",
                          marginTop: "0.1rem",
                          cursor: "pointer",
                          border: "2px solid #e2e6e9",
                          borderRadius: "4px",
                          marginBottom: "1rem",
                        }}
                        InputProps={{
                          ...params.InputProps,
                          style: { outline: "none" },
                        }}
                      />
                    )}
                  />
                </div>
                <button type="button" className="npr3but" onClick={addRow}>
                  Add Row
                </button>
              </div>
              <br />

              {/* Product Lines Table */}
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
                      "&.MuiTable-root": { border: "none" },
                      "& .MuiTableCell-root": { border: "none" },
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
                      {currentRows.map((row, i) => (
                        <ProductRow
                          key={i + page * rowsPerPage}
                          row={row}
                          index={i + page * rowsPerPage}
                          products={products || []}
                          onProductChange={handleProductChange}
                          onInputChange={handleInputChange}
                        />
                      ))}
                      <StyledTableRow>
                        <TableCell colSpan={5} align="right">
                          <b>Total Amount</b>
                        </TableCell>
                        <TableCell align="right">{totalAmount}</TableCell>
                      </StyledTableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </div>

              {/* Form Action Buttons */}
              <div className="npr3e">
                <button type="button" className="npr3btn" onClick={handleSave}>
                  Save
                </button>
                <button type="submit" className="npr3btn">
                  Save &amp; Submit
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
