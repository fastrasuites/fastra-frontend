import React, { useState, useCallback, useMemo } from "react";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { FaCaretLeft, FaCaretRight } from "react-icons/fa";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import PurchaseHeader from "../PurchaseHeader";
import { usePurchase } from "../../../context/PurchaseContext";
import autosave from "../../../image/autosave.svg";
import { formatDate } from "../../../helper/helper";
import "./Rform.css";

/* =======================
   Helper Functions
========================== */
/**
 * Calculates the total price of all rows.
 */
const calculateRowsTotal = (rows) =>
  rows
    .reduce((sum, row) => sum + parseFloat(row.totalPrice || 0), 0)
    .toFixed(2);

/**
 * Returns a new empty product row.
 */
const createEmptyRow = () => ({
  productName: "",
  description: "",
  qty: "",
  unitOfMeasure: "",
  unitPrice: "",
  totalPrice: "",
});

/**
 * Validates rows and returns an array of error messages.
 */
const validateRows = (rows) => {
  const errors = [];
  rows.forEach((row, index) => {
    if (!row.productName) {
      errors.push(`Row ${index + 1}: Product is required.`);
    }
    if (!row.qty || parseFloat(row.qty) <= 0) {
      errors.push(`Row ${index + 1}: Quantity must be greater than 0.`);
    }
    if (!row.unitPrice || parseFloat(row.unitPrice) <= 0) {
      errors.push(`Row ${index + 1}: Unit Price must be greater than 0.`);
    }
  });
  return errors;
};

/* =======================
   Styled Components
========================== */

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

/* =======================
   Subcomponents
========================== */

/**
 * Renders action buttons for cancel, save, and submit.
 */
const ActionButtons = ({ onClose, onSave }) => (
  <div className="rpr3a">
    <p style={{ fontSize: "20px" }}>Basic Information</p>
    <div className="rpr3e">
      <button type="button" className="rpr3but" onClick={onClose}>
        Cancel
      </button>
      <button type="button" className="rpr3btn" onClick={onSave}>
        Save
      </button>
      <button type="submit" className="rpr3btn">
        Send to vendor
      </button>
    </div>
  </div>
);

/**
 * Displays RFQ basic information (ID, date, and currency selection).
 */

const prID = ["PR-0001", "PR-0002", "PR-0003"];
const BasicInformation = ({ formData, onCurrencyChange, currencies }) => (
  <div className="rpr3b">
    <div className="rpr3ba">
      <p>ID</p>
      <p style={{ fontSize: "14px", color: "#7a8a98" }}>{formData.id}</p>
    </div>
    <div className="rpr3bb">
      <p>Date Opened</p>
      <p style={{ fontSize: "14px", color: "#7a8a98" }}>
        {`${formatDate(formData.date)}`}
      </p>
    </div>
    <div className="rfqd">
      <div>
        <p>Input PR ID</p>
        <Autocomplete
          value={formData.prID || null}
          onChange={() => {}}
          options={prID}
          isOptionEqualToValue={(option, value) => option === value}
          getOptionLabel={(option) => option}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Input PR ID"
              required
              error={!formData.prID}
              helperText={!formData.prID && "PR ID is required"}
              className="newpod3cb"
            />
          )}
        />
      </div>
      <div>
        {" "}
        <p>Select Currency</p>
        <Autocomplete
          value={formData.currency || null}
          onChange={onCurrencyChange}
          options={currencies}
          isOptionEqualToValue={(option, value) => option.url === value.url}
          getOptionLabel={(option) =>
            `${option.currency_name} - ${option.currency_symbol}`
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label="Select Currency"
              required
              error={!formData.currency}
              helperText={!formData.currency && "Currency is required"}
              className="newpod3cb"
            />
          )}
        />
      </div>
    </div>
  </div>
);

/**
 * Renders vendor details including expiry date, vendor selection, and category.
 */
const VendorDetails = ({
  formData,
  setFormData,
  vendorInputValue,
  setVendorInputValue,
  onVendorSelect,
  onAddRow,
  vendors,
}) => (
  <div className="rpr3c">
    <div className="rpr3ca">
      <label>Expiry Date</label>
      <input
        type="date"
        name="expiryDate"
        className="rpr3cb"
        value={formData.expiryDate || ""}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, expiryDate: e.target.value }))
        }
      />
    </div>
    <div className="rpr3ca">
      <label>Vendor</label>
      <Autocomplete
        value={formData.vendor || null}
        onChange={onVendorSelect}
        inputValue={vendorInputValue || ""}
        onInputChange={(e, newInputValue) =>
          setVendorInputValue(newInputValue || "")
        }
        options={vendors}
        getOptionLabel={(option) => option.company_name || ""}
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
        value={formData.vendorCategory || ""}
        onChange={(e) =>
          setFormData((prev) => ({
            ...prev,
            vendorCategory: e.target.value || "",
          }))
        }
      />
    </div>
    <button
      type="button"
      className="rpr3but"
      onClick={onAddRow}
      style={{ marginTop: "1rem" }}
    >
      Add Row
    </button>
  </div>
);

