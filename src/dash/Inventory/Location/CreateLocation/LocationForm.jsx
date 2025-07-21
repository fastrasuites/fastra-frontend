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
  const { state } = useLocation(initialFormState);
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

  const [formData, setFormData] = useState({
    locationCode: "",
    locationName: "",
    locationType: LOCATION_TYPES[0].value,
    address: "",
    locationManager: "",
    storeKeeper: "",
    contactInfo: "",
    isHidden: false,
  });

  // Fetch data on mount
  useEffect(() => {
    getLocationList();
    getMultiLocation();
    getUserList();
  }, [getLocationList, getMultiLocation, getUserList]);

  // Restore saved form state
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setFormData(JSON.parse(saved));
      } catch (e) {
        console.error("Invalid saved form state");
      }
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
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const resetForm = () => {
    setFormData({
      locationCode: "",
      locationName: "",
      locationType: LOCATION_TYPES[0].value,
      address: "",
      locationManager: "",
      storeKeeper: "",
      contactInfo: "",
      isHidden: false,
    });
    localStorage.removeItem(STORAGE_KEY);
  };

  const validateForm = useCallback(() => {
    const errors = [];

    const isEmail = /\S+@\S+\.\S+/;

    if (!formData.locationCode) errors.push("Location Code is required.");
    else if (formData.locationCode.length > 4)
      errors.push("Location Code must be 4 characters or less.");

    if (!formData.locationName) errors.push("Location Name is required.");
    else if (formData.locationName.length > 50)
      errors.push("Location Name must be 50 characters or less.");

    if (!formData.address) errors.push("Address is required.");
    else if (formData.address.length > 100)
      errors.push("Address must be 100 characters or less.");

    if (
      !formData.locationType ||
      !["internal", "partner"].includes(formData.locationType)
    )
      errors.push("Location Type must be either 'Internal' or 'Partner'.");

    if (!formData.locationManager) errors.push("Location Manager is required.");
    if (!formData.storeKeeper) errors.push("Store Keeper is required.");

    if (!formData.contactInfo) errors.push("Contact Information is required.");
    else if (!isEmail.test(formData.contactInfo))
      errors.push("Contact Information must be a valid email.");

    return errors.length ? errors : null;
  }, [formData]);

  const handleAddLocation = async () => {
    if (loadingLocations || loadingConfig) return;

    const validationErrors = validateForm();
    if (validationErrors) {
      return Swal.fire({
        icon: "error",
        title: "Validation Error",
        html: validationErrors.map((err) => `<p>${err}</p>`).join(""),
      });
    }

    if (locationList.length >= 3 && !multiLocationList?.is_activated) {
      const { isConfirmed } = await Swal.fire({
        title: "Multi-Location Disabled",
        text: "Enable multi-location in Configuration to add more.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Enable Now",
      });
      if (isConfirmed) {
        history.push(`/${tenantSchema}/inventory/location-configuration`);
      }
      return;
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
        err?.message || "An error occurred while adding the location.";
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

              <Grid container spacing={3} mt={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography gutterBottom display="flex">
                    Location Code <Asteriks />
                  </Typography>
                  <TextField
                    fullWidth
                    required
                    value={formData.locationCode}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        locationCode: e.target.value.toUpperCase().slice(0, 4),
                      }))
                    }
                    placeholder="e.g. AB12"
                    inputProps={{
                      maxLength: 4,
                      style: { textTransform: "uppercase" },
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <Typography gutterBottom display="flex">
                    Location Name <Asteriks />
                  </Typography>
                  <TextField
                    fullWidth
                    required
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
                    required
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

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography gutterBottom display="flex">
                    Address <Asteriks />
                  </Typography>
                  <TextField
                    fullWidth
                    required
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
                    required
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
                    required
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

                <Grid item xs={12} sm={6} md={4}>
                  <Typography gutterBottom display="flex">
                    Contact Information <Asteriks />
                  </Typography>
                  <TextField
                    fullWidth
                    required
                    type="email"
                    value={formData.contactInfo}
                    onChange={handleChange("contactInfo")}
                    placeholder="Enter email address"
                  />
                </Grid>
              </Grid>

              <Box mt={4}>
                <Button
                  variant="contained"
                  disabled={loadingLocations || loadingConfig}
                  onClick={handleAddLocation}
                  sx={{ fontSize: 16, px: 3, py: 1.5 }}
                >
                  {loadingLocations || loadingConfig ? (
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
