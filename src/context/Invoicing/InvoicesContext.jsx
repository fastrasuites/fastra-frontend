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
  if (!data.due_date) errors.due_date = "Due date is required";
  if (data.vendor === undefined || data.vendor === null || data.vendor === "")
    errors.vendor = "Vendor is required";
  if (!Array.isArray(data.invoice_items) || data.invoice_items.length === 0)
    errors.invoice_items = "At least one invoice item is required";

  if (Array.isArray(data.invoice_items)) {
    const itemErrors = [];
    data.invoice_items.forEach((it, idx) => {
      const ie = {};
      if (it.product === undefined || it.product === null || it.product === "")
        ie.product = "Product is required";
      if (
        it.quantity === undefined ||
        it.quantity === null ||
        Number.isNaN(Number(it.quantity))
      )
        ie.quantity = "Valid quantity is required";
      if (
        it.unit_price === undefined ||
        it.unit_price === null ||
        it.unit_price === ""
      )
        ie.unit_price = "Unit price is required";

      if (Object.keys(ie).length) itemErrors[idx] = ie;
    });
    if (itemErrors.length) errors.invoice_items_details = itemErrors;
  }

  return errors;
};

const validatePaymentPayload = (data) => {
  const errors = {};
  if (!data.amount_paid && data.amount_paid !== 0)
    errors.amount_paid = "Amount is required";
  if (!data.payment_method)
    errors.payment_method = "Payment method is required";
  // reference_id, notes optional
  return errors;
};

const validatePaymentTerm = (data) => {
  const errors = {};
  if (!data.name) errors.name = "Name is required";
  if (
    data.days_until_due === undefined ||
    data.days_until_due === null ||
    Number.isNaN(Number(data.days_until_due))
  )
    errors.days_until_due = "days_until_due is required and must be a number";
  return errors;
};

