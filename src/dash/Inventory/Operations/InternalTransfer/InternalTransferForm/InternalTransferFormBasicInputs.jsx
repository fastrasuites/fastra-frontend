import React, { useEffect } from "react";
import {
  Autocomplete,
  TextField,
  CircularProgress,
  Typography,
  Grid,
} from "@mui/material";
import { useCustomLocation } from "../../../../../context/Inventory/LocationContext";

const InternalTransferFormBasicInputs = ({ formData, handleInputChange }) => {
  const {
    locationsForOtherUser,
    getLocationsForOtherUser,
    getAllUserLocations,
    allUserLocations,
    getLocationProducts,
    isLoading,
  } = useCustomLocation();

  useEffect(() => {
    getLocationsForOtherUser();
    getAllUserLocations();
  }, [getLocationsForOtherUser, getAllUserLocations]);

  // Prefill locations if only one option exists
  useEffect(() => {
    if (locationsForOtherUser.length === 1 && !formData.sourceLocation) {
      handleInputChange("sourceLocation", locationsForOtherUser[0]);
    }
    if (allUserLocations.length === 1 && !formData.destinationLocation) {
      handleInputChange("destinationLocation", allUserLocations[0]);
    }
  }, [locationsForOtherUser, allUserLocations, formData, handleInputChange]);

  // Fetch products when sourceLocation changes
  useEffect(() => {
    if (formData.sourceLocation?.id) {
      getLocationProducts(formData.sourceLocation.id);
      handleInputChange("items", []); // Reset items when source location changes
    }
  }, [formData.sourceLocation, getLocationProducts, handleInputChange]);

  // Check if source and destination locations are the same
  const isSameLocation =
    formData.sourceLocation &&
    formData.destinationLocation &&
    formData.sourceLocation.id === formData.destinationLocation.id;

  return (
    <Grid container spacing={2} className="materialbasicInformationInputs">
      <Grid item xs={12} sm={6} md={3}>
        <div className="formLabelAndValue">
          <label>Date</label>
          <Typography variant="body1">{formData.dateCreated}</Typography>
        </div>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <label style={{ marginBottom: "6px", display: "block" }}>
          Source Location
        </label>
        <Autocomplete
          options={locationsForOtherUser}
          getOptionLabel={(option) => option.location_name || ""}
          value={formData.sourceLocation}
          onChange={(event, newValue) => {
            handleInputChange("sourceLocation", newValue);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              variant="outlined"
              placeholder="Select Source Location"
              fullWidth
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {isLoading && <CircularProgress size={20} />}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
          isOptionEqualToValue={(option, value) => option.id === value?.id}
        />
        {isSameLocation && (
          <Typography color="error" variant="caption">
            Source and destination locations cannot be the same
          </Typography>
        )}
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <label style={{ marginBottom: "6px", display: "block" }}>
          Destination Location
        </label>
        <Autocomplete
          options={allUserLocations}
          getOptionLabel={(option) => option.location_name || ""}
          value={formData.destinationLocation}
          onChange={(event, newValue) => {
            handleInputChange("destinationLocation", newValue);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              variant="outlined"
              placeholder="Select Destination Location"
              fullWidth
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {isLoading && <CircularProgress size={20} />}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
          isOptionEqualToValue={(option, value) => option.id === value?.id}
        />
        {isSameLocation && (
          <Typography color="error" variant="caption">
            Source and destination locations cannot be the same
          </Typography>
        )}
      </Grid>
    </Grid>
  );
};

export default InternalTransferFormBasicInputs;
