import React, { createContext, useContext, useState, useMemo, useCallback } from "react";
import { getTenantClient } from "../services/apiService";
import { useTenant } from "./TenantContext";

const PurchaseOrderContext = createContext();

export const PurchaseOrderProvider = ({ children }) => {
  const { tenantData } = useTenant();
  const [purchaseOrderList, setPurchaseOrderList] = useState([]);
  const [singlePurchaseOrder, setSinglePurchaseOrder] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Safely destructure tenant information.
  const { tenant_schema_name, access_token, refresh_token } = tenantData || {};

  // Create a memoized API client when tenant data is available.
  const client = useMemo(() => {
    if (tenant_schema_name && access_token && refresh_token) {
      return getTenantClient(tenant_schema_name, access_token, refresh_token);
    }
    return null;
  }, [tenant_schema_name, access_token, refresh_token]);

  // Validate required fields for Purchase Order creation or update.
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

    if (
      !payment_terms ||
      !vendor ||
      !purchase_policy ||
      !delivery_terms ||
      !currency ||
      !status ||
      !created_by ||
      !items ||
      typeof is_hidden !== "boolean"
    ) {
      return false;
    }
    return true;
  };

  // Helper function to fetch a resource from a URL and ensure HTTPS.
  const fetchResource = async (url) => {
    try {
      const secureUrl = url.replace(/^http:\/\//i, "https://");
      const response = await client.get(secureUrl);
      return response.data;
    } catch (err) {
      console.error("Error fetching resource from", url, err);
      return null;
    }
  };

  // Normalize a purchase order by fetching detailed info for related resources.
  const normalizePurchaseOrder = async (order) => {
    const currencyDetail = await fetchResource(order.currency);
    const vendorDetail = await fetchResource(order.vendor);

    const normalizedItems = await Promise.all(
      order.items.map(async (item) => {
        const productDetail = item.product ? await fetchResource(item.product) : null;
        const unitDetail = item.unit_of_measure ? await fetchResource(item.unit_of_measure) : null;
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
      if (!validatePurchaseOrderFields(info)) {
        const errMsg = "All fields are required and must be valid.";
        console.error("Validation error:", info);
        setError(errMsg);
        return Promise.reject(new Error(errMsg));
      }
      if (!client) {
        const errMsg = "API client is not available. Please check tenant configuration.";
        setError(errMsg);
        return Promise.reject(new Error(errMsg));
      }
      try {
        setIsLoading(true);
        // Assuming endpoint for purchase order creation is '/purchase/purchase-order/'
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

  // Retrieve the Purchase Order list.
  const getPurchaseOrderList = useCallback(async () => {
    if (!client) {
      const errMsg = "API client is not available. Please check tenant configuration.";
      setError(errMsg);
      return Promise.reject(new Error(errMsg));
    }
    try {
      setIsLoading(true);
      const response = await client.get("/purchase/purchase-order/");
      const rawData = response.data;

      // Normalize each purchase order.
      const normalizedData = await Promise.all(
        rawData.map(async (order) => await normalizePurchaseOrder(order))
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

  // Memoize the context value to avoid unnecessary re-renders.
  const contextValue = useMemo(
    () => ({
      error,
      purchaseOrderList,
      isLoading,
      createPurchaseOrder,
      getPurchaseOrderList,
      singlePurchaseOrder,
      setSinglePurchaseOrder,
      setPurchaseOrderList,
    }),
    [
      error,
      purchaseOrderList,
      isLoading,
      createPurchaseOrder,
      getPurchaseOrderList,
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
