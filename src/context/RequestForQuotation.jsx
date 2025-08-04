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
  const [singleRFQ, setSingleRFQ] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const { tenant_schema_name, access_token, refresh_token } = tenantData || {};

  const client = useMemo(() => {
    if (tenant_schema_name && access_token && refresh_token) {
      return getTenantClient(tenant_schema_name, access_token, refresh_token);
    }
    return null;
  }, [tenant_schema_name, access_token, refresh_token]);

  const validateRFQFields = (info) => {
    const { expiry_date, vendor, purchase_request, currency, status, items } =
      info;

    return (
      !!expiry_date &&
      !!vendor &&
      !!purchase_request &&
      !!currency &&
      !!status &&
      !!items
    );
  };

  const createRFQ = useCallback(
    async (info) => {
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
        setIsLoading(true);
        const response = await client.post(
          `/purchase/request-for-quotation/`,
          info
        );
        setError(null);
        setRfqList((prevRFQs) => [...prevRFQs, response.data]);
        return { success: true, data: response.data };
      } catch (err) {
        setError(err);
        return err;
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  const getRFQList = useCallback(
    async (search) => {
      if (!client) {
        const errMsg =
          "API client is not available. Please check tenant configuration.";
        setError(errMsg);
        return Promise.reject(new Error(errMsg));
      }

      try {
        setIsLoading(true);
        const params = search ? { search } : undefined;
        const response = await client.get("/purchase/request-for-quotation/", {
          params,
        });
        setRfqList(response.data);
        setError(null);
        return { success: true, data: response.data };
      } catch (err) {
        setError(err?.response?.data?.detail || err.message);
        return err;
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  const approvedGetRFQList = useCallback(async () => {
    if (!client) {
      const errMsg =
        "API client is not available. Please check tenant configuration.";
      setError(errMsg);
      return Promise.reject(new Error(errMsg));
    }
    try {
      setIsLoading(true);
      const response = await client.get(
        "/purchase/request-for-quotation/approved_list/"
      );
      setRfqList(response.data);
      setError(null);
      return { success: true, data: response.data };
    } catch (err) {
      setError(err);
      return Promise.reject(err);
    } finally {
      setIsLoading(false);
    }
  }, [client]);

  const getRFQById = useCallback(
    async (id) => {
      if (!id) {
        const errMsg = "RFQ ID is required.";
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
        setIsLoading(true);
        const response = await client.get(
          `/purchase/request-for-quotation/${id}/`
        );
        setSingleRFQ(response.data);
        setError(null);
        return { success: true, data: response.data };
      } catch (err) {
        setError(err);
        return Promise.reject(err);
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  const updateRFQ = useCallback(
    async (info, id) => {
      if (!client) {
        const errMsg =
          "API client is not available. Please check tenant configuration.";
        setError(errMsg);
        return Promise.reject(new Error(errMsg));
      }
      try {
        setIsLoading(true);
        const response = await client.put(
          `/purchase/request-for-quotation/${id}/`,
          info
        );
        setError(null);
        setRfqList((prevRFQs) =>
          prevRFQs.map((rfq) =>
            rfq.id === id ? { ...rfq, ...response.data } : rfq
          )
        );
        return { success: true, data: response.data };
      } catch (err) {
        setError(err);
        return Promise.reject(err);
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  const approveRFQ = useCallback(
    async (info, id) => {
      if (!client) {
        const errMsg =
          "API client is not available. Please check tenant configuration.";
        setError(errMsg);
        return Promise.reject(new Error(errMsg));
      }
      try {
        setIsLoading(true);
        const response = await client.patch(
          `/purchase/request-for-quotation/${id}/approve/`,
          info
        );
        setError(null);
        setRfqList((prevRFQs) =>
          prevRFQs.map((rfq) =>
            rfq.id === id ? { ...rfq, ...response.data } : rfq
          )
        );
        return { success: true, data: response.data };
      } catch (err) {
        setError(err);
        return Promise.reject(err);
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  const pendingRFQ = useCallback(
    async (info, id) => {
      if (!client) {
        const errMsg =
          "API client is not available. Please check tenant configuration.";
        setError(errMsg);
        return Promise.reject(new Error(errMsg));
      }
      try {
        setIsLoading(true);
        const response = await client.patch(
          `/purchase/request-for-quotation/${id}/`,
          info
        );
        setError(null);
        setRfqList((prevRFQs) =>
          prevRFQs.map((rfq) =>
            rfq.id === id ? { ...rfq, ...response.data } : rfq
          )
        );
        return { success: true, data: response.data };
      } catch (err) {
        setError(err);
        return Promise.reject(err);
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  const rejectRFQ = useCallback(
    async (info, id) => {
      if (!client) {
        const errMsg =
          "API client is not available. Please check tenant configuration.";
        setError(errMsg);
        return Promise.reject(new Error(errMsg));
      }
      try {
        setIsLoading(true);
        const response = await client.patch(
          `/purchase/request-for-quotation/${id}/reject/`,
          info
        );
        setError(null);
        setRfqList((prevRFQs) =>
          prevRFQs.map((rfq) =>
            rfq.id === id ? { ...rfq, ...response.data } : rfq
          )
        );
        return { success: true, data: response.data };
      } catch (err) {
        setError(err);
        return Promise.reject(err);
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  const deleteRFQ = useCallback(
    async (id) => {
      if (!client) {
        const errMsg =
          "API client is not available. Please check tenant configuration.";
        setError(errMsg);
        return Promise.reject(new Error(errMsg));
      }
      try {
        setIsLoading(true);
        const response = await client.delete(
          `/purchase/request-for-quotation/${id}/soft_delete/`
        );
        setError(null);
        setRfqList((prevRFQs) => prevRFQs.filter((rfq) => rfq.id !== id));
        return response.data;
      } catch (err) {
        setError(err);
        return Promise.reject(err);
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  const contextValue = useMemo(
    () => ({
      createRFQ,
      getRFQList,
      updateRFQ,
      getRFQById,
      approveRFQ,
      rejectRFQ,
      pendingRFQ,
      deleteRFQ,
      approvedGetRFQList,
      singleRFQ,
      error,
      rfqList,
      isLoading,
    }),
    [
      createRFQ,
      getRFQList,
      updateRFQ,
      getRFQById,
      approveRFQ,
      rejectRFQ,
      pendingRFQ,
      deleteRFQ,
      approvedGetRFQList,
      singleRFQ,
      error,
      rfqList,
      isLoading,
    ]
  );

  return (
    <RFQContext.Provider value={contextValue}>{children}</RFQContext.Provider>
  );
};

export const useRFQ = () => {
  const context = useContext(RFQContext);
  if (!context) {
    throw new Error("useRFQ must be used within an RFQProvider");
  }
  return context;
};
