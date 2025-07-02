// src/dash/PurchaseModule/Rfq/RfqBasicInfoFields.jsx
import React, { useEffect, useState } from "react";
import { Autocomplete, TextField, Typography, Box } from "@mui/material";
import { extractRFQID, formatDate } from "../../../../helper/helper";

// Helper: resolves a formValue (object or string) into the corresponding object from `list`.
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

const RfqBasicInfoFieldsConvertToRFQ = ({
  formData,
  handleInputChange,
  formUse,
  currencies = [],
  vendors = [],
  purchaseIdList = [],
  rfqID,
  isConvertToRFQ,
  // eslint-disable-next-line no-unused-vars
  locationList = [],
}) => {
  console.log(formUse);
  // Local state for selected objects
  const [selectedPurchaseRequest, setSelectedPurchaseRequest] = useState(null);
  const [selectedCurrency, setSelectedCurrency] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null);

  // Sync selectedPurchaseRequest
  useEffect(() => {
    setSelectedPurchaseRequest(
      getSelectedOption(formData.purchase_request, purchaseIdList, "id")
    );
  }, [formData.purchase_request, purchaseIdList]);

  // Sync selectedCurrency
  useEffect(() => {
    setSelectedCurrency(
      getSelectedOption(formData.currency, currencies, "url")
    );
  }, [formData.currency, currencies]);

  // Sync selectedVendor
  useEffect(() => {
    setSelectedVendor(getSelectedOption(formData.vendor, vendors, "url"));
  }, [formData.vendor, vendors]);

  return (
    <div className="rfqBasicInfoField">
      {/* ──────────────────────────── Row 1: ID/Date ───────────────────────────── */}
      <div className="rfqBasicInfoFields1">
        <div className="rfqBasicInfoFields1DateAndId">
          {formUse === "Edit RFQ" && (
            <Box className="refID">
              <label>
                ID
                {isConvertToRFQ && REQUIRED_ASTERISK}
              </label>
              <GrayText>{extractRFQID(rfqID)}</GrayText>
            </Box>
          )}
          <Box className="refDate">
            <label>Date Opened</label>
            <GrayText>{formatDate(Date.now())}</GrayText>
          </Box>
        </div>

        {/* ──────────────────────── Input PR ID ──────────────────────── */}
        <Box className="rfqBasicInfoFields1SelectFields">
          <label>
            Input PR ID
            {isConvertToRFQ && REQUIRED_ASTERISK}
          </label>
          {isConvertToRFQ ? (
            <GrayText>{selectedPurchaseRequest?.id || "N/A"}</GrayText>
          ) : (
            <Autocomplete
              disablePortal
              options={purchaseIdList}
              value={selectedPurchaseRequest}
              getOptionLabel={(option) => option.id}
              isOptionEqualToValue={(opt, val) => opt.id === val.id}
              onChange={(event, newValue) => {
                handleInputChange("purchase_request", newValue ? newValue : "");
              }}
              sx={{ width: "100%", mt: 0.5 }}
              renderInput={(params) => <TextField {...params} />}
            />
          )}
        </Box>

        {/* ──────────────────────── Select Currency ──────────────────────── */}
        <Box className="rfqBasicInfoFields1SelectFields">
          <label>
            Select Currency
            {isConvertToRFQ && REQUIRED_ASTERISK}
          </label>
          {isConvertToRFQ ? (
            <GrayText>
              {selectedCurrency
                ? `${selectedCurrency.currency_name} - ${selectedCurrency.currency_symbol}`
                : "N/A"}
            </GrayText>
          ) : (
            <Autocomplete
              disablePortal
              options={currencies}
              value={selectedCurrency}
              getOptionLabel={(option) =>
                `${option.currency_name} - ${option.currency_symbol}`
              }
              isOptionEqualToValue={(opt, val) => opt.url === val?.url}
              onChange={(event, newValue) => {
                handleInputChange("currency", newValue ? newValue : "");
              }}
              sx={{ width: "100%", mt: 0.5 }}
              renderInput={(params) => <TextField {...params} />}
            />
          )}
        </Box>
      </div>

      {/* ──────────────────────────── Row 2: Expiry/Vendor ───────────────────────────── */}
      <div className="rfqBasicInfoFields2">
        {/* Expiry Date (always editable, in a TextField box) */}
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

        {/* Vendor */}
        <Box>
          <label>
            Vendor
            {isConvertToRFQ && REQUIRED_ASTERISK}
          </label>
          {isConvertToRFQ ? (
            <GrayText>{selectedVendor?.company_name || "N/A"}</GrayText>
          ) : (
            <Autocomplete
              disablePortal
              options={vendors}
              value={selectedVendor}
              getOptionLabel={(option) => option.company_name || ""}
              isOptionEqualToValue={(opt, val) => opt.url === val?.url}
              onChange={(event, newValue) => {
                handleInputChange("vendor", newValue ? newValue : "");
              }}
              sx={{ width: "100%", mt: 0.5 }}
              renderInput={(params) => <TextField {...params} />}
            />
          )}
        </Box>
      </div>
    </div>
  );
};

export default RfqBasicInfoFieldsConvertToRFQ;
