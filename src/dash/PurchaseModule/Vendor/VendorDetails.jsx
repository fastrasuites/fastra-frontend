import React, { useEffect } from "react";
import "./VendorDetails.css";
import { Link, useParams } from "react-router-dom";
import { usePurchase } from "../../../context/PurchaseContext";
import { Box, Button, Typography } from "@mui/material";

import fallbackImg from "../../../assets/images/fallback-user.png";
import Can from "../../../components/Access/Can";

export default function VendorDetails() {
  const { fetchSingleVendors, singleVendors } = usePurchase();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      fetchSingleVendors(id);
    }
  }, [id, fetchSingleVendors]);

  const { company_name, email, phone_number, address, profile_picture } =
    singleVendors || {};

  return (
    <Box p={2} pr={10}>
      <Can app="purchase" module="vendor" action="create">
        <Link to="new">
          <Button variant="contained" disableElevation sx={{ mb: 2 }}>
            New Vendor
          </Button>
        </Link>
      </Can>

      <Box
        bgcolor="white"
        p={4}
        borderRadius={4}
        border={1}
        borderColor="#E2E6E9"
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" color="#3B7CED" fontSize="20px">
            Basic Information
          </Typography>
          <Box display={"flex"} gap={2}>
            <Button variant="text" onClick={() => window.history.back()}>
              Close
            </Button>
            <Can app="purchase" module="vendor" action="edit">
              <Link to={`edit/${id}`}>
                <Button variant="contained" disableElevation>
                  Edit
                </Button>
              </Link>
            </Can>
          </Box>
        </Box>

        <div className="vendet3">
          <div className="vendet3a">
            <label>Vendor Name</label>
            <p className="vendet3b">{company_name || "N/A"}</p>
          </div>

          <div className="vendet3a">
            <label>Email Address</label>
            <p className="vendet3b">{email || "N/A"}</p>
          </div>
        </div>

        <div className="vendet4">
          <div className="vendet4a">
            <label>Phone Number</label>
            <p className="vendet4b">{phone_number || "N/A"}</p>
          </div>

          <div className="vendet4a">
            <label>Address</label>
            <p className="vendet4b">{address || "N/A"}</p>
          </div>

          <div className="vendet4a">
            <label>Image</label>
            <img
              src={
                profile_picture
                  ? `data:image/png;base64,${profile_picture}`
                  : fallbackImg
              }
              alt={company_name || "Vendor"}
              className="vendet4b"
              style={{ width: 50, height: 50, objectFit: "cover" }}
            />
          </div>
        </div>
      </Box>
    </Box>
  );
}
