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
  purchaseOrder,
  rfqID,
  rfqList = [],
  locationList = [],
  isRfqLoading,
  isConvertToPO,
}) => {
  console.log(formData);
  const { tenantData } = useTenant();
  const tenantName = tenantData?.tenant_schema_name || "";
  // Resolve selected objects
  const selectedRfq =
    rfqList.find((r) => r.url === formData.rfq?.url) || formData.rfq || null;
  const selectedLocation =
    locationList.find((l) => l.id === formData.destination_location?.id) ||
    formData.destination_location ||
    null;

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
          <Box style={{ marginRight: 32 }} display={"grid"} gap={2}>
            <label style={labelStyle}>Date</label>
            <Typography color={"#353536"}>
              {formatDate(purchaseOrder?.date_created || new Date())}
            </Typography>
          </Box>
          <div className="refDate">
            <label style={labelStyle}>Created By</label>
            <Typography
              style={{ textTransform: "capitalize", color: "#353536" }}
            >
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
          <Typography>
            {formData?.rfq?.vendor_details?.company_name || "N/A"}
          </Typography>
        </div>

        {/* Destination Location */}
        <div className="rfqBasicInfoFields1SelectFields" style={{ flex: 1 }}>
          <label style={labelStyle}>Destination Location</label>
          <Autocomplete
            disablePortal
            options={locationList}
            value={selectedLocation}
            getOptionLabel={(option) => option.location_name || ""}
            isOptionEqualToValue={(option, value) => option.id === value?.id}
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
        <Box display={"grid"} gap={2}>
          <label style={labelStyle}>Vendor Address</label>
          <Typography color="#353536">
            {formData?.rfq?.vendor_details?.address || "N/A"}
          </Typography>
        </Box>
        <Box display={"grid"} gap={2}>
          <label style={labelStyle}>Vendor Email</label>
          <Typography color="#353536">
            {formData?.rfq?.vendor_details?.email || "N/A"}
          </Typography>
        </Box>
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
          <Typography>
            {formData?.rfq?.currency_details
              ? `${formData?.rfq?.currency_details?.currency_name} - ${formData?.rfq?.currency_details?.currency_symbol}`
              : "N/A"}
          </Typography>
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
