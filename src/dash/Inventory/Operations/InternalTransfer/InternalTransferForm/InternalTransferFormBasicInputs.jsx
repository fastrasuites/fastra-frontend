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
  ({ formData, handleInputChange, isEdit = false }) => {
    const {
      locationsForOtherUser,
      getLocationsForOtherUser,
      getAllUserLocations,
      allUserLocations,
      getLocationProducts,
      isLoading,
    } = useCustomLocation();

    // Use refs to track API call status and prevent infinite loops
    const locationsFetched = useRef(false);
    const allLocationsFetched = useRef(false);
    const sourceLocationRef = useRef(formData.sourceLocation?.id ?? null);
    const prefilledSource = useRef(false);
    const prefilledDestination = useRef(false);
    const initialLoad = useRef(true);

    // Fetch locations only once on component mount for create form
    useEffect(() => {
      if (!isEdit && initialLoad.current) {
        initialLoad.current = false;

        if (!locationsFetched.current) {
          getLocationsForOtherUser().then(() => {
            locationsFetched.current = true;
          });
        }

        if (!allLocationsFetched.current) {
          getAllUserLocations().then(() => {
            allLocationsFetched.current = true;
          });
        }
      }
    }, [isEdit, getLocationsForOtherUser, getAllUserLocations]);

    // Prefill locations if only one option exists (only in create mode)
    useEffect(() => {
      if (
        !isEdit &&
        locationsForOtherUser.length === 1 &&
        !formData.sourceLocation &&
        !prefilledSource.current
      ) {
        handleInputChange("sourceLocation", locationsForOtherUser[0]);
        prefilledSource.current = true;
      }

      if (
        !isEdit &&
        allUserLocations.length === 1 &&
        !formData.destinationLocation &&
        !prefilledDestination.current
      ) {
        handleInputChange("destinationLocation", allUserLocations[0]);
        prefilledDestination.current = true;
      }
    }, [
      isEdit,
      locationsForOtherUser,
      allUserLocations,
      formData.sourceLocation,
      formData.destinationLocation,
      handleInputChange,
    ]);

    // Fetch location products when source location changes
    useEffect(() => {
      const currentId = formData.sourceLocation?.id;

      // Only fetch if we have a valid id and it's different from the last one
      if (currentId && currentId !== sourceLocationRef.current) {
        getLocationProducts(currentId).then(() => {
          sourceLocationRef.current = currentId;
          if (formData.items.length > 0 && !isEdit) {
            handleInputChange("items", []);
          }
        });
      }
    }, [
      formData.sourceLocation?.id,
      getLocationProducts,
      handleInputChange,
      formData.items.length,
      isEdit,
    ]);

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
            isOptionEqualToValue={optEq}
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
