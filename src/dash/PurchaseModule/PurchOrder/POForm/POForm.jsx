import React, { useEffect, useState, useCallback } from "react";
import "../../Rfq/RfqForm/RfqForm.css";
import autosave from "../../../../image/autosave.svg";
import { Button } from "@mui/material";
import Swal from "sweetalert2";
import { useHistory, useLocation, useParams } from "react-router-dom";
import { usePurchase } from "../../../../context/PurchaseContext";
import { usePurchaseOrder } from "../../../../context/PurchaseOrderContext.";
import { useTenant } from "../../../../context/TenantContext";
import POBasicInfoFields from "./POBasicInfoFields";
import POItemsTable from "./POItemsTable";
import { extractRFQID, normalizedRFQ } from "../../../../helper/helper";
import { useRFQ } from "../../../../context/RequestForQuotation";
import { useCustomLocation } from "../../../../context/Inventory/LocationContext";
import POBasicInfoFieldsConverToPO from "./POBasicInforCoverToPO";
import Can from "../../../../components/Access/Can";

const DEFAULT_FORM = {
  vendor: null,
  rfq: null,
  destination_location: null,
  currency: null,
  payment_terms: "",
  purchase_policy: "",
  delivery_terms: "",
  items: [],
  status: "draft",
  is_hidden: true,
};

