import { Autocomplete, TextField } from "@mui/material";
import CustomAutocomplete from "../../../../components/ui/CustomAutocomplete";
import { extractRFQID, formatDate } from "../../../../helper/helper";

// Helper that returns the full object from the list based on the form value.
// It accepts either an object or a string. If a string is passed, it looks up
// the object by comparing a specific key.
const getSelectedOption = (formValue, list, key) => {
  if (typeof formValue === "object" && formValue !== null) return formValue;
  if (typeof formValue === "string") {
    return list.find((item) => item[key] === formValue) || null;
  }
  return null;
};

const RfqBasicInfoFields = ({
  formData,
  handleInputChange,
  formUse,
  currencies,
  vendors,
  purchaseIdList,
  rfqID,
}) => {

  const selectedCurrency =
    getSelectedOption(formData?.currency, currencies, "currency_name") || null;
  const selectedVendor =
    getSelectedOption(formData?.vendor, vendors, "company_name") || null;
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
            <p>{formatDate(Date.now())}</p>
          </div>
        </div>
        <div className="rfqBasicInfoFields1SelectFields">
          <label style={{ marginBottom: "6px", display: "block" }}>
            Input PR ID
          </label>
          <Autocomplete
            disablePortal
            options={purchaseIdList}
            value={
              purchaseIdList.find(
                (option) => option.url === formData.purchase_request
              ) || null
            }
            getOptionLabel={(option) => option.rfqID}
            isOptionEqualToValue={(option, value) => option.url === value.url}
            onChange={(event, newValue) => {
              handleInputChange(
                "purchase_request",
                newValue ? newValue.url : ""
              );
            }}
            sx={{ width: "100%" }}
            renderInput={(params) => (
              <TextField {...params} />
            )}
          />
        </div>
        <div>
          <label style={{ marginBottom: "6px", display: "block" }}>
            Select Currency
          </label>
          <Autocomplete
            disablePortal
            options={currencies}
            value={selectedCurrency}
            getOptionLabel={(option) =>
              `${option.currency_name} - ${option.currency_symbol}`
            }
            onChange={(event, value) =>
              // Store the full object so that the lookup remains consistent.
              handleInputChange("currency", value)
            }
            sx={{ width: "100%" }}
            renderInput={(params) => <TextField {...params} />}
          />
        </div>
      </div>
      <div className="rfqBasicInfoFields2">
        <div>
          <label style={{ marginBottom: "6px", display: "block" }}>
            Expiry Date
          </label>
          <input
            type="date"
            name="expiry_date"
            className="rpr3cb"
            value={
              formData.expiry_date
                ? new Date(formData.expiry_date).toISOString().slice(0, 10)
                : ""
            }
            onChange={(e) => handleInputChange("expiry_date", e.target.value)}
          />
        </div>
        <div>
          <label style={{ marginBottom: "6px", display: "block" }}>
            Vendor
          </label>
          <Autocomplete
            disablePortal
            options={vendors}
            value={selectedVendor}
            getOptionLabel={(option) => option.company_name || ""}
            isOptionEqualToValue={(option, value) =>
              option.company_name === value.company_name
            }
            onChange={(event, value) =>
              // Store the full object.
              handleInputChange("vendor", value)
            }
            sx={{ width: "100%" }}
            renderInput={(params) => <TextField {...params} />}
          />
        </div>
        <div>
          <label style={{ marginBottom: "6px", display: "block" }}>
            Vendor Category
          </label>
          <TextField
            type="text"
            value={formData.vendor_category}
            onChange={(e) =>
              handleInputChange("vendor_category", e.target.value)
            }
            sx={{ width: "100%" }}
            placeholder="Select Vendor Category"
          />
        </div>
      </div>
    </div>
  );
};

export default RfqBasicInfoFields;
