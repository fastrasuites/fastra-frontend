// src/dash/PurchaseModule/Rfq/RfqForm.js
import "./RfqForm.css";
import autosave from "../../../../image/autosave.svg";

import React, { useEffect, useState, useCallback } from "react";
import { Button } from "@mui/material";
import Swal from "sweetalert2";
import { usePurchase } from "../../../../context/PurchaseContext";
import RfqBasicInfoFields from "./RfqBasicInfoFields";
import RfqItemsTable from "./RfqItemsTable";
import { useRFQ } from "../../../../context/RequestForQuotation";
import { normalizedRFQ } from "../../../../helper/helper";
import { useHistory, useLocation } from "react-router-dom";
import { useTenant } from "../../../../context/TenantContext";
import RfqBasicInfoFieldsConvertToRFQ from "./RFQBasisInfoConvert";

const EditRfqForm = () => {
  const {
    products,
    fetchProductsForForm,
    vendors,
    currencies,
    fetchCurrencies,
    fetchVendors,
    fetchApprovedPurchaseRequestsForForm,
    purchaseRequests,
  } = usePurchase();

  const { updateRFQ } = useRFQ();
  const { state } = useLocation();
  const { rfq = {}, edit = false } = state || {};

  const formUse = edit ? "Edit RFQ" : "Create RFQ";
  const quotation = rfq || {};
  const conversionRFQ = rfq || {};
  const isEdit = formUse === "Edit RFQ";
  const { tenant_schema_name } = useTenant().tenantData || {};
  const history = useHistory();

  // ─── Default and initial form data ──────────────────────────────────────────
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
    conversionRFQ && Object.keys(conversionRFQ).length > 0
      ? { ...defaultForm, ...conversionRFQ }
      : isEdit
      ? { ...defaultForm, ...quotation }
      : defaultForm;

  const [formData, setFormData] = useState(initial);
  // eslint-disable-next-line no-unused-vars
  const [prIDList, setPrIDList] = useState([]);

  // ─── Fetch required data on mount ──────────────────────────────────────────
  useEffect(() => {
    fetchVendors();
    fetchCurrencies();
    fetchProductsForForm();
    fetchApprovedPurchaseRequestsForForm();
  }, [
    fetchVendors,
    fetchCurrencies,
    fetchProductsForForm,
    fetchApprovedPurchaseRequestsForForm,
  ]);

  useEffect(() => {
    setPrIDList(normalizedRFQ(purchaseRequests));
  }, [purchaseRequests]);

  // ─── Handlers for formData updates ─────────────────────────────────────────
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

  // ─── Prepare payload by cleaning formData (string URLs ↔ objects) ─────────
  const cleanData = (status) => {
    const sourceItems =
      formData.purchase_request?.items?.length > 0
        ? formData.purchase_request.items
        : formData.items;

    const items = sourceItems.map((item) => ({
      id: item.id,
      product: item.product,
      description: item.description,
      qty: Number(item.qty) || 0,
      unit_of_measure: item.product_details.unit_of_measure || "",
      estimated_unit_price: item.estimated_unit_price,
    }));

    return {
      //   ...formData,
      expiry_date: formData?.expiry_date,
      id: formData?.id,
      status,
      vendor: formData?.purchase_request?.vendor || formData?.vendor,
      currency: formData?.purchase_request.currency || formData?.currency,
      purchase_request:
        typeof formData.purchase_request === "object" &&
        formData.purchase_request !== null &&
        !Array.isArray(formData.purchase_request)
          ? formData.purchase_request.id
          : formData.purchase_request,
      items,
      is_submitted: true,
      can_edit: true,
      is_hidden: false,
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

  const handleError = (err) => {
    let message = "An unexpected error occurred.";
    if (err?.response?.data) {
      if (err.response.data.non_field_errors) {
        message = err.response.data.non_field_errors.join(", ");
      } else if (err.response.data.detail) {
        message = err.response.data.detail;
      } else if (err.response.data.message) {
        message = err.response.data.message;
      }
    } else if (err?.message) {
      message = err.message;
    }

    Swal.fire({
      title: "Error",
      text: message,
      icon: "error",
    });
    console.error("Error: ", err); // Log error for debugging purposes
  };

  const navigateToDetail = (id) => {
    setTimeout(() => {
      history.push(
        `/${tenant_schema_name}/purchase/request-for-quotations/${id}`
      );
    }, 1500);
  };

  // ─── Handle Save Draft or Save Changes ─────────────────────────────────────
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
    try {
      const id = quotation.id;
      const res = await updateRFQ(payload, id);

      if (res.success) Swal.fire("Updated!", "RFQ updated.", "success");
      else Swal.fire("Error", res.message, "error");
      navigateToDetail(id);
    } catch (err) {
      handleError(err);
    }
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
            <Button variant="text" onClick={() => window.history.back()}>
              Close
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rfqformEditAndCreate">
          <RfqBasicInfoFields
            formData={formData}
            handleInputChange={handleInputChange}
            formUse={formUse}
            currencies={currencies}
            vendors={vendors}
            purchaseIdList={purchaseRequests}
            rfqID={quotation?.url}
          />

          {/** Show existing RFQ items in Edit mode, or associated PR items in Create mode */}

          <RfqItemsTable
            items={formData?.purchase_request?.items || formData?.items}
            handleRowChange={handleRowChange}
            products={products}
          />

          <div
            style={{
              display: "flex",
              justifyContent: "end",
              alignItems: "center",
            }}
          >
            {/* <Button variant="outlined" onClick={handleAddRow}>
              Add Item
            </Button> */}
            <div style={{ display: "flex", gap: 16 }}>
              <Button variant="outlined" type="submit">
                {isEdit ? "Save Changes" : "Save Draft"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditRfqForm;
