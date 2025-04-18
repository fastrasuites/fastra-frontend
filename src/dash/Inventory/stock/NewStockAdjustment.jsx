import { useState, useEffect } from "react";
import autosave from "../../../image/autosave.svg";
import { useHistory } from "react-router-dom";
import "../Location/LocationForm.css";
import { Grid, TextField, Box, Divider, Select, Typography, MenuItem } from "@mui/material";
import ProductLineTable from "./ProductLineTable";

const NewStockAdjustment = () => {
    const [adjustmentType, setAdjustmentType] = useState("");
    const [notes, setNotes] = useState("");
    const [locations, setLocations] = useState([]); // Stores the list of locations
    const [selectedLocation, setSelectedLocation] = useState("");
    const [showForm, setShowForm] = useState(true);
    const [productLines, setProductLines] = useState([
        { productName: "", unitOfMeasure: "Kg", currentQuantity: 4, adjustedQuantity: 0 },
    ]);
    const [status, setStatus] = useState(""); // Store the status of the adjustment
  
    // Fetch locations from localStorage when the component mounts
    useEffect(() => {
        const storedLocations = JSON.parse(localStorage.getItem("locations")) || [];
        setLocations(storedLocations);
    
        // Auto-select if only one location exists
        if (storedLocations.length === 1) {
          setSelectedLocation(storedLocations[0].name);
        }
      }, []);
    
    const handleProductChange = (index, field, value) => {
        const updatedProductLines = [...productLines];
        updatedProductLines[index][field] = value;
        setProductLines(updatedProductLines);
    };

    const addProductLine = () => {
        setProductLines([
            ...productLines,
            { productName: "", unitOfMeasure: "Kg", currentQuantity: 0, adjustedQuantity: 0 },
        ]);
    };

    const handleValidate = () => {
        if (adjustmentType && selectedLocation && notes && productLines.every(line => line.productName && line.adjustedQuantity >= 0)) {
            console.log("Validated adjustment:", { adjustmentType, notes, selectedLocation, productLines });
            // Save the data and set status to "Done"
            setStatus("Done");
            // Perform validation logic and save the data here
        } else {
            alert("Please fill all required fields before validating.");
        }
    };

    const handleSave = () => {
        if (adjustmentType && selectedLocation && notes && productLines.every(line => line.productName && line.adjustedQuantity >= 0)) {
            console.log("Saved adjustment:", { adjustmentType, notes, selectedLocation, productLines });
            // Save the data with status "Draft"
            setStatus("Draft");
            // Add your save logic here
        } else {
            alert("Please fill all required fields before saving.");
        }
    };

    const history = useHistory();

    const onClose = () => {
        // Navigate back to screen when cancel is clicked
        history.push("/stock-adjustment"); // Use history.push for navigation
    };

    return (
        <div className="inven-header">
            <div className="location-form-wrapper fade-in">
                <div className="location-form-container">
                    <div className="location-form-header">
                        <div className="location-header-left">
                            <p className="location-title">New Stock Adjustment</p>
                            <div className="location-autosave">
                                <p>Autosaved</p>
                                <img src={autosave} alt="Autosaved" />
                            </div>
                        </div>
                    </div>
                    <div className="location-form-content">
                        <form className="location-form-fields">
                            <div className="location-form-info">
                                <p style={{ fontSize: "20px" }}>Product Information</p>
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
                            <Box sx={{ padding: "5px" }}>
                                <Grid container spacing={2}>
                                    {/* Adjustment Type */}
                                    <Grid item xs={12} sm={6} md={3}>
                                        <Typography variant="body1" gutterBottom>
                                            Adjustment Type
                                        </Typography>
                                        <TextField fullWidth value="Stock Level Update" disabled />
                                    </Grid>
                                    {/* Date */}
                                    <Grid item xs={12} sm={6} md={3}>
                                        <Typography variant="body1" gutterBottom>
                                            Date
                                        </Typography>
                                        <TextField fullWidth type="text" value={new Date().toLocaleString()} disabled />
                                    </Grid>
                                      {/* Warehouse Location */}
                                <Grid item xs={12} sm={6} md={3}>
                                <Typography variant="body1" gutterBottom>
                                     Location
                                </Typography>
                                {locations.length === 1 ? (
                                    <TextField fullWidth value={locations[0].name} disabled />
                                ) : (
                                    <Select
                                    fullWidth
                                    value={selectedLocation}
                                    onChange={(e) => setSelectedLocation(e.target.value)}
                                    displayEmpty
                                    >
                                    <MenuItem value="">Select Location</MenuItem>
                                    {locations.map((location, index) => (
                                        <MenuItem key={index} value={location.name}>
                                        {location.locationName}
                                        </MenuItem>
                                    ))}
                                    </Select>
                                )}
                                </Grid>
                                    {/* Notes */}
                                    <Grid item xs={12} sm={6} md={3}>
                                        <Typography variant="body1" gutterBottom>
                                            Notes
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            type="text"
                                            placeholder="Input your notes here"
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                        />
                                    </Grid>
                                </Grid>
                                {/* Divider */}
                                <Divider sx={{ marginY: "32px", borderColor: "#E2E6E9", borderWidth: "1.2px" }} />
                            </Box>
                            {/* Product Line Table */}
                            <section>
                                <ProductLineTable
                                    productLines={productLines}
                                    handleProductChange={handleProductChange}
                                    addProductLine={addProductLine}
                                />
                            </section>
                            <div className="location-form-footer" style={{ marginTop: "32px", justifyContent: "flex-end" }}>
                                <button
                                    type="button"
                                    className="add-location-button"
                                    style={{
                                        display: "flex",
                                        justifyContent: "center",
                                        float: "left",
                                        padding: "12px 20px",
                                        border: "1px solid #3b7ced",
                                        backgroundColor: "#fff",
                                        color: "#3b7ced",
                                        fontSize: "18px",
                                    }}
                                    onClick={handleValidate}
                                >
                                    Validate
                                </button>
                                <button
                                    type="button"
                                    className="add-location-button"
                                    style={{
                                        display: "flex",
                                        justifyContent: "center",
                                        float: "left",
                                        padding: "12px 20px",
                                        fontSize: "18px",
                                    }}
                                    onClick={handleSave}
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewStockAdjustment;
