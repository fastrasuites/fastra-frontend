import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
} from "react";
import { getTenantClient } from "../services/apiService";
import { useTenant } from "./TenantContext";

const PurchaseOrderContext = createContext();

export const PurchaseOrderProvider = ({ children }) => {
  const { tenantData } = useTenant();
  const [purchaseOrderList, setPurchaseOrderList] = useState([]);
  const [singlePurchaseOrder, setSinglePurchaseOrder] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Destructure tenant configuration safely.
  const { tenant_schema_name, access_token, refresh_token } = tenantData || {};

  // Create a memoized API client when tenant data is available.
  const client = useMemo(() => {
    if (tenant_schema_name && access_token && refresh_token) {
      return getTenantClient(tenant_schema_name, access_token, refresh_token);
    }
    return null;
  }, [tenant_schema_name, access_token, refresh_token]);

  // Validation function for purchase order fields.
  const validatePurchaseOrderFields = (info) => {
    const {
      status,
      vendor,
      currency,
      payment_terms,
      purchase_policy,
      delivery_terms,
      created_by,
      items,
      is_hidden,
    } = info;

    // Basic validations; feel free to extend or refine these rules.
    return (
      !!payment_terms &&
      !!vendor &&
      !!purchase_policy &&
      !!delivery_terms &&
      !!currency &&
      !!status &&
      !!created_by &&
      !!items &&
      typeof is_hidden === "boolean"
    );
  };

  // Helper function to fetch a resource ensuring HTTPS.
  const fetchResource = async (url) => {
    if (!url) return null;
    try {
      const secureUrl = url.replace(/^http:\/\//i, "https://");
      const response = await client.get(secureUrl);
      return response.data;
    } catch (err) {
      console.error("Error fetching resource from", url, err);
      return null;
    }
  };

  // Normalize a purchase order by fetching details for related resources.
  const normalizePurchaseOrder = async (order) => {
    const currencyDetail = await fetchResource(order.currency);
    const vendorDetail = await fetchResource(order.vendor);

    const normalizedItems = await Promise.all(
      order.items.map(async (item) => {
        const productDetail = item.product
          ? await fetchResource(item.product)
          : null;
        const unitDetail = item.unit_of_measure
          ? await fetchResource(item.unit_of_measure)
          : null;
        return {
          ...item,
          product: productDetail,
          unit_of_measure: unitDetail,
        };
      })
    );

    return {
      ...order,
      currency: currencyDetail,
      vendor: vendorDetail,
      items: normalizedItems,
    };
  };

  // Create a Purchase Order.
  const createPurchaseOrder = useCallback(
    async (info) => {
      const validationError = "All fields are required and must be valid.";
      if (!validatePurchaseOrderFields(info)) {
        console.error("Validation error:", info);
        setError(validationError);
        return Promise.reject(new Error(validationError));
      }
      if (!client) {
        const clientError =
          "API client is not available. Please check tenant configuration.";
        setError(clientError);
        return Promise.reject(new Error(clientError));
      }
      try {
        setIsLoading(true);
        console.log(info);
        const response = await client.post("/purchase/purchase-order/", info);
        setError(null);
        setPurchaseOrderList((prevOrders) => [...prevOrders, response.data]);
        return { success: true, data: response.data };
      } catch (err) {
        console.error("Error creating purchase order:", err);
        setError(err);
        return { success: false, message: err.message };
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  // Update a Purchase Order.
  const updatePurchaseOrder = useCallback(
    async (info, id) => {
      if (!client) {
        const clientError =
          "API client is not available. Please check tenant configuration.";
        setError(clientError);
        return Promise.reject(new Error(clientError));
      }
      try {
        setIsLoading(true);
        // Update using a POST endpoint; adjust method if necessary.
        const response = await client.put(
          `/purchase/purchase-order/${id}/`,
          info
        );
        setError(null);
        setPurchaseOrderList((prevOrders) =>
          prevOrders.map((order) =>
            order.id === id ? { ...order, ...response.data } : order
          )
        );
        return { success: true, data: response.data };
      } catch (err) {
        console.error("Error updating purchase order:", err);
        setError(err);
        return { success: false, message: err.message };
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  // Update a Purchase Order Status to pending.
  const updatePurchasePending = useCallback(
    async (info, id) => {
      if (!client) {
        const clientError =
          "API client is not available. Please check tenant configuration.";
        setError(clientError);
        return Promise.reject(new Error(clientError));
      }
      try {
        setIsLoading(true);
        // Update using a POST endpoint; adjust method if necessary.
        const response = await client.put(
          `/purchase/purchase-order/${id}/submit/`,
          info
        );
        setError(null);
        setPurchaseOrderList((prevOrders) =>
          prevOrders.map((order) =>
            order.id === id ? { ...order, ...response.data } : order
          )
        );
        return { success: true, data: response.data };
      } catch (err) {
        console.error("Error updating purchase order to pending:", err);
        setError(err);
        return { success: false, message: err.message };
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  // Update a Purchase Order Status to pending.
  const updatePurchaseReject = useCallback(
    async (info, id) => {
      if (!client) {
        const clientError =
          "API client is not available. Please check tenant configuration.";
        setError(clientError);
        return Promise.reject(new Error(clientError));
      }
      try {
        setIsLoading(true);
        // Update using a POST endpoint; adjust method if necessary.
        const response = await client.put(
          `/purchase/purchase-order/${id}/cancel/`,
          info
        );
        setError(null);
        setPurchaseOrderList((prevOrders) =>
          prevOrders.map((order) =>
            order.id === id ? { ...order, ...response.data } : order
          )
        );
        return { success: true, data: response.data };
      } catch (err) {
        console.error("Error updating purchase order to reject:", err);
        setError(err);
        return { success: false, message: err.message };
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  const updatePurchaseApproved = useCallback(
    async (info, id) => {
      if (!client) {
        const clientError =
          "API client is not available. Please check tenant configuration.";
        setError(clientError);
        return Promise.reject(new Error(clientError));
      }
      try {
        setIsLoading(true);
        // Update using a POST endpoint; adjust method if necessary.
        const response = await client.put(
          `/purchase/purchase-order/${id}/complete/`,
          info
        );
        setError(null);
        setPurchaseOrderList((prevOrders) =>
          prevOrders.map((order) =>
            order.id === id ? { ...order, ...response.data } : order
          )
        );
        return { success: true, data: response.data };
      } catch (err) {
        console.error("Error updating purchase order to Approved:", err);
        setError(err);
        return { success: false, message: err.message };
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  // Retrieve the Purchase Order list.
  const getPurchaseOrderList = useCallback(async () => {
    if (!client) {
      const clientError =
        "API client is not available. Please check tenant configuration.";
      setError(clientError);
      return Promise.reject(new Error(clientError));
    }
    try {
      setIsLoading(true);
      const response = await client.get("/purchase/purchase-order/");
      const rawData = response.data;
      const normalizedData = await Promise.all(
        rawData.map(normalizePurchaseOrder)
      );
      setError(null);
      setPurchaseOrderList(normalizedData);
      return { success: true, data: normalizedData };
    } catch (err) {
      console.error("Error fetching purchase order list:", err);
      setError(err);
      return Promise.reject(err);
    } finally {
      setIsLoading(false);
    }
  }, [client]);


   // Retrieve single Purchase Order.
   const getPurchaseOrderById = useCallback(async (id) => {
    if (!client) {
      const clientError =
        "API client is not available. Please check tenant configuration.";
      setError(clientError);
      return Promise.reject(new Error(clientError));
    }
    try {
      setIsLoading(true);
      const response = await client.get(`/purchase/purchase-order/${id}/`);
      const rawData = response.data;
      const normalizedData = await normalizePurchaseOrder(rawData);
      setError(null);
      setSinglePurchaseOrder(normalizedData);
      return { success: true, data: normalizedData };
    } catch (err) {
      console.error("Error fetching single purchase order:", err);
      setError(err);
      return Promise.reject(err);
    } finally {
      setIsLoading(false);
    }
  }, [client]);

  // Memoize the context value.
  const contextValue = useMemo(
    () => ({
      error,
      purchaseOrderList,
      isLoading,
      createPurchaseOrder,
      updatePurchaseOrder,
      updatePurchasePending,
      updatePurchaseReject,
      updatePurchaseApproved,
      getPurchaseOrderList,
      getPurchaseOrderById,
      singlePurchaseOrder,
      setSinglePurchaseOrder,
      setPurchaseOrderList,
    }),
    [
      error,
      purchaseOrderList,
      isLoading,
      createPurchaseOrder,
      updatePurchaseOrder,
      updatePurchasePending,
      updatePurchaseReject,
      updatePurchaseApproved,
      getPurchaseOrderList,
      getPurchaseOrderById,
      singlePurchaseOrder,
    ]
  );

  return (
    <PurchaseOrderContext.Provider value={contextValue}>
      {children}
    </PurchaseOrderContext.Provider>
  );
};

export const usePurchaseOrder = () => useContext(PurchaseOrderContext);
