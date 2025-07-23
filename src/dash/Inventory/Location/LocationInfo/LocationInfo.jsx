import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemText,
  IconButton,
  CircularProgress,
  Divider,
  Chip,
} from "@mui/material";
import { useCustomLocation } from "../../../../context/Inventory/LocationContext";
import CloseIcon from "@mui/icons-material/Close";
import InventoryIcon from "@mui/icons-material/Inventory";

const LocationInfo = () => {
  const { id } = useParams();
  const {
    getSingleLocation,
    singleLocation,
    getLocationProducts,
    locationProducts,
    productsLoading,
    productsError,
  } = useCustomLocation();
  const [openProducts, setOpenProducts] = useState(false);

  useEffect(() => {
    if (id) {
      getSingleLocation(id);
    }
  }, [id, getSingleLocation]);

  // Fetch products when drawer opens
  useEffect(() => {
    if (openProducts) {
      getLocationProducts(id);
    }
  }, [openProducts, id, getLocationProducts]);

  const handleDone = () => {
    window.history.back();
  };
  return (
    <Box padding={"30px"} display={"grid"} gap="32px">
      <Typography variant="h6" fontSize={24} fontWeight={600}>
        New Location
      </Typography>

      <Box
        padding={"24px"}
        display={"grid"}
        gap="32px"
        border="1px solid #E2E6E9"
        sx={{ backgroundColor: "#FFFFFF" }}
      >
        <Typography variant="h6" color="#3B7CED" fontSize={20} fontWeight={500}>
          Product Information
        </Typography>

        <Box
          display={"flex"}
          gap={"170px"}
          borderBottom={"1px solid #E2E6E9"}
          paddingBottom={"24px"}
        >
          <Box>
            <Typography>Location Code</Typography>
            <Typography color="#7A8A98">{singleLocation?.id}</Typography>
          </Box>

          <Box>
            <Typography>Location Name</Typography>
            <Typography color="#7A8A98">
              {singleLocation?.location_name}
            </Typography>
          </Box>

          <Box>
            <Typography>Location Type</Typography>
            <Typography color="#7A8A98">
              {singleLocation?.location_type}
            </Typography>
          </Box>
        </Box>

        <Box
          display={"flex"}
          gap={"170px"}
          borderBottom={"1px solid #E2E6E9"}
          paddingBottom={"24px"}
        >
          <Box>
            <Typography>Address</Typography>
            <Typography color="#7A8A98">{singleLocation?.address}</Typography>
          </Box>
          <Box>
            <Typography>Location Manager</Typography>
            <Typography color="#7A8A98">
              {singleLocation?.location_manager}
            </Typography>
          </Box>

          <Box>
            <Typography>Store Keeper</Typography>
            <Typography color="#7A8A98">
              {singleLocation?.store_keeper}
            </Typography>
          </Box>

          <Box>
            <Typography>Contact Information</Typography>
            <Typography color="#7A8A98">
              {singleLocation?.contact_information}
            </Typography>
          </Box>
        </Box>

        <Box>
          <Button
            variant="contained"
            size="lg"
            disableElevation
            onClick={handleDone}
          >
            Done
          </Button>

          <Button
            variant="outlined"
            size="lg"
            disableElevation
            onClick={() => setOpenProducts(true)}
            startIcon={<InventoryIcon />}
            sx={{ marginLeft: "16px" }}
          >
            View Inventory
          </Button>
        </Box>
      </Box>

      {/* Products Drawer */}
      <Drawer
        anchor="right"
        open={openProducts}
        onClose={() => setOpenProducts(false)}
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: "60%", md: "45%" },
            padding: "20px",
          },
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight={600}>
            {singleLocation?.location_name} Inventory
          </Typography>
          <IconButton onClick={() => setOpenProducts(false)}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ my: 2 }} />

        {productsLoading ? (
          <Box display="flex" justifyContent="center" mt={4}>
            <CircularProgress />
          </Box>
        ) : productsError ? (
          <Box color="error.main" p={2}>
            <Typography>Error: {productsError}</Typography>
            <Button
              variant="outlined"
              onClick={() => getLocationProducts(id)}
              sx={{ mt: 1 }}
            >
              Retry
            </Button>
          </Box>
        ) : locationProducts.length === 0 ? (
          <Box textAlign="center" p={4}>
            <InventoryIcon
              sx={{ fontSize: 60, color: "text.secondary", mb: 1 }}
            />
            <Typography variant="body1" color="text.secondary">
              No inventory found for this location
            </Typography>
          </Box>
        ) : (
          <List sx={{ overflow: "auto", maxHeight: "80vh" }}>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="h6">Product Name</Typography>
              <Typography variant="h6">Quantity at Hand</Typography>
            </Box>
            {locationProducts.map((product) => (
              <ListItem key={product.product_id} divider sx={{ py: 2 }}>
                <ListItemText
                  primary={product.product_name}
                  // secondary={`SKU: ${product.sku || "N/A"}`}
                  primaryTypographyProps={{ fontWeight: 500 }}
                />
                <Chip
                  label={`${product.quantity} units`}
                  color={product.quantity > 0 ? "primary" : "error"}
                  variant="outlined"
                  sx={{ minWidth: 100 }}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Drawer>
    </Box>
  );
};

export default LocationInfo;