export const InvoicesProvider = ({ children }) => {
  const { tenantData } = useTenant();
  const [invoiceList, setInvoiceList] = useState([]);
  const [activeInvoiceList, setActiveInvoiceList] = useState([]);
  const [singleInvoice, setSingleInvoice] = useState(null);
  const [hiddenInvoiceList, setHiddenInvoiceList] = useState([]);
  const [invoicingPreferences, setInvoicingPreferences] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [singlePaymentHistory, setSinglePaymentHistory] = useState(null);
  const [paymentTerms, setPaymentTerms] = useState([]);
  const [singlePaymentTerm, setSinglePaymentTerm] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const { tenant_schema_name, access_token, refresh_token } = tenantData || {};
  const client = useMemo(() => {
    if (!tenant_schema_name || !access_token || !refresh_token) return null;
    return getTenantClient(tenant_schema_name, access_token, refresh_token);
  }, [tenant_schema_name, access_token, refresh_token]);

  // Invoice endpoints
  const getInvoiceList = useCallback(
    async ({ search = "", due_date = "", method = "", status = "" } = {}) => {
      if (!client) {
        const msg = "API client not initialized.";
        setError(msg);
        return Promise.reject(new Error(msg));
      }
      setIsLoading(true);
      try {
        const params = {};
        if (search) params.search = search;
        if (due_date) params.due_date = due_date;
        if (method) params.method = method;
        if (status) params.status = status;

        const { data } = await client.get("/invoicing/invoice/", { params });
        setInvoiceList(data);
        setError(null);
        return { success: true, data };
      } catch (err) {
        setError(
          err.response?.data || err.message || "Failed to fetch invoices"
        );
        return Promise.reject(err);
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

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
    async (formData) => {
      if (!client) throw new Error("API client not initialized.");

      const errors = validateInvoiceData(formData);
      if (Object.keys(errors).length) throw { validation: errors };

      setIsLoading(true);
      try {
        const payload = {
          is_hidden: formData.is_hidden ?? false,
          due_date: formData.due_date,
          status: formData.status,
          vendor: Number(formData.vendor),
          purchase_order: formData.purchase_order ?? null,
          invoice_items: formData.invoice_items,
        };
        const { data } = await client.post("/invoicing/invoice/", payload);
        setInvoiceList((prev) => [...prev, data]);
        setError(null);
        return { success: true, data };
      } catch (err) {
        setError(
          err.response?.data || err.message || "Failed to create invoice"
        );
        throw err;
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

  const softDeleteInvoice = useCallback(
    async (id) => {
      if (!client) throw new Error("API client not initialized.");
      setIsLoading(true);
      try {
        await client.delete(`/invoicing/invoice/${id}/soft_delete/`);
        setInvoiceList((prev) => prev.filter((inv) => inv.id !== id));
        setActiveInvoiceList((prev) => prev.filter((inv) => inv.id !== id));
        setHiddenInvoiceList((prev) => prev.filter((inv) => inv.id !== id));
        if (singleInvoice?.id === id) setSingleInvoice(null);
        setError(null);
        return { success: true };
      } catch (err) {
        setError(
          err.response?.data || err.message || "Failed to soft-delete invoice"
        );
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [client, singleInvoice]
  );

  // GET /invoicing/invoice/?search=&due_date=&method=&status=
  const getInvoiceListFiltered = useCallback(
    async ({ search = "", due_date = "", method = "", status = "" } = {}) => {
      if (!client) {
        const msg = "API client not initialized.";
        setError(msg);
        return Promise.reject(new Error(msg));
      }
      setIsLoading(true);
      try {
        const params = {};
        if (search) params.search = search;
        if (due_date) params.due_date = due_date;
        if (method) params.method = method;
        if (status) params.status = status;

        const { data } = await client.get("/invoicing/invoice/", { params });
        setInvoiceList(data);
        setError(null);
        return { success: true, data };
      } catch (err) {
        setError(
          err.response?.data || err.message || "Failed to fetch invoices"
        );
        return Promise.reject(err);
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  // PUT /invoicing/invoice/{id}/
  const updateInvoiceFull = useCallback(
    async (id, formData) => {
      if (!client) throw new Error("API client not initialized.");

      const errors = validateInvoiceData(formData);
      if (Object.keys(errors).length) throw { validation: errors };

      setIsLoading(true);
      try {
        const payload = {
          is_hidden: formData.is_hidden ?? false,
          due_date: formData.due_date,
          status: formData.status,
          vendor: Number(formData.vendor),
          purchase_order: formData.purchase_order ?? null,
          invoice_items: formData.invoice_items,
        };
        const { data } = await client.put(`/invoicing/invoice/${id}/`, payload);
        setInvoiceList((prev) =>
          prev.map((inv) => (inv.id === id ? data : inv))
        );
        setSingleInvoice((prev) => (prev?.id === id ? data : prev));
        setError(null);
        return { success: true, data };
      } catch (err) {
        setError(
          err.response?.data || err.message || "Failed to update invoice"
        );
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  // PATCH /invoicing/invoice/{id}/
  const patchInvoice = useCallback(
    async (id, partialPayload) => {
      if (!client) throw new Error("API client not initialized.");
      setIsLoading(true);
      try {
        const { data } = await client.patch(
          `/invoicing/invoice/${id}/`,
          partialPayload
        );
        setInvoiceList((prev) =>
          prev.map((inv) => (inv.id === id ? data : inv))
        );
        setSingleInvoice((prev) => (prev?.id === id ? data : prev));
        setError(null);
        return { success: true, data };
      } catch (err) {
        setError(
          err.response?.data || err.message || "Failed to patch invoice"
        );
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  // PUT /invoicing/invoice/{id}/toggle_hidden_status/
  const toggleHiddenStatusPut = useCallback(
    async (id, payload) => {
      if (!client) throw new Error("API client not initialized.");
      setIsLoading(true);
      try {
        const { data } = await client.put(
          `/invoicing/invoice/${id}/toggle_hidden_status/`,
          payload
        );
        setInvoiceList((prev) =>
          prev.map((inv) => (inv.id === id ? data : inv))
        );
        setActiveInvoiceList((prev) =>
          prev.map((inv) => (inv.id === id ? data : inv))
        );
        setHiddenInvoiceList((prev) =>
          prev.map((inv) => (inv.id === id ? data : inv))
        );
        setSingleInvoice((prev) => (prev?.id === id ? data : prev));
        setError(null);
        return { success: true, data };
      } catch (err) {
        setError(
          err.response?.data ||
            err.message ||
            "Failed to toggle hidden status (PUT)"
        );
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  // PATCH /invoicing/invoice/{id}/toggle_hidden_status/
  const toggleHiddenStatusPatch = useCallback(
    async (id, partialPayload) => {
      if (!client) throw new Error("API client not initialized.");
      setIsLoading(true);
      try {
        const { data } = await client.patch(
          `/invoicing/invoice/${id}/toggle_hidden_status/`,
          partialPayload
        );
        setInvoiceList((prev) =>
          prev.map((inv) => (inv.id === id ? data : inv))
        );
        setActiveInvoiceList((prev) =>
          prev.map((inv) => (inv.id === id ? data : inv))
        );
        setHiddenInvoiceList((prev) =>
          prev.map((inv) => (inv.id === id ? data : inv))
        );
        setSingleInvoice((prev) => (prev?.id === id ? data : prev));
        setError(null);
        return { success: true, data };
      } catch (err) {
        setError(
          err.response?.data ||
            err.message ||
            "Failed to toggle hidden status (PATCH)"
        );
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  // GET /invoicing/invoice/hidden_list/
  const getHiddenList = useCallback(async () => {
    if (!client) {
      const msg = "API client not initialized.";
      setError(msg);
      return Promise.reject(new Error(msg));
    }
    setIsLoading(true);
    try {
      const { data } = await client.get("/invoicing/invoice/hidden_list/");
      setHiddenInvoiceList(data);
      setError(null);
      return { success: true, data };
    } catch (err) {
      setError(
        err.response?.data || err.message || "Failed to fetch hidden invoices"
      );
      return Promise.reject(err);
    } finally {
      setIsLoading(false);
    }
  }, [client]);

  // GET /invoicing/invoicing-preferences/details/
  const getInvoicingPreferences = useCallback(async () => {
    if (!client) {
      const msg = "API client not initialized.";
      setError(msg);
      return Promise.reject(new Error(msg));
    }
    setIsLoading(true);
    try {
      const { data } = await client.get(
        "/invoicing/invoicing-preferences/details/"
      );
      setInvoicingPreferences(data);
      setError(null);
      return { success: true, data };
    } catch (err) {
      setError(
        err.response?.data ||
          err.message ||
          "Failed to fetch invoicing preferences"
      );
      return Promise.reject(err);
    } finally {
      setIsLoading(false);
    }
  }, [client]);

  // POST /invoicing/invoicing-preferences/set-defaults/
  const setInvoicingDefaults = useCallback(
    async (payload) => {
      if (!client) throw new Error("API client not initialized.");
      setIsLoading(true);
      try {
        const { data } = await client.post(
          "/invoicing/invoicing-preferences/set-defaults/",
          payload
        );
        setInvoicingPreferences(data);
        setError(null);
        return { success: true, data };
      } catch (err) {
        setError(
          err.response?.data ||
            err.message ||
            "Failed to set invoicing defaults"
        );
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  /* --------------------------- */
  // Payments & payment-history
  /* --------------------------- */

  // POST /invoicing/make-payment/
  const makePayment = useCallback(
    async (formData) => {
      if (!client) throw new Error("API client not initialized.");

      const errors = validatePaymentPayload(formData);
      if (Object.keys(errors).length) throw { validation: errors };

      setIsLoading(true);
      try {
        const payload = {
          amount_paid: formData.amount_paid,
          reference_id: formData.reference_id ?? null,
          payment_method: formData.payment_method,
          notes: formData.notes ?? "",
        };
        const { data } = await client.post("/invoicing/make-payment/", payload);
        // Append to local paymentHistory (optional)
        setPaymentHistory((prev) => [...prev, data]);
        setError(null);
        return { success: true, data };
      } catch (err) {
        setError(err.response?.data || err.message || "Failed to make payment");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  // GET /invoicing/payment-history/?search=&payment_method=&date_created=&ordering=
  const getPaymentHistory = useCallback(
    async ({
      search = "",
      payment_method = "",
      date_created = "",
      ordering = "",
    } = {}) => {
      if (!client) {
        const msg = "API client not initialized.";
        setError(msg);
        return Promise.reject(new Error(msg));
      }
      setIsLoading(true);
      try {
        const params = {};
        if (search) params.search = search;
        if (payment_method) params.payment_method = payment_method;
        if (date_created) params.date_created = date_created;
        if (ordering) params.ordering = ordering;
        const { data } = await client.get("/invoicing/payment-history/", {
          params,
        });
        setPaymentHistory(data);
        setError(null);
        return { success: true, data };
      } catch (err) {
        setError(
          err.response?.data || err.message || "Failed to fetch payment history"
        );
        return Promise.reject(err);
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  // GET /invoicing/payment-history/{id}/
  const getPaymentHistoryById = useCallback(
    async (id) => {
      if (!client) {
        const msg = "API client not initialized.";
        setError(msg);
        return Promise.reject(new Error(msg));
      }
      setIsLoading(true);
      try {
        const { data } = await client.get(`/invoicing/payment-history/${id}/`);
        setSinglePaymentHistory(data);
        setError(null);
        return { success: true, data };
      } catch (err) {
        setError(
          err.response?.data ||
            err.message ||
            "Failed to fetch payment history item"
        );
        return Promise.reject(err);
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  /* --------------------------- */
  // Payment-term endpoints
  /* --------------------------- */

  // GET /invoicing/payment-term/?search=
  const getPaymentTerms = useCallback(
    async (search = "") => {
      if (!client) {
        const msg = "API client not initialized.";
        setError(msg);
        return Promise.reject(new Error(msg));
      }
      setIsLoading(true);
      try {
        const params = {};
        if (search) params.search = search;
        const { data } = await client.get("/invoicing/payment-term/", {
          params,
        });
        setPaymentTerms(data);
        setError(null);
        return { success: true, data };
      } catch (err) {
        setError(
          err.response?.data || err.message || "Failed to fetch payment terms"
        );
        return Promise.reject(err);
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  // POST /invoicing/payment-term/
  const createPaymentTerm = useCallback(
    async (formData) => {
      if (!client) throw new Error("API client not initialized.");

      const errors = validatePaymentTerm(formData);
      if (Object.keys(errors).length) throw { validation: errors };

      setIsLoading(true);
      try {
        const payload = {
          is_hidden: formData.is_hidden ?? false,
          name: formData.name,
          description: formData.description ?? "",
          days_until_due: Number(formData.days_until_due),
        };
        const { data } = await client.post("/invoicing/payment-term/", payload);
        setPaymentTerms((prev) => [...prev, data]);
        setError(null);
        return { success: true, data };
      } catch (err) {
        setError(
          err.response?.data || err.message || "Failed to create payment term"
        );
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  // GET /invoicing/payment-term/{id}/
  const getPaymentTerm = useCallback(
    async (id) => {
      if (!client) {
        const msg = "API client not initialized.";
        setError(msg);
        return Promise.reject(new Error(msg));
      }
      setIsLoading(true);
      try {
        const { data } = await client.get(`/invoicing/payment-term/${id}/`);
        setSinglePaymentTerm(data);
        setError(null);
        return { success: true, data };
      } catch (err) {
        setError(
          err.response?.data || err.message || "Failed to fetch payment term"
        );
        return Promise.reject(err);
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  // PUT /invoicing/payment-term/{id}/
  const updatePaymentTerm = useCallback(
    async (id, formData) => {
      if (!client) throw new Error("API client not initialized.");

      const errors = validatePaymentTerm(formData);
      if (Object.keys(errors).length) throw { validation: errors };

      setIsLoading(true);
      try {
        const payload = {
          is_hidden: formData.is_hidden ?? false,
          name: formData.name,
          description: formData.description ?? "",
          days_until_due: Number(formData.days_until_due),
        };
        const { data } = await client.put(
          `/invoicing/payment-term/${id}/`,
          payload
        );
        setPaymentTerms((prev) => prev.map((pt) => (pt.id === id ? data : pt)));
        setSinglePaymentTerm((prev) => (prev?.id === id ? data : prev));
        setError(null);
        return { success: true, data };
      } catch (err) {
        setError(
          err.response?.data || err.message || "Failed to update payment term"
        );
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  // PATCH /invoicing/payment-term/{id}/
  const patchPaymentTerm = useCallback(
    async (id, partialPayload) => {
      if (!client) throw new Error("API client not initialized.");
      setIsLoading(true);
      try {
        const { data } = await client.patch(
          `/invoicing/payment-term/${id}/`,
          partialPayload
        );
        setPaymentTerms((prev) => prev.map((pt) => (pt.id === id ? data : pt)));
        setSinglePaymentTerm((prev) => (prev?.id === id ? data : prev));
        setError(null);
        return { success: true, data };
      } catch (err) {
        setError(
          err.response?.data || err.message || "Failed to patch payment term"
        );
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  // Context Value
  const contextValue = useMemo(
    () => ({
      // invoice data
      invoiceList,
      singleInvoice,
      activeInvoiceList,
      hiddenInvoiceList,
      invoicingPreferences,

      // payments & terms data
      paymentHistory,
      singlePaymentHistory,
      paymentTerms,
      singlePaymentTerm,

      // state
      isLoading,
      error,

      // invoice actions
      getInvoiceList,
      getActiveInvoiceList,
      getSingleInvoice,
      createInvoice,
      updateInvoice,
      softDeleteInvoice,
      getInvoiceListFiltered,
      updateInvoiceFull,
      patchInvoice,
      toggleHiddenStatusPut,
      toggleHiddenStatusPatch,
      getHiddenList,
      getInvoicingPreferences,
      setInvoicingDefaults,

      // payments actions
      makePayment,
      getPaymentHistory,
      getPaymentHistoryById,

      // payment-terms actions
      getPaymentTerms,
      createPaymentTerm,
      getPaymentTerm,
      updatePaymentTerm,
      patchPaymentTerm,
    }),
    [
      invoiceList,
      singleInvoice,
      activeInvoiceList,
      hiddenInvoiceList,
      invoicingPreferences,
      paymentHistory,
      singlePaymentHistory,
      paymentTerms,
      singlePaymentTerm,
      isLoading,
      error,
      getInvoiceList,
      getActiveInvoiceList,
      getSingleInvoice,
      createInvoice,
      updateInvoice,
      softDeleteInvoice,
      getInvoiceListFiltered,
      updateInvoiceFull,
      patchInvoice,
      toggleHiddenStatusPut,
      toggleHiddenStatusPatch,
      getHiddenList,
      getInvoicingPreferences,
      setInvoicingDefaults,
      makePayment,
      getPaymentHistory,
      getPaymentHistoryById,
      getPaymentTerms,
      createPaymentTerm,
      getPaymentTerm,
      updatePaymentTerm,
      patchPaymentTerm,
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
