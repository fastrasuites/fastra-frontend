import React, { useState, useEffect } from "react";
import { Link, useHistory } from "react-router-dom";
import {
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import "./Location.css";
import { useLocation } from "react-router-dom";
import LocationStep from "./LocationStep";
import { useTenant } from "../../../context/TenantContext";

const locationType = [
  {
    type: "Suppliers Location",
    desc: "Products coming in from suppliers (PO).",
  },
  {
    type: "Customers Location",
    desc: "Product going out to customers (deliveries).",
  },
];

function Location() {
  const [locations, setLocations] = useState([]);
  const tenant_schema_name = useTenant().tenantData?.tenant_schema_name;

  useEffect(() => {
    // Fetch data from localStorage when the component mounts
    const storedLocations = JSON.parse(localStorage.getItem("locations")) || [];
    setLocations(storedLocations);
  }, []);

  // Location wizard ===========================
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const location = useLocation();

  useEffect(() => {
    if (location.state?.step) {
      setCurrentStep(location.state.step);
      setIsModalOpen(true);
    } else {
      const timer = setTimeout(() => {
        setIsModalOpen(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  // End ---------------------------------------------------------------------------

  return (
    <div className="location-contain">
      <div style={{ padding: "20px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <Link to={`/${tenant_schema_name}/inventory/location/create-inventory-location`}>
          <button
            className="create-location"
          >
            Create Location
          </button>
          </Link>
          
          <TextField
            variant="outlined"
            placeholder="Search"
            size="small"
            style={{ width: "200px" }}
          />
        </div>

        {/* Location Type Table */}
        <TableContainer
          component={Paper}
          style={{ marginTop: "20px", width: "50%" }}
        >
          <Table>
            <TableBody>
              {locationType.map((location, index) => (
                <TableRow
                  key={location.type}
                  style={{
                    backgroundColor: index % 2 === 0 ? "#f2f2f2" : "white",
                  }}
                >
                  <TableCell
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <LocationOnIcon className="LocationOnIcon" />
                    {location.type}
                  </TableCell>
                  <TableCell>{location.desc}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Locations Table */}
        <TableContainer component={Paper} style={{ marginTop: "20px" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox color="primary" />
                </TableCell>
                <TableCell>Location ID</TableCell>
                <TableCell>Location Name</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>Phone Number</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {locations.map((location, index) => (
                <TableRow
                  key={location.id}
                  style={{
                    backgroundColor: index % 2 === 0 ? "#f2f2f2" : "white",
                  }}
                >
                  <TableCell padding="checkbox">
                    <Checkbox color="primary" />
                  </TableCell>
                  <TableCell
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <LocationOnIcon className="LocationOnIcon" />
                    {location.locationCode}
                  </TableCell>
                  <TableCell>{location.locationName}</TableCell>
                  <TableCell>{location.address}</TableCell>
                  <TableCell>{location.contactInfo}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      <LocationStep
        open={isModalOpen}
        onClose={handleCloseModal}
        step={currentStep}
      />
    </div>
  );
}

export default Location;
