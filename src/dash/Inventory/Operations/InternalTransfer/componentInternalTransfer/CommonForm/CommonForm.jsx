import React, { useCallback } from "react";
import { Box, Button, Grid } from "@mui/material";
import autosave from "../../../../../../image/autosave-text.svg";
import "./CommonForm.css";
import DynamicItemsTable from "./DynamicItemsTable";

const CommonForm = ({
  basicInformationTitle,
  basicInformationInputs: BasicInformationInputs,
  formTitle,
  isEdit = false,
  rowConfig,
  formData,
  setFormData,
  onSubmit,
  submitBtnText = "Save",
  saveAsSubmitBtnText = "Done",
  autofillRow = [
    "product_name",
    "product_description",
    "unit_of_measure",
    "available_product_quantity",
  ],
  showSaveButton = true,
  primaryButtonVariant = "contained",
  onSubmitAsDone,
  setMax = null,
  onSendForApproval = false,
  sendForApprovalBtnText = "Send for Approval",
  handleSendForApproval,
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
        if (field === "product" && value) {
          autofillRow.forEach((row) => {
            if (row === "unit_of_measure") {
              // Explicitly handle product_unit_of_measure for InternalTransferForm
              updatedItems[index][row] =
                value.product_unit_of_measure || value.unit_of_measure || "";
            } else {
              updatedItems[index][row] =
                value[row] || value[`product_${row}`] || "";
            }
          });
          updatedItems[index].description = value.product_description || "";
        }
        return { ...prev, items: updatedItems };
      });
    },
    [setFormData, autofillRow]
  );

  const handleAddRow = useCallback(() => {
    setFormData((prev) => {
      const newRow = rowConfig.reduce((acc, cfg) => {
        let defaultValue = "";
        if (cfg.value && typeof cfg.value === "function") {
          defaultValue = cfg.value(acc);
        }
        acc[cfg.field] = defaultValue;
        return acc;
      }, {});
      return {
        ...prev,
        items: [...prev.items, newRow],
      };
    });
  }, [rowConfig, setFormData]);

  const handleRemoveRow = useCallback(
    (index) => {
      setFormData((prev) => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index),
      }));
    },
    [setFormData]
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(formData);
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
    <Box p={3}>
      <Grid container spacing={2} className="common-form">
        <Grid item xs={12}>
          <header className="common-form-header">
            <h1>{formTitle}</h1>
            <img
              src={autosave}
              alt="autosave"
              className="common-form-autosave-img"
            />
          </header>
        </Grid>
        <Grid item xs={12}>
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
                setMax={setMax}
              />
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mt: 2,
                  flexWrap: "wrap",
                  gap: 2,
                }}
              >
                <Button variant="outlined" onClick={handleAddRow}>
                  Add Item
                </Button>
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                  {onSubmitAsDone && (
                    <Button
                      variant="contained"
                      disableElevation
                      onClick={handleSubmitAsDone}
                    >
                      {saveAsSubmitBtnText}
                    </Button>
                  )}
                  {showSaveButton && (
                    <Button
                      variant={primaryButtonVariant}
                      onClick={handleSubmit}
                      type="submit"
                      disabled={!showSaveButton}
                    >
                      {isEdit ? "Update" : submitBtnText}
                    </Button>
                  )}
                  {onSendForApproval && (
                    <Button
                      variant="contained"
                      disableElevation
                      onClick={handleSendForApproval}
                      disabled={!showSaveButton}
                    >
                      {sendForApprovalBtnText}
                    </Button>
                  )}
                </Box>
              </Box>
            </div>
          </form>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CommonForm;
