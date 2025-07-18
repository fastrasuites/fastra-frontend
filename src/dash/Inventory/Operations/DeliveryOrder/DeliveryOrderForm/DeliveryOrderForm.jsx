import React, { useEffect, useState } from "react";
import {
  Autocomplete,
  Grid,
  TextField,
  Typography,
  Divider,
  Box,
  CircularProgress,
} from "@mui/material";
import CommonForm from "../../../../../components/CommonForm/CommonForm";
import { useCustomLocation } from "../../../../../context/Inventory/LocationContext";
import { useDeliveryOrder } from "../../../../../context/Inventory/DeliveryOrderContext";
import { usePurchase } from "../../../../../context/PurchaseContext";
import { useTenant } from "../../../../../context/TenantContext";
import Swal from "sweetalert2";
import { useHistory } from "react-router-dom";
import Asterisk from "../../../../../components/Asterisk";

const defaultFormData = {
  customer_name: "",
  source_location: "",
  delivery_address: "",
  delivery_date: "",
  shipping_policy: "",
  return_policy: "",
  assigned_to: "",
  items: [],
  status: "draft",
};

// Basic input component for the delivery order form
const DeliveryOrderFormBasicInputs = ({ formData, handleInputChange }) => {
  const [selectedLocation, setSelectedLocation] = useState(null);

  const { locationList, getLocationList } = useCustomLocation();

  useEffect(() => {
    getLocationList();
  }, []);

  // Sync with parent state upon selection change
  const handleLocationChange = (event, newValue) => {
    // console.log("inside handle location change", newValue);
    setSelectedLocation(newValue);
    handleInputChange("source_location", newValue);
  };
  // console.log(locationList);
  return (
    <>
      <Box display="flex" flexDirection="column" gap={3}>
        <Box>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} lg={3}>
              <Typography
                style={{ marginBottom: "6px", display: "inline-flex" }}
              >
                Customer's name
                <Asterisk />
              </Typography>
              <TextField
                type="text"
                variant="standard"
                size="small"
                value={formData.customer_name}
                onChange={(e) =>
                  handleInputChange("customer_name", e.target.value)
                }
                placeholder="Enter customer name"
                fullWidth
              />
            </Grid>
            {locationList.length <= 1 ? (
              <Grid item xs={12} sm={6} lg={3}>
                <Typography>
                  Location <Asterisk />
                </Typography>
                <Typography>{formData.location}</Typography>
              </Grid>
            ) : (
              <Grid item xs={12} sm={6} lg={3}>
                <Typography
                  style={{
                    marginBottom: "6px",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  Source Location
                  <Asterisk />
                </Typography>

                <Autocomplete
                  disablePortal
                  options={locationList}
                  value={selectedLocation}
                  getOptionLabel={(option) => option?.location_name || ""}
                  isOptionEqualToValue={(option, value) =>
                    option?.location_name === value?.location_name
                  }
                  onChange={handleLocationChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Input Source Location"
                      size="small"
                      variant="standard"
                      fullWidth
                    />
                  )}
                />
              </Grid>
            )}

            {/* Input delivery Address*/}
            <Grid item xs={12} sm={6} lg={3}>
              <Typography
                style={{ marginBottom: "6px", display: "inline-flex" }}
              >
                Delivery Address <Asterisk />
              </Typography>
              <TextField
                type="text"
                variant="standard"
                size="small"
                value={formData.delivery_address}
                onChange={(e) =>
                  handleInputChange("delivery_address", e.target.value)
                }
                placeholder="Input Delivery Address"
                fullWidth
              />
            </Grid>
            {/* Input delivery Date*/}
            <Grid item xs={12} sm={6} lg={3}>
              <Typography
                style={{ marginBottom: "4px", display: "inline-flex" }}
              >
                Delivery Date
                <Asterisk />
              </Typography>
              <TextField
                type="date"
                variant="standard"
                size="small"
                value={formData.delivery_date}
                onChange={(e) =>
                  handleInputChange("delivery_date", e.target.value)
                }
                fullWidth
              />
            </Grid>
          </Grid>
        </Box>
        <Divider />
        <Box>
          <Grid container spacing={2}>
            {/* Input Shipping Policy*/}
            <Grid item xs={12} sm={6} lg={3}>
              <Typography style={{ marginBottom: "6px", display: "block" }}>
                Shipping Policy
              </Typography>
              <TextField
                type="text"
                value={formData.shipping_policy}
                onChange={(e) =>
                  handleInputChange("shipping_policy", e.target.value)
                }
                placeholder="Input Shipping Policy"
                size="small"
                fullWidth
              />
            </Grid>
            {/* Input Return Policy*/}
            <Grid item xs={12} sm={6} lg={3}>
              <Typography style={{ marginBottom: "6px", display: "block" }}>
                Return Policy
              </Typography>
              <TextField
                type="text"
                size="small"
                value={formData.return_policy}
                onChange={(e) =>
                  handleInputChange("return_policy", e.target.value)
                }
                placeholder="Input Return Policy"
                fullWidth
              />
            </Grid>
            {/* Input Assigned To*/}
            <Grid item xs={12} sm={6} lg={3}>
              <Typography
                style={{ marginBottom: "6px", display: "inline-flex" }}
              >
                Assigned To
                <Asterisk />
              </Typography>
              <TextField
                type="text"
                size="small"
                value={formData.assigned_to}
                onChange={(e) =>
                  handleInputChange("assigned_to", e.target.value)
                }
                placeholder="Input Assigned To"
                fullWidth
              />
            </Grid>
          </Grid>
        </Box>
        <Divider />
      </Box>
    </>
  );
};

