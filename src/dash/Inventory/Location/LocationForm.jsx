import { useState, useEffect } from "react";
import { FaCaretLeft, FaCaretRight } from "react-icons/fa";
import { useHistory } from "react-router-dom";
import autosave from "../../../image/autosave.svg";
import Swal from "sweetalert2";
import "./LocationForm.css";
import {
  Grid,
  TextField,
  Box,
  Divider,
  Typography,
  Button,
} from "@mui/material";

const LocationForm = () => {
  const [locationName, setLocationName] = useState(""); // User-inputted location name
  const [locationCode, setLocationCode] = useState(""); // User-inputted location code
  const [locationType] = useState("Internal");
  const [address, setAddress] = useState("");
  const [locationManager, setLocationManager] = useState("");
  const [storeKeeper, setStoreKeeper] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [locations, setLocations] = useState([]);
  const [showForm, setShowForm] = useState(true);
  const [multiLocationEnabled, setMultiLocationEnabled] = useState(false);

  const history = useHistory();

  useEffect(() => {
    const savedLocations = JSON.parse(localStorage.getItem("locations")) || [];
    setLocations(savedLocations);

    const isMultiLocationEnabled = JSON.parse(
      localStorage.getItem("multiLocationEnabled")
    );
    setMultiLocationEnabled(isMultiLocationEnabled || false);
  }, []);

  const handleLocationCodeBlur = () => {
    // Append code ID if not already appended
    if (!locationCode.match(/\d+$/)) {
      const codeID = String(locations.length + 1).padStart(4, "0");
      setLocationCode((prevCode) => `${prevCode}${codeID}`);
    }
  };

  const handleAddLocation = () => {
    if (locations.length > 0 && !multiLocationEnabled) {
      Swal.fire({
        title: "Multi-Location Disabled",
        text: "To create multiple locations, please enable the multi-location setting in the Configuration page.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Okay, Enable",
        cancelButtonText: "Cancel",
        customClass: {
          confirmButton: "swal-button-blue",
        },
      }).then((result) => {
        if (result.isConfirmed) {
          history.push("/location-configuration");
        }
      });
      return;
    }

    if (
      !locationName ||
      !locationCode ||
      !address ||
      !locationManager ||
      !storeKeeper ||
      !contactInfo
    ) {
      alert("All fields must be filled before adding a location.");
      return;
    }

    const newLocation = {
      locationCode,
      locationName,
      locationType,
      address,
      locationManager,
      storeKeeper,
      contactInfo,
    };

    const updatedLocations = [...locations, newLocation];
    localStorage.setItem("locations", JSON.stringify(updatedLocations));
    setLocations(updatedLocations);

    setLocationName("");
    setLocationCode("");
    setAddress("");
    setLocationManager("");
    setStoreKeeper("");
    setContactInfo("");
  };

  const onClose = () => {
    // Navigate back to the location screen when cancel is clicked
    history.push("/location");
  };

  if (!showForm) {
    return null;
  }

  return (
    <div className="inven-header">
      <div className="location-form-wrapper fade-in">
        <div className="location-form-container">
          <div className="location-form-header">
            <div className="location-header-left">
              <p className="location-title">New Location</p>
              <div className="location-autosave">
                <p>Autosaved</p>
                <img src={autosave} alt="Autosaved" />
              </div>
            </div>
          </div>
          <div className="location-form-content">
            <form className="location-form-fields">
              <div className="location-form-info">
                <p style={{ fontSize: "20px" }}>Location Information</p>
                <button
                  type="button"
                  className="location-cancel-button"
                  style={{ marginTop: "1rem", cursor: "pointer" }}
                  onClick={onClose}
                >
                  Cancel
                </button>
              </div>
              <br />
              <Box>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="body1" gutterBottom>
                      Location Code
                    </Typography>
                    <TextField
                      fullWidth
                      variant="outlined"
                      type="text"
                      value={locationCode}
                      onChange={(e) =>
                        setLocationCode(e.target.value.toUpperCase())
                      }
                      onBlur={handleLocationCodeBlur} // Append code ID on blur
                      placeholder="Enter Location Code"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="body1" gutterBottom>
                      Location Name
                    </Typography>
                    <TextField
                      fullWidth
                      variant="outlined"
                      type="text"
                      value={locationName}
                      onChange={(e) => setLocationName(e.target.value)}
                      placeholder="Enter Location Name"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="body1" gutterBottom>
                      Location Type
                    </Typography>
                    <span className="location-type-text">{locationType}</span>
                  </Grid>
                </Grid>

                <Divider
                  sx={{
                    marginY: "32px",
                    borderColor: "#E2E6E9",
                    borderWidth: "1.2px",
                  }}
                />
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography gutterBottom>Address</Typography>
                  <TextField
                    fullWidth
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter Location Address"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography gutterBottom>Location Manager</Typography>
                  <TextField
                    fullWidth
                    select
                    value={locationManager}
                    onChange={(e) => setLocationManager(e.target.value)}
                    placeholder="Select Location Manager"
                  >
                    <option value="Alice Johnson">Alice Johnson</option>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography gutterBottom>Store Keeper</Typography>
                  <TextField
                    fullWidth
                    select
                    value={storeKeeper}
                    onChange={(e) => setStoreKeeper(e.target.value)}
                    placeholder="Select Store Keeper"
                  >
                    <option value="Adams">Adams</option>
                  </TextField>
                </Grid>
              </Grid>
              <Grid container spacing={3} mt={1}>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography gutterBottom>Contact Information</Typography>
                  <TextField
                    fullWidth
                    type="text"
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                    placeholder="Enter Contact Information"
                  />
                </Grid>
              </Grid>
              <div
                className="location-form-footer"
                style={{ marginTop: "32px", justifyContent: "flex-start" }}
              >
                <button
                  type="button"
                  className="add-location-button"
                  onClick={handleAddLocation}
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    float: "left",
                    padding: "12px 20px",
                    fontSize: "18px",
                  }}
                >
                  Add Location
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationForm;
