import React, { useState, useEffect, useCallback } from "react";
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
import { useRFQ } from "../../../context/RequestForQuotation";
import { useTenant } from "../../../context/TenantContext";
import { usePurchase } from "../../../context/PurchaseContext";

// ---------- Subcomponents ----------

// Action Buttons Component
const ActionButtons = ({ onClose, handleSave }) => (
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
);

// Basic Information Component
const BasicInformation = ({
  formState,
  formatDate,
  formatTime,
  handleCurrencyChange,
  savedCurrencies,
}) => (
  <div className="rpr3b">
    <div className="rpr3ba">
      <p>ID</p>
      <p style={{ fontSize: "14px", color: "#7a8a98" }}>{formState.id}</p>
    </div>
    <div className="rpr3bb">
      <p>Date Opened</p>
      <p style={{ fontSize: "14px", color: "#7a8a98" }}>
        {`${formatDate(formState.date)} - ${formatTime(formState.date)}`}
      </p>
    </div>
    <div className="npr3ca">
      <p>Select Currency</p>
      <Autocomplete
        value={formState.currency || null}
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
            helperText={!formState.currency && "Currency is required"}
            className="newpod3cb"
          />
        )}
      />
    </div>
  </div>
);

// Vendor Details Component
const VendorDetails = ({
  formState,
  setFormState,
  vendorInputValue,
  setVendorInputValue,
  handleVendorSelect,
  addRow,
  vendors,
}) => (
  <div className="rpr3c">
    <div className="rpr3ca">
      <label>Expiry Date</label>
      <input
        type="date"
        name="expiryDate"
        className="rpr3cb"
        value={formState.expiryDate}
        onChange={(e) =>
          setFormState((prev) => ({ ...prev, expiryDate: e.target.value }))
        }
      />
    </div>
    <div className="rpr3ca">
      <label>Vendor</label>
      <Autocomplete
        value={formState.vendor || null}
        onChange={handleVendorSelect}
        inputValue={vendorInputValue}
        onInputChange={(event, newInputValue) =>
          setVendorInputValue(newInputValue)
        }
        options={vendors}
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
          setFormState((prev) => ({
            ...prev,
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
);

// Product Table Component
const ProductTable = ({
  rows,
  handleInputChange,
  page,
  rowsPerPage,
  calculateTotalAmount,
}) => {
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

  const startIndex = page * rowsPerPage;
  const currentRows = rows.slice(startIndex, startIndex + rowsPerPage);

  return (
    <TableContainer
      component={Paper}
      sx={{ boxShadow: "none", border: "1px solid #e2e6e9", marginTop: "1rem" }}
    >
      <Table
        sx={{
          minWidth: 700,
          "&.MuiTable-root": { border: "none" },
          "& .MuiTableCell-root": { border: "none" },
          "& .MuiTableCell-head": { border: "none" },
          "& .MuiTableCell-body": { border: "none" },
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
            <StyledTableCell align="right">Total Price</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {currentRows.map((row, idx) => (
            <StyledTableRow key={idx + startIndex}>
              <StyledTableCell component="th" scope="row">
                {row.productName}
              </StyledTableCell>
              <StyledTableCell>{row.description}</StyledTableCell>
              <StyledTableCell align="right">
                <input
                  type="number"
                  placeholder="0.00"
                  name="qty"
                  className="no-arrows"
                  style={{ textAlign: "right" }}
                  value={row.qty}
                  onChange={(e) =>
                    handleInputChange(idx + startIndex, "qty", e.target.value)
                  }
                />
              </StyledTableCell>
              <StyledTableCell align="right">
                {row.unitOfMeasure}
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
                      idx + startIndex,
                      "unitPrice",
                      e.target.value
                    )
                  }
                />
              </StyledTableCell>
              <StyledTableCell align="right">{row.totalPrice}</StyledTableCell>
            </StyledTableRow>
          ))}
          <StyledTableRow>
            <StyledTableCell colSpan={5} align="right">
              <b>Total Amount</b>
            </StyledTableCell>
            <StyledTableCell align="right">
              {calculateTotalAmount()}
            </StyledTableCell>
          </StyledTableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};

// ---------- Main Rform Component ----------

export default function Rform({ onClose, onSaveAndSubmit, vendors = [] }) {
  const defaultRows = [
    {
      productName: "",
      description: "",
      qty: "",
      unitOfMeasure: "",
      unitPrice: "",
      totalPrice: "",
    },
  ];

  // Combine form data (including rows, vendor, currency, etc.) into one state
  const [formData, setFormData] = useState({
    id: generateNewID(),
    purchaseRequest: "string",
    items: [],
    date: new Date(),
    vendor: null,
    vendorCategory: "",
    currency: null,
    rows: defaultRows,
  });

  const [page, setPage] = useState(0);
  const [vendorInputValue, setVendorInputValue] = useState("");

  const { fetchCurrencies, currencies } = usePurchase();
  const { createRFQ, error, rfqList } = useRFQ();

  const [savedCurrencies, setSavedCurrencies] = useState([]);
  useEffect(() => {
    fetchCurrencies();
    setSavedCurrencies(currencies);
  }, [fetchCurrencies, currencies]);

  // Dummy ID generator; replace with your API logic when needed.
  function generateNewID() {
    return "RFQ" + Date.now();
  }

  const handleInputChange = (index, key, value) => {
    const newRows = [...formData.rows];
    newRows[index][key] = value;
    if (key === "qty" || key === "unitPrice") {
      const qty = parseFloat(newRows[index].qty) || 0;
      const unitPrice = parseFloat(newRows[index].unitPrice) || 0;
      newRows[index].totalPrice = (qty * unitPrice).toFixed(2);
    }
    setFormData((prev) => ({ ...prev, rows: newRows }));
  };

  const handleSave = () => {
    console.log("Data saved:", formData);
    alert("Data saved successfully!");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveAndSubmit({ ...formData, date: formData.date.toString() });
  };

  const addRow = () => {
    setFormData((prev) => ({
      ...prev,
      rows: [
        ...prev.rows,
        {
          productName: "",
          description: "",
          qty: "",
          unitOfMeasure: "",
          unitPrice: "",
          totalPrice: "",
        },
      ],
    }));
  };

  const handleNextPage = () => {
    if ((page + 1) * 2 < formData.rows.length) setPage(page + 1);
  };

  const handlePreviousPage = () => {
    if (page > 0) setPage(page - 1);
  };

  const handleCurrencyChange = (event, newValue) => {
    setFormData((prev) => ({ ...prev, currency: newValue }));
  };

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

  const calculateTotalAmount = useCallback(() => {
    return formData.rows
      .reduce((sum, row) => sum + parseFloat(row.totalPrice || 0), 0)
      .toFixed(2);
  }, [formData.rows]);

  const handleVendorSelect = (event, newValue) => {
    setFormData((prev) => ({
      ...prev,
      vendor: newValue,
      vendorCategory: newValue ? newValue.vendorCategory : "",
    }));
  };

  const pageCount = Math.ceil(formData.rows.length / 2);

  return (
    <div className="rpr-contain">
      <PurchaseHeader />
      <div id="newrfq" className="rpr fade-in">
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
              <ActionButtons onClose={onClose} handleSave={handleSave} />
              <BasicInformation
                formState={formData}
                formatDate={formatDate}
                formatTime={formatTime}
                handleCurrencyChange={handleCurrencyChange}
                savedCurrencies={savedCurrencies}
              />
              <VendorDetails
                formState={formData}
                setFormState={setFormData}
                vendorInputValue={vendorInputValue}
                setVendorInputValue={setVendorInputValue}
                handleVendorSelect={handleVendorSelect}
                addRow={addRow}
                vendors={vendors}
              />
              <ProductTable
                rows={formData.rows}
                handleInputChange={handleInputChange}
                page={page}
                rowsPerPage={2}
                calculateTotalAmount={calculateTotalAmount}
              />
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
