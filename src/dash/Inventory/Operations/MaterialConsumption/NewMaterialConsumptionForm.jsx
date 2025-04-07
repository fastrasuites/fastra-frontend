import { Typography, Box, useTheme } from "@mui/material";
import React from "react";
import autosave from "../../../../image/autosave-text.svg";
import inventoryShareStyle from "../../inventorySharedStyles";

const NewMaterialConsumptionForm = () => {
  const theme = useTheme();
  return (
    <Box>
      <Box sx={{}}>
        <Typography sx={{ ...inventoryShareStyle.pageBoldTitle(theme) }}>
          New Material Consumption
        </Typography>
        <img src={autosave} alt="" />
      </Box>
    </Box>
  );
};

export default NewMaterialConsumptionForm;
