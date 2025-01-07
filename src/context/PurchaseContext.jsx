import React, { createContext, useContext, useState, useEffect } from "react";
import { getTenantClient } from "../services/apiService";
import { useTenant } from "./TenantContext";

const PurchaseContext = createContext();

export const PurchaseProvider = ({ children }) => {
  const { tenant } = useTenant();
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [purchaseReq, setPurchaseReq] = useState([]);
  const [error, setError] = useState(null);

  const access_token = localStorage.getItem("access_token");

  // Create a client for tenant-specific API calls
  const client = getTenantClient(tenant, access_token);

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

  const fetchPurchaseRequests = async () => {
    try {
      const response = await client.get("/purchase/purchase-request");
      setPurchaseReq(response.data);
    } catch (err) {
      console.error(err);
      console.log("Error fetching purchase request");
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
    fetchPurchaseOrders();
    fetchPurchaseRequests();
  }, [client]);

  return (
    <PurchaseContext.Provider
      value={{
        purchaseOrders,
        purchaseReq,
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
