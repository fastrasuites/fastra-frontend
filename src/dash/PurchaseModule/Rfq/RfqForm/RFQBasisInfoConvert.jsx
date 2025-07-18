// src/dash/PurchaseModule/Rfq/RfqBasicInfoFields.jsx
import { Autocomplete, TextField, Typography, Box } from "@mui/material";
import { extractRFQID, formatDate } from "../../../../helper/helper";

const REQUIRED_ASTERISK = (
  <Typography component="span" color="#D32F2F" ml={0.5} fontSize="20px">
    *
  </Typography>
);

const GrayText = ({ children }) => (
  <Typography color="#303030">{children}</Typography>
);

const RfqBasicInfoFieldsConvertToRFQ = ({
  formData,
  handleInputChange,
  formUse,
  rfqID,
  isConvertToRFQ,
  // eslint-disable-next-line no-unused-vars
  locationList = [],
}) => {
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
          <Box display={"grid"} gap={2}>
            <label>Date Opened</label>
            <GrayText>{formatDate(Date.now())}</GrayText>
          </Box>
        </div>

        {/* ──────────────────────── Input PR ID ──────────────────────── */}
        <Box display={"grid"} gap={2}>
          <label>
            Input PR ID
            {isConvertToRFQ && REQUIRED_ASTERISK}
          </label>
          <GrayText>{formData?.id || "N/A"}</GrayText>
        </Box>

        {/* ──────────────────────── Select Currency ──────────────────────── */}
        <Box display={"grid"} gap={2}>
          <label>
            Select Currency
            {isConvertToRFQ && REQUIRED_ASTERISK}
          </label>
          <GrayText>
            {formData.currency_details.currency_name
              ? `${formData.currency_details.currency_name} - ${formData.currency_details.currency_symbol}`
              : "N/A"}
          </GrayText>
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
        <Box display={"grid"}>
          <label>
            Vendor
            {isConvertToRFQ && REQUIRED_ASTERISK}
          </label>
          <GrayText>
            {formData?.vendor_details?.company_name
              ? `${formData?.vendor_details?.company_name}`
              : "N/A"}
          </GrayText>
        </Box>
      </div>
    </div>
  );
};

export default RfqBasicInfoFieldsConvertToRFQ;
