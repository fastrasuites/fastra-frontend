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
  const [singleLocation, setSingleLocation] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const { tenant_schema_name, access_token, refresh_token } = tenantData || {};

  const client = useMemo(() => {
    return tenant_schema_name && access_token && refresh_token
      ? getTenantClient(tenant_schema_name, access_token, refresh_token)
      : null;
  }, [tenant_schema_name, access_token, refresh_token]);

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
  

  // Update this block to avoid unnecessary destructuring
  const createLocation = useCallback(
    async (locationData) => {
      const errors = validateLocationData(locationData);
      if (Object.keys(errors).length > 0) {
        return Promise.reject(errors);
      }
  
      if (!client) {
        const errMsg = "API client not available. Please check tenant configuration.";
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
  
        console.log("Submitting location data:", requestBody); // Debug log
  
        const response = await client.post("/inventory/location/", requestBody);
        const newLocation = response.data;
        console.log("Location created:", newLocation); // Debug log
  
        setLocationList((prev) => [...prev, newLocation]);
        setError(null);
        return { success: true, data: newLocation };
      } catch (err) {
        console.error("Error creating location:", err.response?.data || err.message);
        setError(err.message || "Failed to create location");
        return Promise.reject(err.response?.data || err.message);
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  const getLocationList = useCallback(async () => {
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
      const response = await client.get("/inventory/location/");
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
  }, [client]);


  const getSingleLocation = useCallback(async (id) => {
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
  }, [client]);

  const contextValue = useMemo(
    () => ({
      locationList,
      singleLocation,
      setSingleLocation,
      getLocationList,
      getSingleLocation,
      createLocation,
      isLoading,
      error,
    }),
    [
      locationList,
      singleLocation,
      getLocationList,
      getSingleLocation,
      createLocation,
      isLoading,
      error,
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
