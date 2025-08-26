// src/context/BackOrderContext.jsx

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
const BackOrderContext = createContext(null);

// Validation utilities
const validateBackOrderData = (data) => {
  const errors = {};

  if (!data.receipt_type) errors.receipt_type = "Receipt type is required";
  if (!data.source_location)
    errors.source_location = "Source location is required";
  if (!data.destination_location)
    errors.destination_location = "Destination location is required";
  if (
    data.supplier === undefined ||
    data.supplier === null ||
    data.supplier === ""
  )
    errors.supplier = "Supplier is required";
  if (!data.backorder_of)
    errors.backorder_of = "Backorder source (backorder_of) is required";

  if (
    !Array.isArray(data.backorder_items) ||
    data.backorder_items.length === 0
  ) {
    errors.backorder_items = "At least one backorder item is required";
  } else {
    const itemErrors = data.backorder_items
      .map((it, idx) => {
        const e = {};
        if (it.product === undefined || it.product === null)
          e.product = "Product is required";
        if (
          it.expected_quantity === undefined ||
          it.expected_quantity === null ||
          it.expected_quantity === ""
        )
          e.expected_quantity = "Expected quantity is required";
        return Object.keys(e).length ? { index: idx, ...e } : null;
      })
      .filter(Boolean);

    if (itemErrors.length) errors.backorder_items_details = itemErrors;
  }

  return errors;
};

