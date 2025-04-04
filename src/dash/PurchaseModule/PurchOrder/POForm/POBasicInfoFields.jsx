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
  purchaseOrder,
  rfqID,
}) => {
  const tenant_schema_name = useTenant().tenantData?.tenant_schema_name;

  // Find selected values from options
  const selectedVendor = vendors.find(v => v.url === formData.vendor?.url) || formData.vendor;
  const selectedCurrency = currencies.find(c => c.url === formData.currency?.url) || formData.currency;

  return (
    <div className="rfqBasicInfoField">
      <div className="rfqBasicInfoFields1">
        <div className="rfqBasicInfoFields1DateAndId">
          {formUse === "Edit RFQ" && (
            <div className="refID">
              <label>ID</label>
              <p>{extractRFQID(purchaseOrder?.id || rfqID)}</p>
            </div>
          )}
          <div className="refDate">
            <label>Date</label>
            <p>{formatDate(purchaseOrder?.date_created || new Date())}</p>
          </div>
          <div className="refDate">
            <label>Created By</label>
            <p style={{ textTransform: "capitalize" }}>{tenant_schema_name}</p>
          </div>
        </div>
      </div>

      <div className="rfqBasicInfoFields2">
        <div className="rfqBasicInfoFields1SelectFields">
          <label style={labelStyle}>Vendor</label>
          <Autocomplete
            disablePortal
            options={vendors}
            value={selectedVendor || null}
            getOptionLabel={(option) => option.company_name || ""}
            isOptionEqualToValue={(option, value) => option.url === value?.url}
            onChange={(_, value) => handleInputChange("vendor", value)}
            sx={{ width: "100%" }}
            renderInput={(params) => <TextField {...params} />}
          />
        </div>
      </div>

      <div className="rfqBasicInfoFields2">
        <div className="refID">
          <label>Vendor Address</label>
          <p>{selectedVendor?.address || "N/A"}</p>
        </div>
        <div className="refDate">
          <label>Vendor Email</label>
          <p>{selectedVendor?.email || "N/A"}</p>
        </div>
      </div>

      <div className="rfqBasicInfoFields2">
        <div className="currency-select">
          <label style={labelStyle}>Currency</label>
          <Autocomplete
            disablePortal
            options={currencies}
            value={selectedCurrency || null}
            getOptionLabel={(option) =>
              `${option.currency_name} - ${option.currency_symbol}`
            }
            isOptionEqualToValue={(option, value) => option.url === value?.url}
            onChange={(_, value) => handleInputChange("currency", value)}
            sx={{ width: "100%" }}
            renderInput={(params) => <TextField {...params} />}
          />
        </div>
        
        <div>
          <label style={labelStyle}>Payment Terms</label>
          <TextField
            fullWidth
            value={formData.payment_terms || purchaseOrder?.payment_terms || ""}
            onChange={(e) => handleInputChange("payment_terms", e.target.value)}
            placeholder="Enter payment terms"
          />
        </div>

        <div>
          <label style={labelStyle}>Purchase Policy</label>
          <TextField
            fullWidth
            value={formData.purchase_policy || purchaseOrder?.purchase_policy || ""}
            onChange={(e) => handleInputChange("purchase_policy", e.target.value)}
            placeholder="Enter purchase policy"
          />
        </div>
      </div>

      <div className="rfqBasicInfoFields2">
        <div>
          <label style={labelStyle}>Delivery Terms</label>
          <TextField
            fullWidth
            value={formData.delivery_terms || purchaseOrder?.delivery_terms || ""}
            onChange={(e) => handleInputChange("delivery_terms", e.target.value)}
            placeholder="Enter delivery terms"
          />
        </div>
      </div>
    </div>
  );
};

export default POBasicInfoFields;