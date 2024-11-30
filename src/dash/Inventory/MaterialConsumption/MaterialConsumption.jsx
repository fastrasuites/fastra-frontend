import React from "react";
import InventoryHeader from "../InventoryHeader";
import { Box, Button, useTheme } from "@mui/material";
import inventoryShareStyle from "../inventorySharedStyles";

const MaterialConsumption = () => {
  const theme = useTheme();
  return (
    <div>
      <InventoryHeader />
      <Box sx={inventoryShareStyle.operationWrapper(theme)}>
        <Button sx={inventoryShareStyle.buttonStyles(theme)}>
          New Material Consumption
        </Button>
      </Box>
    </div>
  );
};

export default MaterialConsumption;
