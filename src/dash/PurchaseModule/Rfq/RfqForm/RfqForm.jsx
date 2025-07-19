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
import { extractRFQID, normalizedRFQ } from "../../../../helper/helper";
import { useHistory, useLocation } from "react-router-dom";
import { useTenant } from "../../../../context/TenantContext";
import RfqBasicInfoFieldsConvertToRFQ from "./RFQBasisInfoConvert";

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
  const { state } = useLocation();
  const { rfq = {}, edit = false, isConvertToRFQ } = state || {};

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
    fetchProducts();
    fetchApprovedPurchaseRequests();
  }, [
    fetchVendors,
    fetchCurrencies,
    fetchProducts,
    fetchApprovedPurchaseRequests,
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
      currency: formData?.purchase_request.currency || formData?.currency,
      purchase_request: formData.purchase_request?.id || formData?.id,
      items,
      is_submitted: true,
      can_edit: true,
    };
  };

  const navigateToDetail = (id) => {
    setTimeout(() => {
      history.push(
        `/${tenant_schema_name}/purchase/request-for-quotations/${id}`
      );
    }, 1500);
  };
  console.log(formData);
  // ─── Handle Save Draft or Save Changes ─────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = cleanData("draft");
    try {
      if (isEdit) {
        const id = quotation.id;
        const res = await updateRFQ(payload, id);

        if (res.success) Swal.fire("Updated!", "RFQ updated.", "success");
        else Swal.fire("Error", res.message, "error");
        navigateToDetail(id);
      } else {
        const res = await createRFQ(payload);
        if (res.success) {
          Swal.fire("Created!", "RFQ saved as draft.", "success");
          navigateToDetail(extractRFQID(res.data.url));
        } else {
          Swal.fire("Error", res.message, "error");
        }
      }
    } catch (err) {
      console.error(err);
      let errMsg = "Unexpected error occurred.";

      if (err.response && err.response.data) {
        const data = err.response.data;
        if (data.non_field_errors?.length) {
          errMsg = data.non_field_errors.join(" ");
        } else if (typeof data === "string") {
          errMsg = data;
        } else {
          errMsg = JSON.stringify(data);
        }
      }

      Swal.fire("Error", errMsg, "error");
    }
  };

  // ─── Handle Save & Send (only in Create mode) ──────────────────────────────
  const saveAndShare = async () => {
    const payload = cleanData("pending");
    try {
      const res = await createRFQ(payload);
      if (res.success) {
        Swal.fire("Shared!", "RFQ created and shared.", "success");
        navigateToDetail(extractRFQID(res.data.url));
      } else {
        Swal.fire("Error", res.message, "error");
      }
    } catch (err) {
      console.error(err);
      let errMsg = "Unexpected error occurred.";

      if (err.response && err.response.data) {
        const data = err.response.data;
        if (data.non_field_errors?.length) {
          errMsg = data.non_field_errors.join(" ");
        } else if (typeof data === "string") {
          errMsg = data;
        } else {
          errMsg = JSON.stringify(data);
        }
      }

      Swal.fire("Error", errMsg, "error");
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
          {isConvertToRFQ ? (
            <RfqBasicInfoFieldsConvertToRFQ
              formData={formData}
              handleInputChange={handleInputChange}
              formUse={formUse}
              currencies={currencies}
              vendors={vendors}
              purchaseIdList={purchaseRequests}
              rfqID={quotation?.url}
              isConvertToRFQ={!!conversionRFQ}
            />
          ) : (
            <RfqBasicInfoFields
              formData={formData}
              handleInputChange={handleInputChange}
              formUse={formUse}
              currencies={currencies}
              vendors={vendors}
              purchaseIdList={purchaseRequests}
              rfqID={quotation?.url}
            />
          )}

          {/** Show existing RFQ items in Edit mode, or associated PR items in Create mode */}
          {formUse === "Edit RFQ" ? (
            <RfqItemsTable
              items={formData?.items}
              handleRowChange={handleRowChange}
              products={products}
            />
          ) : (
            <RfqItemsTable
              items={formData?.purchase_request?.items || formData?.items}
              handleRowChange={handleRowChange}
              products={products}
            />
          )}

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
              {!isEdit && (
                <Button variant="contained" onClick={saveAndShare}>
                  Save & Send
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RfqForm;
