import React, { useEffect, useState, useCallback } from "react";
import "./VendorDetails.css";
import { Link, useParams, useHistory } from "react-router-dom";
import { usePurchase } from "../../../context/PurchaseContext";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  IconButton,
  Tooltip,
} from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import fallbackImg from "../../../assets/images/fallback-user.png";
import Can from "../../../components/Access/Can";
import Swal from "sweetalert2";
import { useTenant } from "../../../context/TenantContext";

export default function VendorDetails() {
  const { id } = useParams();
  const history = useHistory();
  const { fetchSingleVendors, singleVendors: vendor } = usePurchase();
  const { tenantData } = useTenant();
  console.log(tenantData);

  const [loading, setLoading] = useState(true);
  const [navigation, setNavigation] = useState({
    nextId: null,
    prevId: null,
    loading: false,
  });

  const showError = useCallback((msg) => {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: msg,
      timer: 3000,
    });
  }, []);

  const loadVendor = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchSingleVendors(id);
      if (!res) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Vendor data is not available for this ID",
        });
        return;
      }
      loadAdjacentIds(id);
    } catch (err) {
      showError(err.message || "Failed to load vendor details");
    } finally {
      setLoading(false);
    }
  }, [fetchSingleVendors, id, showError]);

  const loadAdjacentIds = useCallback((currentId) => {
    const currentNum = parseInt(currentId, 10);
    if (isNaN(currentNum)) return;

    setNavigation({
      nextId: currentNum + 1,
      prevId: currentNum > 1 ? currentNum - 1 : null,
      loading: false,
    });
  }, []);

  const handleNavigate = useCallback(
    (newId) => {
      if (newId && !navigation.loading) {
        history.push(`${newId}`);
      }
    },
    [history, navigation.loading]
  );

  useEffect(() => {
    if (id) loadVendor();
  }, [id, loadVendor]);

  const { company_name, email, phone_number, address, profile_picture } =
    vendor || {};

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="70vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={2} pr={10}>
      <Can app="purchase" module="vendor" action="create">
        <Link to="new">
          <Button variant="contained" disableElevation sx={{ mb: 2 }}>
            New Vendor
          </Button>
        </Link>
      </Can>

      {/* Navigation Buttons */}
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Box
          display="flex"
          alignItems="center"
          gap={1}
          bgcolor="white"
          border="1px solid #E2E6E9"
          borderRadius={1}
          px={1}
          py={0.5}
        >
          <Tooltip title="Previous Vendor">
            <span>
              <IconButton
                onClick={() => handleNavigate(navigation.prevId)}
                disabled={!navigation.prevId || navigation.loading}
                size="small"
              >
                {navigation.loading ? (
                  <CircularProgress size={20} />
                ) : (
                  <ArrowBackIosIcon fontSize="small" />
                )}
              </IconButton>
            </span>
          </Tooltip>

          <Box
            sx={{
              width: "2px",
              bgcolor: "#E2E6E9",
              alignSelf: "stretch",
              borderRadius: "1px",
              marginY: "4px",
            }}
          />

          <Tooltip title="Next Vendor">
            <span>
              <IconButton
                onClick={() => handleNavigate(navigation.nextId)}
                disabled={!navigation.nextId || navigation.loading}
                size="small"
              >
                {navigation.loading ? (
                  <CircularProgress size={20} />
                ) : (
                  <ArrowForwardIosIcon fontSize="small" />
                )}
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Box>

      {/* Main Vendor Card */}
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

          <Box display="flex" gap={2}>
            <Link to={`/${tenantData.tenant_schema_name}/purchase/vendor`}>
              <Button variant="text">Close</Button>
            </Link>

            <Can app="purchase" module="vendor" action="edit">
              <Link to={`edit/${id}`}>
                <Button variant="contained" disableElevation>
                  Edit
                </Button>
              </Link>
            </Can>
          </Box>
        </Box>

        {/* Vendor Info */}
        <Box className="vendet3">
          <div className="vendet3a">
            <label>Vendor Name</label>
            <p className="vendet3b">{company_name || "N/A"}</p>
          </div>

          <div className="vendet3a">
            <label>Email Address</label>
            <p className="vendet3b">{email || "N/A"}</p>
          </div>
        </Box>

        <Box className="vendet4">
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
              onError={(e) => {
                e.target.src = fallbackImg;
              }}
            />
          </div>
        </Box>
      </Box>
    </Box>
  );
}
