// CommonForm.jsx
import React, { useCallback } from "react";
import { Box, Button } from "@mui/material";
import autosave from "../../image/autosave-text.svg";
import "./CommonForm.css";
import DynamicItemsTable from "./DynamicItemsTable";

const CommonForm = ({
  basicInformationTitle,
  // eslint-disable-next-line no-unused-vars
  basicInformationInputs: BasicInformationInputs,
  formTitle,
  isEdit = false,
  rowConfig,
  formData,
  setFormData,
  onSubmit,
  submitBtnText = "Save",
  autofillRow = [
    "product_name",
    "product_description",
    "unit_of_measure",
    "available_product_quantity",
  ],
  showSaveButton = true,
  primaryButtonVariant = "outlined",
  onSubmitAsDone,
}) => {
  // Update a single field in formData
  const handleInputChange = useCallback(
    (field, value) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    [setFormData]
  );

  // Update a specific row in formData.items
  const handleRowChange = useCallback(
    (index, field, value) => {
      setFormData((prev) => {
        const updatedItems = [...prev.items];
        updatedItems[index] = { ...updatedItems[index], [field]: value };

        // Auto-update related fields when product changes
        if (field === "product" && value?.product_description) {
          autofillRow.forEach((row) => {
            // console.log(row);
            updatedItems[index][row] = value[row];
          });
          updatedItems[index].description = value.product_description;
          // updatedItems[index].unit_of_measure = value.unit_of_measure;
        }
        return { ...prev, items: updatedItems };
      });
    },
    [setFormData]
  );

  // Adding a new row: use the rowConfig to define default values
  const handleAddRow = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        rowConfig.reduce(
          (acc, cfg) => {
            acc[cfg.field] = "";
            return acc;
          },
          { id: `new-${prev.items.length + 1}` }
        ),
      ],
    }));
  }, [rowConfig, setFormData]);

  // Removing an existing row
  const handleRemoveRow = useCallback(
    (index) => {
      setFormData((prev) => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index),
      }));
    },
    [setFormData]
  );

  // Submission handler: it passes out the final formData object
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(formData);
    } else {
      console.log("Submitting form data: ", formData);
    }
  };

  const handleSubmitAsDone = (e) => {
    e.preventDefault();
    if (onSubmitAsDone) {
      onSubmitAsDone(formData);
    }
  };
  const handleBack = () => {
    window.history.back();
  };

  return (
    <div className="common-form">
      <header className="common-form-header">
        <h1>{formTitle}</h1>
        <img
          src={autosave}
          alt="autosave"
          className="common-form-autosave-img"
        />
      </header>
      <form className="common-form-body" onSubmit={handleSubmit}>
        <div className="common-form-title-section">
          <h1 className="common-form-title">{basicInformationTitle}</h1>
          <Button
            className="common-form-close-btn"
            sx={{ p: "8px 24px", borderRadius: "4px" }}
            disableElevation
            onClick={handleBack}
          >
            Close
          </Button>
        </div>
        <div className="common-form-inputs">
          <BasicInformationInputs
            formData={formData}
            setFormData={setFormData}
            handleInputChange={handleInputChange}
          />
        </div>
        <div className="common-form-items-table">
          <DynamicItemsTable
            items={formData.items}
            handleRowChange={handleRowChange}
            handleRemoveRow={handleRemoveRow}
            rowConfig={rowConfig}
          />
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
            <Button variant="outlined" onClick={handleAddRow}>
              Add Item
            </Button>
            <Box sx={{ display: "flex", gap: 2 }}>
              {/* <Button variant={primaryButtonVariant} type="submit">
                {isEdit ? "Save Changes" : submitBtnText}
              </Button> */}
              {/* {!isEdit && showSaveButton ? (
                <Button variant="contained" onClick={handleSubmit}>
                  Save
                </Button>
                ""
              ) : (
                
              )} */}
              {onSubmitAsDone && (
                <Button variant="outlined" onClick={handleSubmitAsDone}>
                  {submitBtnText}
                </Button>
              )}

              <Button
                variant={primaryButtonVariant}
                onClick={handleSubmit}
                type="submit"
              >
                {isEdit ? "Update" : submitBtnText}
              </Button>
            </Box>
          </Box>
        </div>
      </form>
    </div>
  );
};

export default CommonForm;
