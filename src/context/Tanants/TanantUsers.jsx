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
const TenantUsersContext = createContext();

// Provider component
export const TenantUsersProvider = ({ children }) => {
  const { tenantData } = useTenant();

  const [tenantUsersList, setTenantUsersList] = useState([]);
  const [singleTenantUser, setSingleTenantUser] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const { tenant_schema_name, access_token, refresh_token } = tenantData || {};

  // Memoize API client
  const client = useMemo(() => {
    if (tenant_schema_name && access_token && refresh_token) {
      return getTenantClient(tenant_schema_name, access_token, refresh_token);
    }
    return null;
  }, [tenant_schema_name, access_token, refresh_token]);

  // Generic resource fetcher
  const fetchResource = useCallback(
    async (url) => {
      if (!client || !url) return null;
      try {
        const secureUrl = url.replace(/^http:\/\//i, "https://");
        const response = await client.get(secureUrl);
        return response.data;
      } catch (err) {
        console.error(`Error fetching resource from ${url}:`, err);
        return null;
      }
    },
    [client]
  );

  // Fetch and normalize a single RFQ
  const normalizeRFQList = useCallback(
    async (rfq) => {
      const currencyDetail = await fetchResource(rfq.currency);
      const vendorDetail = await fetchResource(rfq.vendor);

      const normalizedItems = await Promise.all(
        rfq.items.map(async (item) => {
          const productDetail = item.product
            ? await fetchResource(item.product)
            : null;
          const unitDetail = item.unit_of_measure
            ? await fetchResource(item.unit_of_measure)
            : null;

          return {
            ...item,
            product: productDetail,
            unit_of_measure: unitDetail,
          };
        })
      );

      return {
        ...rfq,
        currency: currencyDetail,
        vendor: vendorDetail,
        items: normalizedItems,
      };
    },
    [fetchResource]
  );

  // Fetch list of tenant users
  const getTenantUsersList = useCallback(async () => {
    if (!client) {
      const errMsg =
        "API client is not available. Please check tenant configuration.";
      console.error(errMsg);
      setError(errMsg);
      return Promise.reject(new Error(errMsg));
    }

    setIsLoading(true);
    try {
      const response = await client.get("/users/tenant-users/");

      const rawData = response.data;

      setTenantUsersList(rawData);
      setError(null);
      return { success: true, data: rawData };
    } catch (err) {
      console.error("Error fetching Tenant Users list:", err);
      setError(err.message || "Failed to fetch tenant users");
      return Promise.reject(err);
    } finally {
      setIsLoading(false);
    }
  }, [client]);

  // Provide context values
  const contextValue = useMemo(
    () => ({
      tenantUsersList,
      singleTenantUser,
      getTenantUsersList,
      isLoading,
      error,
    }),
    [tenantUsersList, singleTenantUser, getTenantUsersList, isLoading, error]
  );

  return (
    <TenantUsersContext.Provider value={contextValue}>
      {children}
    </TenantUsersContext.Provider>
  );
};

// Custom hook
export const useTenantUsers = () => {
  const context = useContext(TenantUsersContext);
  if (!context) {
    throw new Error("useTenantUsers must be used within a TenantUsersProvider");
  }
  return context;
};
