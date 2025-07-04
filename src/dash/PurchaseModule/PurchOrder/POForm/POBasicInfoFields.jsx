import React from "react";
import { Autocomplete, TextField, Box, Skeleton } from "@mui/material";
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
    locationList.find((l) => l.url === formData.destination_location?.url) ||
    formData.destination_location ||
    null;
  const selectedCurrency =
    currencies.find((c) => c.url === formData?.rfq?.currency?.url) ||
    formData?.rfq?.currency ||
    null;

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
          <label style={labelStyle}>Requested for Quotation ID</label>
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
          <TextField
            fullWidth
            value={
              formData.rfq?.vendor?.company_name ||
              purchaseOrder?.payment_terms ||
              ""
            }
            onChange={(e) => handleInputChange("payment_terms", e.target.value)}
            placeholder="Vendor"
          />
        </div>

        {/* Destination Location Autocomplete */}
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
          <p>{formData?.rfq?.vendor?.address || "N/A"}</p>
        </div>
        <div className="refDate">
          <label style={labelStyle}>Vendor Email</label>
          <p>{formData?.rfq?.vendor?.email || "N/A"}</p>
        </div>
      </div>

      {/* Row 4: Currency, Payment Terms, Purchase Policy */}
      <div
        className="rfqBasicInfoFields2"
        style={{ gap: 24, marginBottom: 24 }}
      >
        <div className="currency-select" style={{ flex: 1 }}>
          <label style={labelStyle}>Currency</label>
          <Autocomplete
            disablePortal
            options={currencies}
            value={selectedCurrency}
            getOptionLabel={(option) =>
              `${option.currency_name} - ${option.currency_symbol}`
            }
            isOptionEqualToValue={(option, value) => option.url === value?.url}
            onChange={(_, value) => handleInputChange("currency", value)}
            renderInput={(params) => (
              <TextField {...params} placeholder="Select Currency" />
            )}
            sx={{ width: "100%" }}
          />
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
