import React, { createContext, useContext, useState, useMemo, useCallback } from "react";
import { useTenant } from "../TenantContext";
import { getTenantClient } from "../../services/apiService";

// Create context
const StockAdjustmentContext = createContext(null);

// Validation utilities
const validateStockAdjustmentData = (data) => {
  const errors = {};
  if (!data.location) errors.location = "Warehouse location is required";
  if (!data.adjustmentType) errors.adjustmentType = "Adjustment type is required";
  if (!data.date) errors.date = "Date is required";
  if (!data.notes) errors.notes = "Notes are required";
  return errors;
};

const validateItemData = (data) => {
  const errors = {};
  if (!data.product) errors.product = "Product is required";
  if (data.adjusted_quantity == null) errors.adjusted_quantity = "Adjusted quantity is required";
  if (!data.stock_adjustment) errors.stock_adjustment = "Stock adjustment ID is required";
  return errors;
};

export const StockAdjustmentProvider = ({ children }) => {
  const { tenantData } = useTenant();
  const [adjustmentList, setAdjustmentList] = useState([]);
  const [singleAdjustment, setSingleAdjustment] = useState(null);
  const [itemList, setItemList] = useState([]);
  const [singleItem, setSingleItem] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const { tenant_schema_name, access_token, refresh_token } = tenantData || {};
  const client = useMemo(() => {
    if (!tenant_schema_name || !access_token || !refresh_token) return null;
    return getTenantClient(tenant_schema_name, access_token, refresh_token);
  }, [tenant_schema_name, access_token, refresh_token]);

  // Stock adjustment endpoints
  const getStockAdjustmentList = useCallback(async () => {
    if (!client) {
      const msg = "API client not initialized.";
      setError(msg);
      return Promise.reject(new Error(msg));
    }
    setIsLoading(true);
    try {
      const { data } = await client.get("/inventory/stock-adjustment/");
      setAdjustmentList(data);
      setError(null);
      return { success: true, data };
    } catch (err) {
      setError(err.message || "Failed to load stock adjustments");
      return Promise.reject(err);
    } finally {
      setIsLoading(false);
    }
  }, [client]);

  const getSingleStockAdjustment = useCallback(
    async (id) => {
      if (!client) {
        const msg = "API client not initialized.";
        setError(msg);
        return Promise.reject(new Error(msg));
      }
      setIsLoading(true);
      try {
        const { data } = await client.get(`/inventory/stock-adjustment/${id}/`);
        setSingleAdjustment(data);
        setError(null);
        return { success: true, data };
      } catch (err) {
        setError(err.message || "Failed to load stock adjustment");
        return Promise.reject(err);
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  const createStockAdjustment = useCallback(
    async (adjustmentData) => {
      const errors = validateStockAdjustmentData(adjustmentData);
      if (Object.keys(errors).length) return Promise.reject(errors);
      if (!client) {
        const msg = "API client not initialized.";
        setError(msg);
        return Promise.reject(new Error(msg));
      }
      setIsLoading(true);
      try {
        const payload = {
          id: adjustmentData.id,
          warehouse_location: adjustmentData.location,
          adjustment_type: adjustmentData.adjustmentType,
          date: adjustmentData.date,
          notes: adjustmentData.notes,
          status: adjustmentData.status || "draft",
          is_hidden: adjustmentData.isHidden ?? true,
        };
        const { data } = await client.post(
          "/inventory/stock-adjustment/",
          payload
        );
        setAdjustmentList((prev) => [...prev, data]);
        setError(null);
        return { success: true, data };
      } catch (err) {
        setError(err.message || "Failed to create stock adjustment");
        return Promise.reject(err);
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  // Stock adjustment item endpoints
  const getStockAdjustmentItemList = useCallback(async () => {
    if (!client) {
      const msg = "API client not initialized.";
      setError(msg);
      return Promise.reject(new Error(msg));
    }
    setIsLoading(true);
    try {
      const { data } = await client.get(
        "/inventory/stock-adjustment/stock-adjustment-item/"
      );
      setItemList(data);
      setError(null);
      return { success: true, data };
    } catch (err) {
      setError(err.message || "Failed to load adjustment items");
      return Promise.reject(err);
    } finally {
      setIsLoading(false);
    }
  }, [client]);

  const getSingleStockAdjustmentItem = useCallback(
    async (id) => {
      if (!client) {
        const msg = "API client not initialized.";
        setError(msg);
        return Promise.reject(new Error(msg));
      }
      setIsLoading(true);
      try {
        const { data } = await client.get(
          `/inventory/stock-adjustment/stock-adjustment-item/${id}/`
        );
        setSingleItem(data);
        setError(null);
        return { success: true, data };
      } catch (err) {
        setError(err.message || "Failed to load adjustment item");
        return Promise.reject(err);
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  const createStockAdjustmentItem = useCallback(
    async (itemData) => {
      const errors = validateItemData(itemData);
      if (Object.keys(errors).length) return Promise.reject(errors);
      if (!client) {
        const msg = "API client not initialized.";
        setError(msg);
        return Promise.reject(new Error(msg));
      }
      setIsLoading(true);
      try {
        const { data } = await client.post(
          "/inventory/stock-adjustment/stock-adjustment-item/",
          itemData
        );
        setItemList((prev) => [...prev, data]);
        setError(null);
        return { success: true, data };
      } catch (err) {
        setError(err.message || "Failed to create adjustment item");
        return Promise.reject(err);
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  const updateStockAdjustmentItem = useCallback(
    async (id, itemData) => {
      const errors = validateItemData(itemData);
      if (Object.keys(errors).length) return Promise.reject(errors);
      if (!client) {
        const msg = "API client not initialized.";
        setError(msg);
        return Promise.reject(new Error(msg));
      }
      setIsLoading(true);
      try {
        const { data } = await client.put(
          `/inventory/stock-adjustment/stock-adjustment-item/${id}/`,
          itemData
        );
        setItemList((prev) =>
          prev.map((itm) => (itm.id === id ? data : itm))
        );
        setError(null);
        return { success: true, data };
      } catch (err) {
        setError(err.message || "Failed to update adjustment item");
        return Promise.reject(err);
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  const patchStockAdjustmentItem = useCallback(
    async (id, itemData) => {
      const errors = validateItemData(itemData);
      if (Object.keys(errors).length) return Promise.reject(errors);
      if (!client) {
        const msg = "API client not initialized.";
        setError(msg);
        return Promise.reject(new Error(msg));
      }
      setIsLoading(true);
      try {
        const { data } = await client.patch(
          `/inventory/stock-adjustment/stock-adjustment-item/${id}/`,
          itemData
        );
        setItemList((prev) =>
          prev.map((itm) => (itm.id === id ? data : itm))
        );
        setError(null);
        return { success: true, data };
      } catch (err) {
        setError(err.message || "Failed to patch adjustment item");
        return Promise.reject(err);
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  const deleteStockAdjustmentItem = useCallback(
    async (id) => {
      if (!client) {
        const msg = "API client not initialized.";
        setError(msg);
        return Promise.reject(new Error(msg));
      }
      setIsLoading(true);
      try {
        await client.delete(
          `/inventory/stock-adjustment/stock-adjustment-item/${id}/`
        );
        setItemList((prev) => prev.filter((itm) => itm.id !== id));
        setError(null);
        return { success: true };
      } catch (err) {
        setError(err.message || "Failed to delete adjustment item");
        return Promise.reject(err);
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  const contextValue = useMemo(
    () => ({
      adjustmentList,
      singleAdjustment,
      itemList,
      singleItem,
      isLoading,
      error,
      getStockAdjustmentList,
      getSingleStockAdjustment,
      createStockAdjustment,
      getStockAdjustmentItemList,
      getSingleStockAdjustmentItem,
      createStockAdjustmentItem,
      updateStockAdjustmentItem,
      patchStockAdjustmentItem,
      deleteStockAdjustmentItem,
    }),
    [
      adjustmentList,
      singleAdjustment,
      itemList,
      singleItem,
      isLoading,
      error,
      getStockAdjustmentList,
      getSingleStockAdjustment,
      createStockAdjustment,
      getStockAdjustmentItemList,
      getSingleStockAdjustmentItem,
      createStockAdjustmentItem,
      updateStockAdjustmentItem,
      patchStockAdjustmentItem,
      deleteStockAdjustmentItem,
    ]
  );

  return (
    <StockAdjustmentContext.Provider value={contextValue}>
      {children}
    </StockAdjustmentContext.Provider>
  );
};

export const useStockAdjustment = () => {
  const context = useContext(StockAdjustmentContext);
  if (!context) {
    throw new Error("useStockAdjustment must be used within a StockAdjustmentProvider");
  }
  return context;
};