/**
 * Renders a single product row with editable fields.
 * Uses React.memo to prevent unnecessary re-renders.
 */
const ProductRow = React.memo(
  ({ row, index, products, onProductChange, onInputChange }) => {
    const selectedProduct =
      products.find((p) => p.url === row.productName) || null;

    const handleProductSelect = (event, newValue) => {
      if (newValue) {
        onProductChange(index, newValue);
      }
    };

    const handleInputChange = (field, value) => {
      onInputChange(index, field, value);
    };

    return (
      <tr>
        {/* Product Name Autocomplete */}
        <td>
          <Autocomplete
            options={products}
            getOptionLabel={(option) => option.product_name || ""}
            value={selectedProduct}
            onChange={handleProductSelect}
            disableClearable
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
        </td>
        {/* Description Field */}
        <td>
          <TextField
            value={row.description}
            variant="standard"
            onChange={() =>
              handleInputChange(
                "description",
                selectedProduct?.product_description || ""
              )
            }
            sx={{
              width: "100%",
              "& .MuiInput-underline:before": { borderBottomColor: "#C6CCD2" },
              "& .MuiInputBase-input": { color: "#A9B3BC" },
            }}
          />
        </td>
        {/* Quantity Input */}
        <td>
          <TextField
            type="number"
            placeholder="0"
            value={row.qty}
            variant="standard"
            onChange={(e) => handleInputChange("qty", e.target.value || 0)}
            sx={{
              width: "100%",
              "& .MuiInput-underline:before": { borderBottomColor: "#C6CCD2" },
              "& .MuiInputBase-input": { color: "#A9B3BC" },
            }}
            className="no-arrows"
            style={{ textAlign: "right" }}
          />
        </td>
        {/* Unit Measurement Field */}
        <td align="right">
          <TextField
            value={row.unitOfMeasure || ""}
            placeholder="kg"
            variant="standard"
            onChange={(e) => handleInputChange("unitOfMeasure", e.target.value)}
            sx={{
              width: "100%",
              "& .MuiInput-underline:before": { borderBottomColor: "#C6CCD2" },
              "& .MuiInputBase-input": { color: "#A9B3BC" },
            }}
            className="no-arrows"
            style={{ textAlign: "right" }}
          />
        </td>
        {/* Unit Price Input */}
        <td>
          <TextField
            type="number"
            value={row.unitPrice}
            placeholder="0.00"
            variant="standard"
            onChange={(e) =>
              handleInputChange("unitPrice", e.target.value || 0)
            }
            inputProps={{ min: 0, step: 0.01 }}
            sx={{
              width: "100%",
              "& .MuiInput-underline:before": { borderBottomColor: "#C6CCD2" },
              "& .MuiInputBase-input": { color: "#A9B3BC" },
            }}
          />
        </td>
        {/* Total Price Input */}
        <td>
          <TextField
            value={row.totalPrice}
            placeholder="0.00"
            variant="standard"
            onChange={(e) => handleInputChange("totalPrice", e.target.value)}
            sx={{
              width: "100%",
              "& .MuiInput-underline:before": { borderBottomColor: "#C6CCD2" },
              "& .MuiInputBase-input": { color: "#A9B3BC" },
            }}
          />
        </td>
      </tr>
    );
  }
);

/**
 * Displays the product table with pagination and a total amount row.
 */
const ProductTable = ({
  rows,
  handleInputChange,
  page,
  rowsPerPage,
  totalAmount,
  products,
}) => {
  const startIndex = page * rowsPerPage;
  const currentRows = rows.slice(startIndex, startIndex + rowsPerPage);

  // Callback to update row when a product is selected.
  const handleProductChange = useCallback(
    (index, newProduct) => {
      handleInputChange(
        index,
        "productName",
        newProduct.url || newProduct.product_name
      );
      handleInputChange(index, "description", newProduct.product_description);
      handleInputChange(index, "unitOfMeasure", newProduct.unit_of_measure[1]);
    },
    [handleInputChange]
  );

  return (
    <TableContainer
      component={Paper}
      sx={{ boxShadow: "none", border: "1px solid #e2e6e9", marginTop: "1rem" }}
    >
      <Table
        sx={{ minWidth: 700, "& .MuiTableCell-root": { border: "none" } }}
        aria-label="product table"
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
            <ProductRow
              key={idx + startIndex}
              row={row}
              index={idx + startIndex}
              products={products}
              onProductChange={handleProductChange}
              onInputChange={handleInputChange}
            />
          ))}
          <StyledTableRow>
            <StyledTableCell colSpan={5} align="right">
              <strong>Total Amount</strong>
            </StyledTableCell>
            <StyledTableCell align="right">{totalAmount}</StyledTableCell>
          </StyledTableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};

