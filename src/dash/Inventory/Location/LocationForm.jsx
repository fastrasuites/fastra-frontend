import React, { useState, useEffect } from "react";
import { FaCaretLeft, FaCaretRight } from "react-icons/fa";
import autosave from "../../../image/autosave.svg";
import "./LocationForm.css";
import {
    Grid, TextField, Box, Divider, Typography, Button
} from "@mui/material";

const LocationForm = () => {
    const [locationCode, setLocationCode] = useState('');
    const [locationName, setLocationName] = useState('');
    const [locationType] = useState('Internal');
    const [address, setAddress] = useState('');
    const [locationManager, setLocationManager] = useState('');
    const [storeKeeper, setStoreKeeper] = useState('');
    const [contactInfo, setContactInfo] = useState('');
    const [locations, setLocations] = useState([]);
    const [showForm, setShowForm] = useState(true);

    useEffect(() => {
        const savedLocations = JSON.parse(localStorage.getItem('locations')) || [];
        setLocations(savedLocations);

        // Generate next location code
        const nextCode = 'LOC' + String(savedLocations.length + 1).padStart(4, '0');
        setLocationCode(nextCode);
    }, []);

    const handleAddLocation = () => {
        // Validate fields
        if (!locationName || !address || !locationManager || !storeKeeper || !contactInfo) {
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

        // Save to LocalStorage
        const updatedLocations = [...locations, newLocation];
        localStorage.setItem('locations', JSON.stringify(updatedLocations));
        setLocations(updatedLocations);

        // Reset form fields
        setLocationName('');
        setAddress('');
        setLocationManager('');
        setStoreKeeper('');
        setContactInfo('');

        // Generate new location code for next entry
        const nextCode = 'LOC' + String(updatedLocations.length + 1).padStart(4, '0');
        setLocationCode(nextCode);
    };

    const onClose = () => {
        setShowForm(false);
    };

    if (!showForm) {
        return null;
    }

    return (
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
                                style={{ marginTop: "1rem" }}
                                onClick={onClose}
                            >
                                Cancel
                            </button>
                        </div>

                        {/* Location Information */}
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
                                        readOnly
                                        placeholder="Location Code"
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

                            <Divider sx={{ marginY: "32px", borderColor: "#E2E6E9", borderWidth: "1.2px" }} />
                        </Box>

                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6} md={4}>
                                <Typography gutterBottom>Address</Typography>
                                <TextField
                                    fullWidth
                                    type="email"
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
                                    {/* Add options for managers */}
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
                                    {/* Add options for store keepers */}
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
                        <div className="location-form-footer" style={{ marginTop: "32px", justifyContent: "flex-start" }}>
                            <button
                                type="button"
                                className="add-location-button"
                                onClick={handleAddLocation}
                                style={{
                                    display: "flex",
                                    justifyContent: "center",
                                    float: "left",
                                }}
                            >
                                Add Location
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default LocationForm;
