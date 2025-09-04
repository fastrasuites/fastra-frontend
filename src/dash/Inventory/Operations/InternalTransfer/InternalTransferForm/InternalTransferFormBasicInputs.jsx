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
    const sourceLocationRef = useRef(formData.sourceLocation?.id ?? null);
    const prefilledDone = useRef(false);

    // Fetch locations once on mount
    useEffect(() => {
      if (!locationsFetched.current) {
        (async () => {
          await getLocationsForOtherUser();
          locationsFetched.current = true;
        })();
      }
    }, []);

    useEffect(() => {
      if (!allLocationsFetched.current) {
        (async () => {
          await getAllUserLocations();
          allLocationsFetched.current = true;
        })();
      }
    }, []);

    // Prefill locations if only one option exists
    useEffect(() => {
      // if (!prefilledDone.current) {
      if (locationsForOtherUser.length === 1 && !formData.sourceLocation) {
        handleInputChange("sourceLocation", locationsForOtherUser[0]);
        // prefilledDone.current = true;
      }
      if (allUserLocations.length === 1 && !formData.destinationLocation) {
        handleInputChange("destinationLocation", allUserLocations[0]);
        // prefilledDone.current = true;
      }
      // }
    }, [
      // locationsForOtherUser,
      allUserLocations,
      // formData.sourceLocation,
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

    // useEffect(() => {
    //   const timeoutId = setTimeout(fetchLocationProducts, 300);
    //   return () => clearTimeout(timeoutId);
    // }, [fetchLocationProducts]);
    useEffect(() => {
      const currentId = formData.sourceLocation?.id;

      // Only fetch if we have a valid id and it's different from the last one
      if (currentId && currentId !== sourceLocationRef.current) {
        getLocationProducts(currentId).then(() => {
          sourceLocationRef.current = currentId;
          if (formData.items.length > 0) {
            handleInputChange("items", []);
          }
        });
      }
    }, [formData.sourceLocation?.id]); // only depend on the ID, not the whole formData

    // Check if source and destination locations are the same
    const isSameLocation =
      formData.sourceLocation &&
      formData.destinationLocation &&
      String(formData.sourceLocation.id) ===
        String(formData.destinationLocation.id);

    // robust equality: compare ids as strings to avoid number/string mismatch churn
    const optEq = (option, value) =>
      String(option?.id ?? "") === String(value?.id ?? "");

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
            getOptionLabel={(option) =>
              typeof option === "string" ? option : option?.location_name || ""
            }
            value={formData.sourceLocation || null}
            onChange={(event, newValue) => {
              // handleInputChange("sourceLocation", newValue);
              // only act if id actually changed
              if (
                String(newValue?.id ?? "") !==
                String(formData.sourceLocation?.id ?? "")
              ) {
                handleInputChange("sourceLocation", newValue);
              }
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
            isOptionEqualToValue={optEq}
            // isOptionEqualToValue={(option, value) =>
            //   option.id === (value?.id || "")
            // }
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
            getOptionLabel={(option) =>
              typeof option === "string" ? option : option?.location_name || ""
            }
            value={formData.destinationLocation || null}
            onChange={(event, newValue) => {
              // handleInputChange("destinationLocation", newValue);
              // only act if id actually changed
              if (
                String(newValue?.id ?? "") !==
                String(formData.destinationLocation?.id ?? "")
              ) {
                handleInputChange("destinationLocation", newValue);
              }
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
            // isOptionEqualToValue={(option, value) =>
            //   option.id === (value?.id || "")
            // }
            isOptionEqualToValue={optEq}
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