export const BackOrderProvider = ({ children }) => {
  const { tenantData } = useTenant();

  const [backOrderList, setBackOrderList] = useState([]);
  const [singleBackOrder, setSingleBackOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const { tenant_schema_name, access_token, refresh_token } = tenantData || {};
  const client = useMemo(() => {
    if (!tenant_schema_name || !access_token || !refresh_token) return null;
    return getTenantClient(tenant_schema_name, access_token, refresh_token);
  }, [tenant_schema_name, access_token, refresh_token]);

  // Fetch list with query params from swagger
  // Params supported:
  // - backorder_of__incoming_product_id
  // - destination_location__id
  // - search
  // - status (canceled | draft | validated)
  const getBackOrderList = useCallback(
    async (
      search = "",
      destination_location_id = "",
      status = "",
      backorder_of_incoming_product_id = ""
    ) => {
      if (!client) {
        setError("API client not initialized.");
        return;
      }
      setIsLoading(true);
      try {
        const params = {};
        if (search) params.search = search;
        if (destination_location_id)
          params.destination_location__id = destination_location_id;
        if (status) params.status = status;
        if (backorder_of_incoming_product_id)
          params.backorder_of__incoming_product_id =
            backorder_of_incoming_product_id;

        const { data } = await client.get(`/inventory/back-order/?form=true`, {
          params,
        });
        setBackOrderList(data);
        setError(null);
      } catch (err) {
        setError(err.message || "Failed to fetch back orders");
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  // Active list
  const getActiveBackOrderList = useCallback(async () => {
    if (!client) {
      setError("API client not initialized.");
      return;
    }
    setIsLoading(true);
    try {
      const { data } = await client.get(`/inventory/back-order/active_list/`);
      // API returns a single object in example, but likely an array in real impl.
      // Normalize to array if needed.
      const normalized = Array.isArray(data) ? data : [data];
      setBackOrderList(normalized);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to fetch active back orders");
    } finally {
      setIsLoading(false);
    }
  }, [client]);

  // Get single by backorder_id
  const getSingleBackOrder = useCallback(
    async (backorder_id) => {
      if (!client) {
        const msg = "API client not initialized.";
        setError(msg);
        return Promise.reject(new Error(msg));
      }
      setIsLoading(true);
      try {
        const { data } = await client.get(
          `/inventory/back-order/${encodeURIComponent(backorder_id)}/?form=true`
        );
        if (!data) {
          const msg = "Back order not found";
          setError(msg);
          return Promise.reject(new Error(msg));
        }
        setSingleBackOrder(data);
        setError(null);
        return { success: true, data };
      } catch (err) {
        setError(err.message || "Failed to load back order");
        return Promise.reject(err);
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  // Create back order
  const createBackOrder = useCallback(
    async (formData) => {
      if (!client) throw new Error("API client not initialized.");

      const errors = validateBackOrderData(formData);
      if (Object.keys(errors).length) throw { validation: errors };

      setIsLoading(true);
      try {
        // Keep payload keys aligned with swagger
        const payload = {
          backorder_id: formData.backorder_id || undefined, // optional if server generates it
          backorder_of: formData.backorder_of, // required by our validation
          backorder_items: formData.backorder_items,
          source_location: formData.source_location,
          destination_location: formData.destination_location,
          supplier: Number(formData.supplier),
          status: formData.status || "draft",
          receipt_type: formData.receipt_type,
        };

        const { data } = await client.post(`/inventory/back-order/`, payload);
        setBackOrderList((prev) => [...prev, data]);
        setError(null);
        return { success: true, data };
      } catch (err) {
        setError(err.message || "Failed to create back order");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  // Full update (PUT) — optional but exposed since swagger supports PUT
  const replaceBackOrder = useCallback(
    async (backorder_id, formData) => {
      if (!client) throw new Error("API client not initialized.");

      setIsLoading(true);
      try {
        const payload = {
          backorder_id: formData.backorder_id || backorder_id,
          backorder_of: formData.backorder_of,
          backorder_items: formData.backorder_items || [],
          source_location: formData.source_location,
          destination_location: formData.destination_location,
          supplier: Number(formData.supplier),
          status: formData.status || "draft",
          receipt_type: formData.receipt_type,
        };

        const { data } = await client.put(
          `/inventory/back-order/${encodeURIComponent(backorder_id)}/`,
          payload
        );
        setBackOrderList((prev) =>
          prev.map((item) => (item.backorder_id === backorder_id ? data : item))
        );
        setError(null);
        return data;
      } catch (err) {
        setError(err.message || "Failed to update back order");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  // Partial update (PATCH)
  const updateBackOrder = useCallback(
    async (backorder_id, formData) => {
      if (!client) throw new Error("API client not initialized.");

      setIsLoading(true);
      try {
        const { data } = await client.patch(
          `/inventory/back-order/${encodeURIComponent(
            backorder_id
          )}/?form=true`,
          formData
        );
        setBackOrderList((prev) =>
          prev.map((item) => (item.backorder_id === backorder_id ? data : item))
        );
        setError(null);
        return data;
      } catch (err) {
        setError(err.message || "Failed to update back order");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  // Update only status (PATCH)
  const updateBackOrderStatus = useCallback(
    async (backorder_id, status) => {
      if (!client) throw new Error("API client not initialized.");

      setIsLoading(true);
      try {
        const { data } = await client.patch(
          `/inventory/back-order/${encodeURIComponent(backorder_id)}/`,
          { status }
        );
        setBackOrderList((prev) =>
          prev.map((item) => (item.backorder_id === backorder_id ? data : item))
        );
        setError(null);
        return data;
      } catch (err) {
        setError(err.message || "Failed to update back order status");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  // Toggle hidden status (PATCH by default; endpoint also supports PUT)
  const toggleBackOrderHiddenStatus = useCallback(
    async (backorder_id, method = "PATCH") => {
      if (!client) throw new Error("API client not initialized.");

      setIsLoading(true);
      try {
        const url = `/inventory/back-order/${encodeURIComponent(
          backorder_id
        )}/toggle_hidden_status/`;
        const { data } =
          method === "PUT" ? await client.put(url) : await client.patch(url);

        setBackOrderList((prev) =>
          prev.map((item) => (item.backorder_id === backorder_id ? data : item))
        );
        setError(null);
        return data;
      } catch (err) {
        setError(err.message || "Failed to toggle hidden status");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  // Soft delete
  const softDeleteBackOrder = useCallback(
    async (backorder_id) => {
      if (!client) throw new Error("API client not initialized.");

      setIsLoading(true);
      try {
        await client.delete(
          `/inventory/back-order/${encodeURIComponent(
            backorder_id
          )}/soft_delete/`
        );
        setBackOrderList((prev) =>
          prev.filter((item) => item.backorder_id !== backorder_id)
        );
        setError(null);
        return { success: true };
      } catch (err) {
        setError(err.message || "Failed to delete back order");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  const contextValue = useMemo(
    () => ({
      backOrderList,
      singleBackOrder,
      isLoading,
      error,
      // queries
      getBackOrderList,
      getActiveBackOrderList,
      getSingleBackOrder,
      // mutations
      createBackOrder,
      replaceBackOrder,
      updateBackOrder,
      updateBackOrderStatus,
      toggleBackOrderHiddenStatus,
      softDeleteBackOrder,
    }),
    [
      backOrderList,
      singleBackOrder,
      isLoading,
      error,
      getBackOrderList,
      getActiveBackOrderList,
      getSingleBackOrder,
      createBackOrder,
      replaceBackOrder,
      updateBackOrder,
      updateBackOrderStatus,
      toggleBackOrderHiddenStatus,
      softDeleteBackOrder,
    ]
  );

  return (
    <BackOrderContext.Provider value={contextValue}>
      {children}
    </BackOrderContext.Provider>
  );
};

export const useBackOrder = () => {
  const context = useContext(BackOrderContext);
  if (!context) {
    throw new Error("useBackOrder must be used within a BackOrderProvider");
  }
  return context;
};
