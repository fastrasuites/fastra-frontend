import React, { useCallback } from "react";
import { Box, Button, Grid } from "@mui/material";
import autosave from "../../../../../../image/autosave-text.svg";
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
  showSaveButton = true,
  primaryButtonVariant = "contained",
  onSendForApproval = false,
  sendForApprovalBtnText = "Send for Approval",
  handleSendForApproval,
  setMax = null,
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
          updatedItems[index].unit_of_measure =
            value.product_unit_of_measure || "";
          updatedItems[index].product_name = value.product_name || "";
        }
        return { ...prev, items: updatedItems };
      });
    },
    [setFormData]
  );

  const handleAddRow = useCallback(() => {
    setFormData((prev) => {
      const newRow = rowConfig.reduce((acc, cfg) => {
        acc[cfg.field] = "";
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
