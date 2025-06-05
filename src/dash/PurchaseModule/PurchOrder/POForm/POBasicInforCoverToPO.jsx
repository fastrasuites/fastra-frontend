// src/dash/PurchaseModule/PurchOrder/POForm/POBasicInfoFields.jsx
import React from "react";
import { Autocomplete, TextField, Box, Typography } from "@mui/material";
import { extractRFQID, formatDate } from "../../../../helper/helper";
import { useTenant } from "../../../../context/TenantContext";

const labelStyle = {
  marginBottom: 6,
  display: "block",
  fontWeight: 500,
};

// Reusable red asterisk for required fields
const REQUIRED_ASTERISK = (
  <Typography component="span" color="#D32F2F" ml={0.5} fontSize="20px">
    *
  </Typography>
);

const POBasicInfoFieldsConverToPO = ({
  formData,
  handleInputChange,
  formUse,
  currencies = [],
  purchaseOrder,
  rfqID,
  rfqList = [],
  locationList = [],
  isRfqLoading,
  isConvertToPO,
}) => {
  const { tenantData } = useTenant();
  const tenantName = tenantData?.tenant_schema_name || "";

  // Resolve selected objects
  const selectedRfq =
    rfqList.find((r) => r.url === formData.rfq?.url) || formData.rfq || null;
  const selectedLocation =
    locationList.find((l) => l.url === formData.destination_location?.url) ||
    formData.destination_location ||
    null;
  const selectedCurrency =
    currencies.find((c) => c.url === formData.rfq.currency?.url) ||
    formData.rfq.currency ||
    null;
  const selectedVendor = formData.rfq?.vendor || purchaseOrder?.vendor || null;

  return (
    <div className="rfqBasicInfoField">
      {/* Top row: ID (if editing), Date, Created By */}
      <div className="rfqBasicInfoFields1" style={{ marginBottom: 24 }}>
        <div className="rfqBasicInfoFields1DateAndId">
          {formUse === "Edit RFQ" && (
            <div className="refID" style={{ marginRight: 32 }}>
              <label style={labelStyle}>
                ID
                {isConvertToPO && REQUIRED_ASTERISK}
              </label>
              <Typography>
                {extractRFQID(purchaseOrder?.id || rfqID)}
              </Typography>
            </div>
          )}
          <div className="refDate" style={{ marginRight: 32 }}>
            <label style={labelStyle}>Date</label>
            <Typography>
              {formatDate(purchaseOrder?.date_created || new Date())}
            </Typography>
          </div>
          <div className="refDate">
            <label style={labelStyle}>Created By</label>
            <Typography style={{ textTransform: "capitalize" }}>
              {tenantName}
            </Typography>
          </div>
        </div>
      </div>

      {/* Row 2: RFQ, Vendor, Destination Location */}
      <div
        className="rfqBasicInfoFields2"
        style={{ gap: 24, marginBottom: 24 }}
      >
        {/* RFQ ID */}
        <div className="rfqBasicInfoFields1SelectFields" style={{ flex: 1 }}>
          <label style={labelStyle}>
            RFQ ID
            {isConvertToPO && REQUIRED_ASTERISK}
          </label>
          {isConvertToPO ? (
            <Typography>{selectedRfq?.id || "N/A"}</Typography>
          ) : (
            <Autocomplete
              disablePortal
              options={rfqList}
              value={selectedRfq}
              getOptionLabel={(option) => option.id || ""}
              isOptionEqualToValue={(option, value) =>
                option.url === value?.url
              }
              onChange={(_, value) => handleInputChange("rfq", value)}
              loading={isRfqLoading}
              renderInput={(params) => (
                <TextField {...params} placeholder="Search RFQ" />
              )}
              sx={{ width: "100%" }}
            />
          )}
        </div>

        {/* Vendor */}
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>
            Vendor
            {isConvertToPO && REQUIRED_ASTERISK}
          </label>
          {isConvertToPO ? (
            <Typography>{selectedVendor?.company_name || "N/A"}</Typography>
          ) : (
            <TextField
              fullWidth
              value={formData.vendor || purchaseOrder?.vendor_url || ""}
              onChange={(e) => handleInputChange("vendor", e.target.value)}
              placeholder="Vendor"
            />
          )}
        </div>

        {/* Destination Location */}
        <div className="rfqBasicInfoFields1SelectFields" style={{ flex: 1 }}>
          <label style={labelStyle}>Destination Location</label>
          <Autocomplete
            disablePortal
            options={locationList}
            value={selectedLocation}
            getOptionLabel={(option) => option.location_name || ""}
            isOptionEqualToValue={(option, value) => option.url === value?.url}
            onChange={(_, value) =>
              handleInputChange("destination_location", value)
            }
            renderInput={(params) => (
              <TextField {...params} placeholder="Select Location" />
            )}
            sx={{ width: "100%" }}
          />
        </div>
      </div>

      {/* Row 3: Vendor Address & Email */}
      <div
        className="rfqBasicInfoFields2"
        style={{ gap: 32, marginBottom: 24 }}
      >
        <div className="refID">
          <label style={labelStyle}>Vendor Address</label>
          <Typography>{selectedVendor?.address || "N/A"}</Typography>
        </div>
        <div className="refDate">
          <label style={labelStyle}>Vendor Email</label>
          <Typography>{selectedVendor?.email || "N/A"}</Typography>
        </div>
      </div>

      {/* Row 4: Currency, Payment Terms, Purchase Policy */}
      <div
        className="rfqBasicInfoFields2"
        style={{ gap: 24, marginBottom: 24 }}
      >
        {/* Currency */}
        <div className="currency-select" style={{ flex: 1 }}>
          <label style={labelStyle}>
            Currency
            {isConvertToPO && REQUIRED_ASTERISK}
          </label>
          {isConvertToPO ? (
            <Typography>
              {selectedCurrency
                ? `${selectedCurrency.currency_name} - ${selectedCurrency.currency_symbol}`
                : "N/A"}
            </Typography>
          ) : (
            <Autocomplete
              disablePortal
              options={currencies}
              value={selectedCurrency}
              getOptionLabel={(option) =>
                `${option.currency_name} - ${option.currency_symbol}`
              }
              isOptionEqualToValue={(option, value) =>
                option.url === value?.url
              }
              onChange={(_, value) => handleInputChange("currency", value)}
              renderInput={(params) => (
                <TextField {...params} placeholder="Select Currency" />
              )}
              sx={{ width: "100%" }}
            />
          )}
        </div>

        {/* Payment Terms */}
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Payment Terms {REQUIRED_ASTERISK}</label>
          <TextField
            fullWidth
            value={formData.payment_terms || purchaseOrder?.payment_terms || ""}
            onChange={(e) => handleInputChange("payment_terms", e.target.value)}
            placeholder="Enter payment terms"
          />
        </div>

        {/* Purchase Policy */}
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Purchase Policy {REQUIRED_ASTERISK}</label>
          <TextField
            fullWidth
            value={
              formData.purchase_policy || purchaseOrder?.purchase_policy || ""
            }
            onChange={(e) =>
              handleInputChange("purchase_policy", e.target.value)
            }
            placeholder="Enter purchase policy"
          />
        </div>
      </div>

      {/* Row 5: Delivery Terms */}
      <div className="rfqBasicInfoFields2" style={{ marginBottom: 24 }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Delivery Terms {REQUIRED_ASTERISK}</label>
          <TextField
            fullWidth
            value={
              formData.delivery_terms || purchaseOrder?.delivery_terms || ""
            }
            onChange={(e) =>
              handleInputChange("delivery_terms", e.target.value)
            }
            placeholder="Enter delivery terms"
          />
        </div>
      </div>
    </div>
  );
};

export default POBasicInfoFieldsConverToPO;
