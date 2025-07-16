import React, {
  createContext,
  useContext,
  useState,
  useEffect,
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

  // Destructure tenant information and create client only when tenantData changes.
  const { tenant_schema_name, access_token, refresh_token } = tenantData || {};

  const client = useMemo(
    () =>
      tenantData
        ? getTenantClient(tenant_schema_name, access_token, refresh_token)
        : null,
    [tenantData, tenant_schema_name, access_token, refresh_token]
  );

  // Helper: Ensure URL uses HTTPS
  const secureUrl = (url) => url.replace(/^http:\/\//i, "https://");

  // Generalized resource fetcher with error handling.
  const fetchResource = useCallback(
    async (url) => {
      try {
        const response = await client.get(secureUrl(url));
        return response.data;
      } catch (err) {
        console.error(`Error fetching resource from ${url}:`, err);
        return null;
      }
    },
    [client]
  );

  // ------------------ Currencies ------------------
  const fetchCurrencies = useCallback(async () => {
    try {
      const response = await client.get("/purchase/currency/");
      setCurrencies(response.data);
    } catch (err) {
      setError(err);
      console.error("Error fetching currencies:", err);
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
        console.error("Error creating currency:", err);
      }
    },
    [client]
  );

  // ------------------ File Upload ------------------
  const uploadFile = useCallback(
    async (file, endpoint) => {
      const formData = new FormData();
      formData.append("file", file);
      try {
        const response = await client.post(secureUrl(endpoint), formData, {
          headers: { "Content-type": "multipart/form-data" },
        });
        console.log("File uploaded successfully:", response.data);
        return response.data;
      } catch (err) {
        console.error("Error uploading file:", err);
        throw err;
      }
    },
    [client]
  );

  // ------------------ Vendors ------------------
  const fetchVendors = useCallback(
    async (searchTerm = "") => {
      try {
        const params = searchTerm ? { search: searchTerm } : {};
        const response = await client.get("/purchase/vendors/", { params });
        setVendors(response.data);
        return response.data;
      } catch (err) {
        setError(err);
        console.error("Error fetching vendors:", err);
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
        console.error("Error creating vendor:", err);
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
        console.error("Error fetching vendors:", err);
      }
    },
    [client]
  );

  // ------------------ Products ------------------
  const fetchProducts = useCallback(async () => {
    try {
      const productsResponse = await client.get("/purchase/products/");
      const productsData = productsResponse.data;

      const productsWithRealUnits = await Promise.all(
        productsData.map(async (product) => {
          try {
            const originalUnit = product.unit_of_measure;
            const unitUrl = secureUrl(product.unit_of_measure);
            const unitData = await fetchResource(unitUrl);
            const realUnit = unitData?.unit_category || "";
            return { ...product, unit_of_measure: [originalUnit, realUnit] };
          } catch (error) {
            console.error(
              "Error fetching unit measure for product:",
              product.url,
              error
            );
            return product;
          }
        })
      );
      setProducts(productsWithRealUnits);
    } catch (err) {
      setError(err);
      console.error("Error fetching products:", err);
    }
  }, [client, fetchResource]);

  const fetchSingleProduct = useCallback(
    async (id) => {
      if (!client) {
        console.error("API client not initialized"); // API client must be ready
        return;
      }
      try {
        // 1. Fetch the single product object
        const { data: product } = await client.get(`/purchase/products/${id}/`);

        // 2. Fetch and augment its unit info
        let augmentedProduct = product;
        try {
          const originalUnit = product.unit_of_measure;
          const secureUnitUrl = originalUnit.replace(/^http:\/\//i, "https://");
          const unitData = await fetchResource(secureUnitUrl);
          const realUnit = unitData?.unit_category || "";
          augmentedProduct = {
            ...product,
            unit_of_measure: [originalUnit, realUnit],
          };
        } catch (unitErr) {
          console.error(
            "Error fetching unit measure for product:",
            product.url,
            unitErr
          );
        }

        // 3. Update state with the single augmented product
        setSingleProducts(augmentedProduct);
        setError(null);
        return { success: true, data: augmentedProduct };
      } catch (err) {
        console.error("Error fetching product:", err);
        setError(err);
      }
    },
    [client, fetchResource]
  );

  const createProduct = useCallback(
    async (newProduct) => {
      try {
        console.log("newProduct:", newProduct);
        const response = await client.post("/purchase/products/", newProduct);
        // console.log("Product created:", response.data);
        setProducts((prev) => [...prev, response.data]);
      } catch (err) {
        setError(err);
        console.error("Error creating product:", err);
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
        setSingleProducts(response.data); // Update single product state
        console.log("Product updated:", response.data);
        return { success: true, data: response.data };
      } catch (err) {
        setError(err);
        console.error("Error updating product:", err);
      }
    },
    [client]
  );

  // ------------------ Purchase Requests ------------------
  // Normalize purchase request by fetching related resources.
  const normalizePurchaseRequest = useCallback(
    async (pr) => {
      const currencyDetail = await fetchResource(pr.currency);
      const vendorDetail = await fetchResource(pr.vendor);

      const normalizedItems = await Promise.all(
        pr.items.map(async (item) => {
          const productDetail = item.product
            ? await fetchResource(item.product)
            : null;
          const unitDetail = item.unit_of_measure
            ? await fetchResource(item.unit_of_measure)
            : null;
          const itemPrDetail = item.purchase_request
            ? await fetchResource(item.purchase_request)
            : null;

          return {
            ...item,
            product: productDetail,
            unit_of_measure: unitDetail,
            purchase_request: itemPrDetail,
          };
        })
      );

      return {
        ...pr,
        currency: currencyDetail,
        vendor: vendorDetail,
        items: normalizedItems,
      };
    },
    [fetchResource]
  );

  const fetchPurchaseRequests = useCallback(async () => {
    try {
      const response = await client.get("/purchase/purchase-request/");
      const normalizedData = await Promise.all(
        response.data.map(async (pr) => await normalizePurchaseRequest(pr))
      );
      setPurchaseRequests(normalizedData);
      return { success: true, data: normalizedData };
    } catch (err) {
      setError(err);
      console.error("Error fetching purchase requests:", err);
      return { success: false, err };
    }
  }, [client, normalizePurchaseRequest]);

  const fetchApprovedPurchaseRequests = useCallback(async () => {
    try {
      const response = await client.get(
        "/purchase/purchase-request/approved_list/"
      );
      const normalizedData = await Promise.all(
        response.data.map(async (pr) => await normalizePurchaseRequest(pr))
      );
      setPurchaseRequests(normalizedData);
      return { success: true, data: normalizedData };
    } catch (err) {
      setError(err);
      console.error("Error fetching approved purchase requests:", err);
      return { success: false, err };
    }
  }, [client, normalizePurchaseRequest]);

  const createPurchaseRequest = useCallback(
    async (newRequest) => {
      try {
        console.log("newRequest:", newRequest);
        const response = await client.post(
          "/purchase/purchase-request/",
          newRequest
        );
        setPurchaseRequests((prev) => [...prev, response.data]);
        return { success: true, data: response.data };
      } catch (err) {
        setError(err);
        console.error("Error creating purchase request:", err);
      }
    },
    [client]
  );

  const updatePurchaseRequest = useCallback(
    async (id, updatedData) => {
      console.log("Updating purchase request:", id, updatedData);
      try {
        const response = await client.patch(
          `/purchase/purchase-request/${id}/`,
          { ...updatedData, is_hidden: false }
        );
        setPurchaseRequests((prev) =>
          prev.map((req) => (req.url === id ? response.data : req))
        );
        return { success: true, data: response.data };
      } catch (err) {
        setError(err);
        console.error("Error updating purchase request:", err);
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
        console.error("Error submitting purchase request:", err);
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
        console.error("RFQ conversion failed:", err);
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
        const normalizedData = await normalizePurchaseRequest(response.data);
        return { success: true, data: normalizedData };
      } catch (err) {
        setError(err);
        console.error("Error fetching single purchase request:", err);
        throw err;
      }
    },
    [client, normalizePurchaseRequest]
  );

  const approvePurchaseRequest = useCallback(
    async (info, id) => {
      if (!client) {
        const errMsg =
          "API client is not available. Please check tenant configuration.";
        setError(errMsg);
        return Promise.reject(new Error(errMsg));
      }
      try {
        const endpoint = `/purchase/purchase-request/${id}/approve/`;
        const response = await client.put(endpoint, info);
        setError(null);
        setPurchaseRequests((prevPR) =>
          prevPR.map((pr) => (pr.id === id ? { ...pr, ...response.data } : pr))
        );
        return response.data;
      } catch (err) {
        console.error("Error approving purchase request:", err);
        setError(err);
        return Promise.reject(err);
      }
    },
    [client]
  );

  const pendingPurchaseRequest = useCallback(
    async (info, id) => {
      if (!client) {
        const errMsg =
          "API client is not available. Please check tenant configuration.";
        setError(errMsg);
        return Promise.reject(new Error(errMsg));
      }
      try {
        const endpoint = `/purchase/purchase-request/${id}/submit/`;
        const response = await client.put(endpoint, info);
        setError(null);
        setPurchaseRequests((prevPR) =>
          prevPR.map((pr) => (pr.id === id ? { ...pr, ...response.data } : pr))
        );
        return response.data;
      } catch (err) {
        console.error("Error updating pending purchase request:", err);
        setError(err);
        return Promise.reject(err);
      }
    },
    [client]
  );

  const rejectPurchaseRequest = useCallback(
    async (info, id) => {
      if (!client) {
        const errMsg =
          "API client is not available. Please check tenant configuration.";
        setError(errMsg);
        return Promise.reject(new Error(errMsg));
      }
      try {
        const endpoint = `/purchase/purchase-request/${id}/reject/`;
        const response = await client.put(endpoint, info);
        setError(null);
        setPurchaseRequests((prevPR) =>
          prevPR.map((pr) => (pr.id === id ? { ...pr, ...response.data } : pr))
        );
        return response.data;
      } catch (err) {
        console.error("Error rejecting purchase request:", err);
        setError(err);
        return Promise.reject(err);
      }
    },
    [client]
  );

  // Memoize provider value to prevent unnecessary renders.
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
      fetchVendors,
      fetchSingleVendors,
      createVendor,
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
      vendors,
      singleVendors,
      error,
      fetchCurrencies,
      createCurrency,
      uploadFile,
      fetchVendors,
      fetchSingleVendors,
      createVendor,
      fetchSingleProduct,
      fetchProducts,
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
