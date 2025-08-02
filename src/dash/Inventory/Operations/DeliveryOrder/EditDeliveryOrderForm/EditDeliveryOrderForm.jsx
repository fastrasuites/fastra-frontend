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

const DeliveryOrderFormBasicInputs = ({ formData, handleInputChange }) => {
  const { locationList, getLocationList } = useCustomLocation();

  useEffect(() => {
    getLocationList();
  }, [getLocationList]);

  // Handle location change
  const handleLocationChange = (_, newValue) => {
    handleInputChange("source_location", newValue);
  };
  return (
    <>
      <Box display="flex" flexDirection="column" gap={3}>
        <Box>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} lg={3}>
              <label style={{ marginBottom: "6px", display: "block" }}>
                ID
              </label>
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
              <label style={{ marginBottom: "6px", display: "block" }}>
                Customer's name
              </label>
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
              <label style={{ marginBottom: "6px", display: "block" }}>
                Source Location
              </label>

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
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <label style={{ marginBottom: "6px", display: "block" }}>
                Delivery Address
              </label>
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
              <label style={{ marginBottom: "6px", display: "block" }}>
                Delivery Date
              </label>
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
              <label style={{ marginBottom: "6px", display: "block" }}>
                Shipping Policy
              </label>
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
              <label style={{ marginBottom: "6px", display: "block" }}>
                Return Policy
              </label>
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
              <label style={{ marginBottom: "6px", display: "block" }}>
                Assigned To
              </label>
              <TextField
                type="text"
                size="small"
                value={formData.assigned_to || ""}
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

const EditDeliveryOrderForm = () => {
  const { fetchProducts, products } = usePurchase();
  const {
    getSingleDeliveryOrder,
    singleDeliveryOrder,
    updateDeliveryOrder,
    isLoading: isContextLoading,
    getDeliveryOrderList,
  } = useDeliveryOrder();
  const { id } = useParams();
  const orderId = Number(id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const { locationList, getLocationList } = useCustomLocation();
  const history = useHistory();
  const { tenantData } = useTenant();
  const tenant_schema_name = tenantData?.tenant_schema_name;

  useEffect(() => {
    getLocationList();
  }, [getLocationList]);

  useEffect(() => {
    const fetchData = async () => {
      await getDeliveryOrderList();
      await fetchProducts();
      setInitialDataLoaded(true);
    };

    fetchData();
  }, [getDeliveryOrderList, fetchProducts]);

  useEffect(() => {
    const fetchData = async () => {
      if (orderId) {
        await getSingleDeliveryOrder(orderId);
      }
    };
    fetchData();
  }, [orderId, getSingleDeliveryOrder]);

  // Transform products for options
  const transformedProducts = useMemo(() => {
    return products.map((prod) => {
      return {
        ...prod,
        unit_of_measure: Array.isArray(prod.unit_of_measure)
          ? { unit_category: prod.unit_of_measure[1] }
          : prod.unit_of_measure,
      };
    });
  }, [products]);

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

  // Initialize form data when data is available
  useEffect(() => {
    if (initialDataLoaded && singleDeliveryOrder) {
      // Transform items
      const items = singleDeliveryOrder.delivery_order_items.map((item) => {
        return {
          ...item,
          id: item.id,
          product: {
            ...item?.product_details,
            id: item?.product_details?.id,
            product_name: item?.product_details?.product_name,
            unit_of_measure: {
              unit_category:
                item?.product_details?.unit_of_measure_details?.unit_category,
            },
          },
          unit_of_measure: {
            unit_category:
              item?.product_details?.unit_of_measure_details?.unit_name,
          },
          quantity_to_deliver: item.quantity_to_deliver,
          unit_price: item.unit_price,
          total_price: item.total_price,
        };
      });

      const completeFormatForSourceLocation = locationList.find(
        (value) => value?.id === singleDeliveryOrder?.source_location
      );

      setFormData({
        id: singleDeliveryOrder.id,
        order_unique_id: singleDeliveryOrder.order_unique_id,
        customer_name: singleDeliveryOrder.customer_name,
        source_location: completeFormatForSourceLocation,
        delivery_address: singleDeliveryOrder.delivery_address,
        delivery_date: singleDeliveryOrder.delivery_date?.split("T")[0],
        shipping_policy: singleDeliveryOrder.shipping_policy,
        return_policy: singleDeliveryOrder.return_policy,
        assigned_to: singleDeliveryOrder.assigned_to,
        items: items,
        status: singleDeliveryOrder.status,
      });
    }
  }, [singleDeliveryOrder, initialDataLoaded, transformedProducts]);

  const rowConfig = [
    {
      label: "Product Name",
      field: "product",
      type: "autocomplete",
      options: transformedProducts,
      getOptionLabel: (option) => option?.product_name || "",
      isOptionEqualToValue: (option, value) => option?.id === value?.id,
    },
    {
      label: "Quantity to Deliver",
      field: "quantity_to_deliver",
      type: "number",
      transform: (value) => value || "",
    },
    {
      label: "Unit Price",
      field: "unit_price",
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

  const handleSubmit = async (filledFormData) => {
    setIsSubmitting(true);
    try {
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
        })),
      };
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
        throw new Error("Update failed without error message");
      }
    } catch (error) {
      console.error("Update error:", error);
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text:
          error.message || "Failed to update delivery order. Please try again.",
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
      basicInformationInputs={DeliveryOrderFormBasicInputs}
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
