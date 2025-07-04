// src/dash/PurchaseModule/Rfq/RfqForm.js
import "./RfqForm.css";
import PurchaseHeader from "../../PurchaseHeader";
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
  console.log(isConvertToRFQ);
  const isEdit = formUse === "Edit RFQ";
  const { tenant_schema_name } = useTenant().tenantData || {};
  const history = useHistory();

  // ─── Default and initial form data ──────────────────────────────────────────
  const defaultForm = {
    purchase_request: "",
    expiry_date: "",
    currency: "",
    vendor: "",
    vendor_category: "",
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

  // const handleAddRow = useCallback(() => {
  //   setFormData((prev) => ({
  //     ...prev,
  //     items: [
  //       ...prev.items,
  //       {
  //         id: `new-${prev.items.length + 1}`,
  //         product: null,
  //         description: "",
  //         qty: "",
  //         unit_of_measure: "",
  //         estimated_unit_price: "",
  //       },
  //     ],
  //   }));
  // }, []);

  // ─── Determine which items array to display ───────────────────────────────
  const rfqItems =
    formUse === "Edit RFQ"
      ? formData?.items
      : formData?.purchase_request?.items || [];

  // ─── Prepare payload by cleaning formData (string URLs ↔ objects) ─────────
  const cleanData = (status) => ({
    ...formData,
    status,
    vendor: formData.vendor?.url || formData.vendor,
    currency: formData.currency?.url || formData.currency,
    purchase_request:
      formData.purchase_request?.id || formData.purchase_request,
    items: rfqItems.map((i) => ({
      product: i.product?.url || i.product || "",
      description: i.description,
      qty: Number(i.qty) || 0,
      unit_of_measure:
        i.unit_of_measure?.url ||
        (Array.isArray(i.unit_of_measure)
          ? i.unit_of_measure[0]
          : i.unit_of_measure),
      estimated_unit_price: i.estimated_unit_price,
    })),
    is_submitted: true,
    can_edit: true,
    is_hidden: false,
  });

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
    console.log(payload, "payload");
    try {
      if (isEdit) {
        const id = extractRFQID(quotation.url);
        const res = await updateRFQ(payload, id);
        console.log(res);

        if (res.success) Swal.fire("Updated!", "RFQ updated.", "success");
        else Swal.fire("Error", res.message, "error");
        navigateToDetail(id);
      } else {
        const res = await createRFQ(payload);
        if (res.success) {
          Swal.fire("Created!", "RFQ saved as draft.", "success");
          navigateToDetail(extractRFQID(res.data.url));
        } else Swal.fire("Error", res.message, "error");
      }
      // setFormData(defaultForm);
    } catch (err) {
      console.error(err);
      const errMsg = err.message || "Unexpected error occurred.";
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
      } else Swal.fire("Error", res.message, "error");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Unexpected error on share.", "error");
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
