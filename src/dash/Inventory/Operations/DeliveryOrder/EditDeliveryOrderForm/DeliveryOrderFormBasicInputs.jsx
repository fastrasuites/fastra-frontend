import React from "react";
import {
  Autocomplete,
  TextField,
  Grid,
  Typography,
  Divider,
  Box,
} from "@mui/material";

const DeliveryOrderFormBasicInputs = ({
  formData,
  handleInputChange,
  locationList,
}) => {
  const handleLocationChange = (_, newValue) => {
    handleInputChange("source_location", newValue);
  };

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      <Box>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} lg={3}>
            <label>ID</label>
            <TextField
              type="text"
              variant="standard"
              size="small"
              value={formData.order_unique_id || ""}
              disabled
              placeholder="Order unique id"
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <label>Customer's name</label>
            <TextField
              type="text"
              variant="standard"
              size="small"
              value={formData.customer_name || ""}
              onChange={(e) =>
                handleInputChange("customer_name", e.target.value)
              }
              placeholder="Enter customer name"
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <label>Source Location</label>

            {locationList.length <= 1 ? (
              <Typography>{locationList[0].location_name}</Typography>
            ) : (
              <Autocomplete
                disablePortal
                options={locationList}
                value={
                  locationList.find(
                    (loc) =>
                      loc.location_name ===
                      formData.source_location?.location_name
                  ) || null
                }
                getOptionLabel={(option) => option?.location_name || ""}
                isOptionEqualToValue={(option, value) =>
                  option?.id === value?.id
                }
                onChange={handleLocationChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Select Source Location"
                    size="small"
                    variant="standard"
                    fullWidth
                  />
                )}
              />
            )}
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <label>Delivery Address</label>
            <TextField
              type="text"
              variant="standard"
              size="small"
              value={formData.delivery_address || ""}
              onChange={(e) =>
                handleInputChange("delivery_address", e.target.value)
              }
              placeholder="Input Delivery Address"
              fullWidth
            />
          </Grid>
        </Grid>
      </Box>
      <Divider />
      <Box>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} lg={3}>
            <label>Delivery Date</label>
            <TextField
              fullWidth
              type="date"
              variant="outlined"
              size="small"
              value={formData.delivery_date || ""}
              onChange={(e) =>
                handleInputChange("delivery_date", e.target.value)
              }
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <label>Shipping Policy</label>
            <TextField
              fullWidth
              type="text"
              value={formData.shipping_policy || ""}
              onChange={(e) =>
                handleInputChange("shipping_policy", e.target.value)
              }
              placeholder="Input Shipping Policy"
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <label>Return Policy</label>
            <TextField
              type="text"
              fullWidth
              size="small"
              value={formData.return_policy || ""}
              onChange={(e) =>
                handleInputChange("return_policy", e.target.value)
              }
              placeholder="Input Return Policy"
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <label>Assigned To</label>
            <TextField
              type="text"
              size="small"
              value={formData.assigned_to || ""}
              onChange={(e) => handleInputChange("assigned_to", e.target.value)}
              placeholder="Input Assigned To"
              fullWidth
            />
          </Grid>
        </Grid>
      </Box>
      <Divider />
    </Box>
  );
};

export default DeliveryOrderFormBasicInputs;
