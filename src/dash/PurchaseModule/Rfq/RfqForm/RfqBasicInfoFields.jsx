// src/dash/PurchaseModule/Rfq/RfqBasicInfoFields.jsx
import React from "react";
import PropTypes from "prop-types";
import { Autocomplete, Box, TextField, Typography } from "@mui/material";
import { extractRFQID, formatDate } from "../../../../helper/helper";

// Helpers
const getSelectedOption = (formValue, list = [], key) => {
  if (typeof formValue === "object" && formValue !== null) return formValue;
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

const labelStyle = {
  marginBottom: "6px",
  display: "block",
};

const RfqBasicInfoFields = ({
  formData,
  handleInputChange,
  formUse,
  purchaseIdList = [],
  rfqID,
  minDate,
}) => {
  const selectedPurchaseRequest = getSelectedOption(
    formData.purchase_request,
    purchaseIdList,
    "id"
  );

  const renderLabel = (text) => (
    <label style={labelStyle}>
      {text}
      {REQUIRED_ASTERISK}
    </label>
  );

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
            <Typography color="#303030">{formatDate(Date.now())}</Typography>
          </div>
        </div>

        <div className="rfqBasicInfoFields1SelectFields">
          {renderLabel("Input PR ID")}
          <Autocomplete
            disablePortal
            options={purchaseIdList}
            value={selectedPurchaseRequest}
            getOptionLabel={(option) => option?.id || ""}
            isOptionEqualToValue={(opt, val) => opt.id === val.id}
            onChange={(e, newValue) =>
              handleInputChange("purchase_request", newValue || "")
            }
            sx={{ width: "100%" }}
            renderInput={(params) => <TextField {...params} />}
          />
        </div>

        <div>
          {renderLabel("Select Currency")}
          <Typography color="#303030" marginTop={2}>
            {formData?.purchase_request?.currency_details?.currency_name ||
              formData?.currency_details?.currency_name ||
              "N/A"}
          </Typography>
        </div>
      </div>

      <div className="rfqBasicInfoFields2">
        <Box>
          {renderLabel("Expiry Date")}
          <TextField
            type="date"
            name="expiry_date"
            value={
              formData.expiry_date
                ? new Date(formData.expiry_date).toISOString().slice(0, 10)
                : ""
            }
            onChange={(e) => handleInputChange("expiry_date", e.target.value)}
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: new Date().toISOString().split("T")[0] }}
            variant="outlined"
            fullWidth
            sx={{ width: "100%", mt: 0.5 }}
          />
        </Box>

        <div>
          {renderLabel("Vendor")}
          <Typography color="#303030" marginTop={3}>
            {formData?.purchase_request?.vendor_details?.company_name ||
              formData?.vendor_details?.company_name ||
              "N/A"}
          </Typography>
        </div>
      </div>
    </div>
  );
};

RfqBasicInfoFields.propTypes = {
  formData: PropTypes.object.isRequired,
  handleInputChange: PropTypes.func.isRequired,
  formUse: PropTypes.string,
  purchaseIdList: PropTypes.array,
  rfqID: PropTypes.string,
};

export default RfqBasicInfoFields;
