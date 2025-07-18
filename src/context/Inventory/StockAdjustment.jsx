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
const StockAdjustmentContext = createContext(null);

// Validation utilities
const validateStockAdjustmentData = (data) => {
  const errors = {};
  if (!data.warehouse_location) {
    errors.warehouse_location = "Warehouse location is required";
  }
  if (!data.notes) {
    errors.notes = "Notes are required";
  }
  if (!Array.isArray(data.items) || data.items.length === 0) {
    errors.items = "At least one adjustment item is required";
  }
  return errors;
};

const validateItemData = (item) => {
  console.log(item);
  const errors = {};
  if (!item.product) {
    errors.product = "Product is required";
  }
  if (item.adjusted_quantity == null) {
    errors.adjusted_quantity = "Adjusted quantity is required";
  }
  if (!item.stock_adjustment) {
    errors.stock_adjustment = "Stock adjustment ID is required";
  }
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

  const fetchResource = useCallback(
    async (url) => {
      if (!client || !url) return null;
      try {
        const secureUrl = url.replace(/^http:\/\//i, "https://");
        const response = await client.get(secureUrl);
        return response.data;
      } catch (err) {
        console.error("Error fetching resource:", url, err);
        return null;
      }
    },
    [client]
  );

  const normalizeStockAdjustment = useCallback(
    async (stock_adjustment) => {
      // console.log(stock_adjustment);
      if (!stock_adjustment) return null;
      const warehouse = await fetchResource(
        stock_adjustment.warehouse_location
      );
      return {
        ...stock_adjustment,
        warehouse_location: warehouse,
      };
    },
    [fetchResource]
  );

  // Stock adjustment endpoints
  const getStockAdjustmentList = useCallback(async () => {
    if (!client) {
      setError("API client not initialized.");
      return;
    }
    setIsLoading(true);
    try {
      const { data: rawData } = await client.get(
        "/inventory/stock-adjustment/"
      );

      const normalized = await Promise.all(
        rawData.map((pr) => normalizeStockAdjustment(pr))
      );
      setAdjustmentList(normalized.filter(Boolean));
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load stock adjustments");
    } finally {
      setIsLoading(false);
    }
  }, [client, normalizeStockAdjustment]);

  const getSingleStockAdjustment = useCallback(
    async (id) => {
      if (!client) {
        const msg = "API client not initialized.";
        setError(msg);
        return Promise.reject(new Error(msg));
      }
      setIsLoading(true);
      try {
        console.log(client.defaults.baseURL);

        // Use template literal to insert the real id:
        const { data } = await client.get(`/inventory/stock-adjustment/${id}/`);
        setSingleAdjustment(data);
        setError(null);
        return { success: true, data };
      } catch (err) {
        console.error(err);
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
      if (!client) {
        throw new Error("API client not initialized.");
      }

      const errors = validateStockAdjustmentData(adjustmentData);
      if (Object.keys(errors).length > 0) {
        throw { validation: errors };
      }

      setIsLoading(true);
      try {
        const payload = {
          warehouse_location: adjustmentData.warehouse_location,
          stock_adjustment_items: adjustmentData.items,
          notes: adjustmentData.notes,
          status: adjustmentData.status || "draft",
          is_hidden: false,
        };
        const { data } = await client.post(
          "/inventory/stock-adjustment/",
          payload
        );
        setAdjustmentList((prev) => [...prev, data]);
        setError(null);
        return { success: true, data };
      } catch (err) {
        console.error(err);
        setError(err || "Failed to create stock adjustment");
        return { success: false, error: err };
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  const updateStockAdjustment = useCallback(
    async (adjustmentData, id) => {
      if (!client) {
        throw new Error("API client not initialized.");
      }

      const errors = validateStockAdjustmentData(adjustmentData);
      if (Object.keys(errors).length > 0) {
        throw { validation: errors };
      }

      setIsLoading(true);
      try {
        const payload = {
          warehouse_location: adjustmentData.warehouse_location || null,
          adjustment_type: adjustmentData.adjustment_type || null,
          stock_adjustment_items: adjustmentData.items,
          notes: adjustmentData.notes || null,
          status: adjustmentData.status || "draft",
          is_hidden: false,
        };

        console.log("Payload", payload);

        const { data } = await client.put(
          `/inventory/stock-adjustment/${id}/`,
          payload
        );

        setAdjustmentList((prev) =>
          prev.map((item) => (item.id === id ? data : item))
        );
        setError(null);
        return { success: true, data };
      } catch (err) {
        console.log(err);
        setError(err.message || "Failed to update stock adjustment");
        return { success: false, error: err.message };
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  const updateStockAdjustmentToDone = useCallback(
    async (id) => {
      if (!client) {
        throw new Error("API client not initialized.");
      }

      setIsLoading(true);
      try {
        const payload = {
          status: "done",
        };

        console.log("Payload", payload);

        const { data } = await client.patch(
          `/inventory/stock-adjustment/${id}/`,
          payload
        );

        setAdjustmentList((prev) =>
          prev.map((item) => (item.id === id ? data : item))
        );
        setError(null);
        return { success: true, data };
      } catch (err) {
        console.log(err);
        setError(err.message || "Failed to update stock adjustment");
        return { success: false, error: err.message };
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
        setItemList((prev) => prev.map((itm) => (itm.id === id ? data : itm)));
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
        setItemList((prev) => prev.map((itm) => (itm.id === id ? data : itm)));
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
      updateStockAdjustmentToDone,
      createStockAdjustment,
      getStockAdjustmentItemList,
      getSingleStockAdjustmentItem,
      createStockAdjustmentItem,
      updateStockAdjustment,
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
      updateStockAdjustmentToDone,
      getSingleStockAdjustmentItem,
      createStockAdjustmentItem,
      updateStockAdjustment,
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
    throw new Error(
      "useStockAdjustment must be used within a StockAdjustmentProvider"
    );
  }
  return context;
};
