import React, { useEffect, useRef, useCallback } from "react";
import {
  Autocomplete,
  TextField,
  CircularProgress,
  Typography,
  Grid,
} from "@mui/material";
import { useCustomLocation } from "../../../../../context/Inventory/LocationContext";

const InternalTransferFormBasicInputs = React.memo(
  ({ formData, handleInputChange }) => {
    const {
      locationsForOtherUser,
      getLocationsForOtherUser,
      getAllUserLocations,
      allUserLocations,
      getLocationProducts,
      isLoading,
    } = useCustomLocation();

    // Use refs to track API call status
    const locationsFetched = useRef(false);
    const allLocationsFetched = useRef(false);
    const sourceLocationRef = useRef(formData.sourceLocation?.id);

    // Fetch locations once on mount
    useEffect(() => {
      if (!locationsFetched.current) {
        getLocationsForOtherUser().then(() => {
          locationsFetched.current = true;
        });
      }
    }, [getLocationsForOtherUser]);

    useEffect(() => {
      if (!allLocationsFetched.current) {
        getAllUserLocations().then(() => {
          allLocationsFetched.current = true;
        });
      }
    }, [getAllUserLocations]);

    // Prefill locations if only one option exists
    useEffect(() => {
      if (locationsForOtherUser.length === 1 && !formData.sourceLocation) {
        handleInputChange("sourceLocation", locationsForOtherUser[0]);
      }
      if (allUserLocations.length === 1 && !formData.destinationLocation) {
        handleInputChange("destinationLocation", allUserLocations[0]);
      }
    }, [
      locationsForOtherUser,
      allUserLocations,
      formData.sourceLocation,
      formData.destinationLocation,
      handleInputChange,
    ]);

    // Debounced fetch for location products
    const fetchLocationProducts = useCallback(() => {
      if (
        formData.sourceLocation?.id &&
        formData.sourceLocation?.id !== sourceLocationRef.current
      ) {
        getLocationProducts(formData.sourceLocation.id).then(() => {
          sourceLocationRef.current = formData.sourceLocation?.id;
          if (formData.items.length > 0) {
            handleInputChange("items", []);
          }
        });
      }
    }, [formData.sourceLocation?.id, getLocationProducts, handleInputChange]);

    useEffect(() => {
      const timeoutId = setTimeout(fetchLocationProducts, 300);
      return () => clearTimeout(timeoutId);
    }, [fetchLocationProducts]);

    // Check if source and destination locations are the same
    const isSameLocation =
      formData.sourceLocation &&
      formData.destinationLocation &&
      formData.sourceLocation.id === formData.destinationLocation.id;

    return (
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <div className="formLabelAndValue">
            <label>Date Created</label>
            <Typography variant="body1">{formData.dateCreated}</Typography>
          </div>
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <label style={{ marginBottom: "6px", display: "block" }}>
            Source Location
          </label>
          <Autocomplete
            options={locationsForOtherUser}
            getOptionLabel={(option) => option.location_name || ""}
            value={formData.sourceLocation || null}
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
            isOptionEqualToValue={(option, value) =>
              option.id === (value?.id || "")
            }
            onFocus={(e) => e.stopPropagation()} // Prevent focus loss
          />
          {isSameLocation && (
            <Typography color="error" variant="caption">
              Source and destination locations cannot be the same
            </Typography>
          )}
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <label style={{ marginBottom: "6px", display: "block" }}>
            Destination Location
          </label>
          <Autocomplete
            options={allUserLocations}
            getOptionLabel={(option) => option.location_name || ""}
            value={formData.destinationLocation || null}
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
            isOptionEqualToValue={(option, value) =>
              option.id === (value?.id || "")
            }
            onFocus={(e) => e.stopPropagation()} // Prevent focus loss
          />
          {isSameLocation && (
            <Typography color="error" variant="caption">
              Source and destination locations cannot be the same
            </Typography>
          )}
        </Grid>
      </Grid>
    );
  }
);

export default InternalTransferFormBasicInputs;
