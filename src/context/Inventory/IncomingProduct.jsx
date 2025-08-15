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
const IncomingProductContext = createContext(null);

// Validation utilities
const validateIncomingProductData = (data) => {
  const errors = {};
  if (!data.receipt_type) errors.receipt_type = "Receipt type is required";
  if (!data.source_location)
    errors.source_location = "Source location is required";
  if (!data.destination_location)
    errors.destination_location = "Destination location is required";

  return errors;
};

export const IncomingProductProvider = ({ children }) => {
  const { tenantData } = useTenant();
  const [incomingProductList, setIncomingProductList] = useState([]);
  const [singleIncomingProduct, setSingleIncomingProduct] = useState(null);
  const [returnList, setReturnList] = useState([]);
  const [backOrder, setBackOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const { tenant_schema_name, access_token, refresh_token } = tenantData || {};
  const client = useMemo(() => {
    if (!tenant_schema_name || !access_token || !refresh_token) return null;
    return getTenantClient(tenant_schema_name, access_token, refresh_token);
  }, [tenant_schema_name, access_token, refresh_token]);

  // Fetch list, optionally with search
  const getIncomingProductList = useCallback(
    async (search = "", location_id = "") => {
      if (!client) {
        setError("API client not initialized.");
        return;
      }
      setIsLoading(true);
      try {
        const params = search ? { search } : {};
        const { data } = await client.get(
          `/inventory/incoming-product/?destination_location__id=${location_id}`,
          {
            params,
          }
        );
        setIncomingProductList(data);
        setError(null);
      } catch (err) {
        setError(err.message || "Failed to fetch incoming products");
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  const getIncomingReturnList = useCallback(
    async (search = "") => {
      if (!client) {
        setError("API client not initialized.");
        return;
      }
      setIsLoading(true);
      try {
        const params = search ? { search } : {};
        const { data } = await client.get(
          `/inventory/return-incoming-product/`,
          {
            params,
          }
        );
        setReturnList(data);
        setError(null);
      } catch (err) {
        setError(err.message || "Failed to fetch incoming products");
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  const getSingleIncomingProduct = useCallback(
    async (id) => {
      if (!client) {
        const msg = "API client not initialized.";
        setError(msg);
        return Promise.reject(new Error(msg));
      }
      setIsLoading(true);
      try {
        const { data } = await client.get(`/inventory/incoming-product/${id}/`);
        if (!data) {
          const msg = "Incoming product not found";
          setError(msg);
          return Promise.reject(new Error(msg));
        }
        setSingleIncomingProduct(data);
        setError(null);
        return { success: true, data };
      } catch (err) {
        setError(err.message || "Failed to load incoming product");
        return Promise.reject(err);
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  const createIncomingProduct = useCallback(
    async (formData) => {
      if (!client) throw new Error("API client not initialized.");

      const errors = validateIncomingProductData(formData);
      if (Object.keys(errors).length) {
        throw { validation: errors };
      }

      setIsLoading(true);
      try {
        const payload = {
          receipt_type: formData.receipt_type,
          related_po: formData.related_po || null,
          supplier: Number(formData.supplier),
          source_location: formData.source_location,
          destination_location: formData.destination_location,
          incoming_product_items: formData.incoming_product_items,
          status: formData.status,
          is_validated: formData.is_validated ?? true,
          can_edit: formData.can_edit ?? true,
          is_hidden: formData.is_hidden ?? false,
        };
        const { data } = await client.post(
          "/inventory/incoming-product/",
          payload
        );
        setIncomingProductList((prev) => [...prev, data]);
        setError(null);

        return { success: true, data };
      } catch (err) {
        setError(err.message || "Failed to create incoming product");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  const createIncomingProductBackOrder = useCallback(
    async (formData) => {
      if (!client) throw new Error("API client not initialized.");

      setIsLoading(true);
      try {
        const { data } = await client.post(
          "/inventory/create-back-order/",
          formData
        );
        setError(null);

        return { success: true, data };
      } catch (err) {
        setError(err.message || "Failed to create incoming product");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  const createIncomingProductReturns = useCallback(
    async (formData) => {
      if (!client) throw new Error("API client not initialized.");
      setIsLoading(true);
      try {
        const { data } = await client.post(
          "/inventory/return-incoming-product/ ", // ✅ Correct endpoint for returns
          formData
        );

        setError(null);
        return { success: true, data };
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to create incoming product return"
        );
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  const getIncomingProductBackOrder = useCallback(
    async (incoming_product_id) => {
      if (!client) throw new Error("API client not initialized.");

      setIsLoading(true);
      console.log(incoming_product_id);
      try {
        const { data } = await client.get(
          `/inventory/incoming-product/${incoming_product_id}/get_backorder/`
        );
        setError(null);
        setBackOrder({ success: true, data: data });

        return { success: true, data };
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to create incoming product");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  const editIncomingProductBackOrder = useCallback(
    async (formData, id) => {
      if (!client) throw new Error("API client not initialized.");

      setIsLoading(true);
      try {
        const { data } = await client.patch(
          `/inventory/create-back-order/${id}/`,
          formData
        );
        setError(null);

        return { success: true, data };
      } catch (err) {
        setError(err.message || "Failed to create incoming product");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );
  const updateIncomingProduct = useCallback(
    async (id, formData) => {
      if (!client) throw new Error("API client not initialized.");

      setIsLoading(true);
      try {
        const payload = {
          receipt_type: formData.receipt_type,
          related_po: formData.related_po || null,
          supplier: Number(formData.supplier),
          source_location: formData.source_location,
          destination_location: formData.destination_location,
          incoming_product_items: formData.incoming_product_items,
          status: formData.status,
          is_validated: formData.is_validated ?? true,
          can_edit: formData.can_edit ?? true,
          is_hidden: formData.is_hidden ?? false,
        };
        const { data } = await client.patch(
          `/inventory/incoming-product/${id}/`,
          payload
        );
        setIncomingProductList((prev) =>
          prev.map((item) => (item.id === id ? data : item))
        );
        setError(null);
        return data;
      } catch (err) {
        setError(err.message || "Failed to update incoming product");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  const updateIncomingProductStatus = useCallback(
    async (id, formData) => {
      if (!client) throw new Error("API client not initialized.");

      setIsLoading(true);
      try {
        const { data } = await client.patch(
          `/inventory/incoming-product/${id}/`,
          formData
        );

        setIncomingProductList((prev) =>
          prev.map((item) => (item.id === id ? data : item))
        );
        setError(null);
        return data;
      } catch (err) {
        setError(err.message || "Failed to update incoming product");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  const contextValue = useMemo(
    () => ({
      incomingProductList,
      singleIncomingProduct,
      returnList,
      backOrder,
      isLoading,
      error,
      getIncomingProductList,
      getSingleIncomingProduct,
      createIncomingProduct,
      createIncomingProductBackOrder,
      createIncomingProductReturns,
      getIncomingReturnList,
      getIncomingProductBackOrder,
      editIncomingProductBackOrder,
      updateIncomingProduct,
      updateIncomingProductStatus,
    }),
    [
      incomingProductList,
      singleIncomingProduct,
      backOrder,
      returnList,
      isLoading,
      error,
      getIncomingProductList,
      getSingleIncomingProduct,
      createIncomingProduct,
      getIncomingReturnList,
      createIncomingProductBackOrder,
      createIncomingProductReturns,
      getIncomingProductBackOrder,
      editIncomingProductBackOrder,
      updateIncomingProduct,
      updateIncomingProductStatus,
    ]
  );

  return (
    <IncomingProductContext.Provider value={contextValue}>
      {children}
    </IncomingProductContext.Provider>
  );
};

export const useIncomingProduct = () => {
  const context = useContext(IncomingProductContext);
  if (!context) {
    throw new Error(
      "useIncomingProduct must be used within an IncomingProductProvider"
    );
  }
  return context;
};
