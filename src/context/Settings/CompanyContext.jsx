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
const CompanyContext = createContext(null);

// Provider component (corrected spelling)
export const CompanyProvider = ({ children }) => {
  const { tenantData } = useTenant();
  const [company, setCompany] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const { tenant_schema_name, access_token, refresh_token } = tenantData || {};

  const client = useMemo(() => {
    if (!tenant_schema_name || !access_token || !refresh_token) return null;
    return getTenantClient(tenant_schema_name, access_token, refresh_token);
  }, [tenant_schema_name, access_token, refresh_token]);

  // CompanyContext.js
  const updateCompany = useCallback(
    async (companyData) => {
      if (!client) {
        throw new Error("API client not initialized.");
      }

      setIsLoading(true);
      try {
        const { data } = await client.patch(
          `/company/update-company-profile/`,
          companyData,
          {
            headers: { "Content-Type": "multipart/form-data" },
            transformRequest: [(data /*, headers*/) => data],
          }
        );
        setCompany(data);
        setError(null);
        return { success: true, data };
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to update company profile");
        return { success: false, error: err.message };
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  const getCompany = useCallback(async () => {
    if (!client) {
      throw new Error("API client not initialized.");
    }

    setIsLoading(true);
    try {
      const { data } = await client.get(`/company/update-company-profile/`);
      setCompany(data);
      setError(null);
      return { success: true, data };
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to fetch company profile");
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, [client]);

  const contextValue = useMemo(
    () => ({
      company,
      isLoading,
      error,
      updateCompany,
      getCompany,
    }),
    [company, isLoading, error, updateCompany, getCompany]
  );

  return (
    <CompanyContext.Provider value={contextValue}>
      {children}
    </CompanyContext.Provider>
  );
};

// Custom hook (renamed to match context)
export const useCompany = () => {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error("useCompany must be used within a CompanyProvider");
  }
  return context;
};
