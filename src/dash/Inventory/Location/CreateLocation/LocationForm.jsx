import { useState, useEffect, useCallback } from "react";
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
  const routerLocation = useLocation();
  const { tenantData } = useTenant();
  const tenantSchema = tenantData?.tenant_schema_name;

  const fromWizard = routerLocation.state?.openForm === true;

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

  // Fetch locations and config on mount
  useEffect(() => {
    getLocationList();
    getMultiLocation();
  }, [getLocationList, getMultiLocation]);

  // Auto-generate location code
  useEffect(() => {
    if (
      !loadingLocations &&
      Array.isArray(locationList) &&
      !formData.locationCode
    ) {
      const suffix = String(locationList.length + 1).padStart(4, "0");
      setFormData((prev) => ({ ...prev, locationCode: suffix }));
    }
  }, [loadingLocations, locationList, formData.locationCode]);

  // Restore from draft
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setFormData(JSON.parse(saved));
      } catch {
        // Invalid JSON - ignore
      }
    }
  }, []);

  // Auto-save on data change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);

  const handleChange = useCallback(
    (field) => (e) =>
      setFormData((prev) => ({ ...prev, [field]: e.target.value })),
    []
  );

  const handleCodeBlur = () => {
    if (formData.locationCode && !/\d+$/.test(formData.locationCode)) {
      const suffix = String((locationList?.length || 0) + 1).padStart(4, "0");
      setFormData((prev) => ({
        ...prev,
        locationCode: prev.locationCode.toUpperCase() + suffix,
      }));
    }
  };

  const resetForm = () => {
    setFormData(initialFormState);
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleAddLocation = async () => {
    if (loadingLocations || loadingConfig) return;

    let canAdd = true;

    if (locationList.length >= 3 && multiLocationList?.is_activated === false) {
      canAdd = false;
      const { isConfirmed } = await Swal.fire({
        title: "Multi-Location Disabled",
        text: "To create multiple locations, please enable it in Configuration.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Enable Now",
      });

      if (isConfirmed) {
        return history.push(
          `/${tenantSchema}/inventory/location-configuration`
        );
      }
    }

    // Validate required fields
    for (const [key, val] of Object.entries(formData)) {
      if (key !== "isHidden" && !val) {
        return Swal.fire({
          icon: "error",
          title: "Missing Fields",
          text: "Please fill all fields before submitting.",
        });
      }
    }

    const newLocation = { id: Date.now(), ...formData };

    if (canAdd) {
      try {
        const result = await createLocation(newLocation);
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
        const messages = Object.values(err || {}).filter(Boolean);
        return Swal.fire({
          icon: "error",
          title: "Error",
          text: messages.length
            ? messages.join(", ")
            : err?.message || "An error occurred.",
        });
      }
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
              <div className="location-form-info">
                <Typography variant="h6">Location Information</Typography>
                <Button onClick={history.goBack} sx={{ mt: 2 }}>
                  Close
                </Button>
              </div>

              <Box mt={3}>
                <Grid container spacing={3}>
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
                    <MenuItem value="Alice Johnson">Alice Johnson</MenuItem>
                    <MenuItem value="Michael Brown">Michael Brown</MenuItem>
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
                    <MenuItem value="Adams">Adams</MenuItem>
                    <MenuItem value="Susan Keys">Susan Keys</MenuItem>
                  </TextField>
                </Grid>
              </Grid>

              <Grid container spacing={3} mt={1}>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography gutterBottom display="flex">
                    Contact Information <Asteriks />
                  </Typography>
                  <TextField
                    fullWidth
                    value={formData.contactInfo}
                    onChange={handleChange("contactInfo")}
                    placeholder="Enter Contact Information"
                  />
                </Grid>
              </Grid>

              <Box mt={4}>
                <Button
                  variant="contained"
                  onClick={handleAddLocation}
                  disabled={loadingLocations || loadingConfig}
                  sx={{ fontSize: 16, px: 3, py: 1.5 }}
                >
                  {loadingLocations ? (
                    <CircularProgress size={20} />
                  ) : (
                    "Add Location"
                  )}
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
