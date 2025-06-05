import React, { useEffect, useMemo, useState } from "react";
import CommonForm from "../../../../../components/CommonForm/CommonForm";
import {
  Box,
  CircularProgress,
  Divider,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { usePurchase } from "../../../../../context/PurchaseContext";
import { useDeliveryOrder } from "../../../../../context/Inventory/DeliveryOrderContext";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";

const DeliveryOrderFormBasicInputs = ({ formData, handleInputChange }) => {
  //   const { locationList, getLocationList } = useCustomLocation();

  //   useEffect(() => {
  //     getLocationList();
  //   }, [getLocationList]);

  //   // Handle location change
  //   const handleLocationChange = (_, newValue) => {
  //     handleInputChange("source_location", newValue);
  //   };

  return (
    <>
      <Box display="flex" flexDirection="column" gap={3}>
        <Box>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} lg={3}>
              <label style={{ marginBottom: "6px", display: "block" }}>
                ID
              </label>
              <Typography variant="standard" size="small" fullWidth>
                LAG-RET-001
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <label style={{ marginBottom: "6px", display: "block" }}>
                Source Document
              </label>
              <Typography fullWidth>
                {formData.order_unique_id || ""}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <label style={{ marginBottom: "6px", display: "block" }}>
                Return Date
              </label>
              <Typography fullWidth>{formData.delivery_date || ""}</Typography>
            </Grid>
          </Grid>
        </Box>
        <Divider />
        <Box>
          <Grid container spacing={3}>
            {/* <Grid xs={12} sm={6} lg={3}>
              <label style={{ marginBottom: "6px", display: "block" }}>
                Reason for Return
              </label>

              <TextField
                type="text"
                fullWidth
                variant="outline"
                placeholder="Reason for Return"
              ></TextField>
            </Grid> */}
          </Grid>
        </Box>
        <Divider />
      </Box>
    </>
  );
};

const DeliveryOrderReturnForm = () => {
  const { fetchProducts, products } = usePurchase();
  const {
    updateDeliveryOrder,
    isLoading: isContextLoading,
    getDeliveryOrderList,
    deliveryOrderList,
  } = useDeliveryOrder();
  const { id } = useParams();
  const orderId = Number(id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      await getDeliveryOrderList();
      await fetchProducts();
      setInitialDataLoaded(true);
    };

    fetchData();
  }, [getDeliveryOrderList, fetchProducts]);

  const singleDeliveryOrder = useMemo(() => {
    return deliveryOrderList.find((order) => order.id === orderId);
  }, [deliveryOrderList, orderId]);

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
        const product =
          transformedProducts.find((p) => p.id === item.product_item?.id) ||
          item.product_item;

        return {
          ...item,
          id: item.id,
          product: product,
          quantity_to_deliver: item.quantity_to_deliver,
          unit_of_measure: product?.unit_of_measure || item.unit_of_measure,
        };
      });

      setFormData({
        id: singleDeliveryOrder.id,
        order_unique_id: singleDeliveryOrder.order_unique_id,
        customer_name: singleDeliveryOrder.customer_name,
        source_location: singleDeliveryOrder.source_location,
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
      label: "Quantity received",
      field: "quantity_received",
      type: "number",
      transform: (value) => value || "",
    },
    {
      label: "Quantity to be returned",
      field: "quantity_to_be_returned",
      type: "number",
      transform: (value) => value || "",
    },
  ];

  const handleSubmit = async (filledFormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        customer_name: filledFormData.customer_name,
        source_location: filledFormData.source_location?.id,
        delivery_address: filledFormData.delivery_address,
        delivery_date: filledFormData.delivery_date,
        shipping_policy: filledFormData.shipping_policy,
        return_policy: filledFormData.return_policy,
        assigned_to: filledFormData.assigned_to,
        items: filledFormData.items.map((item) => ({
          unit_of_measure:
            item.unit_of_measure?.unit_category || item.unit_of_measure,
          product: item.product?.id || item.product,
          quantity_to_deliver: parseInt(item.quantity_to_deliver, 10),
        })),
      };

      const result = await updateDeliveryOrder(orderId, payload);

      if (result && result.success) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Delivery order updated successfully",
        });
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
      basicInformationTitle="Return Product Information"
      basicInformationInputs={DeliveryOrderFormBasicInputs}
      formTitle="Return"
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
          "Send"
        )
      }
      autofillRow={[
        "product_name",
        "product_description",
        "unit_of_measure",
        "available_product_quantity",
      ]}
    />
  );
};

export default DeliveryOrderReturnForm;
