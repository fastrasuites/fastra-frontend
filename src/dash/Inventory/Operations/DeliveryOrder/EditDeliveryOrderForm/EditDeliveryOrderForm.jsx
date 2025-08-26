// EditDeliveryOrderForm.jsx
import React, { useMemo, useEffect, useState, useCallback } from "react";
import "./EditDeliveryOrderForm.css";
import { Typography, Box, CircularProgress } from "@mui/material";
import CommonForm from "../../../../../components/CommonForm/CommonForm";
import { useCustomLocation } from "../../../../../context/Inventory/LocationContext";
import Swal from "sweetalert2";
import { useDeliveryOrder } from "../../../../../context/Inventory/DeliveryOrderContext";
import { useParams, useHistory } from "react-router-dom";
import { useTenant } from "../../../../../context/TenantContext";
// import Asterisk from "../../../../../components/Asterisk";
import DeliveryOrderFormBasicInputs from "./DeliveryOrderFormBasicInputs";

// ⬇️ MAIN COMPONENT
const EditDeliveryOrderForm = () => {
  const { id } = useParams();
  const orderId = Number(id);
  const history = useHistory();
  const { tenantData } = useTenant();
  const tenant_schema_name = tenantData?.tenant_schema_name;

  const {
    activeLocationList,
    getActiveLocationListForForm,
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
    getActiveLocationListForForm();
    getDeliveryOrderList().then(() => setInitialDataLoaded(true));
  }, []);

  // Memoize basicInformationInputs function
  const basicInformationInputs = useCallback(
    (props) => (
      <DeliveryOrderFormBasicInputs
        {...props}
        locationList={activeLocationList}
      />
    ),
    [activeLocationList] // Only recreate when location list changes
  );

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

  // useEffect(() => {
  //   const shouldUpdate = formData.items.some((item) => {
  //     const quantity = parseInt(item.quantity_to_deliver, 10) || 0;
  //     const unitPrice = parseFloat(item.unit_price) || 0;
  //     return item.total_price !== quantity * unitPrice;
  //   });

  //   if (shouldUpdate) {
  //     const newItems = formData.items.map((item) => {
  //       const quantity = parseInt(item.quantity_to_deliver, 10) || 0;
  //       const unitPrice = parseFloat(item.unit_price) || 0;
  //       return { ...item, total_price: quantity * unitPrice };
  //     });
  //     setFormData((prev) => ({ ...prev, items: newItems }));
  //   }
  // }, [formData.items]);

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

  // OPTIMIZE rowConfig with proper memoization
  const rowConfig = useMemo(
    () => [
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
        value: (row) => {
          // Ensure we handle both number and string inputs
          const quantity = parseFloat(row.quantity_to_deliver) || 0;
          const unitPrice = parseFloat(row.unit_price) || 0;
          return (quantity * unitPrice).toFixed(2);
        },
      },
    ],
    [locationProducts]
  );

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
        // total_price: Number(item.total_price),
        total_price:
          (parseFloat(item.quantity_to_deliver) || 0) *
          (parseFloat(item.unit_price) || 0),
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

  console.log("rowConfig", rowConfig);

  return (
    <CommonForm
      basicInformationTitle="Delivery Order Information"
      basicInformationInputs={basicInformationInputs}
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
