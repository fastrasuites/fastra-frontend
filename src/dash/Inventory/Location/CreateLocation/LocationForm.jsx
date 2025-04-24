import { useState, useEffect, useCallback } from "react";
import { useHistory } from "react-router-dom";
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

const LOCATION_TYPE = "Internal";
const STORAGE_KEY = "draftLocationForm";

const LocationForm = () => {
  const history = useHistory();
  const {
    locationList,
    getLocationList,
    createLocation,
    isLoading: loadingLocations,
    error: locationsError,
  } = useCustomLocation();
  const {
    multiLocationList,
    getMultiLocation,
    isLoading: loadingConfig,
    error: configError,
  } = useLocationConfig();

  const [isMultiLocationEnabled, setIsMultiLocationEnabled] = useState(false);
  const [formData, setFormData] = useState({
    locationCode: "",
    locationName: "",
    address: "",
    locationManager: "",
    storeKeeper: "",
    contactInfo: "",
    isHidden: false,
  });

  // 1. Fetch both lists on mount
  useEffect(() => {
    getLocationList();
    getMultiLocation();
  }, [getLocationList, getMultiLocation]);

  // 2. Sync multi-location toggle
  useEffect(() => {
    if (multiLocationList.length > 0) {
      setIsMultiLocationEnabled(multiLocationList[0].is_activated);
    }
  }, [multiLocationList]);

  // 3. Restore draft from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setFormData(JSON.parse(saved));
      } catch { /* ignore parse errors */ }
    }
  }, []);

  // 4. Autosave on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);

  const handleChange = useCallback(
    (field) => (e) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    },
    []
  );

  const handleCodeBlur = () => {
    // Append a numeric suffix only if user hasn't already included digits
    if (formData.locationCode && !/\d+$/.test(formData.locationCode)) {
      const suffix = String((locationList?.length || 0) + 1).padStart(4, "0");
      setFormData((prev) => ({
        ...prev,
        locationCode: prev.locationCode.toUpperCase() + suffix,
      }));
    }
  };

  const resetForm = () => {
    const blank = {
      locationCode: "",
      locationName: "",
      address: "",
      locationManager: "",
      storeKeeper: "",
      contactInfo: "",
      isHidden: false,
    };
    setFormData(blank);
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleAddLocation = async () => {
    // Prevent if loading
    if (loadingLocations || loadingConfig) return;

    // If you already have one location and multi is disabled, prompt
    if (locationList.length > 0 && !isMultiLocationEnabled) {
      const { isConfirmed } = await Swal.fire({
        title: "Multi-Location Disabled",
        text: "To create multiple locations, please enable it in Configuration.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Enable Now",
      });
      if (isConfirmed) history.push("/location-configuration");
      return;
    }

    // Simple required-fields check
    for (const [key, val] of Object.entries(formData)) {
      if (key !== "isHidden" && !val) {
        return Swal.fire({
          icon: "error",
          title: "Missing Fields",
          text: "Please fill all fields before submitting.",
        });
      }
    }

    // Construct payload
    const newLocation = {
      id: Date.now(),
      locationCode: formData.locationCode,
      locationName: formData.locationName,
      locationType: LOCATION_TYPE,
      address: formData.address,
      locationManager: formData.locationManager,
      storeKeeper: formData.storeKeeper,
      contactInfo: formData.contactInfo,
      isHidden: formData.isHidden,
    };

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
      }
    } 
    catch (err) {
      // Show validation errors if present
      if (err && typeof err === "object") {
        const msgs = Object.values(err).filter(Boolean);
        if (msgs.length) {
          return Swal.fire({
            icon: "error",
            title: "Validation Error",
            text: "Error submitting the form.",
          });
        }
      }
      Swal.fire({
        icon: "error",
        title: "Submission Error",
        text: "Failed to submit the location data.",
      });
    }
  };

  const handleCancel = () => history.goBack();

  // 5. Render
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
                <Button onClick={handleCancel} sx={{ mt: 2 }}>
                  Close
                </Button>
              </div>

              <Box mt={3}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography gutterBottom>Location Code</Typography>
                    <TextField
                      fullWidth
                      value={formData.locationCode}
                      onChange={handleChange("locationCode")}
                      onBlur={handleCodeBlur}
                      placeholder="Enter Location Code"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <Typography gutterBottom>Location Name</Typography>
                    <TextField
                      fullWidth
                      value={formData.locationName}
                      onChange={handleChange("locationName")}
                      placeholder="Enter Location Name"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <Typography gutterBottom>Location Type</Typography>
                    <Typography sx={{ pt: 1 }}>{LOCATION_TYPE}</Typography>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 4 }} />
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography gutterBottom>Address</Typography>
                  <TextField
                    fullWidth
                    value={formData.address}
                    onChange={handleChange("address")}
                    placeholder="Enter Location Address"
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <Typography gutterBottom>Location Manager</Typography>
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
                  <Typography gutterBottom>Store Keeper</Typography>
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
                  <Typography gutterBottom>Contact Information</Typography>
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
                  {loadingLocations ? <CircularProgress size={20} /> : "Add Location"}
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