/* =======================
   Main Rform Component
========================== */

const initialState = {
  id: "RFQ" + Date.now(),
  date: new Date(),
  expiryDate: "",
  vendor: null,
  vendorCategory: "",
  currency: null,
  rows: [createEmptyRow()],
};

export default function Rform({ onClose, onSaveAndSubmit, purchaseRequest }) {
  const { products, vendors, currencies } = usePurchase();

  // Local form state
  const [formData, setFormData] = useState(initialState);
  const [page, setPage] = useState(0);
  const [vendorInputValue, setVendorInputValue] = useState("");

  // Update specific row field; recalculate totalPrice when qty or unitPrice changes.
  const handleInputChange = useCallback((index, key, value) => {
    setFormData((prev) => {
      const newRows = [...prev.rows];
      newRows[index] = { ...newRows[index], [key]: value };
      if (key === "qty" || key === "unitPrice") {
        const qty = parseFloat(newRows[index].qty) || 0;
        const unitPrice = parseFloat(newRows[index].unitPrice) || 0;
        newRows[index].totalPrice = (qty * unitPrice).toFixed(2);
      }
      return { ...prev, rows: newRows };
    });
  }, []);

  // Save form data after validation.
  const handleSave = useCallback(
    (e) => {
      e.preventDefault();
      const errors = validateRows(formData.rows);
      if (errors.length > 0) {
        alert(errors.join("\n"));
        return;
      }
      const payload = {
        expiry_date: formData.expiryDate,
        vendor: formData.vendor?.url,
        vendor_category: formData.vendor ? formData.vendor.vendorCategory : "",
        purchase_request: purchaseRequest,
        currency: formData.currency?.url,
        status: "draft",
        items: formData.rows,
        is_hidden: false,
      };
      console.log("Submit Payload:", payload);
      // Reset form after save
      setFormData(initialState);
    },
    [formData, purchaseRequest]
  );

  // Handle form submission (can be extended to call onSaveAndSubmit)
  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      const errors = validateRows(formData.rows);
      if (errors.length > 0) {
        alert(errors.join("\n"));
        return;
      }
      const payload = {
        expiry_date: formData.expiryDate,
        vendor: formData.vendor?.url,
        vendor_category: formData.vendor ? formData.vendor.vendorCategory : "",
        purchase_request: purchaseRequest,
        currency: formData.currency?.url,
        status: "draft",
        items: formData.rows,
        is_hidden: false,
      };
      console.log("Submit Payload:", payload);
      // Uncomment below if you wish to trigger the submission process externally.
      // onSaveAndSubmit({ ...formData, date: formData.date.toString() });
      setFormData(initialState);
    },
    [formData, purchaseRequest]
  );

  // Add a new empty row to the form.
  const addRow = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      rows: [...prev.rows, createEmptyRow()],
    }));
  }, []);

  // Pagination handlers (2 rows per page)
  const handleNextPage = useCallback(() => {
    if ((page + 1) * 2 < formData.rows.length) setPage(page + 1);
  }, [page, formData.rows.length]);

  const handlePreviousPage = useCallback(() => {
    if (page > 0) setPage(page - 1);
  }, [page]);

  // Handle currency selection change.
  const handleCurrencyChange = useCallback((event, newValue) => {
    setFormData((prev) => ({ ...prev, currency: newValue }));
  }, []);

  // Handle vendor selection change and set vendor category.
  const handleVendorSelect = useCallback((event, newValue) => {
    setFormData((prev) => ({
      ...prev,
      vendor: newValue,
      vendorCategory: newValue ? newValue.vendorCategory : "",
    }));
  }, []);

  // Calculate the total amount from all rows.
  const totalAmount = useMemo(
    () => calculateRowsTotal(formData.rows),
    [formData.rows]
  );

  const rowsPerPage = 5;
  const pageCount = Math.ceil(formData.rows.length / rowsPerPage);

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
              <ActionButtons onClose={onClose} onSave={handleSave} />
              <BasicInformation
                formData={formData}
                onCurrencyChange={handleCurrencyChange}
                currencies={currencies}
              />
              <VendorDetails
                formData={formData}
                setFormData={setFormData}
                vendorInputValue={vendorInputValue}
                setVendorInputValue={setVendorInputValue}
                onVendorSelect={handleVendorSelect}
                onAddRow={addRow}
                vendors={vendors}
              />
              <ProductTable
                rows={formData.rows}
                handleInputChange={handleInputChange}
                page={page}
                rowsPerPage={rowsPerPage}
                totalAmount={totalAmount}
                products={products}
              />
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
