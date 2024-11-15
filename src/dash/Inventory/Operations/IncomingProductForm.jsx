import React, { useState } from "react";
import autosave from "../../../image/autosave-text.svg";
import "./IncomingProductForm.css";
import {
  Divider,
  FormControl,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";

const IncomingProductForm = () => {
  const [setselectedReceiptType, setSetselectedReceiptType] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const handleChange = (e) => {
    setSetselectedReceiptType(e.target.value);
  };

  const receiptTypes = ["Goods", "Manufacturing", "Internal Transfer"];

  return (
    <div>
      <header
        style={{
          display: "flex",
          gap: "40px",
          alignItems: "center",
          marginTop: "50px",
          marginBottom: "24px",
        }}
      >
        <h1
          style={{
            fontFamily: "Product Sans",
            fontSize: "24px",
            fontWeight: "500",
            lineHeight: "29.11px",
            textAlign: "left",
            textUnderlinePosition: "from-font",
            textDecorationSkipInk: "none",
            color: "#1A1A1A",
            marginRight: "42px",
          }}
        >
          New Incoming product
        </h1>
        <span>
          <img src={autosave} alt="autosave" />
        </span>
      </header>
      <div className="form-wrapper">
        <form>
          {/* form heading and cancel button */}
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h2
              style={{
                fontFamily: "Product Sans",
                fontSize: "20px",
                fontWeight: "500",
                lineHeight: "24.26px",
                textAlign: "left",
                textUnderlinePosition: "from-font",
                textDecorationSkipInk: "none",
                color: "#3B7CED",
              }}
            >
              Product Information
            </h2>
            <button
              style={{
                fontFamily: "Product Sans",
                fontSize: "16px",
                fontWeight: "400",
                lineHeight: "19.41px",
                textUnderlinePosition: "from-font",
                textDecorationSkipInk: "none",
                color: "#3B7CED",
                padding: "8px 24px",
                cursor: "pointer",
                background: "none",
                border: "none",
              }}
            >
              Cancel
            </button>
          </div>
          {/* form detail - first section  */}
          <div
            style={{
              display: "flex",
              rowGap: "16px",
              columnGap: "77px",
              flexWrap: "wrap",
            }}
          >
            <FormControl
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  width: "300px",
                  height: "48px",
                  padding: "0 24px",
                  fontFamily: "Product Sans",
                  fontSize: "14px",
                  fontWeight: "400",
                  borderRadius: "4px",
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#7A8A98",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#7A8A98",
                  },
                },
              }}
            >
              <label
                style={{
                  fontFamily: "Product Sans",
                  fontSize: "16px",
                  color: "#1A1A1A",
                  marginBottom: "8px",
                  display: "block",
                }}
              >
                Receipt Type
              </label>
              <Select
                value={setselectedReceiptType}
                onChange={handleChange}
                displayEmpty
              >
                <MenuItem value="" disabled>
                  Select Receipt Type
                </MenuItem>
                {receiptTypes.map((receipt, index) => (
                  <MenuItem key={index} value={receipt}>
                    {receipt}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="ID"
              variant="standard"
              value="LAGIN0001"
              InputProps={{ readOnly: true, disableUnderline: true }}
              sx={{
                width: "content",
                fontFamily: "Product Sans",
                fontSize: "14px",
              }}
            />

            <TextField
              label="Receipt Date"
              variant="standard"
              value="4 Apr 2024 - 4:48"
              InputProps={{ readOnly: true, disableUnderline: true }}
              sx={{
                width: "max-content",
                fontFamily: "Product Sans",
                fontSize: "14px",
              }}
            />

            <TextField
              label="Location"
              variant="standard"
              value="xds Store"
              InputProps={{ readOnly: true, disableUnderline: true }}
              sx={{
                width: "max-content",
                fontFamily: "Product Sans",
                fontSize: "14px",
              }}
            />
          </div>

          <Divider sx={{ marginY: "0px" }} />

          <div>
            <label
              style={{
                fontFamily: "Product Sans",
                fontSize: "16px",
                color: "#1A1A1A",
                marginBottom: "8px",
                display: "block",
              }}
            >
              Name of Supplier
            </label>
            <TextField
              placeholder="Enter supplier's name"
              variant="outlined"
              value={supplierName}
              onChange={(e) => setSupplierName(e.target.value)}
              sx={{
                width: "300px",
                fontFamily: "Product Sans",
                fontSize: "14px",
                color: "#1A1A1A",
              }}
            />
          </div>
          <Divider sx={{ marginY: "0px" }} />
        </form>
      </div>
    </div>
  );
};

export default IncomingProductForm;
