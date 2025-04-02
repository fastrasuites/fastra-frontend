import { Autocomplete, TextField } from "@mui/material";
import { extractRFQID, formatDate } from "../../../../helper/helper";
import { useTenant } from "../../../../context/TenantContext";

const labelStyle = { marginBottom: "6px", display: "block" };

const POBasicInfoFields = ({
  formData,
  handleInputChange,
  formUse,
  currencies,
  vendors,
  rfqID,
}) => {
  const tenant_schema_name = useTenant().tenantData?.tenant_schema_name;
  return (
    <div className="rfqBasicInfoField">
      {/* Header Section */}
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
            <label>Created By</label>
            <p style={{ textTransform: "capitalize" }}>{tenant_schema_name}</p>
          </div>
        </div>
      </div>

      {/* Vendor Selection */}
      <div className="rfqBasicInfoFields2">
        <div className="rfqBasicInfoFields1SelectFields">
          <label style={labelStyle}>Vendor</label>
          <Autocomplete
            disablePortal
            options={vendors}
            getOptionLabel={(option) => option.company_name || ""}
            isOptionEqualToValue={(option, value) => option.url === value.url}
            onChange={(event, value) => handleInputChange("vendor", value)}
            sx={{ width: "100%" }}
            renderInput={(params) => <TextField {...params} />}
          />
        </div>
      </div>

      {/* Vendor Details */}
      <div className="rfqBasicInfoFields2">
        <div className="refID">
          <label>Vendor Address</label>
          <p>{formData?.vendor?.address || "N/A"}</p>
        </div>
        <div className="refDate">
          <label>Vendor Email</label>
          <p>{formData?.vendor?.email || "N/A"}</p>
        </div>
      </div>

      {/* Currency and Additional Information */}
      <div className="rfqBasicInfoFields2">
        <div className="currency-select">
          <label style={labelStyle}>Select Currency</label>
          <Autocomplete
            disablePortal
            options={currencies}
            getOptionLabel={(option) =>
              `${option.currency_name} - ${option.currency_symbol}`
            }
            onChange={(event, value) =>
              handleInputChange("currency", value?.url)
            }
            sx={{ width: "100%" }}
            renderInput={(params) => <TextField {...params} />}
          />
        </div>
        <div>
          <label style={labelStyle}>Payment Terms</label>
          <TextField
            type="text"
            value={formData.payment_terms || ""}
            onChange={(e) => handleInputChange("payment_terms", e.target.value)}
            sx={{ width: "100%" }}
            placeholder="Type your payment terms here."
          />
        </div>
        <div>
          <label style={labelStyle}>Purchase Policy</label>
          <TextField
            type="text"
            value={formData.purchase_policy || ""}
            onChange={(e) =>
              handleInputChange("purchase_policy", e.target.value)
            }
            sx={{ width: "100%" }}
            placeholder="Type your purchase policy here."
          />
        </div>
      </div>

      {/* Delivery Terms */}
      <div className="rfqBasicInfoFields2">
        <div>
          <label style={labelStyle}>Delivery Terms</label>
          <TextField
            type="text"
            value={formData.delivery_terms || ""}
            onChange={(e) =>
              handleInputChange("delivery_terms", e.target.value)
            }
            sx={{ width: "100%" }}
            placeholder="Type your delivery terms here."
          />
        </div>
      </div>
    </div>
  );
};

export default POBasicInfoFields;
