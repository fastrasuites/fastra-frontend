import { useState, useEffect } from "react";
import { FaCaretLeft, FaCaretRight } from "react-icons/fa";
import { useHistory } from "react-router-dom";
import autosave from "../../../image/autosave.svg";
import Swal from "sweetalert2";
import "./LocationForm.css";
import {
    Grid, TextField, Box, Divider, Typography, Button
} from "@mui/material";
import InventoryHeader from "../InventoryHeader";

const LocationForm = () => {
    const [locationName, setLocationName] = useState(''); // User-inputted location name
    const [locationCode, setLocationCode] = useState(''); // Auto-generated location code
    const [locationType] = useState('Internal');
    const [address, setAddress] = useState('');
    const [locationManager, setLocationManager] = useState('');
    const [storeKeeper, setStoreKeeper] = useState('');
    const [contactInfo, setContactInfo] = useState('');
    const [locations, setLocations] = useState([]);
    const [showForm, setShowForm] = useState(true);
    const [multiLocationEnabled, setMultiLocationEnabled] = useState(false);

    const history = useHistory();

    useEffect(() => {
        const savedLocations = JSON.parse(localStorage.getItem('locations')) || [];
        setLocations(savedLocations);
    
        // Check multi-location setting
        const isMultiLocationEnabled = JSON.parse(localStorage.getItem('multiLocationEnabled'));
        setMultiLocationEnabled(isMultiLocationEnabled || false);
    }, []);

    useEffect(() => {
        if (locationName) {
            // Automatically generate location code when the user types the location name
            const codeBase = locationName.toUpperCase(); // Convert the location name to uppercase
            const nextCode = codeBase + String(locations.length + 1).padStart(4, '0');
            setLocationCode(nextCode);
        }
    }, [locationName, locations.length]); // Update location code whenever location name or the number of locations changes

    const handleAddLocation = () => {
        const multiLocationEnabled = JSON.parse(localStorage.getItem('multiLocationEnabled'));

        // Check if multi-location is disabled and location already exists
        if (locations.length > 0 && !multiLocationEnabled) {
            Swal.fire({
                title: "Multi-Location Disabled",
                text: "To create multiple locations, please enable the multi-location setting in the Configuration page.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Okay, Enable",
                cancelButtonText: "Cancel",
                customClass: {
                    confirmButton: 'swal-button-blue', // Custom class for styling
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    history.push("/location-configuration");
                }
            });
            return;
        }
    
        // Validate fields
        if (!locationName || !address || !locationManager || !storeKeeper || !contactInfo) {
            alert("All fields must be filled before adding a location.");
            return;
        }
    
        // Add location as before
        const newLocation = {
            locationCode, // This will now be user-inputted or system-generated
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
    };

    const onClose = () => {
        setShowForm(false);
    };

    if (!showForm) {
        return null;
    }

    return (
        <div className="inven-header">
            <InventoryHeader />
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
                                            disabled
                                            placeholder="Location Code Auto-generated"
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
                                            onChange={(e) => setLocationName(e.target.value.toUpperCase())} // Convert to uppercase as the user types
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
        </div>
    );
}

export default LocationForm;


// import { useState, useEffect } from "react";
// import { FaCaretLeft, FaCaretRight } from "react-icons/fa";
// import { useHistory } from "react-router-dom";
// import autosave from "../../../image/autosave.svg";
// import Swal from "sweetalert2";
// import "./LocationForm.css";
// import {
//     Grid, TextField, Box, Divider, Typography, Button
// } from "@mui/material";
// import InventoryHeader from "../InventoryHeader";

// const LocationForm = () => {
//     const [locationCode, setLocationCode] = useState('');
//     const [locationName, setLocationName] = useState('');
//     const [locationType] = useState('Internal');
//     const [address, setAddress] = useState('');
//     const [locationManager, setLocationManager] = useState('');
//     const [storeKeeper, setStoreKeeper] = useState('');
//     const [contactInfo, setContactInfo] = useState('');
//     const [locations, setLocations] = useState([]);
//     const [showForm, setShowForm] = useState(true);
//     const [multiLocationEnabled, setMultiLocationEnabled] = useState(false);

//     const history = useHistory();

//     useEffect(() => {
//         const savedLocations = JSON.parse(localStorage.getItem('locations')) || [];
//         setLocations(savedLocations);
    
//         // Check multi-location setting
//         const isMultiLocationEnabled = JSON.parse(localStorage.getItem('multiLocationEnabled'));
//         setMultiLocationEnabled(isMultiLocationEnabled || false);
    
//         // Generate next location code
//         const nextCode = 'LOC' + String(savedLocations.length + 1).padStart(4, '0');
//         setLocationCode(nextCode);
//     }, []);
    
//     const handleAddLocation = () => {
//         const multiLocationEnabled = JSON.parse(localStorage.getItem('multiLocationEnabled'));

//         // Check if multi-location is disabled and location already exists
//         if (locations.length > 0 && !multiLocationEnabled) {
//             Swal.fire({
//                 title: "Multi-Location Disabled",
//                 text: "To create multiple locations, please enable the multi-location setting in the Configuration page.",
//                 icon: "warning",
//                 showCancelButton: true,
//                 confirmButtonText: "Okay, Enable",
//                 cancelButtonText: "Cancel",
//                 customClass: {
//                     confirmButton: 'swal-button-blue', // Custom class for styling
//                 }
//             }).then((result) => {
//                 if (result.isConfirmed) {
//                     history.push("/location-configuration");
//                 }
//             });
//             return;
//         }
    
//         // Validate fields
//         if (!locationName || !address || !locationManager || !storeKeeper || !contactInfo) {
//             alert("All fields must be filled before adding a location.");
//             return;
//         }
    
//         // Add location as before
//         const newLocation = {
//             locationCode,
//             locationName,
//             locationType,
//             address,
//             locationManager,
//             storeKeeper,
//             contactInfo,
//         };
    
//         // Save to LocalStorage
//         const updatedLocations = [...locations, newLocation];
//         localStorage.setItem('locations', JSON.stringify(updatedLocations));
//         setLocations(updatedLocations);
    
//         // Reset form fields
//         setLocationName('');
//         setAddress('');
//         setLocationManager('');
//         setStoreKeeper('');
//         setContactInfo('');
    
//         // Generate new location code for next entry
//         const nextCode = 'LOC' + String(updatedLocations.length + 1).padStart(4, '0');
//         setLocationCode(nextCode);
//     };
    
//     const onClose = () => {
//         setShowForm(false);
//     };

//     if (!showForm) {
//         return null;
//     }

//     return (
//         <div className="inven-header">
//             <InventoryHeader />
//         <div className="location-form-wrapper fade-in">
//             <div className="location-form-container">
//                 <div className="location-form-header">
//                     <div className="location-header-left">
//                         <p className="location-title">New Location</p>
//                         <div className="location-autosave">
//                             <p>Autosaved</p>
//                             <img src={autosave} alt="Autosaved" />
//                         </div>
//                     </div>
//                 </div>
//                 <div className="location-form-content">
//                     <form className="location-form-fields">
//                         <div className="location-form-info">
//                             <p style={{ fontSize: "20px" }}>Location Information</p>
//                             <button
//                                 type="button"
//                                 className="location-cancel-button"
//                                 style={{ marginTop: "1rem" }}
//                                 onClick={onClose}
//                             >
//                                 Cancel
//                             </button>
//                         </div>

//                         {/* Location Information */}
//                         <Box>
//                             <Grid container spacing={3}>
//                                 <Grid item xs={12} sm={6} md={4}>
//                                     <Typography variant="body1" gutterBottom>
//                                         Location Code
//                                     </Typography>
//                                     <TextField
//                                         fullWidth
//                                         variant="outlined"
//                                         type="text"
//                                         value={locationCode}
//                                         readOnly
//                                         placeholder="Location Code"
//                                     />
//                                 </Grid>
//                                 <Grid item xs={12} sm={6} md={4}>
//                                     <Typography variant="body1" gutterBottom>
//                                         Location Name
//                                     </Typography>
//                                     <TextField
//                                         fullWidth
//                                         variant="outlined"
//                                         type="text"
//                                         value={locationName}
//                                         onChange={(e) => setLocationName(e.target.value)}
//                                         placeholder="Enter Location Name"
//                                     />
//                                 </Grid>
//                                 <Grid item xs={12} sm={6} md={4}>
//                                     <Typography variant="body1" gutterBottom>
//                                         Location Type
//                                     </Typography>
//                                     <span className="location-type-text">{locationType}</span>
//                                 </Grid>
//                             </Grid>

//                             <Divider sx={{ marginY: "32px", borderColor: "#E2E6E9", borderWidth: "1.2px" }} />
//                         </Box>

//                         <Grid container spacing={3}>
//                             <Grid item xs={12} sm={6} md={4}>
//                                 <Typography gutterBottom>Address</Typography>
//                                 <TextField
//                                     fullWidth
//                                     value={address}
//                                     onChange={(e) => setAddress(e.target.value)}
//                                     placeholder="Enter Location Address"
//                                 />
//                             </Grid>
//                             <Grid item xs={12} sm={6} md={4}>
//                                 <Typography gutterBottom>Location Manager</Typography>
//                                 <TextField
//                                     fullWidth
//                                     select
//                                     value={locationManager}
//                                     onChange={(e) => setLocationManager(e.target.value)}
//                                     placeholder="Select Location Manager"
//                                 >
//                                     <option value="Alice Johnson">Alice Johnson</option>
//                                 </TextField>
//                             </Grid>
//                             <Grid item xs={12} sm={6} md={4}>
//                                 <Typography gutterBottom>Store Keeper</Typography>
//                                 <TextField
//                                     fullWidth
//                                     select
//                                     value={storeKeeper}
//                                     onChange={(e) => setStoreKeeper(e.target.value)}
//                                     placeholder="Select Store Keeper"
//                                 >
//                                     <option value="Adams">Adams</option>
//                                 </TextField>
//                             </Grid>
//                         </Grid>
//                         <Grid container spacing={3} mt={1}>
//                             <Grid item xs={12} sm={6} md={4}>
//                                 <Typography gutterBottom>Contact Information</Typography>
//                                 <TextField
//                                     fullWidth
//                                     type="text"
//                                     value={contactInfo}
//                                     onChange={(e) => setContactInfo(e.target.value)}
//                                     placeholder="Enter Contact Information"
//                                 />
//                             </Grid>
//                         </Grid>
//                         <div className="location-form-footer" style={{ marginTop: "32px", justifyContent: "flex-start" }}>
//                             <button
//                                 type="button"
//                                 className="add-location-button"
//                                 onClick={handleAddLocation}
//                                 style={{
//                                     display: "flex",
//                                     justifyContent: "center",
//                                     float: "left",
//                                 }}
//                             >
//                                 Add Location
//                             </button>
//                             </div>
//                     </form>
//                 </div>
//             </div>
//         </div> </div>
//     );
// }

// export default LocationForm;