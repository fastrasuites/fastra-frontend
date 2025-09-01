import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import { getTenantClient } from "../../services/apiService";
import { useTenant } from "../TenantContext";

// Create context
const InternalTransferContext = createContext(null);

// Validation utility for internal transfer data
const validateInternalTransferData = (data) => {
  const errors = {};
  if (!data.source_location)
    errors.source_location = "Source location is required";
  if (!data.destination_location)
    errors.destination_location = "Destination location is required";
  if (
    !data.internal_transfer_items ||
    data.internal_transfer_items.length === 0
  ) {
    errors.internal_transfer_items = "At least one item is required";
  } else {
    data.internal_transfer_items.forEach((item, index) => {
      if (!item.product)
        errors[`item_${index}_product`] = "Product is required";
      if (!item.quantity_requested || item.quantity_requested <= 0) {
        errors[`item_${index}_quantity`] = "Valid quantity is required";
      }
    });
  }
  return errors;
};

export const InternalTransferProvider = ({ children }) => {
  const { tenantData } = useTenant();
  const [internalTransfers, setInternalTransfers] = useState([]);
  const [singleTransfer, setSingleTransfer] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const { tenant_schema_name, access_token, refresh_token } = tenantData || {};

  const client = useMemo(() => {
    return tenant_schema_name && access_token && refresh_token
      ? getTenantClient(tenant_schema_name, access_token, refresh_token)
      : null;
  }, [tenant_schema_name, access_token, refresh_token]);

  // Create a new internal transfer
  const createInternalTransfer = useCallback(
    async (transferData) => {
      const errors = validateInternalTransferData(transferData);
      if (Object.keys(errors).length > 0) {
        setError(errors);
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
          source_location: transferData.source_location,
          destination_location: transferData.destination_location,
          status: transferData.status || "draft",
          internal_transfer_items: transferData.internal_transfer_items.map(
            (item) => ({
              product: item.product,
              quantity_requested: item.quantity_requested,
            })
          ),
        };

        const response = await client.post(
          "/inventory/internal-transfer/",
          requestBody
        );
        const newTransfer = response.data;
        setInternalTransfers((prev) => [...prev, newTransfer]);
        setError(null);
        return { success: true, data: newTransfer };
      } catch (err) {
        console.error("Error creating internal transfer:", err);
        setError(err.message || "Failed to create internal transfer");
        return Promise.reject(err.response?.data || err.message);
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  // Update an existing internal transfer (supports both PUT and PATCH)
  const updateInternalTransfer = useCallback(
    async (id, transferData, method = "PATCH") => {
      const errors = validateInternalTransferData(transferData);
      if (Object.keys(errors).length > 0) {
        setError(errors);
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
          source_location: transferData.source_location,
          destination_location: transferData.destination_location,
          status: transferData.status || "draft",
          internal_transfer_items: transferData.internal_transfer_items.map(
            (item) => ({
              product: item.product,
              quantity_requested: item.quantity_requested,
            })
          ),
        };

        const response = await client({
          method: method.toLowerCase(),
          url: `/inventory/internal-transfer/${id}/`,
          data: requestBody,
        });

        const updatedTransfer = response.data;
        setInternalTransfers((prev) =>
          prev.map((transfer) =>
            transfer.id === id ? updatedTransfer : transfer
          )
        );
        setSingleTransfer(updatedTransfer);
        setError(null);
        return { success: true, data: updatedTransfer };
      } catch (err) {
        console.error(`Error ${method} internal transfer:`, err);
        setError(
          err.message || `Failed to ${method.toLowerCase()} internal transfer`
        );
        return Promise.reject(err.response?.data || err.message);
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  // Delete an internal transfer
  const deleteInternalTransfer = useCallback(
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
        await client.delete(`/inventory/internal-transfer/${id}/`);
        setInternalTransfers((prev) =>
          prev.filter((transfer) => transfer.id !== id)
        );
        setSingleTransfer(null);
        setError(null);
        return { success: true };
      } catch (err) {
        console.error("Error deleting internal transfer:", err);
        setError(err.message || "Failed to delete internal transfer");
        return Promise.reject(err.response?.data || err.message);
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  // Get a single internal transfer by ID
  const getInternalTransfer = useCallback(
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
        const response = await client.get(
          `/inventory/internal-transfer/${id}/`
        );
        const transfer = response.data;
        setSingleTransfer(transfer);
        setError(null);
        return { success: true, data: transfer };
      } catch (err) {
        console.error("Error fetching internal transfer:", err);
        setError(err.message || "Failed to fetch internal transfer");
        return Promise.reject(err.response?.data || err.message);
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  // Get list of internal transfers
  const getInternalTransferList = useCallback(
    async (searchTerm = "") => {
      if (!client) {
        const errMsg =
          "API client not available. Please check tenant configuration.";
        console.error(errMsg);
        setError(errMsg);
        return Promise.reject(new Error(errMsg));
      }

      setIsLoading(true);
      try {
        const params = searchTerm ? { search: searchTerm } : {};
        const response = await client.get("/inventory/internal-transfer/", {
          params,
        });
        const data = response.data;
        setInternalTransfers(data);
        setError(null);
        return { success: true, data };
      } catch (err) {
        console.error("Error fetching internal transfer list:", err);
        setError(err.message || "Failed to fetch internal transfers");
        return Promise.reject(err.response?.data || err.message);
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  const contextValue = useMemo(
    () => ({
      createInternalTransfer,
      updateInternalTransfer,
      deleteInternalTransfer,
      getInternalTransfer,
      getInternalTransferList,
      internalTransfers,
      singleTransfer,
      isLoading,
      error,
    }),
    [
      createInternalTransfer,
      updateInternalTransfer,
      deleteInternalTransfer,
      getInternalTransfer,
      getInternalTransferList,
      internalTransfers,
      singleTransfer,
      isLoading,
      error,
    ]
  );

  return (
    <InternalTransferContext.Provider value={contextValue}>
      {children}
    </InternalTransferContext.Provider>
  );
};

export const useInternalTransfer = () => {
  const context = useContext(InternalTransferContext);
  if (!context) {
    throw new Error(
      "useInternalTransfer must be used within an InternalTransferProvider"
    );
  }
  return context;
};

// import React, {
//   createContext,
//   useContext,
//   useState,
//   useCallback,
//   useMemo,
// } from "react";
// import { getTenantClient } from "../../services/apiService";
// import { useTenant } from "../TenantContext";

// // Create context
// const InternalTransferContext = createContext(null);

// // Validation utility for internal transfer data
// const validateInternalTransferData = (data) => {
//   const errors = {};
//   if (!data.source_location)
//     errors.source_location = "Source location is required";
//   if (!data.destination_location)
//     errors.destination_location = "Destination location is required";
//   if (
//     !data.internal_transfer_items ||
//     data.internal_transfer_items.length === 0
//   ) {
//     errors.internal_transfer_items = "At least one item is required";
//   } else {
//     data.internal_transfer_items.forEach((item, index) => {
//       if (!item.product)
//         errors[`item_${index}_product`] = "Product is required";
//       if (!item.quantity_requested || item.quantity_requested <= 0) {
//         errors[`item_${index}_quantity`] = "Valid quantity is required";
//       }
//     });
//   }
//   return errors;
// };

// export const InternalTransferProvider = ({ children }) => {
//   const { tenantData } = useTenant();
//   const [internalTransfers, setInternalTransfers] = useState([]);
//   const [singleTransfer, setSingleTransfer] = useState(null);
//   const [error, setError] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);

//   const { tenant_schema_name, access_token, refresh_token } = tenantData || {};

//   const client = useMemo(() => {
//     return tenant_schema_name && access_token && refresh_token
//       ? getTenantClient(tenant_schema_name, access_token, refresh_token)
//       : null;
//   }, [tenant_schema_name, access_token, refresh_token]);

//   // Create a new internal transfer
//   const createInternalTransfer = useCallback(
//     async (transferData) => {
//       const errors = validateInternalTransferData(transferData);
//       if (Object.keys(errors).length > 0) {
//         setError(errors);
//         return Promise.reject(errors);
//       }

//       if (!client) {
//         const errMsg =
//           "API client not available. Please check tenant configuration.";
//         console.error(errMsg);
//         setError(errMsg);
//         return Promise.reject(new Error(errMsg));
//       }

//       setIsLoading(true);
//       try {
//         const requestBody = {
//           source_location: transferData.source_location,
//           destination_location: transferData.destination_location,
//           status: transferData.status || "draft",
//           internal_transfer_items: transferData.internal_transfer_items.map(
//             (item) => ({
//               product: item.product, // expects product_id
//               quantity_requested: item.quantity_requested,
//             })
//           ),
//         };

//         const response = await client.post(
//           "/inventory/internal-transfer/",
//           requestBody
//         );
//         const newTransfer = response.data;
//         setInternalTransfers((prev) => [...prev, newTransfer]);
//         setError(null);
//         return { success: true, data: newTransfer };
//       } catch (err) {
//         console.error("Error creating internal transfer:", err);
//         setError(err.message || "Failed to create internal transfer");
//         return Promise.reject(err.response?.data || err.message);
//       } finally {
//         setIsLoading(false);
//       }
//     },
//     [client]
//   );

//   // Update an existing internal transfer (supports both PUT and PATCH)
//   const updateInternalTransfer = useCallback(
//     async (id, transferData, method = "PATCH") => {
//       const errors = validateInternalTransferData(transferData);
//       if (Object.keys(errors).length > 0) {
//         setError(errors);
//         return Promise.reject(errors);
//       }

//       if (!client) {
//         const errMsg =
//           "API client not available. Please check tenant configuration.";
//         console.error(errMsg);
//         setError(errMsg);
//         return Promise.reject(new Error(errMsg));
//       }

//       setIsLoading(true);
//       try {
//         const requestBody = {
//           source_location: transferData.source_location,
//           destination_location: transferData.destination_location,
//           status: transferData.status || "draft",
//           internal_transfer_items: transferData.internal_transfer_items.map(
//             (item) => ({
//               product: item.product,
//               quantity_requested: item.quantity_requested,
//             })
//           ),
//         };

//         const response = await client({
//           method: method.toLowerCase(),
//           url: `/inventory/internal-transfer/${id}/`,
//           data: requestBody,
//         });

//         const updatedTransfer = response.data;
//         setInternalTransfers((prev) =>
//           prev.map((transfer) =>
//             transfer.id === id ? updatedTransfer : transfer
//           )
//         );
//         setError(null);
//         return { success: true, data: updatedTransfer };
//       } catch (err) {
//         console.error(`Error ${method} internal transfer:`, err);
//         setError(
//           err.message || `Failed to ${method.toLowerCase()} internal transfer`
//         );
//         return Promise.reject(err.response?.data || err.message);
//       } finally {
//         setIsLoading(false);
//       }
//     },
//     [client]
//   );

//   // Get a single internal transfer by ID
//   const getInternalTransfer = useCallback(
//     async (id) => {
//       if (!client) {
//         const errMsg =
//           "API client not available. Please check tenant configuration.";
//         console.error(errMsg);
//         setError(errMsg);
//         return Promise.reject(new Error(errMsg));
//       }

//       setIsLoading(true);
//       try {
//         const response = await client.get(
//           `/inventory/internal-transfer/${id}/`
//         );
//         const transfer = response.data;
//         setSingleTransfer(transfer);
//         setError(null);
//         return { success: true, data: transfer };
//       } catch (err) {
//         console.error("Error fetching internal transfer:", err);
//         setError(err.message || "Failed to fetch internal transfer");
//         return Promise.reject(err.response?.data || err.message);
//       } finally {
//         setIsLoading(false);
//       }
//     },
//     [client]
//   );

//   // Get list of internal transfers
//   const getInternalTransferList = useCallback(
//     async (searchTerm = "") => {
//       if (!client) {
//         const errMsg =
//           "API client not available. Please check tenant configuration.";
//         console.error(errMsg);
//         setError(errMsg);
//         return Promise.reject(new Error(errMsg));
//       }

//       setIsLoading(true);
//       try {
//         const params = searchTerm ? { search: searchTerm } : {};
//         const response = await client.get("/inventory/internal-transfer/", {
//           params,
//         });
//         const data = response.data;
//         setInternalTransfers(data);
//         setError(null);
//         return { success: true, data };
//       } catch (err) {
//         console.error("Error fetching internal transfer list:", err);
//         setError(err.message || "Failed to fetch internal transfers");
//         return Promise.reject(err.response?.data || err.message);
//       } finally {
//         setIsLoading(false);
//       }
//     },
//     [client]
//   );

//   const contextValue = useMemo(
//     () => ({
//       createInternalTransfer,
//       updateInternalTransfer,
//       getInternalTransfer,
//       getInternalTransferList,
//       internalTransfers,
//       singleTransfer,
//       isLoading,
//       error,
//     }),
//     [
//       createInternalTransfer,
//       updateInternalTransfer,
//       getInternalTransfer,
//       getInternalTransferList,
//       internalTransfers,
//       singleTransfer,
//       isLoading,
//       error,
//     ]
//   );

//   return (
//     <InternalTransferContext.Provider value={contextValue}>
//       {children}
//     </InternalTransferContext.Provider>
//   );
// };

// export const useInternalTransfer = () => {
//   const context = useContext(InternalTransferContext);
//   if (!context) {
//     throw new Error(
//       "useInternalTransfer must be used within an InternalTransferProvider"
//     );
//   }
//   return context;
// };
