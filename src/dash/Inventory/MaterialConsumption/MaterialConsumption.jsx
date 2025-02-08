import React, { useState } from "react";
import InventoryHeader from "../InventoryHeader";
import { Box, Button, useTheme } from "@mui/material";
import inventoryShareStyle from "../inventorySharedStyles";
import MaterialConsumptionListview from "./MaterialConsumptionListview";
import NewMaterialConsumptionForm from "./NewMaterialConsumptionForm";

const MaterialConsumption = () => {
  const theme = useTheme();
  const [showNewMaterialConsumptionForm, setShowNewMaterialConsumptionForm] =
    useState(false);

  const handleOpenMaterialConsumptionForm = () => {
    setShowNewMaterialConsumptionForm(true);
  };
  const handleCloseMaterialConsumptionForm = () => {
    setShowNewMaterialConsumptionForm(false);
  };
  return (
    <div>
      <InventoryHeader />
      <Box sx={inventoryShareStyle.operationWrapper(theme)}>
        {showNewMaterialConsumptionForm ? (
          <NewMaterialConsumptionForm
            onClose={handleCloseMaterialConsumptionForm}
          />
        ) : (
          <>
            <Button
              sx={{
                ...inventoryShareStyle.buttonStyles(theme),
                marginBottom: "48px",
              }}
              onClick={handleOpenMaterialConsumptionForm}
            >
              New Material Consumption
            </Button>
            <MaterialConsumptionListview />
          </>
        )}
      </Box>
    </div>
  );
};

export default MaterialConsumption;
