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
const ScrapContext = createContext(null);

// Validation utilities
const validateScrapData = (data) => {
  const errors = {};
  if (!data.location) errors.location = "Warehouse location is required";
  if (!data.adjustmentType)
    errors.adjustmentTypes = "Adjustment type is required";
  if (!data.notes) errors.notes = "Notes are required";
  return errors;
};

const validateScrapItemData = (data) => {
  const errors = {};
  if (!data.product) errors.product = "Product is required";
  if (data.adjusted_quantity == null)
    errors.adjusted_quantity = "Adjusted quantity is required";
  return errors;
};

export const ScrapProvider = ({ children }) => {
  const { tenantData } = useTenant();
  const [scrapList, setScrapList] = useState([]);
  const [singleScrap, setSingleScrap] = useState(null);
  const [scrapItemList, setScrapItemList] = useState([]);
  const [singleScrapItem, setSingleScrapItem] = useState(null);
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

  // Scrap endpoints
  const getScrapList = useCallback(async () => {
    if (!client) {
      const msg = "API client not initialized.";
      setError(msg);
      return Promise.reject(new Error(msg));
    }
    setIsLoading(true);
    try {
      const { data: rawData } = await client.get("/inventory/scrap/");
      const normalizedData = await Promise.all(
        rawData.map(async (scrap) => await normalizeStockAdjustment(scrap))
      );
      setScrapList(normalizedData);
      setError(null);
      return { success: true, data: normalizedData };
    } catch (err) {
      setError(err.message || "Failed to load scraps");
      return Promise.reject(err);
    } finally {
      setIsLoading(false);
    }
  }, [client]);

  const getSingleScrap = useCallback(
    async (id) => {
      if (!client) {
        const msg = "API client not initialized.";
        setError(msg);
        return Promise.reject(new Error(msg));
      }
      setIsLoading(true);
      try {
        const { data } = await client.get(`/inventory/scrap/${id}/`);
        setSingleScrap(data);
        setError(null);
        return { success: true, data };
      } catch (err) {
        setError(err.message || "Failed to load scrap");
        return Promise.reject(err);
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  const createScrap = useCallback(
    async (scrapData) => {
      if (!client) {
        const msg = "API client not initialized.";
        setError(msg);
        return Promise.reject(new Error(msg));
      }

      const errors = validateScrapData(scrapData);
      if (Object.keys(errors).length) {
        throw { validation: errors };
      }
      setIsLoading(true);
      try {
        const payload = {
          warehouse_location: scrapData.location.id,
          adjustment_type: scrapData.adjustmentType?.toLowerCase(),
          // date: scrapData.date,
          notes: scrapData.notes,
          status: scrapData.status || "draft",
          scrap_items: scrapData.items,
          is_hidden: false,
        };

        const { data } = await client.post("/inventory/scrap/", payload);
        setScrapList((prev) => [...prev, data]);
        setError(null);
        return { success: true, data };
      } catch (err) {
        setError(err.message || "Failed to create scrap");
        return Promise.reject(err);
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  const updateScrap = useCallback(
    async (scrapData, id) => {
      if (!client) {
        const msg = "API client not initialized.";
        setError(msg);
        return Promise.reject(new Error(msg));
      }

      const errors = validateScrapData(scrapData);
      if (Object.keys(errors).length) {
        throw { validation: errors };
      }
      setIsLoading(true);
      try {
        const payload = {
          warehouse_location: scrapData.location.url,
          adjustment_type: scrapData.adjustmentType?.toLowerCase(),
          // date: scrapData.date,
          notes: scrapData.notes,
          status: scrapData.status || "draft",
          scrap_items: scrapData.items,
          is_hidden: false,
        };

        const { data } = await client.patch(`/inventory/scrap/${id}/`, payload);
        setScrapList((prev) => [...prev, data]);
        setError(null);
        return { success: true, data };
      } catch (err) {
        setError(err.message || "Failed to update scrap");
        return Promise.reject(err);
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  // Scrap item endpoints
  const getScrapItemList = useCallback(async () => {
    if (!client) {
      const msg = "API client not initialized.";
      setError(msg);
      return Promise.reject(new Error(msg));
    }
    setIsLoading(true);
    try {
      const { data } = await client.get("/inventory/scrap/scrap-item/");
      setScrapItemList(data);
      setError(null);
      return { success: true, data };
    } catch (err) {
      setError(err.message || "Failed to load scrap items");
      return Promise.reject(err);
    } finally {
      setIsLoading(false);
    }
  }, [client]);

  const getSingleScrapItem = useCallback(
    async (id) => {
      if (!client) {
        const msg = "API client not initialized.";
        setError(msg);
        return Promise.reject(new Error(msg));
      }
      setIsLoading(true);
      try {
        const { data } = await client.get(`/inventory/scrap/scrap-item/${id}/`);
        setSingleScrapItem(data);
        setError(null);
        return { success: true, data };
      } catch (err) {
        setError(err.message || "Failed to load scrap item");
        return Promise.reject(err);
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  const createScrapItem = useCallback(
    async (itemData) => {
      const errors = validateScrapItemData(itemData);
      if (Object.keys(errors).length) return Promise.reject(errors);
      if (!client) {
        const msg = "API client not initialized.";
        setError(msg);
        return Promise.reject(new Error(msg));
      }
      setIsLoading(true);
      try {
        const { data } = await client.post(
          "/inventory/scrap/scrap-item/",
          itemData
        );
        setScrapItemList((prev) => [...prev, data]);
        setError(null);
        return { success: true, data };
      } catch (err) {
        setError(err.message || "Failed to create scrap item");
        return Promise.reject(err);
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  const updateScrapItem = useCallback(
    async (id, itemData) => {
      const errors = validateScrapItemData(itemData);
      if (Object.keys(errors).length) return Promise.reject(errors);
      if (!client) {
        const msg = "API client not initialized.";
        setError(msg);
        return Promise.reject(new Error(msg));
      }
      setIsLoading(true);
      try {
        const { data } = await client.put(
          `/inventory/scrap/scrap-item/${id}/`,
          itemData
        );
        setScrapItemList((prev) =>
          prev.map((itm) => (itm.id === id ? data : itm))
        );
        setError(null);
        return { success: true, data };
      } catch (err) {
        setError(err.message || "Failed to update scrap item");
        return Promise.reject(err);
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  const patchScrapItem = useCallback(
    async (id, itemData) => {
      const errors = validateScrapItemData(itemData);
      if (Object.keys(errors).length) return Promise.reject(errors);
      if (!client) {
        const msg = "API client not initialized.";
        setError(msg);
        return Promise.reject(new Error(msg));
      }
      setIsLoading(true);
      try {
        const { data } = await client.patch(
          `/inventory/scrap/scrap-item/${id}/`,
          itemData
        );
        setScrapItemList((prev) =>
          prev.map((itm) => (itm.id === id ? data : itm))
        );
        setError(null);
        return { success: true, data };
      } catch (err) {
        setError(err.message || "Failed to patch scrap item");
        return Promise.reject(err);
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  const deleteScrapItem = useCallback(
    async (id) => {
      if (!client) {
        const msg = "API client not initialized.";
        setError(msg);
        return Promise.reject(new Error(msg));
      }
      setIsLoading(true);
      try {
        await client.delete(`/inventory/scrap/scrap-item/${id}/`);
        setScrapItemList((prev) => prev.filter((itm) => itm.id !== id));
        setError(null);
        return { success: true };
      } catch (err) {
        setError(err.message || "Failed to delete scrap item");
        return Promise.reject(err);
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  const contextValue = useMemo(
    () => ({
      scrapList,
      singleScrap,
      scrapItemList,
      singleScrapItem,
      isLoading,
      error,
      getScrapList,
      getSingleScrap,
      createScrap,
      updateScrap,
      getScrapItemList,
      getSingleScrapItem,
      createScrapItem,
      updateScrapItem,
      patchScrapItem,
      deleteScrapItem,
    }),
    [
      scrapList,
      singleScrap,
      scrapItemList,
      singleScrapItem,
      isLoading,
      error,
      getScrapList,
      getSingleScrap,
      createScrap,
      updateScrap,
      getScrapItemList,
      getSingleScrapItem,
      createScrapItem,
      updateScrapItem,
      patchScrapItem,
      deleteScrapItem,
    ]
  );

  return (
    <ScrapContext.Provider value={contextValue}>
      {children}
    </ScrapContext.Provider>
  );
};

export const useScrap = () => {
  const context = useContext(ScrapContext);
  if (!context) {
    throw new Error("useScrap must be used within a ScrapProvider");
  }
  return context;
};
