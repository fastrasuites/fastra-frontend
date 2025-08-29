import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import { getTenantClient } from "../services/apiService";
import { useTenant } from "./TenantContext";

const PurchaseContext = createContext();

export const PurchaseProvider = ({ children }) => {
  const { tenantData } = useTenant();
  const [currencies, setCurrencies] = useState([]);
  const [purchaseRequests, setPurchaseRequests] = useState([]);
  const [products, setProducts] = useState([]);
  const [singleProducts, setSingleProducts] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [singleVendors, setSingleVendors] = useState([]);
  const [error, setError] = useState(null);

  const [loadingCurrencies, setLoadingCurrencies] = useState(false);
  const [savingCurrencyId, setSavingCurrencyId] = useState(null);
  const [deletingCurrencyId, setDeletingCurrencyId] = useState(null);

  const [unitsOfMeasure, setUnitsOfMeasure] = useState([]);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [savingUnitId, setSavingUnitId] = useState(null);
  const [deletingUnitId, setDeletingUnitId] = useState(null);

  const { tenant_schema_name, access_token, refresh_token } = tenantData || {};

  const client = useMemo(
    () =>
      tenantData
        ? getTenantClient(tenant_schema_name, access_token, refresh_token)
        : null,
    [tenantData, tenant_schema_name, access_token, refresh_token]
  );

  const fetchCurrencies = useCallback(
    async (search = "") => {
      if (!client) return;
      try {
        setLoadingCurrencies(true);
        const params = {};
        if (search && typeof search === "string" && search.trim()) {
          params.search = search.trim();
        }

        const response = await client.get("/purchase/currency/", { params });

        // DRF sometimes returns paginated object (results) or a flat array.
        const data = Array.isArray(response.data)
          ? response.data
          : response.data?.results ?? [];

        setCurrencies(data);
        setError(null);
        return data;
      } catch (err) {
        setError(err);
        // rethrow if caller expects it
        throw err;
      } finally {
        setLoadingCurrencies(false);
      }
    },
    [client]
  );

  const createCurrency = useCallback(
    async (newCurrency) => {
      try {
        const response = await client.post("/purchase/currency/", newCurrency);
        setCurrencies((prev) => [...prev, response.data]);
        return response.data;
      } catch (err) {
        setError(err);
        throw err;
      }
    },
    [client]
  );

  const updateCurrency = useCallback(
    async (id, payload) => {
      if (!client) throw new Error("No API client available");
      try {
        setSavingCurrencyId(id);
        const response = await client.patch(
          `/purchase/currency/${id}/`,
          payload
        );
        const updated = response?.data ?? { id, ...payload };

        // update local state
        setCurrencies((prev) =>
          prev.map((c) => (c.id === id ? { ...c, ...updated } : c))
        );

        setError(null);
        return updated;
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setSavingCurrencyId(null);
      }
    },
    [client]
  );

  const softDeleteCurrency = useCallback(
    async (id, { removeFromList = true } = {}) => {
      if (!client) throw new Error("No API client available");
      try {
        setDeletingCurrencyId(id);
        // The endpoint in your spec is a DELETE to /.../{id}/soft_delete/
        const response = await client.delete(
          `/purchase/currency/${id}/soft_delete/`
        );

        // Most backends return 204 No Content. Treat any 2xx as success.
        if (response.status >= 200 && response.status < 300) {
          if (removeFromList) {
            setCurrencies((prev) => prev.filter((c) => c.id !== id));
          } else {
            // alternatively mark hidden so UI keeps row but flagged
            setCurrencies((prev) =>
              prev.map((c) => (c.id === id ? { ...c, is_hidden: true } : c))
            );
          }
          setError(null);
          return true;
        } else {
          throw new Error(`Unexpected response status: ${response.status}`);
        }
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setDeletingCurrencyId(null);
      }
    },
    [client]
  );

  /**
   * fetchUnits({ search })
   * - GET /purchase/unit-of-measure/
   * - Optional search string
   */

  const fetchUnits = useCallback(
    async ({ search = "" } = {}) => {
      if (!client) return [];
      try {
        setLoadingUnits(true);
        const params = {};
        if (search && typeof search === "string" && search.trim())
          params.search = search.trim();

        const resp = await client.get("/purchase/unit-of-measure/", { params });

        // Accept DRF paginated or plain array; we only care about items list
        const items = Array.isArray(resp.data)
          ? resp.data
          : resp.data.results ?? [];
        setUnitsOfMeasure(items);
        setError(null);
        return items;
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setLoadingUnits(false);
      }
    },
    [client]
  );

  /**
   * createUnit(newUnit)
   * - POST /purchase/unit-of-measure/
   */
  const createUnit = useCallback(
    async (newUnit) => {
      if (!client) throw new Error("No API client available");
      try {
        const resp = await client.post("/purchase/unit-of-measure/", newUnit);
        const created = resp.data;
        setUnitsOfMeasure((prev) => [...prev, created]);
        return created;
      } catch (err) {
        setError(err);
        throw err;
      }
    },
    [client]
  );

  /**
   * updateUnit(id, payload)
   * - PATCH /purchase/unit-of-measure/{id}/
   */
  const updateUnit = useCallback(
    async (id, payload) => {
      if (!client) throw new Error("No API client available");
      try {
        setSavingUnitId(id);
        const resp = await client.patch(
          `/purchase/unit-of-measure/${id}/`,
          payload
        );
        const updated = resp.data ?? { id, ...payload };
        setUnitsOfMeasure((prev) =>
          prev.map((u) => (u.id === id ? { ...u, ...updated } : u))
        );
        setError(null);
        return updated;
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setSavingUnitId(null);
      }
    },
    [client]
  );

  /**
   * softDeleteUnit(id)
   * - DELETE /purchase/unit-of-measure/{id}/soft_delete/
   * - On success removes the item from local list
   */
  const softDeleteUnit = useCallback(
    async (id) => {
      if (!client) throw new Error("No API client available");
      try {
        setDeletingUnitId(id);
        const resp = await client.delete(
          `/purchase/unit-of-measure/${id}/soft_delete/`
        );
        if (resp.status >= 200 && resp.status < 300) {
          setUnitsOfMeasure((prev) => prev.filter((u) => u.id !== id));
          setError(null);
          return true;
        }
        throw new Error(`Unexpected status ${resp.status}`);
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setDeletingUnitId(null);
      }
    },
    [client]
  );

  const uploadFile = useCallback(
    async (file, endpoint) => {
      const formData = new FormData();
      formData.append("file", file);
      try {
        const response = await client.post(endpoint, formData, {
          headers: { "Content-type": "multipart/form-data" },
        });
        return response.data;
      } catch (err) {
        setError(err);
        throw err;
      }
    },
    [client]
  );

  const downloadExcelTemplate = useCallback(
    async (endpoint) => {
      try {
        const response = await client.get(endpoint, {
          responseType: "blob",
        });
        const contentDisposition = response.headers["content-disposition"];
        let filename = "template.xlsx";
        if (contentDisposition && contentDisposition.includes("filename=")) {
          const filenameMatch = contentDisposition
            .split("filename=")[1]
            ?.replace(/['"]/g, "")
            .trim();
          filename = filenameMatch || "template.xlsx";
        }

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (err) {
        setError(err);
        throw err;
      }
    },
    [client]
  );

  const fetchVendorsForForm = useCallback(
    async (searchTerm = "") => {
      try {
        const params = searchTerm ? { search: searchTerm } : {};
        const response = await client.get("/purchase/vendors/?form=true", {
          params,
        });
        setVendors(response.data);
        return response.data;
      } catch (err) {
        setError(err);
      }
    },
    [client]
  );

  const fetchVendors = useCallback(
    async (searchTerm = "") => {
      try {
        const params = searchTerm ? { search: searchTerm } : {};
        const response = await client.get("/purchase/vendors/", { params });
        setVendors(response.data);
        return response.data;
      } catch (err) {
        setError(err);
      }
    },
    [client]
  );

  const createVendor = useCallback(
    async (newVendor) => {
      try {
        const response = await client.post("/purchase/vendors/", newVendor, {
          headers: { "Content-type": "multipart/form-data" },
        });
        setVendors((prev) => [...prev, response.data]);
        return { success: true, data: response.data };
      } catch (err) {
        setError(err);
        console.error("Error: ", err);
        return err;
        throw new Error(err);
      }
    },
    [client]
  );

  const updateVendor = useCallback(
    async (vendorId, updatedData) => {
      try {
        const response = await client.patch(
          `/purchase/vendors/${vendorId}/`,
          updatedData,
          {
            headers: { "Content-type": "multipart/form-data" },
          }
        );
        return response.data;
      } catch (error) {
        console.error("Error updating vendor:", error);
        throw error;
      }
    },
    [client]
  );

  const fetchSingleVendors = useCallback(
    async (id) => {
      try {
        const response = await client.get(`/purchase/vendors/${id}/`);
        setSingleVendors(response.data);
        return response.data;
      } catch (err) {
        setError(err);
      }
    },
    [client]
  );

  const fetchProducts = useCallback(
    async (searchTerm = "") => {
      try {
        const params = searchTerm ? { search: searchTerm } : {};
        const response = await client.get("/purchase/products/", { params });
        setProducts(response.data);
      } catch (err) {
        console.error(err);
        setError(err);
      }
    },
    [client]
  );

  const fetchProductsForForm = useCallback(
    async (searchTerm = "") => {
      try {
        const params = searchTerm ? { search: searchTerm } : {};
        const response = await client.get("/purchase/products/?form=true", {
          params,
        });
        setProducts(response.data);
      } catch (err) {
        console.error(err);
        setError(err);
      }
    },
    [client]
  );

  const fetchSingleProduct = useCallback(
    async (id) => {
      try {
        const response = await client.get(`/purchase/products/${id}/`);
        setSingleProducts(response.data);
        return { success: true, data: response.data };
      } catch (err) {
        setError(err);
      }
    },
    [client]
  );

  const createProduct = useCallback(
    async (newProduct) => {
      try {
        const response = await client.post("/purchase/products/", newProduct);
        setProducts((prev) => [...prev, response.data]);
        return { success: true, data: response.data };
      } catch (err) {
        console.error(err);
        setError(err);
      }
    },
    [client]
  );

  const updateProduct = useCallback(
    async (id, updatedData) => {
      try {
        const response = await client.patch(
          `/purchase/products/${id}/`,
          updatedData
        );
        setProducts((prev) =>
          prev.map((product) => (product.id === id ? response.data : product))
        );
        setSingleProducts(response.data);
        return { success: true, data: response.data };
      } catch (err) {
        setError(err);
      }
    },
    [client]
  );

  const fetchPurchaseRequests = useCallback(
    async (searchTerm = "") => {
      const params = searchTerm ? { search: searchTerm } : {};
      try {
        const response = await client.get(`/purchase/purchase-request/`, {
          params,
        });
        setPurchaseRequests(response.data);
        return { success: true, data: response.data };
      } catch (err) {
        console.error(err);
        setError(err);
        return { success: false, err };
      }
    },
    [client]
  );

  const fetchApprovedPurchaseRequests = useCallback(async () => {
    try {
      const response = await client.get(
        "/purchase/purchase-request/approved_list/"
      );
      setPurchaseRequests(response.data);
      return { success: true, data: response.data };
    } catch (err) {
      setError(err);
      return { success: false, err };
    }
  }, [client]);

  const fetchApprovedPurchaseRequestsForForm = useCallback(async () => {
    try {
      const response = await client.get(
        "/purchase/purchase-request/approved_list/?form=true"
      );
      setPurchaseRequests(response.data);
      return { success: true, data: response.data };
    } catch (err) {
      setError(err);
      return { success: false, err };
    }
  }, [client]);

  const createPurchaseRequest = useCallback(
    async (newRequest) => {
      try {
        const response = await client.post(
          "/purchase/purchase-request/",
          newRequest
        );
        setPurchaseRequests((prev) => [...prev, response.data]);
        return { success: true, data: response.data };
      } catch (err) {
        console.error(err);
        setError(err);
      }
    },
    [client]
  );

  const updatePurchaseRequest = useCallback(
    async (id, updatedData) => {
      try {
        const response = await client.put(`/purchase/purchase-request/${id}/`, {
          ...updatedData,
          is_hidden: false,
        });
        setPurchaseRequests((prev) =>
          prev.map((req) => (req.url === id ? response.data : req))
        );
        return { success: true, data: response.data };
      } catch (err) {
        setError(err);
        throw err;
      }
    },
    [client]
  );

  const submitPurchaseRequest = useCallback(
    async (url, submitData) => {
      try {
        const response = await client.put(url, {
          ...submitData,
          status: "pending",
        });
        setPurchaseRequests((prev) =>
          prev.map((req) => (req.url === url ? response.data : req))
        );
        return response.data;
      } catch (err) {
        setError(err);
        throw err;
      }
    },
    [client]
  );

  const convertToRFQ = useCallback(
    async (prId) => {
      try {
        const endpoint = `/purchase/purchase-request/${prId}/convert_to_rfq/`;
        const response = await client.post(endpoint);
        return response.data;
      } catch (err) {
        setError(err);
        throw err;
      }
    },
    [client]
  );

  const fetchSinglePurchaseRequest = useCallback(
    async (id) => {
      const cleanId = id.endsWith("/") ? id.slice(0, -1) : id;
      try {
        const endpoint = `/purchase/purchase-request/${cleanId}/`;
        const response = await client.get(endpoint);
        return { success: true, data: response.data };
      } catch (err) {
        setError(err);
        throw err;
      }
    },
    [client]
  );

  const approvePurchaseRequest = useCallback(
    async (info, id) => {
      try {
        const endpoint = `/purchase/purchase-request/${id}/approve/`;
        const response = await client.put(endpoint, info);
        setPurchaseRequests((prevPR) =>
          prevPR.map((pr) => (pr.id === id ? { ...pr, ...response.data } : pr))
        );
        return response.data;
      } catch (err) {
        setError(err);
        throw err;
      }
    },
    [client]
  );

  const pendingPurchaseRequest = useCallback(
    async (info, id) => {
      try {
        const endpoint = `/purchase/purchase-request/${id}/submit/`;
        const response = await client.put(endpoint, info);
        setPurchaseRequests((prevPR) =>
          prevPR.map((pr) => (pr.id === id ? { ...pr, ...response.data } : pr))
        );
        return response.data;
      } catch (err) {
        setError(err);
        throw err;
      }
    },
    [client]
  );

  const rejectPurchaseRequest = useCallback(
    async (info, id) => {
      try {
        const endpoint = `/purchase/purchase-request/${id}/reject/`;
        const response = await client.put(endpoint, info);
        setPurchaseRequests((prevPR) =>
          prevPR.map((pr) => (pr.id === id ? { ...pr, ...response.data } : pr))
        );
        return response.data;
      } catch (err) {
        setError(err);
        throw err;
      }
    },
    [client]
  );

  const providerValue = useMemo(
    () => ({
      unitsOfMeasure,
      loadingUnits,
      savingUnitId,
      deletingUnitId,
      currencies,
      purchaseRequests,
      products,
      singleProducts,
      singleVendors,
      vendors,
      error,
      loadingCurrencies,
      savingCurrencyId,
      deletingCurrencyId,
      fetchCurrencies,
      createCurrency,
      updateCurrency,
      softDeleteCurrency,
      uploadFile,
      downloadExcelTemplate,
      fetchVendors,
      fetchVendorsForForm,
      fetchSingleVendors,
      createVendor,
      updateVendor,
      fetchProducts,
      fetchProductsForForm,
      fetchSingleProduct,
      createProduct,
      fetchPurchaseRequests,
      fetchApprovedPurchaseRequests,
      fetchApprovedPurchaseRequestsForForm,
      createPurchaseRequest,
      updatePurchaseRequest,
      submitPurchaseRequest,
      convertToRFQ,
      fetchSinglePurchaseRequest,
      approvePurchaseRequest,
      pendingPurchaseRequest,
      rejectPurchaseRequest,
      updateProduct,

      fetchUnits,
      createUnit,
      updateUnit,
      softDeleteUnit,
    }),
    [
      unitsOfMeasure,
      loadingUnits,
      savingUnitId,
      deletingUnitId,
      currencies,
      purchaseRequests,
      products,
      singleProducts,
      singleVendors,
      vendors,
      error,
      loadingCurrencies,
      savingCurrencyId,
      deletingCurrencyId,
      fetchCurrencies,
      createCurrency,
      updateCurrency,
      softDeleteCurrency,
      uploadFile,
      downloadExcelTemplate,
      fetchVendors,
      fetchVendorsForForm,
      fetchSingleVendors,
      createVendor,
      updateVendor,
      fetchProducts,
      fetchProductsForForm,
      fetchSingleProduct,
      createProduct,
      fetchPurchaseRequests,
      fetchApprovedPurchaseRequests,
      fetchApprovedPurchaseRequestsForForm,
      createPurchaseRequest,
      updatePurchaseRequest,
      submitPurchaseRequest,
      convertToRFQ,
      fetchSinglePurchaseRequest,
      approvePurchaseRequest,
      pendingPurchaseRequest,
      rejectPurchaseRequest,
      updateProduct,

      fetchUnits,
      createUnit,
      updateUnit,
      softDeleteUnit,
    ]
  );

  return (
    <PurchaseContext.Provider value={providerValue}>
      {children}
    </PurchaseContext.Provider>
  );
};

export const usePurchase = () => useContext(PurchaseContext);
