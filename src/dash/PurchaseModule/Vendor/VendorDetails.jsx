import React, { useEffect } from "react";
import "./VendorDetails.css";
import { Link, useParams } from "react-router-dom";
import { usePurchase } from "../../../context/PurchaseContext";
import { Box, Button, Typography } from "@mui/material";

export default function VendorDetails() {
  const { fetchSingleVendors, singleVendors } = usePurchase();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      fetchSingleVendors(id);
    }
  }, [id, fetchSingleVendors]);

  return (
    <Box p={2} pr={10}>
      <Link to="new">
        <Button variant="contained" disableElevation sx={{ mb: "16px" }}>
          New Vendor
        </Button>
      </Link>

      <Box
        bgcolor={"white"}
        p={4}
        borderRadius={4}
        border={1}
        borderColor={"#E2E6E9"}
      >
        <Box display={"flex"} justifyContent={"space-between"}>
          <Typography variant="h5" color={"#3B7CED"} fontSize={"20px"}>
            Basic Information
          </Typography>
          <Button type="button" onClick={() => window.history.back()}>
            Close
          </Button>
        </Box>

        <div className="vendet3">
          <div className="vendet3a">
            <label>Vendor Name</label>
            <p className="vendet3b">{singleVendors.company_name}</p>
          </div>

          <div className="vendet3a">
            <label>Email Address</label>
            <p className="vendet3b">{singleVendors.email}</p>
          </div>
        </div>

        <div className="vendet4">
          <div className="vendet4a">
            <label>Phone Number</label>
            <p className="vendet4b">{singleVendors.phone_number}</p>
          </div>
          <div className="vendet4a">
            <label>Address</label>
            <p className="vendet4b">{singleVendors.address}</p>
          </div>
          <div className="vendet4a">
            <label>Image</label>
            <img
              src={`data:image/png;base64,${singleVendors.image}`}
              alt={singleVendors.vendorName}
              className="vendet4b"
              style={{ width: "50px", height: "50px" }}
            />
          </div>
        </div>
      </Box>
    </Box>
  );
}
