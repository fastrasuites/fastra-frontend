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
const InvoicesContext = createContext(null);

// Validation utilities
const validateInvoiceData = (data) => {
  const errors = {};

  if (!data.vendor) {
    errors.vendor = "Vendor is required";
  }

  if (!data.due_date) {
    errors.due_date = "Due date is required";
  }

  if (!data.invoice_items || data.invoice_items.length === 0) {
    errors.invoice_items = "At least one invoice item is required";
  } else {
    data.invoice_items.forEach((item, index) => {
      if (!item.product) {
        errors[`invoice_items[${index}].product`] = "Product is required";
      }
      if (!item.quantity || item.quantity <= 0) {
        errors[`invoice_items[${index}].quantity`] =
          "Valid quantity is required";
      }
      if (!item.unit_price || item.unit_price <= 0) {
        errors[`invoice_items[${index}].unit_price`] =
          "Valid unit price is required";
      }
    });
  }

  return errors;
};

export const InvoicesProvider = ({ children }) => {
  const { tenantData } = useTenant();
  const [invoiceList, setInvoiceList] = useState([]);
  const [activeInvoiceList, setActiveInvoiceList] = useState([]);
  const [singleInvoice, setSingleInvoice] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const { tenant_schema_name, access_token, refresh_token } = tenantData || {};
  const client = useMemo(() => {
    if (!tenant_schema_name || !access_token || !refresh_token) return null;
    return getTenantClient(tenant_schema_name, access_token, refresh_token);
  }, [tenant_schema_name, access_token, refresh_token]);

  // Invoice endpoints
  const getInvoiceList = useCallback(async () => {
    if (!client) {
      const msg = "API client not initialized.";
      setError(msg);
      return Promise.reject(new Error(msg));
    }
    setIsLoading(true);
    try {
      const { data } = await client.get("/invoicing/invoice/");
      setInvoiceList(data);
      setError(null);
      return { success: true, data };
    } catch (err) {
      setError(err.message || "Failed to load invoices");
      return Promise.reject(err);
    } finally {
      setIsLoading(false);
    }
  }, [client]);

  const getActiveInvoiceList = useCallback(async () => {
    if (!client) {
      const msg = "API client not initialized.";
      setError(msg);
      return Promise.reject(new Error(msg));
    }
    setIsLoading(true);
    try {
      const { data } = await client.get("/invoicing/invoice/active_list/");
      setActiveInvoiceList(data);
      setError(null);
      return { success: true, data };
    } catch (err) {
      setError(err.message || "Failed to load active invoices");
      return Promise.reject(err);
    } finally {
      setIsLoading(false);
    }
  }, [client]);

  const getSingleInvoice = useCallback(
    async (id) => {
      if (!client) {
        const msg = "API client not initialized.";
        setError(msg);
        return Promise.reject(new Error(msg));
      }
      setIsLoading(true);
      try {
        const { data } = await client.get(`/invoicing/invoice/${id}/`);
        setSingleInvoice(data);
        setError(null);
        return { success: true, data };
      } catch (err) {
        setError(err.message || "Failed to load invoice");
        return Promise.reject(err);
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  const createInvoice = useCallback(
    async (invoiceData) => {
      const errors = validateInvoiceData(invoiceData);
      if (Object.keys(errors).length) return Promise.reject(errors);

      if (!client) {
        const msg = "API client not initialized.";
        setError(msg);
        return Promise.reject(new Error(msg));
      }

      setIsLoading(true);
      try {
        const payload = {
          vendor: invoiceData.vendor,
          due_date: invoiceData.due_date,
          invoice_items: invoiceData.invoice_items.map((item) => ({
            product: item.product,
            quantity: parseInt(item.quantity, 10),
            unit_price: parseFloat(item.unit_price),
            total_price: parseFloat(item.total_price),
          })),
          total_amount: parseFloat(invoiceData.total_amount),
          amount_paid: parseFloat(invoiceData.amount_paid) || 0,
          balance: parseFloat(invoiceData.balance),
          status: invoiceData.status || "unpaid",
        };

        const { data } = await client.post("/invoicing/invoice/", payload);
        setInvoiceList((prev) => [...prev, data]);
        setError(null);
        return { success: true, data };
      } catch (err) {
        console.error("Invoice creation failed:", err);

        // Get all error messages
        const errorData = err.response?.data;
        const errorMessages = errorData
          ? Object.entries(errorData)
              .map(
                ([field, messages]) =>
                  `${field}: ${
                    Array.isArray(messages) ? messages.join(", ") : messages
                  }`
              )
              .join("\n")
          : "Invoice could not be created";

        setError(errorMessages);
        return Promise.reject(err);
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  const updateInvoice = useCallback(
    async (id, invoiceData, partial = true) => {
      const errors = validateInvoiceData(invoiceData);
      if (Object.keys(errors).length && !partial) {
        return Promise.reject(errors);
      }

      if (!client) {
        const msg = "API client not initialized.";
        setError(msg);
        return Promise.reject(new Error(msg));
      }

      setIsLoading(true);
      try {
        // Transform items if present
        const payload = { ...invoiceData };
        if (payload.invoice_items) {
          payload.invoice_items = payload.invoice_items.map((item) => {
            const quantity = parseInt(item.quantity, 10) || 0;
            const unitPrice = parseFloat(item.unit_price) || 0;
            const totalPrice = quantity * unitPrice;

            return {
              id: item.id,
              product: item.product?.id || item.product,
              quantity: quantity,
              unit_price: unitPrice,
              total_price: totalPrice,
            };
          });
        }

        // Transform vendor if present
        if (payload.vendor && typeof payload.vendor === "object") {
          payload.vendor = payload.vendor.id;
        }

        const method = partial ? "patch" : "put";
        const { data } = await client[method](
          `/invoicing/invoice/${id}/`,
          payload
        );

        // Update state
        setInvoiceList((prev) =>
          prev.map((invoice) => (invoice.id === id ? data : invoice))
        );
        if (singleInvoice?.id === id) {
          setSingleInvoice(data);
        }

        setError(null);
        return { success: true, data };
      } catch (err) {
        console.error("Invoice update failed:", err);
        setError(
          err.message ||
            `Failed to ${partial ? "partially update" : "update"} invoice`
        );
        return Promise.reject(err);
      } finally {
        setIsLoading(false);
      }
    },
    [client, singleInvoice]
  );

  const deleteInvoice = useCallback(
    async (id) => {
      if (!client) {
        const msg = "API client not initialized.";
        setError(msg);
        return Promise.reject(new Error(msg));
      }

      setIsLoading(true);
      try {
        await client.delete(`/invoicing/invoice/${id}/soft_delete/`);

        // Update state
        setInvoiceList((prev) => prev.filter((invoice) => invoice.id !== id));
        if (singleInvoice?.id === id) {
          setSingleInvoice(null);
        }

        setError(null);
        return { success: true };
      } catch (err) {
        setError(err.message || "Failed to delete invoice");
        return Promise.reject(err);
      } finally {
        setIsLoading(false);
      }
    },
    [client, singleInvoice]
  );

  // Context Value
  const contextValue = useMemo(
    () => ({
      // State
      invoiceList,
      activeInvoiceList,
      singleInvoice,
      isLoading,
      error,

      // Invoice Operations
      getInvoiceList,
      getActiveInvoiceList,
      getSingleInvoice,
      createInvoice,
      updateInvoice,
      deleteInvoice,
    }),
    [
      invoiceList,
      activeInvoiceList,
      singleInvoice,
      isLoading,
      error,
      getInvoiceList,
      getActiveInvoiceList,
      getSingleInvoice,
      createInvoice,
      updateInvoice,
      deleteInvoice,
    ]
  );

  return (
    <InvoicesContext.Provider value={contextValue}>
      {children}
    </InvoicesContext.Provider>
  );
};

export const useInvoices = () => {
  const context = useContext(InvoicesContext);
  if (!context) {
    throw new Error("useInvoices must be used within an InvoicesProvider");
  }
  return context;
};
