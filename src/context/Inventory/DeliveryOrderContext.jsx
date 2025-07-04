import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
} from "react";
import { useTenant } from "../TenantContext";
import { getTenantClient } from "../../services/apiService";

// Create context
const DeliveryOrderContext = createContext(null);

// Validation utilities
const validateDeliveryOrderData = (data) => {
  const errors = {};
  if (!data.customer_name?.trim())
    errors.customer_name = "Customer name is required";
  if (!data.source_location)
    errors.source_location = "Source location is required";
  if (!data.delivery_address?.trim())
    errors.delivery_address = "Delivery address required";
  if (!data.delivery_date) errors.delivery_date = "Delivery date is required";
  // if (!data.shipping_policy?.trim())
  //   errors.shipping_policy = "Shipping policy is required";
  // if (!data.return_policy?.trim())
  //   errors.return_policy = "Return policy is required";
  if (!data.assigned_to?.trim()) errors.assigned_to = "Assigned to is required";
  if (!data.items || data.items.length === 0) {
    errors.items = "At least one item is required";
  } else {
    data.items.forEach((item, index) => {
      if (!item.product) {
        errors[`items[${index}].product`] = "Product is required";
      }
      if (!item.quantity_to_deliver || item.quantity_to_deliver <= 0) {
        errors[`items[${index}].quantity`] = "Valid quantity is required";
      }
    });
  }
  return errors;
};

