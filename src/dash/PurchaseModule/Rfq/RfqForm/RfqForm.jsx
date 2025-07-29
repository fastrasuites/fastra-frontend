// src/dash/PurchaseModule/Rfq/RfqForm.js
import "./RfqForm.css";
import autosave from "../../../../image/autosave.svg";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Button, Stack } from "@mui/material";
import Swal from "sweetalert2";
import { useHistory, useLocation } from "react-router-dom";

import { usePurchase } from "../../../../context/PurchaseContext";
import { useRFQ } from "../../../../context/RequestForQuotation";
import { useTenant } from "../../../../context/TenantContext";

import RfqBasicInfoFields from "./RfqBasicInfoFields";
import RfqBasicInfoFieldsConvertToRFQ from "./RFQBasisInfoConvert";
import RfqItemsTable from "./RfqItemsTable";

import { extractRFQID, normalizedRFQ } from "../../../../helper/helper";
import Can from "../../../../components/Access/Can";

const RfqForm = () => {
  const {
    products,
    fetchProducts,
    vendors,
    currencies,
    fetchCurrencies,
    fetchVendors,
    fetchApprovedPurchaseRequests,
    purchaseRequests,
  } = usePurchase();

  const { createRFQ, updateRFQ } = useRFQ();
  const { tenant_schema_name } = useTenant().tenantData || {};
  const { state } = useLocation();
  const history = useHistory();

  const { rfq = {}, edit = false, isConvertToRFQ = false } = state || {};
  const isEdit = edit;
  const formTitle = isEdit ? "Edit RFQ" : "Create RFQ";

  const defaultForm = {
    purchase_request: "",
    expiry_date: "",
    currency: "",
    vendor: "",
    items: [],
    status: "draft",
    is_hidden: true,
  };

  const initial =
    Object.keys(rfq).length > 0 ? { ...defaultForm, ...rfq } : defaultForm;

  const [formData, setFormData] = useState(initial);
  const [prIDList, setPrIDList] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const minExpiryDate = useMemo(
    () => new Date().toISOString().split("T")[0],
    []
  );

  useEffect(() => {
    fetchVendors();
    fetchCurrencies();
    fetchProducts();
    fetchApprovedPurchaseRequests();
  }, []);

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

  const cleanData = (status) => {
    const sourceItems =
      formData.purchase_request?.items?.length > 0
        ? formData.purchase_request.items
        : formData.items;

    const items = sourceItems.map((item) => ({
      product: item.product,
      description: item.description,
      qty: Number(item.qty) || 0,
      unit_of_measure: item.unit_of_measure || "",
      estimated_unit_price: item.estimated_unit_price,
    }));

    return {
      expiry_date: formData.expiry_date,
      status,
      vendor: formData?.purchase_request?.vendor || formData?.vendor,
      currency: formData?.purchase_request?.currency || formData?.currency,
      purchase_request: formData.purchase_request?.id || formData?.id,
      items,
      is_submitted: true,
      can_edit: true,
    };
  };

  const validateRequiredFields = (payload) => {
    if (!payload.currency) return "Currency is required.";
    if (!payload.vendor) return "Vendor is required.";
    if (!payload.expiry_date) return "Expiry date is required.";
    if (!payload.purchase_request) return "Purchase Request is required.";
    if (!payload.items || payload.items.length === 0)
      return "At least one product item is required.";
    return null;
  };

  const extractErrorMessage = (res) => {
    const data = res?.response?.data;
    if (!data) return "An unexpected error occurred.";
    return (
      data.non_field_errors?.join(", ") ||
      data.detail ||
      data.message ||
      "An unexpected error occurred."
    );
  };

  const handleError = (err) => {
    Swal.fire({
      title: "Error",
      text: extractErrorMessage(err),
      icon: "error",
    });
    console.error("Error:", err);
  };

  const navigateToDetail = (id) => {
    history.push(
      `/${tenant_schema_name}/purchase/request-for-quotations/${id}`
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = cleanData("draft");
    const errorMessage = validateRequiredFields(payload);
    if (errorMessage) {
      return Swal.fire({
        icon: "warning",
        title: "Missing Information",
        text: errorMessage,
      });
    }

    setIsSubmitting(true);
    try {
      if (isEdit) {
        const res = await updateRFQ(payload, rfq.id);
        if (res.success) {
          Swal.fire("Updated!", "RFQ updated.", "success").then(() =>
            navigateToDetail(rfq.id)
          );
        } else {
          Swal.fire("Error", extractErrorMessage(res), "error");
        }
      } else {
        const res = await createRFQ(payload);
        if (res.success) {
          Swal.fire("Created!", "RFQ saved as draft.", "success").then(() =>
            navigateToDetail(extractRFQID(res.data.url))
          );
        } else {
          Swal.fire("Error", extractErrorMessage(res), "error");
        }
      }
    } catch (err) {
      handleError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveAndShare = async () => {
    const payload = cleanData("pending");
    const errorMessage = validateRequiredFields(payload);
    if (errorMessage) {
      return Swal.fire({
        icon: "warning",
        title: "Missing Information",
        text: errorMessage,
      });
    }

    setIsSubmitting(true);
    try {
      const res = await createRFQ(payload);
      if (res.success) {
        Swal.fire("Shared!", "RFQ created and shared.", "success").then(() =>
          navigateToDetail(extractRFQID(res.data.url))
        );
      } else {
        Swal.fire("Error", extractErrorMessage(res), "error");
      }
    } catch (err) {
      handleError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="RfqForm">
      <div className="rfqAutoSave">
        <p className="raprhed">{formTitle}</p>
        <div className="rfqauto">
          <p>Autosaved</p>
          <img src={autosave} alt="Autosaved" />
        </div>
      </div>

      <div className="rfqFormSection">
        <div className="rfqBasicInfo">
          <h2>Basic Information</h2>
          <div className="editCancel">
            <Button variant="text" onClick={() => window.history.back()}>
              Close
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rfqformEditAndCreate">
          {isConvertToRFQ ? (
            <RfqBasicInfoFieldsConvertToRFQ
              formData={formData}
              handleInputChange={handleInputChange}
              formUse={formTitle}
              currencies={currencies}
              vendors={vendors}
              purchaseIdList={purchaseRequests}
              rfqID={rfq?.url}
              isConvertToRFQ={!!rfq}
              minDate={minExpiryDate}
            />
          ) : (
            <RfqBasicInfoFields
              formData={formData}
              handleInputChange={handleInputChange}
              formUse={formTitle}
              currencies={currencies}
              vendors={vendors}
              purchaseIdList={purchaseRequests}
              rfqID={rfq?.url}
              minDate={minExpiryDate}
            />
          )}

          <RfqItemsTable
            items={
              formTitle === "Edit RFQ"
                ? formData?.items
                : formData?.purchase_request?.items || formData?.items
            }
            handleRowChange={handleRowChange}
            products={products}
          />

          <Stack direction="row" spacing={2} justifyContent="flex-end" mt={3}>
            <Button variant="outlined" type="submit" disabled={isSubmitting}>
              {isEdit ? "Save Changes" : "Save Draft"}
            </Button>
            {!isEdit && (
              <Can app="purchase" module="requestforquotation" action="create">
                <Button
                  variant="contained"
                  onClick={saveAndShare}
                  disabled={isSubmitting}
                >
                  Save & Send
                </Button>
              </Can>
            )}
          </Stack>
        </form>
      </div>
    </div>
  );
};

export default RfqForm;
