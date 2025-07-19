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

  const { tenant_schema_name, access_token, refresh_token } = tenantData || {};

  const client = useMemo(() => {
    if (tenant_schema_name && access_token && refresh_token) {
      return getTenantClient(tenant_schema_name, access_token, refresh_token);
    }
    return null;
  }, [tenant_schema_name, access_token, refresh_token]);

  const validatePurchaseOrderFields = (info) => {
    const {
      status,
      vendor,
      currency,
      payment_terms,
      purchase_policy,
      delivery_terms,
      items,
      is_hidden,
    } = info;

    return (
      !!payment_terms &&
      !!vendor &&
      !!purchase_policy &&
      !!delivery_terms &&
      !!currency &&
      !!status &&
      !!items &&
      typeof is_hidden === "boolean"
    );
  };

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
        const response = await client.patch(
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
      setError(null);
      setPurchaseOrderList(rawData);
      return { success: true, data: rawData };
    } catch (err) {
      console.error("Error fetching purchase order list:", err);
      setError(err);
      return Promise.reject(err);
    } finally {
      setIsLoading(false);
    }
  }, [client]);

  const getApprovedPurchaseOrderList = useCallback(async () => {
    if (!client) {
      const clientError =
        "API client is not available. Please check tenant configuration.";
      setError(clientError);
      return Promise.reject(new Error(clientError));
    }
    try {
      setIsLoading(true);
      const response = await client.get(
        "/purchase/purchase-order/completed_list/"
      );
      const rawData = response.data;
      setError(null);
      setPurchaseOrderList(rawData);
      return { success: true, data: rawData };
    } catch (err) {
      console.error("Error fetching purchase order list:", err);
      setError(err);
      return Promise.reject(err);
    } finally {
      setIsLoading(false);
    }
  }, [client]);

  const getPurchaseOrderById = useCallback(
    async (id) => {
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
        setError(null);
        setSinglePurchaseOrder(rawData);
        return { success: true, data: rawData };
      } catch (err) {
        console.error("Error fetching single purchase order:", err);
        setError(err);
        return Promise.reject(err);
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

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
      getApprovedPurchaseOrderList,
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
      getApprovedPurchaseOrderList,
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
