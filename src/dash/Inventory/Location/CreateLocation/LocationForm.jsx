import React, { useState, useEffect, useCallback } from "react";
import { useHistory, useLocation } from "react-router-dom";
import {
  Grid,
  TextField,
  Box,
  Divider,
  Typography,
  Button,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import Swal from "sweetalert2";

import autosaveIcon from "../../../../image/autosave.svg";
import "./LocationForm.css";

import { useCustomLocation } from "../../../../context/Inventory/LocationContext";
import { useLocationConfig } from "../../../../context/Inventory/LocationConfigContext";
import { useTenant } from "../../../../context/TenantContext";
import Asteriks from "../../../../components/Asterisk";
import { useUser } from "../../../../context/Settings/UserContext";

const STORAGE_KEY = "draftLocationForm";
const LOCATION_TYPES = [
  { value: "internal", label: "Internal" },
  { value: "partner", label: "Partner" },
];

const initialFormState = {
  locationCode: "",
  locationName: "",
  locationType: "internal",
  address: "",
  locationManager: "",
  storeKeeper: "",
  contactInfo: "",
  isHidden: false,
};

const LocationForm = () => {
  const history = useHistory();
  const { state } = useLocation();
  const fromWizard = state?.openForm === true;

  const { tenantData } = useTenant();
  const tenantSchema = tenantData?.tenant_schema_name;
  const { getUserList, userList } = useUser();

  const {
    locationList,
    getLocationList,
    createLocation,
    isLoading: loadingLocations,
  } = useCustomLocation();

  const {
    multiLocationList,
    getMultiLocation,
    isLoading: loadingConfig,
  } = useLocationConfig();

  const [formData, setFormData] = useState(initialFormState);

  // FETCH on mount
  useEffect(() => {
    getLocationList();
    getMultiLocation();
    getUserList();
  }, [getLocationList, getMultiLocation, getUserList]);

  // Generate code suffix once locations loaded
  useEffect(() => {
    if (!loadingLocations && locationList.length && !formData.locationCode) {
      const suffix = String(locationList.length + 1).padStart(4, "0");
      setFormData((f) => ({ ...f, locationCode: suffix }));
    }
  }, [loadingLocations, locationList, formData.locationCode]);

  // Restore draft
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setFormData(JSON.parse(saved));
      } catch {}
    }
  }, []);

  // Auto-save
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);

  const handleChange = useCallback(
    (field) => (e) => {
      const value =
        e.target.type === "checkbox" ? e.target.checked : e.target.value;
      setFormData((f) => ({ ...f, [field]: value }));
    },
    []
  );

  // Ensure code ends in number suffix
  const handleCodeBlur = () => {
    if (formData.locationCode && !/\d+$/.test(formData.locationCode)) {
      const suffix = String(locationList.length + 1).padStart(4, "0");
      setFormData((f) => ({
        ...f,
        locationCode: f.locationCode.toUpperCase() + suffix,
      }));
    }
  };

  const resetForm = () => {
    setFormData(initialFormState);
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleAddLocation = async () => {
    if (loadingLocations || loadingConfig) return;

    // If multi-location disabled and already 3 exist
    if (locationList.length >= 3 && !multiLocationList?.is_activated) {
      const { isConfirmed } = await Swal.fire({
        title: "Multi-Location Disabled",
        text: "Enable multi-location in Configuration to add more.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Enable Now",
      });
      if (isConfirmed)
        history.push(`/${tenantSchema}/inventory/location-configuration`);
      return;
    }

    // Required fields
    for (const [key, val] of Object.entries(formData)) {
      if (key !== "isHidden" && !val) {
        return Swal.fire({
          icon: "error",
          title: "Missing Fields",
          text: "Please fill all fields before submitting.",
        });
      }
    }

    try {
      const result = await createLocation({ ...formData });
      if (result.success) {
        await Swal.fire({
          icon: "success",
          title: "Location Added",
          text: "The location was added successfully.",
        });
        resetForm();
        getLocationList();
        if (fromWizard) {
          history.push({
            pathname: `/${tenantSchema}/purchase`,
            state: { step: 2, preservedWizard: true },
          });
        }
      }
    } catch (err) {
      const msg =
        err.message || Object.values(err).join(", ") || "An error occurred.";
      Swal.fire({ icon: "error", title: "Error", text: msg });
    }
  };

  return (
    <div className="inven-header">
      <div className="location-form-wrapper fade-in">
        <div className="location-form-container">
          <div className="location-form-header">
            <div className="location-header-left">
              <p className="location-title">New Location</p>
              <div className="location-autosave">
                <p>Autosaved</p>
                <img src={autosaveIcon} alt="Autosaved" />
              </div>
            </div>
          </div>

          <div className="location-form-content">
            <form className="location-form-fields" noValidate>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="h6">Location Information</Typography>
                <Button onClick={() => history.goBack()} sx={{ mt: 2 }}>
                  Close
                </Button>
              </Box>

              <Box mt={3}>
                <Grid container spacing={3}>
                  {/* Code */}
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography gutterBottom display="flex">
                      Location Code <Asteriks />
                    </Typography>
                    <TextField
                      fullWidth
                      value={formData.locationCode}
                      onChange={handleChange("locationCode")}
                      onBlur={handleCodeBlur}
                      placeholder="Enter Location Code"
                    />
                  </Grid>
                  {/* Name */}
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography gutterBottom display="flex">
                      Location Name <Asteriks />
                    </Typography>
                    <TextField
                      fullWidth
                      value={formData.locationName}
                      onChange={handleChange("locationName")}
                      placeholder="Enter Location Name"
                    />
                  </Grid>
                  {/* Type */}
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography gutterBottom display="flex">
                      Location Type <Asteriks />
                    </Typography>
                    <TextField
                      fullWidth
                      select
                      value={formData.locationType}
                      onChange={handleChange("locationType")}
                    >
                      {LOCATION_TYPES.map(({ value, label }) => (
                        <MenuItem key={value} value={value}>
                          {label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                </Grid>
                <Divider sx={{ my: 4 }} />
              </Box>

              {/* Address, Manager, Keeper */}
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography gutterBottom display="flex">
                    Address <Asteriks />
                  </Typography>
                  <TextField
                    fullWidth
                    value={formData.address}
                    onChange={handleChange("address")}
                    placeholder="Enter Location Address"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography gutterBottom display="flex">
                    Location Manager <Asteriks />
                  </Typography>
                  <TextField
                    fullWidth
                    select
                    value={formData.locationManager}
                    onChange={handleChange("locationManager")}
                  >
                    {userList.map((u) => (
                      <MenuItem key={u.user_id} value={u.user_id}>
                        {u.first_name} {u.last_name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography gutterBottom display="flex">
                    Store Keeper <Asteriks />
                  </Typography>
                  <TextField
                    fullWidth
                    select
                    value={formData.storeKeeper}
                    onChange={handleChange("storeKeeper")}
                  >
                    {userList.map((u) => (
                      <MenuItem key={u.user_id} value={u.user_id}>
                        {u.first_name} {u.last_name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>

              {/* Contact */}
              <Grid container spacing={3} mt={1}>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography gutterBottom display="flex">
                    Contact Information <Asteriks />
                  </Typography>
                  <TextField
                    fullWidth
                    type="email"
                    value={formData.contactInfo}
                    onChange={handleChange("contactInfo")}
                    placeholder="Enter email address"
                  />
                </Grid>
              </Grid>

              {/* Submit */}
              <Box mt={4}>
                <Button
                  variant="contained"
                  onClick={handleAddLocation}
                  disabled={loadingLocations || loadingConfig}
                  sx={{ fontSize: 16, px: 3, py: 1.5 }}
                >
                  {(loadingLocations || loadingConfig) && (
                    <CircularProgress size={20} />
                  )}
                  {!(loadingLocations || loadingConfig) && "Add Location"}
                </Button>
              </Box>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationForm;
