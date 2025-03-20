// PurchaseContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { getTenantClient } from "../services/apiService";
import { useTenant } from "./TenantContext";

const PurchaseContext = createContext();

export const PurchaseProvider = ({ children }) => {
  const { tenantData } = useTenant();
  const [currencies, setCurrencies] = useState([]);
  const [purchaseRequests, setPurchaseRequests] = useState([]);
  const [products, setProducts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [error, setError] = useState(null);

  console.log(
    "purchase requests from db in purchaseContext: ",
    purchaseRequests
  );

  // const access_token = localStorage.getItem("access_token");
  const { tenant_schema_name, access_token, refresh_token } = tenantData || {};

  // Create a client for tenant-specific API calls
  const client = getTenantClient(
    tenant_schema_name,
    access_token,
    refresh_token
  );

  // fetch currencies
  const fetchCurrencies = async () => {
    try {
      const response = await client.get("/purchase/currency/");
      setCurrencies(response.data);
    } catch (err) {
      setError(err);
      console.error("Error fetching currencies:", err);
    }
  };
  // create currency
  const createCurrency = async (newCurrency) => {
    try {
      const response = await client.post("/purchase/currency/", newCurrency);
      setCurrencies([...currencies, response.data]);
      return response.data;
    } catch (err) {
      setError(err);
      console.error("Error creating currency:", err);
    }
  };

  // upload file
  const uploadFile = async (file, endpoint) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await client.post(endpoint, formData, {
        // correct endpoint will be added
        headers: {
          "Content-type": "multipart/form-data",
        },
      });
      console.log("File uploaded successfully:", response.data);
      return response.data;
    } catch (err) {
      console.error("Error uploading file:", err);
      throw err; // Rethrow the error to handle it in the component
    }
  };

  // Fetch all vendors
  const fetchVendors = async () => {
    try {
      const response = await client.get("/purchase/vendors/");
      setVendors(response.data);
    } catch (err) {
      setError(err);
      console.error("Error fetching vendors:", err);
    }
  };

  // create new vendor
  const createVendor = async (newVendor) => {
    try {
      const response = await client.post("/purchase/vendors/", newVendor, {
        headers: {
          "Content-type": "multipart/form-data",
        },
      });
      setVendors([...vendors, response.data]);
    } catch (err) {
      setError(err);
      console.error("Error creating vendor:", err);
    }
  };

  // Fetch all products
  const fetchProducts = async () => {
    try {
      // Fetch the list of products from the tenant API.
      const productsResponse = await client.get("/purchase/products/");
      const productsData = productsResponse.data;

      const productsWithRealUnits = await Promise.all(
        productsData.map(async (product) => {
          try {
            const originalUnit = product.unit_of_measure;
            // Convert the unit_of_measure URL to HTTPS if needed.
            const unitUrl = product.unit_of_measure.replace(
              /^http:\/\//i,
              "https://"
            );
            const unitResponse = await client.get(unitUrl);
            const unitData = unitResponse.data;

            const realUnit = unitData.unit_category || "";
            return { ...product, unit_of_measure: [originalUnit, realUnit] };
          } catch (error) {
            console.error(
              "Error fetching unit measure for product:",
              product.url,
              error
            );
            // Return the product unchanged if fetching fails.
            return product;
          }
        })
      );

      setProducts(productsWithRealUnits);
    } catch (err) {
      setError(err);
      console.error("Error fetching products:", err);
    }
  };

  // create product
  const createProduct = async (newProduct) => {
    try {
      const response = await client.post("/purchase/products/", newProduct);
      console.log("response", response);
      setProducts([...products, response.data]);
    } catch (err) {
      setError(err);
      console.error("Error creating product:", err);
    }
  };

  // Fetch all purchase requests
  const fetchPurchaseRequests = async () => {
    try {
      const response = await client.get("/purchase/purchase-request/");
      setPurchaseRequests(response.data);
    } catch (err) {
      setError(err);
      console.error("Error fetching purchase requests:", err);
    }
  };

  // Save/create a new purchase request (POST)
  const createPurchaseRequest = async (newRequest) => {
    try {
      const response = await client.post(
        "/purchase/purchase-request/",
        newRequest
      );
      setPurchaseRequests([...purchaseRequests, response.data]);
    } catch (err) {
      setError(err);
      console.error("Error creating purchase request:", err);
    }
  };

  // Update existing purchase request (PATCH)
  const updatePurchaseRequest = async (url, updatedData) => {
    try {
      const response = await client.patch(url, updatedData);
      setPurchaseRequests((prev) =>
        prev.map((req) => (req.url === url ? response.data : req))
      );
      return response.data;
    } catch (err) {
      setError(err);
      console.error("Error updating purchase request:", err);
      throw err;
    }
  };

  // Submit purchase request (PUT for full update)
  const submitPurchaseRequest = async (url, submitData) => {
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
  };

  useEffect(() => {
    if (tenantData) {
      fetchCurrencies();
    }
  }, []);

  useEffect(() => {
    if (tenantData) {
      fetchVendors();
    }
  }, []);

  useEffect(() => {
    if (tenantData) {
      fetchProducts();
    }
  }, []);

  useEffect(() => {
    if (tenantData) {
      fetchPurchaseRequests();
    }
  }, []);

  return (
    <PurchaseContext.Provider
      value={{
        fetchVendors,
        fetchProducts,
        currencies,
        fetchCurrencies,
        createCurrency,
        uploadFile,
        vendors,
        createVendor,
        products,
        createProduct,
        purchaseRequests,
        fetchPurchaseRequests,
        createPurchaseRequest,
        updatePurchaseRequest,
        submitPurchaseRequest,
        error,
      }}
    >
      {children}
    </PurchaseContext.Provider>
  );
};

export const usePurchase = () => useContext(PurchaseContext);
