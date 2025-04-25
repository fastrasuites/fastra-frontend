import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
import LocationStep from "./LocationStep";
import { useTenant } from "../../../context/TenantContext";
import { useCustomLocation } from "../../../context/Inventory/LocationContext";
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
  const tenant_schema_name = useTenant().tenantData?.tenant_schema_name;


  // Location wizard ===========================
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const {
    locationList,
    singleLocation,
    getLocationList,
    createLocation,
    isLoading,
    error,
  } = useCustomLocation();


  useEffect(() => {
    getLocationList();
  }, []);

  console.log(locationList, "locationList");

  // useEffect(() => {
  //   if (location.state?.step) {
  //     setCurrentStep(location.state.step);
  //     setIsModalOpen(true);
  //   } else {
  //     const timer = setTimeout(() => {
  //       setIsModalOpen(true);
  //     }, 500);
  //     return () => clearTimeout(timer);
  //   }
  // }, [location.state]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };



  return (
    <div className="location-contain">
      <div style={{ padding: "20px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <Link
            to={`/${tenant_schema_name}/inventory/location/create-inventory-location`}
          >
            <button className="create-location">Create Location</button>
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
              {locationList.map((location, index) => (
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
                    {location?.id}
                  </TableCell>
                  <TableCell>{location?.location_name}</TableCell>
                  <TableCell>{location?.address}</TableCell>
                  <TableCell>{location?.contact_information}</TableCell>
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
