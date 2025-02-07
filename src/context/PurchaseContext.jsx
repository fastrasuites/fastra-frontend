// PurchaseContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { getTenantClient } from "../services/apiService";
import { useTenant } from "./TenantContext";

const PurchaseContext = createContext();

export const PurchaseProvider = ({ children }) => {
  const { tenantData } = useTenant();
  const [productCategories, setProductCategories] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [purchaseRequests, setPurchaseRequests] = useState([]);
  const [products, setProducts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [error, setError] = useState(null);



  // const access_token = localStorage.getItem("access_token");
  const { tenant_company_name, access_token } = tenantData;
  console.log(tenant_company_name);
  console.log(access_token);

  // Create a client for tenant-specific API calls
  const client = getTenantClient(tenant_company_name, access_token);

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

  // Fetch single purchase order by ID
  const fetchSinglePurchaseOrder = async (id) => {
    try {
      const response = await client.get(`/purchase/purchase-order/${id}/`);
      return response.data;
    } catch (err) {
      setError(err);
      console.error("Error fetching purchase order:", err);
    }
  };

  // Fetch all product categories
  const fetchProductCategories = async () => {
    try {
      const response = await client.get("/purchase/product-categories/");
      setProductCategories(response.data);
    } catch (err) {
      setError(err);
      console.error("Error fetching product categories:", err);
    }
  };

  // Fetch a single product by ID
  // const fetchSingleProductByID = async () => {
  //   try {
  //     const response = await client.get(`/purchase/products/${id}/`);
  //     setProducts(response.data);
  //   } catch (err) {
  //     setError(err);
  //     console.error("Error fetching product:", err);
  //   }
  // };

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
      const response = await client.post("/purchase/vendors/", newVendor);
      setVendors([...vendors, response.data]);
    } catch (err) {
      setError(err);
      console.error("Error creating vendor:", err);
    }
  };

  // Fetch all products
  const fetchProducts = async () => {
    try {
      const response = await client.get("/purchase/products/");
      setProducts(response.data); // Set products state
    } catch (err) {
      setError(err);
      console.error("Error fetching products:", err);
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

  // Fetch all purchase orders (GET)
  const fetchPurchaseOrders = async () => {
    try {
      const response = await client.get("/purchase/purchase-order/");
      setPurchaseOrders(response.data);
    } catch (err) {
      setError(err);
      console.error("Error fetching purchase orders:", err);
    }
  };

  // Create a new purchase order (POST)
  const createPurchaseOrder = async (newOrder) => {
    try {
      const response = await client.post("/purchase/purchase-order/", newOrder);
      setPurchaseOrders([...purchaseOrders, response.data]);
    } catch (err) {
      setError(err);
      console.error("Error creating purchase order:", err);
    }
  };

  // Update a purchase order (PUT)
  const updatePurchaseOrder = async (id, updatedOrder) => {
    try {
      const response = await client.put(
        `/purchase/purchase-order/${id}/`,
        updatedOrder
      );
      setPurchaseOrders(
        purchaseOrders.map((order) => (order.id === id ? response.data : order))
      );
    } catch (err) {
      setError(err);
      console.error("Error updating purchase order:", err);
    }
  };

  // Partially update a purchase order (PATCH)
  const partialUpdatePurchaseOrder = async (id, updatedFields) => {
    try {
      const response = await client.patch(
        `/purchase/purchase-order/${id}/`,
        updatedFields
      );
      setPurchaseOrders(
        purchaseOrders.map((order) => (order.id === id ? response.data : order))
      );
    } catch (err) {
      setError(err);
      console.error("Error partially updating purchase order:", err);
    }
  };

  // Delete a purchase order (DELETE)
  const deletePurchaseOrder = async (id) => {
    try {
      await client.delete(`/purchase/purchase-order/${id}/`);
      setPurchaseOrders(purchaseOrders.filter((order) => order.id !== id));
    } catch (err) {
      setError(err);
      console.error("Error deleting purchase order:", err);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    fetchPurchaseRequests();
  }, []);

  useEffect(() => {
    fetchPurchaseOrders();
  }, []);

  return (
    <PurchaseContext.Provider
      value={{
        uploadFile,
        vendors,
        createVendor,
        products,
        purchaseRequests,
        fetchPurchaseRequests,
        purchaseOrders,
        createPurchaseOrder,
        updatePurchaseOrder,
        partialUpdatePurchaseOrder,
        deletePurchaseOrder,
        error,
      }}
    >
      {children}
    </PurchaseContext.Provider>
  );
};

export const usePurchase = () => useContext(PurchaseContext);
