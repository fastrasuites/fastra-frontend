import React, { useEffect, useState } from "react";
import { Autocomplete, TextField } from "@mui/material";
import { extractRFQID, formatDate } from "../../../../helper/helper";

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
  //
  // ─── LOCAL STATE FOR SELECTED OBJECTS ──────────────────────────────────────
  //
  const [selectedCurrency, setSelectedCurrency] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);

  //
  // ─── RESOLVE CURRENCY OBJECT WHEN `formData.currency` OR `currencies` CHANGE ─
  //
  useEffect(() => {
    if (typeof formData.currency === "string" && currencies.length > 0) {
      const match = currencies.find((c) => c.url === formData.currency);
      setSelectedCurrency(match || null);
    } else if (formData.currency && typeof formData.currency === "object") {
      setSelectedCurrency(formData.currency);
    } else {
      setSelectedCurrency(null);
    }
  }, [formData.currency, currencies]);

  //
  // ─── RESOLVE VENDOR OBJECT WHEN `formData.vendor` OR `vendors` CHANGE ───────
  //
  useEffect(() => {
    if (typeof formData.vendor === "string" && vendors.length > 0) {
      const match = vendors.find((v) => v.url === formData.vendor);
      setSelectedVendor(match || null);
    } else if (formData.vendor && typeof formData.vendor === "object") {
      setSelectedVendor(formData.vendor);
    } else {
      setSelectedVendor(null);
    }
  }, [formData.vendor, vendors]);

  //
  // ─── RESOLVE LOCATION OBJECT WHEN `formData.requesting_location` OR `locationList` CHANGE ─
  //
  useEffect(() => {
    if (
      typeof formData.requesting_location === "string" &&
      locationList.length > 0
    ) {
      const match = locationList.find(
        (loc) => loc.id === formData.requesting_location
      );
      setSelectedLocation(match || null);
    } else if (
      formData.requesting_location &&
      typeof formData.requesting_location === "object"
    ) {
      setSelectedLocation(formData.requesting_location);
    } else {
      setSelectedLocation(null);
    }
  }, [formData.requesting_location, locationList]);

  //
  // ─── SOURCE LOC OBJECT (for display only) ──────────────────────────────────
  //
  // eslint-disable-next-line no-unused-vars
  const sourceLocObj = locationList.find((loc) => loc.location_code === "SUPP");

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
        {/** ──────────── Select Currency ──────────── **/}
        <div>
          <label style={{ marginBottom: "6px", display: "block" }}>
            Select Currency
          </label>
          <Autocomplete
            disablePortal
            options={Array.isArray(currencies) ? currencies : []}
            value={selectedCurrency}
            getOptionLabel={(option) =>
              `${option.currency_name} - ${option.currency_symbol}`
            }
            isOptionEqualToValue={(opt, val) => opt.url === val?.url}
            onChange={(event, value) => {
              setSelectedCurrency(value || null);
              handleInputChange("currency", value ? value.url : "");
            }}
            sx={{ width: "100%" }}
            renderInput={(params) => <TextField {...params} />}
          />
        </div>

        {/** ──────────── Purpose ──────────── **/}
        <div>
          <label style={{ marginBottom: "6px", display: "block" }}>
            Purpose
          </label>
          <TextField
            type="text"
            value={formData.purpose}
            onChange={(e) => handleInputChange("purpose", e.target.value)}
            sx={{ width: "100%" }}
            placeholder="Enter a purpose"
          />
        </div>

        {/** ──────────── Requesting Location ──────────── **/}
        <div>
          <label style={{ marginBottom: "6px", display: "block" }}>
            Requesting Location
          </label>
          <Autocomplete
            disablePortal
            options={Array.isArray(locationList) ? locationList : []}
            value={selectedLocation}
            getOptionLabel={(option) => option.location_name || ""}
            isOptionEqualToValue={(opt, val) => opt.id === val?.id}
            onChange={(event, value) => {
              setSelectedLocation(value || null);
              handleInputChange("requesting_location", value ? value.id : "");
            }}
            sx={{ width: "100%" }}
            renderInput={(params) => <TextField {...params} />}
          />
        </div>

        {/** ──────────── Select Vendor ──────────── **/}
        <div>
          <label style={{ marginBottom: "6px", display: "block" }}>
            Select Vendor
          </label>
          <Autocomplete
            disablePortal
            options={Array.isArray(vendors) ? vendors : []}
            value={selectedVendor}
            getOptionLabel={(option) => option.company_name || ""}
            isOptionEqualToValue={(opt, val) => opt.url === val?.url}
            onChange={(event, value) => {
              setSelectedVendor(value || null);
              handleInputChange("vendor", value ? value.url : "");
            }}
            sx={{ width: "100%" }}
            renderInput={(params) => <TextField {...params} />}
          />
        </div>
      </div>
    </div>
  );
};

export default PRBasicInfoFields;
