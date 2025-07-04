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
const LocationConfigContext = createContext(null);

export const LocationConfigProvider = ({ children }) => {
  const { tenantData } = useTenant();
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [multiLocationEnabled, setMultiLocationEnabled] = useState(false);
  const [multiLocationList, setMultiLocationList] = useState([]);

  const { tenant_schema_name, access_token, refresh_token } = tenantData || {};

  // Create the API client
  const client = useMemo(() => {
    return tenant_schema_name && access_token && refresh_token
      ? getTenantClient(tenant_schema_name, access_token, refresh_token)
      : null;
  }, [tenant_schema_name, access_token, refresh_token]);

  // Toggle multi-location state (for enabling/disabling multi-location)
  const toggleMultiLocation = useCallback(
    async (newStatus) => {
      if (!client) {
        const errMsg =
          "API client not available. Please check tenant configuration.";
        console.error(errMsg);
        setError(errMsg);
        return Promise.reject(new Error(errMsg));
      }

      setIsLoading(true);
      try {
        // console.log(is_activated);
        const response = await client.post(
          "/inventory/configuration/multi-location/",
          {
            is_activated: newStatus,
          }
        );
        const newMultiLocationEnabled = response.data;

        setMultiLocationEnabled(newMultiLocationEnabled);
        setError(null);
        return { success: true, data: newMultiLocationEnabled };
      } catch (err) {
        console.error("Error configuring multi-location:", err);
        setError(err.message || "Failed to configure multi-location.");
        return Promise.reject(err);
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  const getMultiLocation = useCallback(async () => {
    if (!client) {
      const errMsg =
        "API client not available. Please check tenant configuration.";
      console.error(errMsg);
      setError(errMsg);
      return Promise.reject(new Error(errMsg));
    }

    setIsLoading(true);
    try {
      const response = await client.get(
        "/inventory/configuration/multi-location/check_status/"
      );
      const data = response.data;
      console.log(data, "data from multi-location check status");
      setMultiLocationList(data);
      setError(null);
      return { success: true, data };
    } catch (err) {
      console.error("Error fetching multi-location list:", err);
      setError(err.message || "Failed to fetch multi-location list.");
      return Promise.reject(err);
    } finally {
      setIsLoading(false);
    }
  }, [client]);

  const patchToggleMultiLocation = useCallback(
    async ({ id, is_activated }) => {
      if (!client) {
        const errMsg =
          "API client not available. Please check tenant configuration.";
        console.error(errMsg);
        setError(errMsg);
        return Promise.reject(new Error(errMsg));
      }

      setIsLoading(true);
      console.log(id, is_activated)
      try {
        // console.log(is_activated);
        const response = await client.patch(
          `/inventory/configuration/multi-location/change_status/`,
          {
            is_activated: is_activated,
          }
        );
        const newMultiLocationEnabled = response.data;

        setMultiLocationEnabled(newMultiLocationEnabled);
        setError(null);
        return { success: true, data: newMultiLocationEnabled };
      } catch (err) {
        console.error("Error configuring multi-location:", err);
        setError(err.message || "Failed to configure multi-location.");
        return Promise.reject(err);
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );
  // Context value to provide
  const contextValue = useMemo(
    () => ({
      toggleMultiLocation,
      patchToggleMultiLocation,
      multiLocationEnabled,
      multiLocationList,
      getMultiLocation,
      isLoading,
      error,
    }),
    [
      toggleMultiLocation,
      patchToggleMultiLocation,
      multiLocationEnabled,
      multiLocationList,
      getMultiLocation,
      isLoading,
      error,
    ]
  );

  return (
    <LocationConfigContext.Provider value={contextValue}>
      {children}
    </LocationConfigContext.Provider>
  );
};

// Custom hook to use LocationContext
export const useLocationConfig = () => {
  const context = useContext(LocationConfigContext);
  if (!context) {
    throw new Error(
      "useLocationConfig must be used within a LocationConfigProvider"
    );
  }
  return context;
};
