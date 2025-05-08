import { Autocomplete, TextField } from "@mui/material";
import { extractRFQID, formatDate } from "../../../../helper/helper";

const PRBasicInfoFields = ({
  formData,
  handleInputChange,
  formUse,
  currencies,
  vendors,
  requester,
  rfqID,
}) => {
  console.log(formUse);
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
            <label>Date</label>
            <p>{formatDate(Date.now())}</p>
          </div>
          <div className="refDate">
            <label>Requester</label>
            <p>{requester || "N/A"}</p>
          </div>
        </div>
      </div>

      <div className="rfqBasicInfoFields2">
        <div>
          <label style={{ marginBottom: "6px", display: "block" }}>
            Select Currency
          </label>
          {formUse ? (
            <Autocomplete
              disablePortal
              options={currencies}
              value={formData.currency}
              getOptionLabel={(option) =>
                `${option.currency_name} - ${option.currency_symbol}`
              }
              onChange={(event, value) =>
                handleInputChange("currency", value?.url)
              }
              sx={{ width: "100%" }}
              renderInput={(params) => <TextField {...params} />}
            />
          ) : (
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
          )}
          {/* <Autocomplete
            disablePortal
            options={currencies}
            value={formUse ? formData.currency : null}
            getOptionLabel={(option) =>
              `${option.currency_name} - ${option.currency_symbol}`
            }
            onChange={(event, value) =>
              handleInputChange("currency", value?.url)
            }
            sx={{ width: "100%" }}
            renderInput={(params) => <TextField {...params} />}
          /> */}
        </div>
        <div>
          <label style={{ marginBottom: "6px", display: "block" }}>
            Purpose
          </label>
          <TextField
            type="text"
            value={formData.purpose}
            onChange={(e) => handleInputChange("purpose", e.target.value)}
            sx={{ width: "100%" }}
            placeholder="Enter a purpose"
          />
        </div>
        <div>
          <label style={{ marginBottom: "6px", display: "block" }}>
            Select Vendor
          </label>
          {
            formUse ? (
              <Autocomplete
              disablePortal
              options={vendors}
              value={formData?.vendor}
              getOptionLabel={(option) => option.company_name || ""}
              isOptionEqualToValue={(option, value) => option.url === value.url}
              onChange={(event, value) => handleInputChange("vendor", value?.url)}
              sx={{ width: "100%" }}
              renderInput={(params) => <TextField {...params} />}
            />
            ) : (
              <Autocomplete
                disablePortal
                options={vendors}
                getOptionLabel={(option) => option.company_name || ""}
                isOptionEqualToValue={(option, value) => option.url === value.url}
                onChange={(event, value) => handleInputChange("vendor", value?.url)}
                sx={{ width: "100%" }}
                renderInput={(params) => <TextField {...params} />}
              />
            )
          }
          {/* <Autocomplete
            disablePortal
            options={vendors}
            value={formData?.vendor}
            getOptionLabel={(option) => option.company_name || ""}
            isOptionEqualToValue={(option, value) => option.url === value.url}
            onChange={(event, value) => handleInputChange("vendor", value?.url)}
            sx={{ width: "100%" }}
            renderInput={(params) => <TextField {...params} />}
          /> */}
        </div>
      </div>
    </div>
  );
};

export default PRBasicInfoFields;


{/* <Autocomplete
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
<label style={{ marginBottom: "6px", display: "block" }}>
Purpose
</label>
<TextField
type="text"
value={formData.purpose}
onChange={(e) => handleInputChange("purpose", e.target.value)}
sx={{ width: "100%" }}
placeholder="Enter a purpose"
/>
</div>
<div>
<label style={{ marginBottom: "6px", display: "block" }}>
Select Vendor
</label>
<Autocomplete
disablePortal
options={vendors}
getOptionLabel={(option) => option.company_name || ""}
isOptionEqualToValue={(option, value) => option.url === value.url}
onChange={(event, value) => handleInputChange("vendor", value?.url)}
sx={{ width: "100%" }}
renderInput={(params) => <TextField {...params} />}
/> */}
