import React, { useEffect, useState } from "react";
import { Autocomplete, TextField, Typography } from "@mui/material";
import { extractRFQID, formatDate } from "../../../../helper/helper";

const REQUIRED_ASTERISK = (
  <Typography component="span" color="#D32F2F" ml={0.5}>
    *
  </Typography>
);

// Helper: resolve a formValue (string URL/ID or object) into the matching object
const getSelectedOption = (formValue, list = [], key = "id") => {
  if (formValue && typeof formValue === "object") return formValue;
  if (typeof formValue === "string" || typeof formValue === "number") {
    return list.find((item) => String(item[key]) === String(formValue)) || null;
  }
  return null;
};

const PRBasicInfoFields = ({
  formData,
  handleInputChange,
  formUse,
  currencies = [],
  vendors = [],
  requester,
  rfqID,
  locationList = [],
}) => {
  const [selectedCurrency, setSelectedCurrency] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);

  useEffect(() => {
    setSelectedCurrency(getSelectedOption(formData.currency, currencies, "id"));
  }, [formData.currency, currencies]);

  // Vendor
  useEffect(() => {
    setSelectedVendor(getSelectedOption(formData.vendor, vendors, "id"));
  }, [formData.vendor, vendors]);

  // Location already uses id, so no change
  useEffect(() => {
    setSelectedLocation(
      getSelectedOption(formData.requesting_location, locationList, "id")
    );
  }, [formData.requesting_location, locationList]);

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
            <label>Date</label>
            <p>{formatDate(Date.now())}</p>
          </div>
          <div className="refDate">
            <label>Requester</label>
            <p>{requester || "N/A"}</p>
          </div>
        </div>
      </div>

      <div className="rfqBasicInfoFields2">
        {/* Select Currency */}
        <div>
          <label style={{ marginBottom: 6, display: "block" }}>
            Select Currency {REQUIRED_ASTERISK}
          </label>
          <Autocomplete
            disablePortal
            options={currencies}
            value={selectedCurrency}
            getOptionLabel={(option) =>
              `${option.currency_name} - ${option.currency_symbol}`
            }
            isOptionEqualToValue={(opt, val) => opt.url === val?.url}
            onChange={(e, value) => {
              setSelectedCurrency(value);
              handleInputChange("currency", value?.id || "");
            }}
            renderInput={(params) => <TextField {...params} />}
          />
        </div>

        {/* Purpose */}
        <div>
          <label style={{ marginBottom: 6, display: "block" }}>
            Purpose {REQUIRED_ASTERISK}
          </label>
          <TextField
            fullWidth
            value={formData.purpose}
            onChange={(e) => handleInputChange("purpose", e.target.value)}
            placeholder="Enter a purpose"
          />
        </div>

        {/* Requesting Location */}
        <div>
          <label style={{ marginBottom: 6, display: "block" }}>
            Requesting Location {REQUIRED_ASTERISK}
          </label>
          <Autocomplete
            disablePortal
            options={locationList}
            value={selectedLocation}
            getOptionLabel={(option) => option.location_name || ""}
            isOptionEqualToValue={(opt, val) => opt.id === val?.id}
            onChange={(e, value) => {
              setSelectedLocation(value);
              handleInputChange("requesting_location", value?.id || "");
            }}
            renderInput={(params) => <TextField {...params} />}
          />
        </div>

        {/* Select Vendor */}
        <div>
          <label style={{ marginBottom: 6, display: "block" }}>
            Select Vendor {REQUIRED_ASTERISK}
          </label>
          <Autocomplete
            disablePortal
            options={vendors}
            value={selectedVendor}
            getOptionLabel={(option) => option.company_name || ""}
            isOptionEqualToValue={(opt, val) => opt.url === val?.url}
            onChange={(e, value) => {
              setSelectedVendor(value);
              handleInputChange("vendor", value?.id || "");
            }}
            renderInput={(params) => <TextField {...params} />}
          />
        </div>
      </div>
    </div>
  );
};

export default PRBasicInfoFields;
