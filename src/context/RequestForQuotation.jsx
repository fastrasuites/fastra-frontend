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

  // Safely destructure tenant information.
  const { tenant_schema_name, access_token, refresh_token } = tenantData || {};

  // Create a memoized API client when tenant data is available.
  const client = useMemo(() => {
    if (tenant_schema_name && access_token && refresh_token) {
      return getTenantClient(tenant_schema_name, access_token, refresh_token);
    }
    return null;
  }, [tenant_schema_name, access_token, refresh_token]);

  // Validate required fields for RFQ creation or update.
  const validateRFQFields = (info) => {
    const {
      expiry_date,
      vendor,
      purchase_request,
      currency,
      status,
      items,
      is_hidden,
    } = info;

    // You can expand these checks as needed.
    if (
      !expiry_date ||
      !vendor ||
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

  // Helper function to fetch a resource from a URL
  async function fetchResource(url) {
    try {
      // Ensure the URL uses HTTPS
      const secureUrl = url.replace(/^http:\/\//i, "https://");
      const response = await client.get(secureUrl);
      return response.data;
    } catch (err) {
      console.error("Error fetching resource from", url, err);
      return null;
    }
  }

  async function normalizeRFQList(rfq) {
    // Fetch top-level related resources
    const currencyDetail = await fetchResource(rfq.currency);
    const vendorDetail = await fetchResource(rfq.vendor);

    // Normalize items by fetching related data for each item field.
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
  }

  // Create an RFQ.
  const createRFQ = useCallback(
    async (info) => {
      console.log(info);
      if (!validateRFQFields(info)) {
        const errMsg = "All fields are required and must be valid.";
        console.log(info);
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
        // Append the new RFQ to the list.
        setRfqList((prevRFQs) => [...prevRFQs, response.data]);
        return { success: true, data: response.data };
      } catch (err) {
        setError(err);
        console.error("Error creating RFQ:", err);
        return { success: false, message: Promise.reject(err) };
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  // Retrieve the RFQ list.
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

        // Construct query parameters
        const params = search ? { search } : undefined;

        // Make GET request with optional search
        const response = await client.get("/purchase/request-for-quotation/", {
          params,
        });

        const rawData = response.data;

        // Normalize each RFQ item
        const normalizedData = await Promise.all(
          rawData.map(async (rfq) => await normalizeRFQList(rfq))
        );

        setRfqList(normalizedData);
        setError(null);

        return { success: true, data: normalizedData };
      } catch (err) {
        console.error("Error fetching RFQ list:", err);
        const message =
          err?.response?.data?.detail ||
          err.message ||
          "An unexpected error occurred while fetching RFQs.";
        setError(message);
        return Promise.reject(err);
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  // Retrieve the RFQ list.
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
      const rawData = response.data;

      // Normalize each purchase request
      const normalizedData = await Promise.all(
        rawData.map(async (pr) => await normalizeRFQList(pr))
      );

      setError(null);
      setRfqList(normalizedData);
      return { success: true, data: normalizedData };
    } catch (err) {
      setError(err);
      console.error("Error fetching RFQ list:", err);
      return Promise.reject(err);
    } finally {
      setIsLoading(false);
    }
  }, [client]);

  // Retrieve the RFQ By Id.
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

        const rawData = response.data;

        // Normalize each purchase request
        const normalizedData = await normalizeRFQList(rawData);

        setError(null);
        setSingleRFQ(normalizedData);
        return { success: true, data: normalizedData };
      } catch (err) {
        setError(err);
        console.error("Error fetching RFQ by ID:", err);
        return Promise.reject(err);
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  // Update an existing RFQ.
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
        console.log(id, info);
        const response = await client.patch(
          `/purchase/request-for-quotation/${id}/`,
          info
        );
        setError(null);
        // Update the RFQ in the list if it exists.
        setRfqList((prevRFQs) =>
          prevRFQs.map((rfq) =>
            rfq.id === id ? { ...rfq, ...response.data } : rfq
          )
        );
        return { success: true, data: response.data };
      } catch (err) {
        console.error("Error updating RFQ:", err);
        console.error("Request config:", err.config.data);
        setError(err);
        return Promise.reject(err);
      }
    },
    [client]
  );

  // Update RFQ Status to approved.
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
        // Using PUT as per the API documentation for the approve endpoint
        const response = await client.patch(
          `/purchase/request-for-quotation/${id}/approve/`,
          info
        );
        setError(null);
        // Update the RFQ in the list if it exists.
        setRfqList((prevRFQs) =>
          prevRFQs.map((rfq) =>
            rfq.id === id ? { ...rfq, ...response.data } : rfq
          )
        );
        return { success: true, data: response.data };
      } catch (err) {
        console.error("Error updating RFQ Approved Status:", err);
        if (err.response && err.response.data) {
          console.error("Backend error details:", err.response.data);
        }
        setError(err);
        return Promise.reject(err);
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  // Update RFQ Status to approved.
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
        // Using PUT as per the API documentation for the approve endpoint
        const response = await client.patch(
          `/purchase/request-for-quotation/${id}/`,
          info
        );
        setError(null);
        // Update the RFQ in the list if it exists.
        setRfqList((prevRFQs) =>
          prevRFQs.map((rfq) =>
            rfq.id === id ? { ...rfq, ...response.data } : rfq
          )
        );
        return { success: true, data: response.data };
      } catch (err) {
        console.error("Error updating RFQ Pending Status:", err);
        if (err.response && err.response.data) {
          console.error("Backend error details:", err.response.data);
        }
        setError(err);
        return Promise.reject(err);
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  // Update RFQ Status to rejected.
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
        console.log(id, info);
        const response = await client.patch(
          `/purchase/request-for-quotation/${id}/reject/`,
          info
        );
        setError(null);
        // Update the RFQ in the list if it exists.
        setRfqList((prevRFQs) =>
          prevRFQs.map((rfq) =>
            rfq.id === id ? { ...rfq, ...response.data } : rfq
          )
        );
        return { success: true, data: response.data };
      } catch (err) {
        console.error("Error updating RFQ Reject Status:", err);
        console.error("Request config:", err.config.data);
        setError(err);
        return Promise.reject(err);
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
      setIsLoading(true);
      try {
        console.log(id);
        const response = await client.delete(
          `/purchase/request-for-quotation/${id}/soft_delete/`
        );
        setError(null);
        // Remove the deleted RFQ from the list using filter.
        setRfqList((prevRFQs) => prevRFQs.filter((rfq) => rfq.id !== id));
        return response.data;
      } catch (err) {
        console.error("Error deleting RFQ:", err);
        setError(err);
        return Promise.reject(err);
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  // Memoize the context value to avoid unnecessary re-renders.
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
      error,
      rfqList,
      singleRFQ,
      isLoading,
    ]
  );

  return (
    <RFQContext.Provider value={contextValue}>{children}</RFQContext.Provider>
  );
};

