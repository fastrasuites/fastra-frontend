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

  // console.log(
  //   "purchase requests from db in purchaseContext: ",
  //   purchaseRequests
  // );

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

  // Helper function to fetch a resource from a URL
  async function fetchResource(url) {
    try {
      // Ensure the URL uses HTTPS
      const secureUrl = url.replace(/^http:\/\//i, "https://");
      const response = await client.get(secureUrl);
      return response.data;
    } catch (err) {
      console.error("Error fetching resource from", url, err);
      return null;
    }
  }

  // Normalizes a purchase request by fetching sub-data for currency, vendor, and purchase_request,
  // as well as for each item: product, unit_of_measure, and purchase_request.
  async function normalizePurchaseRequest(pr) {
    // Fetch top-level related resources
    const currencyDetail = await fetchResource(pr.currency);
    const vendorDetail = await fetchResource(pr.vendor);

    // Normalize items by fetching related data for each item field.
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
  }

  const fetchPurchaseRequests = async () => {
    try {
      const response = await client.get("/purchase/purchase-request/");
      const rawData = response.data;

      // Normalize each purchase request
      const normalizedData = await Promise.all(
        rawData.map(async (pr) => await normalizePurchaseRequest(pr))
      );

      setPurchaseRequests(normalizedData);
      return { success: true, data: normalizedData };
    } catch (err) {
      setError(err);
      console.error("Error fetching purchase requests:", err);
      return { success: false, err };
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

  // Convert to RFQ
  const convertToRFQ = async (prId) => {
    try {
      const response = await client.post(
        `/purchase/purchase-request/${prId}/convert_to_rfq/`
      );
      return response.data;
    } catch (err) {
      setError(err);
      console.error("RFQ conversion failed:", err);
      throw err;
    }
  };

  // get single purchase request by id not url
  const fetchSinglePurchaseRequest = async (id) => {
    // remove trailing slash if any
    id = id.replace(/\/$/, "");
    //extract the PR000004 from http://lukudigital.fastrasuiteapi.com.ng/purchase/purchase-request/PR000004/
    id = id.split("/").pop();
    console.log(id);
    try {
      const response = await client.get(`/purchase/purchase-request/${id}/`);
      const data = await normalizePurchaseRequest(response.data);
      console.log("data", data);
      return data;
    } catch (err) {
      setError(err);
      console.error("Error fetching single purchaseRequest:", err);
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

  // useEffect(() => {
  //   if (tenantData) {
  //     fetchPurchaseRequests();
  //   }
  // }, []);

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
        convertToRFQ,
        fetchSinglePurchaseRequest,
        error,
      }}
    >
      {children}
    </PurchaseContext.Provider>
  );
};

export const usePurchase = () => useContext(PurchaseContext);
