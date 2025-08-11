// EditDeliveryOrderForm.jsx
import React, { useMemo, useEffect, useState } from "react";
import "./EditDeliveryOrderForm.css";
import {
  Autocomplete,
  TextField,
  Grid,
  Typography,
  Divider,
  Box,
  CircularProgress,
} from "@mui/material";
import CommonForm from "../../../../../components/CommonForm/CommonForm";
import { useCustomLocation } from "../../../../../context/Inventory/LocationContext";
import Swal from "sweetalert2";
import { useDeliveryOrder } from "../../../../../context/Inventory/DeliveryOrderContext";
import { usePurchase } from "../../../../../context/PurchaseContext";
import { useParams, useHistory } from "react-router-dom";
import { useTenant } from "../../../../../context/TenantContext";

// ⬇️ CHILD COMPONENT
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
              isOptionEqualToValue={(option, value) => option?.id === value?.id}
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

// ⬇️ MAIN COMPONENT
const EditDeliveryOrderForm = () => {
  const { id } = useParams();
  const orderId = Number(id);
  const history = useHistory();
  const { tenantData } = useTenant();
  const tenant_schema_name = tenantData?.tenant_schema_name;

  const {
    activeLocationList,
    getActiveLocationList,
    getLocationProducts,
    locationProducts,
  } = useCustomLocation();
  const {
    getSingleDeliveryOrder,
    singleDeliveryOrder,
    updateDeliveryOrder,
    isLoading: isContextLoading,
    getDeliveryOrderList,
  } = useDeliveryOrder();

  const [formData, setFormData] = useState({
    id: "",
    order_unique_id: "",
    customer_name: "",
    source_location: null,
    delivery_address: "",
    delivery_date: "",
    shipping_policy: "",
    return_policy: "",
    assigned_to: "",
    items: [],
    status: "draft",
  });

  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const locationId = formData.source_location?.id;

  useEffect(() => {
    getActiveLocationList();
    getDeliveryOrderList().then(() => setInitialDataLoaded(true));
  }, []);

  useEffect(() => {
    if (orderId) {
      getSingleDeliveryOrder(orderId);
    }
  }, [orderId]);

  useEffect(() => {
    if (initialDataLoaded && singleDeliveryOrder) {
      const items = singleDeliveryOrder.delivery_order_items.map((item) => ({
        ...item,
        product: {
          ...item.product_details,
          unit_of_measure: {
            unit_category:
              item.product_details.unit_of_measure_details?.unit_category,
          },
        },
        unit_of_measure: {
          unit_category:
            item.product_details.unit_of_measure_details?.unit_name,
        },
        quantity_to_deliver: item.quantity_to_deliver,
        unit_price: item.unit_price,
        total_price: item.total_price,
      }));

      const completeSourceLocation = activeLocationList.find(
        (loc) => loc.id === singleDeliveryOrder.source_location
      );

      setFormData({
        id: singleDeliveryOrder.id,
        order_unique_id: singleDeliveryOrder.order_unique_id,
        customer_name: singleDeliveryOrder.customer_name,
        source_location: completeSourceLocation,
        delivery_address: singleDeliveryOrder.delivery_address,
        delivery_date: singleDeliveryOrder.delivery_date?.split("T")[0],
        shipping_policy: singleDeliveryOrder.shipping_policy,
        return_policy: singleDeliveryOrder.return_policy,
        assigned_to: singleDeliveryOrder.assigned_to,
        items: items,
        status: singleDeliveryOrder.status,
      });
    }
  }, [singleDeliveryOrder, initialDataLoaded, activeLocationList]);

  useEffect(() => {
    if (locationId) {
      getLocationProducts(locationId);
    }
  }, [locationId, getLocationProducts]);

  useEffect(() => {
    const shouldUpdate = formData.items.some((item) => {
      const quantity = parseInt(item.quantity_to_deliver, 10) || 0;
      const unitPrice = parseFloat(item.unit_price) || 0;
      return item.total_price !== quantity * unitPrice;
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

  const transformedProducts = (list) =>
    list.map((prod) => ({
      ...prod,
      id: prod?.product_id,
      product_name: prod?.product_name,
      product_description: prod?.product_name,
      unit_of_measure: {
        unit_name: prod?.product_unit_of_measure,
        unit_category: prod?.product_unit_of_measure,
      },
    }));

  const rowConfig = [
    {
      label: "Product Name",
      field: "product",
      type: "autocomplete",
      options: transformedProducts(locationProducts),
      getOptionLabel: (option) => option?.product_name || "",
      isOptionEqualToValue: (option, value) => option?.id === value?.id,
    },
    {
      label: "Quantity to Deliver",
      field: "quantity_to_deliver",
      type: "number",
    },
    {
      label: "Unit Price",
      field: "unit_price",
      type: "number",
    },
    {
      label: "Unit of Measure",
      field: "unit_of_measure",
      type: "text",
      disabled: true,
      transform: (value) => value?.unit_category || "",
    },
    {
      label: "Total",
      field: "total_price",
      type: "number",
      disabled: true,
    },
  ];

  const handleSubmit = async (filledFormData) => {
    setIsSubmitting(true);
    const cleanData = {
      customer_name: filledFormData.customer_name,
      source_location: filledFormData.source_location?.id,
      delivery_address: filledFormData.delivery_address,
      delivery_date: filledFormData.delivery_date,
      shipping_policy: filledFormData.shipping_policy,
      return_policy: filledFormData.return_policy,
      assigned_to: filledFormData.assigned_to,
      items: filledFormData.items.map((item) => ({
        id: item.id,
        unit_of_measure:
          item.unit_of_measure?.unit_category || item.unit_of_measure,
        product: item.product?.id || item.product,
        quantity_to_deliver: parseInt(item.quantity_to_deliver, 10),
        unit_price: Number(item.unit_price),
        total_price: Number(item.total_price),
      })),
    };

    try {
      const result = await updateDeliveryOrder(orderId, cleanData);

      if (result && result.success) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Delivery order updated successfully",
        });
        history.push(
          `/${tenant_schema_name}/inventory/operations/delivery-order/${orderId}`
        );
      } else {
        throw new Error("Update failed");
      }
    } catch (error) {
      console.error("Update error:", error);
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text:
          error.message ||
          "Failed to update delivery order. Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!initialDataLoaded) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!singleDeliveryOrder) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <Typography variant="h6">Delivery order not found</Typography>
      </Box>
    );
  }

  return (
    <CommonForm
      basicInformationTitle="Delivery Order Information"
      basicInformationInputs={(props) => (
        <DeliveryOrderFormBasicInputs
          {...props}
          locationList={activeLocationList}
        />
      )}
      formTitle="Edit Delivery Order"
      formData={formData}
      setFormData={setFormData}
      rowConfig={rowConfig}
      isEdit={true}
      showSaveButton={true}
      primaryButtonVariant="contained"
      onSubmit={handleSubmit}
      submitBtnText={
        isSubmitting || isContextLoading ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          "Save changes"
        )
      }
    />
  );
};

export default EditDeliveryOrderForm;
