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
const LocationContext = createContext(null);

// Validation utility
const validateLocationData = (data) => {
  const errors = {};
  if (!data.locationCode) errors.locationCode = "Location code is required";
  if (!data.locationName) errors.locationName = "Location name is required";
  if (!data.address) errors.address = "Location address is required";
  // if (!data.locationManager)
  // errors.locationManager = "Location manager is required";
  // if (!data.storeKeeper) errors.storeKeeper = "Store keeper is required";
  if (!data.contactInfo) errors.contactInfo = "Contact information is required";
  return errors;
};

export const LocationProvider = ({ children }) => {
  const { tenantData } = useTenant();
  const [locationList, setLocationList] = useState([]);
  const [activeLocationList, setActiveLocationList] = useState([]);
  const [singleLocation, setSingleLocation] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [locationProducts, setLocationProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState(null);

  const { tenant_schema_name, access_token, refresh_token } = tenantData || {};

  const client = useMemo(() => {
    return tenant_schema_name && access_token && refresh_token
      ? getTenantClient(tenant_schema_name, access_token, refresh_token)
      : null;
  }, [tenant_schema_name, access_token, refresh_token]);

  // Update this block to avoid unnecessary destructuring
  const createLocation = useCallback(
    async (locationData) => {
      const errors = validateLocationData(locationData);
      if (Object.keys(errors).length > 0) {
        return Promise.reject(errors);
      }

      if (!client) {
        const errMsg =
          "API client not available. Please check tenant configuration.";
        console.error(errMsg);
        setError(errMsg);
        return Promise.reject(new Error(errMsg));
      }

      setIsLoading(true);
      try {
        const requestBody = {
          location_code: locationData.locationCode,
          location_name: locationData.locationName,
          location_type: locationData.locationType || "internal",
          address: locationData.address,
          location_manager: null, // Ensure optional fields default to null
          store_keeper: null,
          contact_information: locationData.contactInfo,
          is_hidden: locationData.isHidden ?? true,
        };

        const response = await client.post("/inventory/location/", requestBody);
        const newLocation = response.data;

        setLocationList((prev) => [...prev, newLocation]);
        setError(null);
        return { success: true, data: newLocation };
      } catch (err) {
        console.error("Error creating location:", err);
        setError(err.message || "Failed to create location");
        return Promise.reject(err.response?.data || err.message);
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  const getLocationList = useCallback(
    async (searchTerm = "") => {
      if (!client) {
        const errMsg =
          "API client not available. Please check tenant configuration.";
        console.error(errMsg);
        setError(errMsg);
        return Promise.reject(new Error(errMsg));
      }

      setIsLoading(true);
      setError(null);

      try {
        const params = searchTerm ? { search: searchTerm } : {};

        const response = await client.get("/inventory/location/", {
          params,
        });
        const data = response.data;
        setLocationList(data);
        setError(null);
        return { success: true, data };
      } catch (err) {
        console.error("Error fetching location list:", err);
        setError(err.message || "Failed to fetch locations");
        return Promise.reject(err);
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  const getActiveLocationList = useCallback(async () => {
    if (!client) {
      const errMsg =
        "API client not available. Please check tenant configuration.";
      console.error(errMsg);
      setError(errMsg);
      return Promise.reject(new Error(errMsg));
    }

    setIsLoading(true);
    console.log("Axios base URL", client.defaults.baseURL);

    try {
      const response = await client.get(
        "/inventory/location/get_active_locations/"
      );
      const data = response.data;
      setActiveLocationList(data);
      setError(null);
      return { success: true, data };
    } catch (err) {
      console.error("Error fetching location list:", err);
      setError(err.message || "Failed to fetch active locations");
      return Promise.reject(err);
    } finally {
      setIsLoading(false);
    }
  }, [client]);

  const getSingleLocation = useCallback(
    async (id) => {
      if (!client) {
        const errMsg =
          "API client not available. Please check tenant configuration.";
        console.error(errMsg);
        setError(errMsg);
        return Promise.reject(new Error(errMsg));
      }

      setIsLoading(true);
      try {
        const response = await client.get(`/inventory/location/${id}/`);
        const data = response.data;
        setSingleLocation(data);
        setError(null);
        return { success: true, data };
      } catch (err) {
        console.error("Error fetching single location:", err);
        setError(err.message || "Failed to fetch single location");
        return Promise.reject(err);
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  // Fetch products for a location
  const getLocationProducts = useCallback(
    async (locationId) => {
      if (!client) {
        setProductsError("API client not available");
        return;
      }

      setProductsLoading(true);
      setProductsError(null);

      try {
        const response = await client.get(
          `/inventory/location/${locationId}/location_stock_levels/`
        );
        setLocationProducts(response.data);
        return { success: true, data: response.data };
      } catch (err) {
        console.error("Error fetching location products:", err);
        setProductsError(err.message || "Failed to fetch products");
        return Promise.reject(err);
      } finally {
        setProductsLoading(false);
      }
    },
    [client]
  );

  const contextValue = useMemo(
    () => ({
      locationList,
      activeLocationList,
      singleLocation,
      setSingleLocation,
      getLocationList,
      getActiveLocationList,
      getSingleLocation,
      createLocation,
      isLoading,
      error,
      locationProducts,
      productsLoading,
      productsError,
      getLocationProducts,
    }),
    [
      activeLocationList,
      locationList,
      singleLocation,
      getLocationList,
      getActiveLocationList,
      getSingleLocation,
      createLocation,
      isLoading,
      error,
      locationProducts,
      productsLoading,
      productsError,
      getLocationProducts,
    ]
  );

  return (
    <LocationContext.Provider value={contextValue}>
      {children}
    </LocationContext.Provider>
  );
};

export const useCustomLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useCustomLocation must be used within a LocationProvider");
  }
  return context;
};