const DeliveryOrderForm = () => {
  const [formData, setFormData] = useState(defaultFormData);
  const [formErrors, setFormErrors] = useState({});
  const { createDeliveryOrder, isLoading, error } = useDeliveryOrder();
  const { fetchProducts, products } = usePurchase();
  const { tenantData } = useTenant();
  const tenant_schema_name = tenantData?.tenant_schema_name;
  const history = useHistory();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const transformProducts = (list) =>
    list.map((prod) => ({
      ...prod,
      unit_of_measure: {
        url: prod.unit_of_measure,
        unit_category: prod?.unit_of_measure_details?.unit_category,
        unit_name: prod?.unit_of_measure_details?.unit_category,
      },
    }));

  const rowConfig = [
    {
      label: "Product Name",
      field: "product",
      type: "autocomplete",
      options: transformProducts(products),
      getOptionLabel: (option) => option?.product_name || "",
    },
    {
      label: "Quantity to Deliver",
      field: "quantity_to_deliver",
      type: "number",
      transform: (value) => value || "",
    },
    {
      label: "Unit of Measure",
      field: "unit_of_measure",
      type: "text",
      disabled: true,
      transform: (value) => value?.unit_category || "",
    },
    {
      label: "Unit Price",
      field: "unit_price",
      type: "number",
      transform: (value) => value || "",
    },
    {
      label: "Total",
      field: "total_price",
      type: "number",
      disabled: true,
      transform: (value) => value || "",
    },
  ];

  useEffect(() => {
    const shouldUpdate = formData.items.some((item) => {
      const quantity = parseInt(item.quantity_to_deliver, 10) || 0;
      const unitPrice = parseFloat(item.unit_price) || 0;
      const calculatedTotal = quantity * unitPrice;
      return item.total_price !== calculatedTotal;
    });

    if (shouldUpdate) {
      const newItems = formData.items.map((item) => {
        const quantity = parseInt(item.quantity_to_deliver, 10) || 0;
        const unitPrice = parseFloat(item.unit_price) || 0;
        return { ...item, total_price: quantity * unitPrice };
      });
      setFormData((prev) => ({ ...prev, items: newItems }));
    }
  }, [formData.items]);

  console.log("formData", formData);

  // Callback to process the final filled form data
  const handleSubmit = async (filledFormData) => {
    console.log("filled form data", filledFormData);
    setFormErrors({}); // Clear previous errors

    try {
      const response = await createDeliveryOrder(filledFormData);

      if (response.success) {
        await Swal.fire({
          title: "Success!",
          text: "Delivery order created successfully",
          icon: "success",
          confirmButtonText: "View Order",
          showCancelButton: true,
          cancelButtonText: "Create Another",
        }).then((result) => {
          if (result.isConfirmed) {
            const orderId = response.data?.id;
            history.push(
              `/${tenant_schema_name}/inventory/operations/delivery-order/${orderId}`
            );
          } else if (result.dismiss === Swal.DismissReason.cancel) {
            // Reset form for new entry
            setFormData(defaultFormData);
          }
        });
      }
    } catch (err) {
      // Handle validation errors
      if (err && typeof err === "object" && !(err instanceof Error)) {
        setFormErrors(err); // Set form errors state

        // Create a list of error messages
        const errorMessages = Object.values(err);

        Swal.fire({
          title: "Validation Error",
          html: `
        <div style="text-align: center;">
          <p><b>Please fix the following errors:</b></p>
          <ul style="margin-top: 10px; padding-left: 20px;">
            ${errorMessages.map((msg) => `<li>${msg}</li>`).join("")}
          </ul>
        </div>
      `,
          icon: "error",
        });
      }
      // Handle other errors
      else {
        Swal.fire({
          title: "Error",
          text: error || "An error occurred while creating the delivery order",
          icon: "error",
        });
      }
    }
  };

  return (
    <CommonForm
      basicInformationTitle="Product Information"
      basicInformationInputs={DeliveryOrderFormBasicInputs}
      formTitle="New Delivery Order"
      formData={formData}
      setFormData={setFormData}
      rowConfig={rowConfig}
      isEdit={false}
      showSaveButton={false}
      primaryButtonVariant="contained"
      onSubmit={handleSubmit}
      submitBtnText={isLoading ? "Submitting..." : "Save"}
    />
  );
};

export default DeliveryOrderForm;