export const DeliveryOrderProvider = ({ children }) => {
  const { tenantData } = useTenant();
  const [deliveryOrderList, setDeliveryOrderList] = useState([]);
  const [singleDeliveryOrder, setSingleDeliveryOrder] = useState(null);
  const [deliveryOrderReturnList, setDeliveryOrderReturnList] = useState([]);
  const [singleDeliveryOrderReturn, setSingleDeliveryOrderReturn] =
    useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const { tenant_schema_name, access_token, refresh_token } = tenantData || {};
  const client = useMemo(() => {
    if (!tenant_schema_name || !access_token || !refresh_token) return null;
    return getTenantClient(tenant_schema_name, access_token, refresh_token);
  }, [tenant_schema_name, access_token, refresh_token]);

  // Deliery order endpoints
  const getDeliveryOrderList = useCallback(async () => {
    if (!client) {
      const msg = "API client not initialized.";
      setError(msg);
      return Promise.reject(new Error(msg));
    }
    setIsLoading(true);
    try {
      const { data } = await client.get("/inventory/delivery-orders/");
      setDeliveryOrderList(data);
      setError(null);
      return { success: true, data };
    } catch (err) {
      setError(err.message || "Failed to load delivery orders");
      return Promise.reject(err);
    } finally {
      setIsLoading(false);
    }
  }, [client]);

  const getSingleDeliveryOrder = useCallback(
    async (id) => {
      if (!client) {
        const msg = "API client not initialized.";
        setError(msg);
        return Promise.reject(new Error(msg));
      }
      setIsLoading(true);
      try {
        const { data } = await client.get(`/inventory/delivery-orders/${id}/`);
        setSingleDeliveryOrder(data);
        setError(null);
        return { success: true, data };
      } catch (err) {
        setError(err.message || "Failed to load delivery order");
        return Promise.reject(err);
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  const createDeliveryOrder = useCallback(
    async (deliveryOrderData) => {
      const errors = validateDeliveryOrderData(deliveryOrderData);
      if (Object.keys(errors).length) return Promise.reject(errors);
      if (!client) {
        const msg = "API client not initialized.";
        setError(msg);
        return Promise.reject(new Error(msg));
      }
      setIsLoading(true);
      try {
        const payload = {
          customer_name: deliveryOrderData.customer_name,
          source_location: deliveryOrderData.source_location.id,
          delivery_address: deliveryOrderData.delivery_address,
          delivery_date: deliveryOrderData.delivery_date,
          shipping_policy: deliveryOrderData.shipping_policy,
          return_policy: deliveryOrderData.return_policy,
          assigned_to: deliveryOrderData.assigned_to,
          delivery_order_items: deliveryOrderData.items.map((item) => ({
            product_item: item.product.id,
            quantity_to_deliver: parseInt(item.quantity_to_deliver, 10),
          })),
        };
        const { data } = await client.post(
          "/inventory/delivery-orders/",
          payload
        );
        setDeliveryOrderList((prev) => [...prev, data]);
        setError(null);
        return { success: true, data };
      } catch (err) {
        setError(err.message || "Failed to create delivery order");
        return Promise.reject(err);
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  const updateDeliveryOrder = useCallback(
    async (id, deliveryOrderData, partial = true) => {
      const errors = validateDeliveryOrderData(deliveryOrderData);
      if (Object.keys(errors).length && !partial) {
        return Promise.reject(errors);
      }

      if (!client) {
        const msg = "API client not initialized.";
        setError(msg);
        return Promise.reject(new Error(msg));
      }

      setIsLoading(true);
      try {
        // Transform items if present
        const payload = { ...deliveryOrderData };
        if (payload.items) {
          payload.delivery_order_items = payload.items.map((item) => ({
            id: item.id, // Include for existing items
            product_item: item.product,
            quantity_to_deliver: parseInt(item.quantity_to_deliver, 10),
          }));
          delete payload.items;
        }

        // Transform location if present
        if (payload.source_location && payload.source_location.id) {
          payload.source_location = payload.source_location.id;
        }
        // checking the payload
        console.log("final Payload for update:", payload);
        const method = partial ? "patch" : "put";
        const { data } = await client[method](
          `/inventory/delivery-orders/${id}/`,
          payload
        );

        // Update state
        setDeliveryOrderList((prev) =>
          prev.map((order) => (order.id === id ? data : order))
        );
        if (singleDeliveryOrder?.id === id) {
          setSingleDeliveryOrder(data);
        }

        setError(null);
        return { success: true, data };
      } catch (err) {
        setError(
          err.message ||
            `Failed to ${
              partial ? "partially update" : "update"
            } delivery order`
        );
        return Promise.reject(err);
      } finally {
        setIsLoading(false);
      }
    },
    [client, singleDeliveryOrder]
  );

  const deleteDeliveryOrder = useCallback(
    async (id) => {
      if (!client) {
        const msg = "API client not initialized.";
        setError(msg);
        return Promise.reject(new Error(msg));
      }

      setIsLoading(true);
      try {
        await client.delete(`/inventory/delivery-orders/${id}/soft_delete/`);

        // Update state
        setDeliveryOrderList((prev) => prev.filter((order) => order.id !== id));
        if (singleDeliveryOrder?.id === id) {
          setSingleDeliveryOrder(null);
        }

        setError(null);
        return { success: true };
      } catch (err) {
        setError(err.message || "Failed to delete delivery order");
        return Promise.reject(err);
      } finally {
        setIsLoading(false);
      }
    },
    [client, singleDeliveryOrder]
  );

  // -- Delivery Order Return Operations --
  const getDeliveryOrderReturnList = useCallback(async () => {
    if (!client) {
      const msg = "API client not initialized.";
      setError(msg);
      return Promise.reject(new Error(msg));
    }

    setIsLoading(true);
    try {
      const { data } = await client.get("/inventory/delivery-order-returns/");
      setDeliveryOrderReturnList(data);
      setError(null);
      return { success: true, data };
    } catch (err) {
      setError(err.message || "Failed to load delivery order returns");
      return Promise.reject(err);
    } finally {
      setIsLoading(false);
    }
  }, [client]);

  const getSingleDeliveryOrderReturn = useCallback(
    async (id) => {
      if (!client) {
        const msg = "API client not initialized.";
        setError(msg);
        return Promise.reject(new Error(msg));
      }

      setIsLoading(true);
      try {
        const { data } = await client.get(
          `/inventory/delivery-order-returns/${id}/`
        );
        setSingleDeliveryOrderReturn(data);
        setError(null);
        return { success: true, data };
      } catch (err) {
        setError(err.message || "Failed to load delivery order return");
        return Promise.reject(err);
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  // const createDeliveryOrderReturn = useCallback(
  //   async (deliveryOrderReturnData) => {
  //     if (!client) {
  //       const msg = "API client not initialized.";
  //       setError(msg);
  //       return Promise.reject(new Error(msg));
  //     }

  //     setIsLoading(true);
  //     try {
  //       // Ensure delivery_order_return_items exists and is an array
  //       const returnItems =
  //         deliveryOrderReturnData.delivery_order_return_items || [];
  //       // Simulate API delay
  //       await new Promise((resolve) => setTimeout(resolve, 500));

  //       // Generate mock response matching the expected structure
  //       const mockResponse = {
  //         unique_record_id: `mock-${Date.now()}`,
  //         ...deliveryOrderReturnData, // Use all input data
  //         delivery_order_return_items: returnItems.map((item) => ({
  //           ...item,
  //           // Add mock IDs if not provided
  //           returned_product_item:
  //             item.returned_product_item || Math.floor(Math.random() * 1000),
  //         })),
  //       };

  //       // Update state with mock response
  //       setDeliveryOrderReturnList((prev) => [...prev, mockResponse]);
  //       setError(null);

  //       return { success: true, data: mockResponse };
  //     } catch (err) {
  //       const errorMsg = err || "Simulated creation failed";
  //       setError(errorMsg);
  //       return Promise.reject(new Error(errorMsg));
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   },
  //   [client]
  // );

  const createDeliveryOrderReturn = useCallback(
    async (deliveryOrderReturnData) => {
      if (!client) {
        const msg = "API client not initialized.";
        setError(msg);
        return Promise.reject(new Error(msg));
      }

      setIsLoading(true);
      try {
        const { data } = await client.post(
          "/inventory/delivery-order-returns/",
          deliveryOrderReturnData
        );
        setDeliveryOrderReturnList((prev) => [...prev, data]);
        setError(null);
        return { success: true, data };
      } catch (err) {
        setError(err.message || "Failed to create delivery order return");
        return Promise.reject(err);
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  const updateDeliveryOrderReturn = useCallback(
    async (id, returnData, partial = false) => {
      if (!client) {
        const msg = "API client not initialized.";
        setError(msg);
        return Promise.reject(new Error(msg));
      }

      setIsLoading(true);
      try {
        const method = partial ? "patch" : "put";
        const { data } = await client[method](
          `/inventory/delivery-order-returns/${id}/`,
          returnData
        );
        // Update state
        setDeliveryOrderReturnList((prev) =>
          prev.map((orderReturn) =>
            orderReturn.id === id ? data : orderReturn
          )
        );
        return { success: true, data };
      } catch (err) {
        setError(
          err.message ||
            `Failed to ${
              partial ? "partially update" : "update"
            } delivery order return`
        );
        return Promise.reject(err);
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  const deleteDeliveryOrderReturn = useCallback(
    async (id) => {
      if (!client) {
        const msg = "API client not initialized.";
        setError(msg);
        return Promise.reject(new Error(msg));
      }

      setIsLoading(true);
      try {
        await client.delete(
          `/inventory/delivery-order-returns/${id}/soft_delete/`
        );
        return { success: true };
      } catch (err) {
        setError(err.message || "Failed to delete delivery order return");
        return Promise.reject(err);
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  // -- Special Operations --
  const checkDeliveryOrderAvailability = useCallback(
    async (id) => {
      if (!client) {
        const msg = "API client not initialized.";
        setError(msg);
        return Promise.reject(new Error(msg));
      }

      setIsLoading(true);
      try {
        const { data } = await client.get(
          `/inventory/delivery-order/check-availability/${id}/`
        );

        // Update state
        setDeliveryOrderList((prev) =>
          prev.map((order) => (order.id === id ? data : order))
        );
        if (singleDeliveryOrder?.id === id) {
          setSingleDeliveryOrder(data);
        }

        return { success: true, data };
      } catch (err) {
        setError(err.message || "Failed to check order availability");
        return Promise.reject(err);
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  const confirmDeliveryOrder = useCallback(
    async (id) => {
      if (!client) {
        const msg = "API client not initialized.";
        setError(msg);
        return Promise.reject(new Error(msg));
      }

      setIsLoading(true);
      try {
        const { data } = await client.get(
          `/inventory/delivery-order/confirm-delivery/${id}/`
        );

        // Update state
        setDeliveryOrderList((prev) =>
          prev.map((order) => (order.id === id ? data : order))
        );
        if (singleDeliveryOrder?.id === id) {
          setSingleDeliveryOrder(data);
        }

        return { success: true, data };
      } catch (err) {
        setError(err.message || "Failed to confirm delivery");
        return Promise.reject(err);
      } finally {
        setIsLoading(false);
      }
    },
    [client, singleDeliveryOrder]
  );

  // -- Context Value --
  const contextValue = useMemo(
    () => ({
      // State
      deliveryOrderList,
      singleDeliveryOrder,
      deliveryOrderReturnList,
      singleDeliveryOrderReturn,
      isLoading,
      error,

      // Delivery Order Operations
      getDeliveryOrderList,
      getSingleDeliveryOrder,
      createDeliveryOrder,
      updateDeliveryOrder,
      deleteDeliveryOrder,

      // Return Operations
      getDeliveryOrderReturnList,
      getSingleDeliveryOrderReturn,
      createDeliveryOrderReturn,
      updateDeliveryOrderReturn,
      deleteDeliveryOrderReturn,

      // Special Operations
      checkDeliveryOrderAvailability,
      confirmDeliveryOrder,
    }),
    [
      deliveryOrderList,
      singleDeliveryOrder,
      deliveryOrderReturnList,
      singleDeliveryOrderReturn,
      isLoading,
      error,
      getDeliveryOrderList,
      getSingleDeliveryOrder,
      createDeliveryOrder,
      updateDeliveryOrder,
      deleteDeliveryOrder,
      getDeliveryOrderReturnList,
      getSingleDeliveryOrderReturn,
      createDeliveryOrderReturn,
      updateDeliveryOrderReturn,
      deleteDeliveryOrderReturn,
      checkDeliveryOrderAvailability,
      confirmDeliveryOrder,
    ]
  );

  return (
    <DeliveryOrderContext.Provider value={contextValue}>
      {children}
    </DeliveryOrderContext.Provider>
  );
};

export const useDeliveryOrder = () => {
  const context = useContext(DeliveryOrderContext);
  if (!context) {
    throw new Error(
      "useDeliveryOrder must be used within a DeliveryOrderProvider"
    );
  }
  return context;
};
