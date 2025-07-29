import React, { useEffect } from "react";
import {
  Autocomplete,
  TextField,
  Box,
  Skeleton,
  Typography,
} from "@mui/material";
import { extractRFQID, formatDate } from "../../../../helper/helper";
import { useTenant } from "../../../../context/TenantContext";

const labelStyle = { marginBottom: 6, display: "block", fontWeight: 500 };

const POBasicInfoFields = ({
  formData,
  handleInputChange,
  formUse,
  currencies = [],
  purchaseOrder,
  rfqID,
  rfqList = [],
  locationList = [],
  isRfqLoading,
}) => {
  const { tenantData } = useTenant();
  const tenantName = tenantData?.tenant_schema_name || "";

  // Resolve currently selected items (or fallback to formData)

  const selectedRfq =
    rfqList.find((r) => r.url === formData.rfq?.url) || formData.rfq || null;
  const selectedLocation =
    locationList.find((l) => l.id === formData.destination_location?.id) ||
    formData.destination_location ||
    null;
  const selectedCurrency =
    currencies.find((c) => c.url === formData?.rfq?.currency?.url) ||
    formData?.rfq?.currency ||
    null;

  useEffect(() => {
    if (locationList.length <= 1) {
      handleInputChange("destination_location", locationList[0]);
    }
  }, [locationList, handleInputChange]);

  return (
    <div className="rfqBasicInfoField">
      {/* Top row: ID (if editing), Date, Created By */}
      <div className="rfqBasicInfoFields1" style={{ marginBottom: 24 }}>
        <div className="rfqBasicInfoFields1DateAndId">
          {formUse === "Edit RFQ" && (
            <div className="refID" style={{ marginRight: 32 }}>
              <label style={labelStyle}>ID</label>
              <p>{extractRFQID(purchaseOrder?.id || rfqID)}</p>
            </div>
          )}
          <div className="refDate" style={{ marginRight: 32 }}>
            <label style={labelStyle}>Date</label>
            <p>{formatDate(purchaseOrder?.date_created || new Date())}</p>
          </div>
          <div className="refDate">
            <label style={labelStyle}>Created By</label>
            <p style={{ textTransform: "capitalize" }}>{tenantName}</p>
          </div>
        </div>
      </div>

      {/* Row 2: RFQ, Vendor, Destination Location */}
      <div
        className="rfqBasicInfoFields2"
        style={{ gap: 24, marginBottom: 24 }}
      >
        {/* RFQ Autocomplete */}
        <div className="rfqBasicInfoFields1SelectFields" style={{ flex: 1 }}>
          <label style={labelStyle}>RFQ ID</label>
          <Autocomplete
            disablePortal
            options={rfqList}
            value={selectedRfq}
            getOptionLabel={(option) => option.id || ""}
            isOptionEqualToValue={(option, value) => option.url === value?.url}
            onChange={(_, value) => handleInputChange("rfq", value)}
            loading={isRfqLoading}
            renderInput={(params) => (
              <TextField {...params} placeholder={"Search RFQ"} />
            )}
            sx={{ width: "100%" }}
          />
        </div>

        {/* Vendor Autocomplete */}
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Vendor</label>
          <Typography marginTop={2}>
            {formData?.rfq?.vendor_details?.company_name ||
              formData?.item?.vendor_details?.company_name ||
              "N/A"}
          </Typography>
        </div>

        {/* Destination Location Autocomplete */}
        <div className="rfqBasicInfoFields1SelectFields" style={{ flex: 1 }}>
          <label style={labelStyle}>Destination Location</label>
          {locationList.length <= 1 ? (
            <Typography>{locationList[0].location_name || "N/A"}</Typography>
          ) : (
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
          )}
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
            {formData?.rfq?.vendor_details?.address ||
              formData?.item?.vendor_details?.address ||
              "N/A"}
          </Typography>
        </Box>
        <Box display={"grid"} gap={2}>
          <label style={labelStyle}>Vendor Email</label>
          <Typography color="#353536">
            {formData?.rfq?.vendor_details?.email ||
              formData?.item?.vendor_details?.email ||
              "N/A"}
          </Typography>
        </Box>
      </div>

      {/* Row 4: Currency, Payment Terms, Purchase Policy */}
      <div
        className="rfqBasicInfoFields2"
        style={{ gap: 24, marginBottom: 24 }}
      >
        <div className="currency-select" style={{ flex: 1 }}>
          <label style={labelStyle}>Currency</label>
          <Typography marginTop={2}>
            {formData?.rfq?.currency_details
              ? `${formData?.rfq?.currency_details?.currency_name} - ${formData?.rfq?.currency_details?.currency_symbol}`
              : formData?.item?.currency_details
              ? `${formData?.item?.currency_details?.currency_name} - ${formData?.item?.currency_details?.currency_symbol}`
              : "N/A"}
          </Typography>
        </div>

        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Payment Terms</label>
          <TextField
            fullWidth
            value={formData.payment_terms || purchaseOrder?.payment_terms || ""}
            onChange={(e) => handleInputChange("payment_terms", e.target.value)}
            placeholder="Enter payment terms"
          />
        </div>

        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Purchase Policy</label>
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
          <label style={labelStyle}>Delivery Terms</label>
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

export default POBasicInfoFields;
