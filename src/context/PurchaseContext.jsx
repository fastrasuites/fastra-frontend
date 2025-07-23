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

  const { tenant_schema_name, access_token, refresh_token } = tenantData || {};

  const client = useMemo(
    () =>
      tenantData
        ? getTenantClient(tenant_schema_name, access_token, refresh_token)
        : null,
    [tenantData, tenant_schema_name, access_token, refresh_token]
  );

  const fetchCurrencies = useCallback(async () => {
    try {
      const response = await client.get("/purchase/currency/");
      setCurrencies(response.data);
    } catch (err) {
      setError(err);
    }
  }, [client]);

  const createCurrency = useCallback(
    async (newCurrency) => {
      try {
        const response = await client.post("/purchase/currency/", newCurrency);
        setCurrencies((prev) => [...prev, response.data]);
        return response.data;
      } catch (err) {
        setError(err);
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
      } catch (err) {
        setError(err);
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
      currencies,
      purchaseRequests,
      products,
      singleProducts,
      singleVendors,
      vendors,
      error,
      fetchCurrencies,
      createCurrency,
      uploadFile,
      downloadExcelTemplate,
      fetchVendors,
      fetchSingleVendors,
      createVendor,
      updateVendor,
      fetchProducts,
      fetchSingleProduct,
      createProduct,
      fetchPurchaseRequests,
      fetchApprovedPurchaseRequests,
      createPurchaseRequest,
      updatePurchaseRequest,
      submitPurchaseRequest,
      convertToRFQ,
      fetchSinglePurchaseRequest,
      approvePurchaseRequest,
      pendingPurchaseRequest,
      rejectPurchaseRequest,
      updateProduct,
    }),
    [
      currencies,
      purchaseRequests,
      products,
      singleProducts,
      singleVendors,
      vendors,
      error,
      fetchCurrencies,
      createCurrency,
      uploadFile,
      downloadExcelTemplate,
      fetchVendors,
      fetchSingleVendors,
      createVendor,
      updateVendor,
      fetchProducts,
      fetchSingleProduct,
      createProduct,
      fetchPurchaseRequests,
      fetchApprovedPurchaseRequests,
      createPurchaseRequest,
      updatePurchaseRequest,
      submitPurchaseRequest,
      convertToRFQ,
      fetchSinglePurchaseRequest,
      approvePurchaseRequest,
      pendingPurchaseRequest,
      rejectPurchaseRequest,
      updateProduct,
    ]
  );

  return (
    <PurchaseContext.Provider value={providerValue}>
      {children}
    </PurchaseContext.Provider>
  );
};

export const usePurchase = () => useContext(PurchaseContext);
