import { Autocomplete, TextField } from "@mui/material";
import CustomAutocomplete from "../../../../components/ui/CustomAutocomplete";
import { extractRFQID, formatDate } from "../../../../helper/helper";

const RfqBasicInfoFields = ({
  formData,
  handleInputChange,
  formUse,
  currencies,
  vendors,
  purchaseIdList,
  rfqID,
}) => {
  // console.log(rfqID)
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
            getOptionLabel={(option) => option.rfqID}
            isOptionEqualToValue={(option, value) =>
              option.rfqID === value.rfqID
            }
            onChange={(event, value) =>
              handleInputChange("purchase_request", value?.url)
            }
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
            getOptionLabel={(option) =>
              `${option.currency_name} - ${option.currency_symbol}`
            }
            onChange={(event, value) =>
              handleInputChange("currency", value?.url)
            }
            sx={{ width: "100%" }}
            renderInput={(params) => (
              <TextField {...params}  />
            )}
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
            getOptionLabel={(option) => option.company_name || ""}
            isOptionEqualToValue={(option, value) => option.url === value.url}
            onChange={(event, value) => handleInputChange("vendor", value.url)}
            sx={{ width: "100%" }}
            renderInput={(params) => (
              <TextField {...params}/>
            )}
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
