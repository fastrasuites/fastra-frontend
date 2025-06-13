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
const StockMoveContext = createContext(null);

// Validation utilities
const validateStockMoveData = (data) => {
  const errors = {};
  if (!data.product) {
    errors.product = "Product is required";
  }
  if (data.quantity === undefined || data.quantity === "") {
    errors.quantity = "Quantity is required";
  }
  if (!data.source_location) {
    errors.source_location = "Source location is required";
  }
  if (!data.destination_location) {
    errors.destination_location = "Destination location is required";
  }
  return errors;
};

export const StockMoveProvider = ({ children }) => {
  const { tenantData } = useTenant();
  const [stockMoveList, setStockMoveList] = useState([]);
  const [singleStockMove, setSingleStockMove] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const { tenant_schema_name, access_token, refresh_token } = tenantData || {};
  const client = useMemo(() => {
    if (!tenant_schema_name || !access_token || !refresh_token) return null;
    return getTenantClient(tenant_schema_name, access_token, refresh_token);
  }, [tenant_schema_name, access_token, refresh_token]);

  const fetchResource = useCallback(
    async (url) => {
      if (!client || !url) return null;
      try {
        const secureUrl = url.replace(/^http:\/\//i, "https://");
        const response = await client.get(secureUrl);
        return response.data;
      } catch (err) {
        console.error("Error fetching resource:", url, err);
        return null;
      }
    },
    [client]
  );

  const normalizeStockMove = useCallback(
    async (stockMove) => {
      if (!stockMove) return null;

      const [sourceLocation, destinationLocation] = await Promise.all([
        fetchResource(stockMove.source_location),
        fetchResource(stockMove.destination_location),
      ]);

      return {
        ...stockMove,
        source_location: sourceLocation,
        destination_location: destinationLocation,
      };
    },
    [fetchResource]
  );

  // Stock move endpoints
  const getStockMoveList = useCallback(
    async (filters = {}) => {
      if (!client) {
        setError("API client not initialized.");
        return;
      }

      setIsLoading(true);
      try {
        // Convert filters to query params
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            queryParams.append(key, value);
          }
        });

        const url = `/inventory/stock-move/${
          queryParams.toString() ? `?${queryParams}` : ""
        }`;
        const { data: rawData } = await client.get(url);

        const normalized = await Promise.all(
          rawData.map((move) => normalizeStockMove(move))
        );
        setStockMoveList(normalized.filter(Boolean));
        setError(null);
        return { success: true, data: normalized };
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load stock moves");
        return { success: false, error: err.message };
      } finally {
        setIsLoading(false);
      }
    },
    [client, normalizeStockMove]
  );

  const getSingleStockMove = useCallback(
    async (id) => {
      if (!client) {
        const msg = "API client not initialized.";
        setError(msg);
        return Promise.reject(new Error(msg));
      }

      setIsLoading(true);
      try {
        const { data } = await client.get(`/inventory/stock-move/${id}/`);
        const normalized = await normalizeStockMove(data);
        setSingleStockMove(normalized);
        setError(null);
        return { success: true, data: normalized };
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load stock move");
        return { success: false, error: err.message };
      } finally {
        setIsLoading(false);
      }
    },
    [client, normalizeStockMove]
  );

  const createStockMove = useCallback(
    async (stockMoveData) => {
      if (!client) {
        throw new Error("API client not initialized.");
      }

      const errors = validateStockMoveData(stockMoveData);
      if (Object.keys(errors).length > 0) {
        throw { validation: errors };
      }

      setIsLoading(true);
      try {
        const payload = {
          product: stockMoveData.product,
          quantity: stockMoveData.quantity,
          source_document_id: stockMoveData.source_document_id || "",
          source_location: stockMoveData.source_location,
          destination_location: stockMoveData.destination_location,
        };

        const { data } = await client.post("/inventory/stock-move/", payload);
        const normalized = await normalizeStockMove(data);

        setStockMoveList((prev) => [...prev, normalized]);
        setError(null);
        return { success: true, data: normalized };
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to create stock move");
        return { success: false, error: err.message };
      } finally {
        setIsLoading(false);
      }
    },
    [client, normalizeStockMove]
  );

  const contextValue = useMemo(
    () => ({
      stockMoveList,
      singleStockMove,
      isLoading,
      error,
      getStockMoveList,
      getSingleStockMove,
      createStockMove,
    }),
    [
      stockMoveList,
      singleStockMove,
      isLoading,
      error,
      getStockMoveList,
      getSingleStockMove,
      createStockMove,
    ]
  );

  return (
    <StockMoveContext.Provider value={contextValue}>
      {children}
    </StockMoveContext.Provider>
  );
};

export const useStockMove = () => {
  const context = useContext(StockMoveContext);
  if (!context) {
    throw new Error("useStockMove must be used within a StockMoveProvider");
  }
  return context;
};