const POForm = () => {
  const history = useHistory();
  const { state } = useLocation();
  const {
    po = {},
    edit = false,
    conversionRFQ = {},
    isConvertToPO = false,
  } = state || {};
  const { tenant_schema_name } = useTenant().tenantData || {};
  const { id } = useParams();

  const {
    products,
    fetchProducts,
    vendors,
    currencies,
    fetchCurrencies,
    fetchVendors,
    fetchPurchaseRequests,
    purchaseRequests,
  } = usePurchase();
  const { approvedGetRFQList, rfqList, isLoading: isRfqLoading } = useRFQ();
  const { activeLocationList, getActiveLocationList } = useCustomLocation();
  const { createPurchaseOrder, updatePurchaseOrder } = usePurchaseOrder();

  const formUse = edit ? "Edit Purchase Order" : "Create Purchase Order";
  const isEdit = formUse === "Edit Purchase Order";
  const hasConversion = conversionRFQ && Object.keys(conversionRFQ).length > 0;

  const computeInitialForm = () => {
    if (hasConversion) {
      return { ...DEFAULT_FORM, ...conversionRFQ, status: "draft" };
    } else if (isEdit) {
      return { ...po };
    } else {
      return DEFAULT_FORM;
    }
  };

  const [formData, setFormData] = useState(computeInitialForm());
  const [prIDList, setPrIDList] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchVendors();
    fetchCurrencies();
    fetchProducts();
    fetchPurchaseRequests();
    approvedGetRFQList();
    getActiveLocationList();
  }, [
    fetchVendors,
    fetchCurrencies,
    fetchProducts,
    fetchPurchaseRequests,
    approvedGetRFQList,
    getActiveLocationList,
  ]);

  useEffect(() => {
    setPrIDList(normalizedRFQ(purchaseRequests));
  }, [purchaseRequests]);

  const handleInputChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleRowChange = useCallback((idx, field, value) => {
    setFormData((prev) => {
      const items = [...prev.items];
      items[idx] = { ...items[idx], [field]: value };
      if (field === "product" && value?.product_description) {
        items[idx].description = value.product_description;
        items[idx].unit_of_measure = value.unit_of_measure;
      }
      return { ...prev, items };
    });
  }, []);

  const hasDuplicateProducts = (items) => {
    const seen = new Set();
    for (const item of items) {
      const id = item?.product?.url || item?.product;
      if (seen.has(id)) return true;
      seen.add(id);
    }
    return false;
  };

  const cleanData = (status) => ({
    status,
    vendor: formData?.rfq?.vendor?.id || formData?.rfq?.vendor,
    destination_location:
      formData?.destination_location?.id || formData?.destination_location,
    related_rfq: formData.rfq?.id || formData.rfq,
    currency: formData?.currency || formData?.rfq?.currency,
    payment_terms: formData?.payment_terms,
    purchase_policy: formData?.purchase_policy,
    delivery_terms: formData?.delivery_terms,
    items: (formData?.rfq?.items || []).map((i) => ({
      product: i?.product?.url || i?.product,
      description: i?.description,
      qty: Number(i?.qty) || 0,
      unit_of_measure: i?.product_details?.unit_of_measure,
      estimated_unit_price: i?.estimated_unit_price,
    })),
    is_hidden: false,
    is_submitted: true,
    can_edit: true,
  });

  const validateRequiredFields = (payload) => {
    if (!payload.related_rfq) return "Related RFQ is required.";
    if (!payload.currency) return "Currency is required.";
    if (!payload.vendor) return "Vendor is required.";
    if (!payload.destination_location)
      return "Destination Location is required.";
    if (!payload.purchase_policy) return "Purchase Policy is required.";
    if (!payload.payment_terms) return "Payment Term is required.";
    if (!payload.items || payload.items.length === 0)
      return "At least one product item is required.";
    if (hasDuplicateProducts(payload.items))
      return "Duplicate products found in items. Each product must be unique.";
    return null;
  };

  const handleError = (err) => {
    let message = "An unexpected error occurred. Please try again later.";

    if (
      err?.message === "Network Error" ||
      err?.message === "Request failed with status code 500"
    ) {
      return Swal.fire({
        title: "Network Error",
        text: message,
        icon: "error",
      });
    }

    if (err?.response?.data) {
      const data = err.response.data;
      console.error("API Error: ", data);

      // Handle string responses
      if (typeof data === "string") {
        return Swal.fire({
          title: "Network Error",
          text: data,
          icon: "error",
        });
      }
      // Handle array responses
      else if (Array.isArray(data)) {
        return Swal.fire({
          title: "Error",
          text: data.join(", "),
          icon: "error",
        });
      }
      // Handle object responses
      else if (typeof data === "object" && data !== null) {
        // Handle common error keys
        if (data.non_field_errors) {
          message = Array.isArray(data.non_field_errors)
            ? data.non_field_errors.join(", ")
            : data.non_field_errors;
        }
        // Handle top-level detail messages
        else if (data.detail) {
          return Swal.fire({
            title: "Error",
            text: data.detail,
            icon: "error",
          });
        }
        // Handle field-specific errors
        else {
          const errorMessages = [];

          // Process flat field errors
          for (const [field, errors] of Object.entries(data)) {
            if (Array.isArray(errors)) {
              errorMessages.push(`${field}: ${errors.join(", ")}`);
            }
            // Handle nested errors (like items validation)
            else if (typeof errors === "object" && errors !== null) {
              for (const [subField, subErrors] of Object.entries(errors)) {
                if (Array.isArray(subErrors)) {
                  errorMessages.push(
                    `${field}.${subField}: ${subErrors.join(", ")}`
                  );
                } else if (typeof subErrors === "object") {
                  // Handle deeply nested errors
                  for (const [deepField, deepErrors] of Object.entries(
                    subErrors
                  )) {
                    if (Array.isArray(deepErrors)) {
                      errorMessages.push(
                        `${field}.${subField}.${deepField}: ${deepErrors.join(
                          ", "
                        )}`
                      );
                    } else {
                      errorMessages.push(
                        `${field}.${subField}.${deepField}: ${deepErrors}`
                      );
                    }
                  }
                } else {
                  errorMessages.push(`${field}.${subField}: ${subErrors}`);
                }
              }
            }
            // Handle simple key-value errors
            else {
              errorMessages.push(`${field}: ${errors}`);
            }
          }

          // Special handling for duplicate PO
          if (
            errorMessages.some(
              (msg) =>
                msg.includes(
                  "purchase order with these details already exists"
                ) || msg.includes("already exists")
            )
          ) {
            message =
              "A purchase order with these details already exists. Please check your inputs.";
          }
          // Use collected messages if available
          else if (errorMessages.length > 0) {
            message = errorMessages.join("\n");
          }
        }
      }
    }
    // Handle network errors
    else if (err.message) {
      message = err.message;
    }
    // Handle request timeout
    else if (err.code === "ECONNABORTED") {
      message =
        "Request timed out. Please check your connection and try again.";
    }

    Swal.fire({
      title: "Error",
      text: message,
      icon: "error",
      customClass: {
        container: "error-swal-container",
        popup: "error-swal-popup",
        content: "error-swal-content",
      },
    });
    console.error("API Error: ", err);
  };

  const navigateToDetail = (id) => {
    setTimeout(() => {
      history.push(`/${tenant_schema_name}/purchase/purchase-order/${id}`);
    }, 1500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = cleanData("draft");
    const errorMessage = validateRequiredFields(payload);
    if (errorMessage) {
      Swal.fire({
        icon: "warning",
        title: "Missing Information",
        text: errorMessage,
      });
      return;
    }

    setSubmitting(true);
    try {
      const res = isEdit
        ? await updatePurchaseOrder(payload, id)
        : await createPurchaseOrder(payload);

      if (res.success) {
        Swal.fire(
          "Success",
          isEdit ? "Purchase Order updated." : "Draft saved.",
          "success"
        );
        navigateToDetail(isEdit ? id : extractRFQID(res.data.url));
      } else {
        Swal.fire("Error", res.message, "error");
      }
    } catch (err) {
      console.error("Error during submission: ", err.message);
      handleError(err);
    } finally {
      setSubmitting(false);
    }
  };

  const saveAndSend = async () => {
    const payload = cleanData("awaiting");
    const errorMessage = validateRequiredFields(payload);
    if (errorMessage) {
      Swal.fire({
        icon: "warning",
        title: "Missing Information",
        text: errorMessage,
      });
      return;
    }

    setSubmitting(true);
    try {
      const res = isEdit
        ? await updatePurchaseOrder(payload, id)
        : await createPurchaseOrder(payload);

      if (res.success) {
        Swal.fire(
          "Success",
          isEdit ? "Purchase Order updated." : "PO created and sent.",
          "success"
        );
        navigateToDetail(isEdit ? id : extractRFQID(res.data.url));
      } else {
        Swal.fire("Error", res.message, "error");
      }
    } catch (err) {
      handleError(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    history.goBack();
  };

  return (
    <div className="RfqForm">
      <div className="rfqAutoSave">
        <p className="raprhed">{formUse}</p>
        <div className="rfqauto">
          <p>Autosaved</p>
          <img src={autosave} alt="Autosaved" />
        </div>
      </div>

      <div className="rfqFormSection">
        <div className="rfqBasicInfo">
          <h2>Basic Information</h2>
          <div className="editCancel">
            <Button variant="text" onClick={handleClose}>
              Close
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rfqformEditAndCreate">
          {isConvertToPO ? (
            <POBasicInfoFieldsConverToPO
              formData={formData}
              handleInputChange={handleInputChange}
              formUse={formUse}
              currencies={currencies}
              vendors={vendors}
              purchaseIdList={prIDList}
              poID={po?.url}
              rfqList={rfqList}
              locationList={activeLocationList}
              isRfqLoading={isRfqLoading}
              isConvertToPO={isConvertToPO}
            />
          ) : (
            <POBasicInfoFields
              formData={formData}
              handleInputChange={handleInputChange}
              formUse={formUse}
              currencies={currencies}
              vendors={vendors}
              purchaseIdList={prIDList}
              poID={po?.url}
              rfqList={rfqList}
              locationList={activeLocationList}
              isRfqLoading={isRfqLoading}
            />
          )}

          <POItemsTable
            items={formData?.rfq?.items}
            handleRowChange={handleRowChange}
            products={products}
            isConversion={!!conversionRFQ?.items?.length}
          />

          <div
            style={{
              display: "flex",
              justifyContent: "end",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", gap: 16 }}>
              <Button variant="outlined" type="submit" disabled={submitting}>
                {isEdit ? "Save Changes" : "Save Draft"}
              </Button>
              <Can app="purchase" module="purchaseorder" action="edit">
                <Button
                  variant="contained"
                  onClick={saveAndSend}
                  disabled={submitting}
                >
                  Save &amp; Send
                </Button>
              </Can>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default POForm;