// Custom hook to consume RFQContext.
export const useRFQ = () => {
  const context = useContext(RFQContext);
  if (!context) {
    throw new Error("useRFQ must be used within an RFQProvider");
  }
  return context;
};

// // // Helper function to fetch a resource from a URL
// // async function fetchResource(url) {
// //   try {
// //     // Ensure the URL uses HTTPS
// //     const secureUrl = url.replace(/^http:\/\//i, "https://");
// //     const response = await client.get(secureUrl);
// //     return response.data;
// //   } catch (err) {
// //     console.error("Error fetching resource from", url, err);
// //     return null;
// //   }
// }

// // Normalizes a purchase request by fetching sub-data for currency, vendor, and purchase_request,
// // as well as for each item: product, unit_of_measure, and purchase_request.
// async function normalizePurchaseRequest(pr) {
//   // Fetch top-level related resources
//   const currencyDetail = await fetchResource(pr.currency);
//   const vendorDetail = await fetchResource(pr.vendor);

//   // Normalize items by fetching related data for each item field.
//   const normalizedItems = await Promise.all(
//     pr.items.map(async (item) => {
//       const productDetail = item.product
//         ? await fetchResource(item.product)
//         : null;
//       const unitDetail = item.unit_of_measure
//         ? await fetchResource(item.unit_of_measure)
//         : null;
//       const itemPrDetail = item.purchase_request
//         ? await fetchResource(item.purchase_request)
//         : null;

//       return {
//         ...item,
//         product: productDetail,
//         unit_of_measure: unitDetail,
//         purchase_request: itemPrDetail,
//       };
//     })
//   );

//   return {
//     ...pr,
//     currency: currencyDetail,
//     vendor: vendorDetail,
//     items: normalizedItems,
//   };
// }

// const fetchPurchaseRequests = async () => {
//   try {
//     const response = await client.get("/purchase/purchase-request/");
//     const rawData = response.data;

//     // Normalize each purchase request
//     const normalizedData = await Promise.all(
//       rawData.map(async (pr) => await normalizePurchaseRequest(pr))
//     );

//     setPurchaseRequests(normalizedData);
//     return { success: true, data: normalizedData };
//   } catch (err) {
//     setError(err);
//     console.error("Error fetching purchase requests:", err);
//     return { success: false, err };
//   }
// };

// const fetchSubData = async (dataArray, key) => {
//   try {
//     const results = await Promise.all(
//       dataArray.map(async (item) => {
//         try {
//           // Get the original URL from the object using the provided key.
//           const originalUrl = item[key];
//           if (!originalUrl) return item;

//           // Convert the URL to HTTPS if needed.
//           const secureUrl = originalUrl.replace(/^http:\/\//i, "https://");
//           const response = await client.get(secureUrl);
//           const fetchedData = response.data;

//           // Return the object with the key replaced by the fetched data.
//           return { ...item, [key]: fetchedData };
//         } catch (err) {
//           console.error(`Error fetching ${key} data for item:`, item, err);
//           // Return the item with a fallback value if the fetch fails.
//           return { ...item, [key]: [item[key], ""] };
//         }
//       })
//     );
//     return results;
//   } catch (err) {
//     console.error("Error in fetchSubData:", err);
//     throw err;
//   }
// };

// // Fetch all purchase requests
// const fetchPurchaseRequests = async () => {
//   try {
//     const response = await client.get("/purchase/purchase-request/");
//     const purchaseRequestResponse = response.data;

//     // Use the sub-fetch helper to normalize the "currency" field.
//     const normalizedRequests = await fetchSubData(
//       purchaseRequestResponse,
//       "currency"
//     );
//     const fullyNormalized = await fetchSubData(normalizedRequests, "vendor");

//     setPurchaseRequests(fullyNormalized);
//   } catch (err) {
//     setError(err);
//     console.error("Error fetching purchase requests:", err);
//   }
// };
