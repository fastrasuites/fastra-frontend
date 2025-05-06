import React, { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Box, Button, Typography } from "@mui/material";
import { useCustomLocation } from "../../../../context/Inventory/LocationContext";

const LocationInfo = () => {
  const { id } = new useParams();
  const { getSingleLocation, singleLocation } = useCustomLocation();

  useEffect(() => {
    getSingleLocation(id);
  });

  const handleDone = () => {
    window.history.back();
  }

  return (
    <Box padding={"30px"} display={"grid"} gap="32px">
      <Typography variant="h6" fontSize={24} fontWeight={600}>
        New Location
      </Typography>

      <Box
        padding={"24px"}
        display={"grid"}
        gap="32px"
        border="1px solid #E2E6E9"
        sx={{ backgroundColor: "#FFFFFF" }}
      >
        <Typography variant="h6" color="#3B7CED" fontSize={20} fontWeight={500}>
          Product Information
        </Typography>

        <Box
          display={"flex"}
          gap={"170px"}
          borderBottom={"1px solid #E2E6E9"}
          paddingBottom={"24px"}
        >
          <Box>
            <Typography>Location Code</Typography>
            <Typography color="#7A8A98">{singleLocation?.id}</Typography>
          </Box>

          <Box>
            <Typography>Location Name</Typography>
            <Typography color="#7A8A98">
              {singleLocation?.location_name}
            </Typography>
          </Box>

          <Box>
            <Typography>Location Type</Typography>
            <Typography color="#7A8A98">
              {singleLocation?.location_type}
            </Typography>
          </Box>
        </Box>

        <Box
          display={"flex"}
          gap={"170px"}
          borderBottom={"1px solid #E2E6E9"}
          paddingBottom={"24px"}
        >
          <Box>
            <Typography>Address</Typography>
            <Typography color="#7A8A98">{singleLocation?.address}</Typography>
          </Box>
          <Box>
            <Typography>Location Manager</Typography>
            <Typography color="#7A8A98">
              {singleLocation?.location_manager}
            </Typography>
          </Box>

          <Box>
            <Typography>Store Keeper</Typography>
            <Typography color="#7A8A98">
              {singleLocation?.store_keeper}
            </Typography>
          </Box>

          <Box>
            <Typography>Contact Information</Typography>
            <Typography color="#7A8A98">
              {singleLocation?.contact_information}
            </Typography>
          </Box>
        </Box>

        <Box>
          <Button variant="contained" size="lg" disableElevation onClick={handleDone}>
            Done
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default LocationInfo;
