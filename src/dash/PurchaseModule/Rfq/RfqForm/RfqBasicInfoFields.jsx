// src/dash/PurchaseModule/Rfq/RfqBasicInfoFields.jsx
import React from "react";
import { Autocomplete, Box, TextField, Typography } from "@mui/material";
import { extractRFQID, formatDate } from "../../../../helper/helper";

const getSelectedOption = (formValue, list = [], key) => {
  if (typeof formValue === "object" && formValue !== null) {
    return formValue;
  }
  if (typeof formValue === "string") {
    return list.find((item) => item[key] === formValue) || null;
  }
  return null;
};

const REQUIRED_ASTERISK = (
  <Typography component="span" color="#D32F2F" ml={0.5} fontSize="20px">
    *
  </Typography>
);

const GrayText = ({ children }) => (
  <Typography color="text.secondary">{children}</Typography>
);

const RfqBasicInfoFields = ({
  formData,
  handleInputChange,
  formUse,
  currencies = [],
  vendors = [],
  purchaseIdList = [],
  rfqID,
}) => {
  // Resolve selected objects from formData (which may be strings or objects)
  const selectedPurchaseRequest = getSelectedOption(
    formData.purchase_request,
    purchaseIdList,
    "id"
  );
  const selectedCurrency = getSelectedOption(
    formData.currency,
    currencies,
    "url"
  );
  const selectedVendor = getSelectedOption(formData.vendor, vendors, "url");

  return (
    <div className="rfqBasicInfoField">
      <div className="rfqBasicInfoFields1">
        <div className="rfqBasicInfoFields1DateAndId">
          {formUse === "Edit RFQ" && (
            <div className="refID">
              <label>ID</label>
              <p>{extractRFQID(rfqID)}</p>
            </div>
          )}
          <div className="refDate">
            <label>Date Opened</label>
            <Typography color={"#303030"}>
              {formatDate(Date.now())}34
            </Typography>
          </div>
        </div>

        <div className="rfqBasicInfoFields1SelectFields">
          <label style={{ marginBottom: "6px", display: "block" }}>
            Input PR ID
            {REQUIRED_ASTERISK}
          </label>
          <Autocomplete
            disablePortal
            options={purchaseIdList}
            value={selectedPurchaseRequest}
            getOptionLabel={(option) => option.id}
            isOptionEqualToValue={(opt, val) => opt.id === val.id}
            onChange={(event, newValue) => {
              // Store the full object in formData
              handleInputChange("purchase_request", newValue || "");
            }}
            sx={{ width: "100%" }}
            renderInput={(params) => <TextField {...params} />}
          />
        </div>

        <div>
          <label style={{ marginBottom: "6px", display: "block" }}>
            Select Currency
            {REQUIRED_ASTERISK}
          </label>
          <Autocomplete
            disablePortal
            options={currencies}
            value={selectedCurrency}
            getOptionLabel={(option) =>
              `${option.currency_name} - ${option.currency_symbol}`
            }
            isOptionEqualToValue={(opt, val) => opt.url === val.url}
            onChange={(event, newValue) => {
              // Store the full currency object
              handleInputChange("currency", newValue || "");
            }}
            sx={{ width: "100%" }}
            renderInput={(params) => <TextField {...params} />}
          />
        </div>
      </div>

      <div className="rfqBasicInfoFields2">
        <Box>
          <label>
            Expiry Date
            {REQUIRED_ASTERISK}
          </label>
          <TextField
            type="date"
            name="expiry_date"
            value={
              formData.expiry_date
                ? new Date(formData.expiry_date).toISOString().slice(0, 10)
                : ""
            }
            onChange={(e) => handleInputChange("expiry_date", e.target.value)}
            sx={{ width: "100%", mt: 0.5 }}
          />
        </Box>

        <div>
          <label style={{ marginBottom: "6px", display: "block" }}>
            Vendor
            {REQUIRED_ASTERISK}
          </label>
          <Autocomplete
            disablePortal
            options={vendors}
            value={selectedVendor}
            getOptionLabel={(option) => option.company_name || ""}
            isOptionEqualToValue={(opt, val) => opt.url === val.url}
            onChange={(event, newValue) => {
              // Store the full vendor object
              handleInputChange("vendor", newValue || "");
            }}
            sx={{ width: "100%" }}
            renderInput={(params) => <TextField {...params} />}
          />
        </div>
      </div>
    </div>
  );
};

export default RfqBasicInfoFields;
