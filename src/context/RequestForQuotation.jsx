// PurchaseContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
} from "react";
import { getTenantClient } from "../services/apiService";
import { useTenant } from "./TenantContext";

const RFQContext = createContext();

export const RFQProvider = ({ children }) => {
  const { tenantData } = useTenant();
  const [rfqList, setRfqList] = useState([]);
  const [error, setError] = useState(null);

  // Destructure tenant information safely.
  const { tenant_schema_name, access_token, refresh_token } = tenantData || {};

  // Create a memoized API client when tenant data is available.
  const client = useMemo(() => {
    if (tenant_schema_name && access_token && refresh_token) {
      return getTenantClient(tenant_schema_name, access_token, refresh_token);
    }
    return null;
  }, [tenant_schema_name, access_token, refresh_token]);

  // Validate required fields for RFQ creation.
  const validateRFQFields = (info) => {
    const {
      expiry_date,
      vendor,
      vendor_category,
      purchase_request,
      currency,
      status,
      items,
      is_hidden,
    } = info;

    if (
      !expiry_date ||
      !vendor ||
      !vendor_category ||
      !purchase_request ||
      !currency ||
      !status ||
      !items ||
      typeof is_hidden !== "boolean"
    ) {
      return false;
    }
    return true;
  };

  // Memoize the createRFQ function to avoid unnecessary re-creations.
  const createRFQ = useCallback(
    async (info) => {
      // Validate input data.
      if (!validateRFQFields(info)) {
        const errMsg = "All fields are required and must be valid.";
        setError(errMsg);
        return Promise.reject(new Error(errMsg));
      }
      if (!client) {
        const errMsg =
          "API client is not available. Please check tenant configuration.";
        setError(errMsg);
        return Promise.reject(new Error(errMsg));
      }

      try {
        const response = await client.post(
          "/purchase/request-for-quotation/",
          info
        );
        // Update state with new RFQ data.
        setRfqList((prevRFQs) => [...prevRFQs, response.data]);
        return response.data;
      } catch (err) {
        setError(err);
        console.error("Error creating RFQ:", err);
        return Promise.reject(err);
      }
    },
    [client]
  );

  // Memoize context value to prevent unnecessary renders.
  const contextValue = useMemo(
    () => ({
      createRFQ,
      error,
      rfqList,
    }),
    [createRFQ, error, rfqList]
  );

  return (
    <RFQContext.Provider value={contextValue}>{children}</RFQContext.Provider>
  );
};

// Custom hook to use RFQContext.
export const useRFQ = () => {
  const context = useContext(RFQContext);
  if (!context) {
    throw new Error("useRFQ must be used within a RFQProvider");
  }
  return context;
};
